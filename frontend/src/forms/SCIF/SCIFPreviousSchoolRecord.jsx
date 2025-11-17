import React, { useState, useEffect } from "react";
import FormField from "../../components/FormField";
import Button from "../../components/UIButton";
import { useEnumChoices } from "../../utils/enumChoices";
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
  const [schoolRecords, setSchoolRecords] = useState(data?.records || []);
  const [sameAsPrimary, setSameAsPrimary] = useState(
    data?.sameAsPrimary || {
      "Junior High": false,
      "Senior High": false,
    }
  );
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

  // Initialize required levels
  useEffect(() => {
    if (schoolRecords.length === 0) {
      REQUIRED_LEVELS.forEach((level) => addRecord(level));
    }
  }, []);

  const updateDataWithState = (records, same = sameAsPrimary) => {
    setSchoolRecords(records);
    updateData({
      records,
      sameAsPrimary: same,
    });
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

    // Reset GPA if not SHS
    if (field === "education_level" && value !== "Senior High") {
      updated[index].senior_high_gpa = "";
    }

    updateDataWithState(updated);
  };

  const handleInputFilterChange = (index, field, rawValue, filterFn) => {
    if (readOnly) return;
    const filtered = filterFn(rawValue);
    handleFieldChange(index, field, filtered);
    handleErrorClear(index, field);
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
    };
    const updated = [...schoolRecords, newRecord];
    updateDataWithState(updated);
  };

  const removeRecord = (index) => {
    const rec = schoolRecords[index];
    const required = REQUIRED_LEVELS.includes(rec.education_level);
    const countSame = schoolRecords.filter(
      (r) => r.education_level === rec.education_level
    ).length;

    if (required && countSame <= 1) {
      alert(`You must have at least one ${rec.education_level} record.`);
      return;
    }

    const updated = schoolRecords.filter((_, i) => i !== index);
    updateDataWithState(updated);
  };

  const handleSameAsPrimaryToggle = (level) => {
    const updatedSame = {
      ...sameAsPrimary,
      [level]: !sameAsPrimary[level],
    };

    const primary = schoolRecords.find((r) => r.education_level === "Primary");
    const levelRecord = schoolRecords.find((r) => r.education_level === level);

    if (!primary || !levelRecord) return;

    const updated = [...schoolRecords];
    const idx = schoolRecords.findIndex((r) => r === levelRecord);

    if (updatedSame[level]) {
      // Copy name + address from primary
      updated[idx].school.name = primary.school.name;
      updated[idx].school.school_address = { ...primary.school.school_address };
    }

    setSameAsPrimary(updatedSame);
    updateDataWithState(updated, updatedSame);
  };

  const renderSection = (level, isRequired = true) => {
    const records = schoolRecords.filter((r) => r.education_level === level);
    return (
      <section
        key={level}
        className="border border-gray-200 rounded-xl bg-gray-50 p-6 space-y-6 mb-10"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {level} School
          </h2>

          {/* Same as Primary Checkbox */}
          {(level === "Junior High" || level === "Senior High") && (
            <label className="flex items-center space-x-2 text-gray-700 text-sm">
              <input
                type="checkbox"
                checked={sameAsPrimary[level] || false}
                onChange={() => handleSameAsPrimaryToggle(level)}
                className="accent-blue-600"
                disabled={readOnly}
              />
              <span>Same as Primary School</span>
            </label>
          )}
        </div>

        {records.map((record, index) => {
          const globalIndex = schoolRecords.findIndex((r) => r === record);
          const disabled = sameAsPrimary[level] || readOnly;

          return (
            <div
              key={globalIndex}
              className="border-t border-gray-200 pt-6 space-y-6"
            >
              {/* School Name */}
              <FormField
                label="School Name"
                type="text"
                value={record.school.name}
                onFocus={() => handleErrorClear(globalIndex, "school.name")}
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
                disabled={disabled}
              />

              {/* School Address */}
              <h3 className="text-md font-semibold text-gray-700 mt-4">
                School Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { field: "address_line_1", filter: filterGeneralText },
                  { field: "barangay", filter: filterGeneralText },
                  { field: "city_municipality", filter: filterGeneralText },
                  { field: "province", filter: filterGeneralText },
                  { field: "region", filter: null, isSelect: true },
                  { field: "zip_code", filter: filterNumbersOnly },
                ].map((item) => {
                  const field = item.field;
                  const isSelect = item.isSelect;
                  if (isSelect) {
                    return (
                      <FormField
                        key={field}
                        label="Region"
                        type="select"
                        value={record.school.school_address[field]}
                        onFocus={() =>
                          handleErrorClear(
                            globalIndex,
                            `school.school_address.${field}`
                          )
                        }
                        onChange={(e) =>
                          handleFieldChange(
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
                          loading
                            ? [{ value: "", label: "Loading regions..." }]
                            : error
                            ? [{ value: "", label: "Error loading regions" }]
                            : enums?.region || []
                        }
                        required
                        disabled={disabled}
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
                        handleErrorClear(
                          globalIndex,
                          `school.school_address.${field}`
                        )
                      }
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
                      disabled={disabled}
                    />
                  );
                })}
              </div>

              {/* More Info */}
              <h3 className="text-md font-semibold text-gray-700 mt-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Start Year"
                  type="text"
                  value={record.start_year}
                  onFocus={() => handleErrorClear(globalIndex, "start_year")}
                  onChange={(e) =>
                    handleInputFilterChange(
                      globalIndex,
                      "start_year",
                      e.target.value,
                      filterNumbersOnly
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
                  onChange={(e) =>
                    handleInputFilterChange(
                      globalIndex,
                      "end_year",
                      e.target.value,
                      filterNumbersOnly
                    )
                  }
                  error={errors?.[`previous_school[${globalIndex}].end_year`]}
                  required
                />

                <FormField
                  label="Honors Received"
                  type="text"
                  value={record.honors_received}
                  onFocus={() =>
                    handleErrorClear(globalIndex, "honors_received")
                  }
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
                  onFocus={() =>
                    handleErrorClear(globalIndex, "senior_high_gpa")
                  }
                  onChange={(e) =>
                    handleInputFilterChange(
                      globalIndex,
                      "senior_high_gpa",
                      e.target.value,
                      filterDecimalNumbers
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
                  className="mt-3"
                >
                  Remove Record
                </Button>
              )}
            </div>
          );
        })}

        {!readOnly && (
          <Button
            variant="primary"
            onClick={() => addRecord(level)}
            className="mt-4"
          >
            Add Another {level} Record
          </Button>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">
        Previous School Record
      </h2>

      {renderSection("Primary")}
      {renderSection("Junior High")}
      {renderSection("Senior High")}
      {renderSection("College", false)}

      {Object.entries(errors || {})
        .filter(([key]) => key.startsWith("previous_school_missing_"))
        .map(([key, message]) => (
          <p key={key} className="text-red-500 text-sm ml-6">
            {message}
          </p>
        ))}
    </div>
  );
};

export default SCIFPreviousSchoolRecord;
