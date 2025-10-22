import React, { useState, useEffect } from "react";
import FormField from "../../components/FormField";
import "../SetupProfile/css/multistep.css";
import { useEnumChoices } from "../../utils/enumChoices";
import Button from "../../components/UIButton";
import {
  filterNumbersOnly,
  filterGeneralText,
  filterDecimalNumbers,
} from "../../utils/inputFilters";

const REQUIRED_LEVELS = ["Primary", "Junior High", "Senior High"];

const SCIFPreviousSchoolRecord = ({
  data,
  updateData,
  readOnly = false,
  errors,
  setErrors,
}) => {
  const [schoolRecords, setSchoolRecords] = useState(data || []);
  const { enums, loading, error } = useEnumChoices();

  const handleErrorClear = (globalIndex, field) => {
      const errorKey = `previous_school[${globalIndex}].${field}`;
      if (errors?.[errorKey]) {
        setErrors((prev) => {
          const updatedErrors = { ...prev };
          delete updatedErrors[errorKey];
          return updatedErrors;
        });
      }
    };

  const handleFieldChange = (index, field, value) => {
    if (readOnly) return;
    const updated = [...schoolRecords];
    const path = field.split(".");
    let target = updated[index];
    for (let i = 0; i < path.length - 1; i++) {
      target = target[path[i]] ||= {};
    }
    target[path[path.length - 1]] = value;

    // Clear GPA if not Senior High
    if (field === "education_level" && value !== "Senior High") {
      updated[index].senior_high_gpa = "";
    }

    const recordLevel =
      field === "education_level" ? value : updated[index].education_level;

    const missingLevelKey = `previous_school_missing_${recordLevel
      .replace(/\s/g, "_")
      .toLowerCase()}`;

    if (errors?.[missingLevelKey]) {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[missingLevelKey];
        return updatedErrors;
      });
    }

    setSchoolRecords(updated);
    updateData(updated);
  };

  const handleInputFilterChange = (globalIndex, field, rawValue, filterFn) => {
    if (readOnly) return;
    const filteredValue = filterFn(rawValue);
    handleFieldChange(globalIndex, field, filteredValue);
    handleErrorClear(globalIndex, field);
  };

  const addRecord = (level) => {
    const newRecord = {
      student_number: "",
      school: {
        name: "",
        school_address: {
          address_line_1: "",
          barangay: "",
          city_municipality: "",
          province: "",
          region: "",
          zip_code: "",
        },
      },
      education_level: level,
      start_year: "",
      end_year: "",
      honors_received: "",
      senior_high_gpa: "",
      submission: "",
    };
    const updated = [...schoolRecords, newRecord];
    setSchoolRecords(updated);
    updateData(updated);
  };

  const removeRecord = (index) => {
    const recordToRemove = schoolRecords[index];
    const isRequiredLevel = REQUIRED_LEVELS.includes(
      recordToRemove.education_level
    );
    const countSameLevel = schoolRecords.filter(
      (r) => r.education_level === recordToRemove.education_level
    ).length;

    if (isRequiredLevel && countSameLevel <= 1) {
      alert(
        `You must have at least one ${recordToRemove.education_level} record.`
      );
      return;
    }

    const updated = schoolRecords.filter((_, i) => i !== index);
    setSchoolRecords(updated);
    updateData(updated);
  };

  useEffect(() => {
    if (schoolRecords.length === 0) {
      REQUIRED_LEVELS.forEach((level) => addRecord(level));
    }
    // eslint-disable-next-line
  }, []);


const renderSection = (level, isRequired=true) => {
    const records = schoolRecords.filter((r) => r.education_level === level);
    return (
      <div className="school-section">
        <div className="line"></div>
        <h2 className="step-info school">{level} School</h2>
        {records.map((record, index) => {
          const globalIndex = schoolRecords.findIndex((r) => r === record);
          return (
            <div key={globalIndex} className="school-record subsection-form">
              <h3 className="step-info school">{level} School Data</h3>
              <FormField
                label="School Name"
                type="text"
                value={record.school.name}
                onFocus={() => handleErrorClear(globalIndex, "school.name")}
                // 🛑 FIX 2: Use the new filter function
                onChange={(e) =>
                  handleInputFilterChange(
                    globalIndex,
                    "school.name",
                    e.target.value,
                    filterGeneralText 
                  )
                }
                error={errors?.[`previous_school[${globalIndex}].school.name`]}
                required
              />

              <h3 className="step-info school">{level} School Address</h3>
              <div className="form-row three-columns">
                {[
                  // Filters assigned for each field
                  {field: "address_line_1", filter: filterGeneralText},
                  {field: "barangay", filter: filterGeneralText},
                  {field: "city_municipality", filter: filterGeneralText},
                  {field: "province", filter: filterGeneralText},
                  {field: "region", filter: null, isSelect: true}, 
                  {field: "zip_code", filter: filterNumbersOnly},
                ].map((item) => {
                  const field = item.field;
                  const isSelect = item.isSelect;

                  if (isSelect) {
                    return (
                        <FormField
                            key={field}
                            label={field
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            type="select"
                            value={record.school.school_address[field]}
                            onFocus={() => handleErrorClear(globalIndex, `school.school_address.${field}`)}
                            onChange={(e) => 
                              handleFieldChange( // Selects use the base handler
                                globalIndex,
                                `school.school_address.${field}`,
                                e.target.value
                              )
                            }
                            error={
                                errors?.[
                                    `previous_school[${globalIndex}].school.school_address.${field}`
                                ]
                            }
                            options={
                                field === "region"
                                    ? loading
                                        ? [{ value: "", label: "Loading regions..." }]
                                        : error
                                        ? [{ value: "", label: "Error loading regions" }]
                                        : enums?.region || []
                                    : undefined
                            }
                            required
                        />
                    );
                  }

                  return (
                    <FormField
                      key={field}
                      label={field
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      type="text"
                      value={record.school.school_address[field]}
                      onFocus={() =>
                        handleErrorClear(globalIndex, `school.school_address.${field}`)
                      }
                      // 🛑 FIX 3: Use the new filter function for address fields
                      onChange={(e) =>
                        handleInputFilterChange(
                          globalIndex,
                          `school.school_address.${field}`,
                          e.target.value,
                          item.filter
                        )
                      }
                      error={
                        errors?.[
                          `previous_school[${globalIndex}].school.school_address.${field}`
                        ]
                      }
                      required
                    />
                  );
                })}
              </div>

              <h3 className="step-info school">
                {level} School More Information
              </h3>
              <div className="form-row three-columns">
                <FormField
                  label="Start Year"
                  type="text"
                  value={record.start_year}
                  onFocus={() => handleErrorClear(globalIndex, "start_year")}
                  // 🛑 FIX 4: Use the number filter for year
                  onChange={(e) => 
                    handleInputFilterChange(
                        globalIndex, 
                        "start_year", 
                        e.target.value, 
                        filterNumbersOnly // Year must be whole numbers
                    )
                  }
                  error={errors?.[`previous_school[${globalIndex}].start_year`]}
                  required
                />
                <FormField
                  label="End Year"
                  type="text"
                  value={record.end_year}
                  onFocus={() => handleErrorClear(globalIndex, "end_year")}
                  // 🛑 FIX 5: Use the number filter for year
                  onChange={(e) =>
                    handleInputFilterChange(
                        globalIndex, 
                        "end_year", 
                        e.target.value, 
                        filterNumbersOnly // Year must be whole numbers
                    )
                  }
                  error={errors?.[`previous_school[${globalIndex}].end_year`]}
                  required
                />
                <FormField
                  label="Honors Received"
                  type="text"
                  value={record.honors_received}
                  onFocus={() => handleErrorClear(globalIndex, "honors_received")}
                  // 🛑 FIX 6: Use the general text filter
                  onChange={(e) =>
                    handleInputFilterChange(
                      globalIndex,
                      "honors_received",
                      e.target.value,
                      filterGeneralText 
                    )
                  }
                  error={
                    errors?.[`previous_school[${globalIndex}].honors_received`]
                  }
                />
              </div>

              {level === "Senior High" && (
                <FormField
                  label="Senior High GPA"
                  type="text"
                  value={record.senior_high_gpa}
                  onFocus={() => handleErrorClear(globalIndex, "senior_high_gpa")}
                  // 🛑 FIX 7: Use the decimal filter for GPA
                  onChange={(e) => 
                    handleInputFilterChange(
                        globalIndex, 
                        "senior_high_gpa", 
                        e.target.value, 
                        filterDecimalNumbers // GPA is a decimal
                    )
                  }
                  error={
                    errors?.[`previous_school[${globalIndex}].senior_high_gpa`]
                  }
                  required
                />
              )}
              {!readOnly && (
                <Button
                  variant="secondary"
                  onClick={() => removeRecord(globalIndex)}
                  style={{ marginBottom: "1rem" }}
                  className={"school-button"}
                >
                  Remove Record
                </Button>
              )}
            </div>
          );
        })}
        {readOnly ? (
          <p style={{ color: "#666" }}>None</p>
        ) : (
          <Button
            variant="primary"
            onClick={() => addRecord(level)}
            className={"school-button"}
          >
            Add Another {level} School Record
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="form-section">
      <fieldset className="form-section" disabled={readOnly}>
        <h2 className="step-title">Previous School Record</h2>
        {renderSection("Primary")}
        {renderSection("Junior High")}
        {renderSection("Senior High")}
        {renderSection("College", false)}
      </fieldset>
      {Object.entries(errors || {})
        .filter(([key]) => key.startsWith("previous_school_missing_"))
        .map(([key, message]) => (
          <p key={key} className="error-message" style={{marginLeft: "2rem"}}>
            {message}
          </p>
        ))}
    </div>
  );
};

export default SCIFPreviousSchoolRecord;
