import React, { useState } from "react";
import FormField from "../../components/FormField";
import Button from "../../components/UIButton";
import { clearError } from "../../utils/helperFunctions";
import {
  filterAlphabetsOnly,
  filterNumbersOnly,
  filterGeneralText,
} from "../../utils/inputFilters";

const SCIFFamilyData = ({
  data,
  updateData,
  readOnly = false,
  errors,
  setErrors,
}) => {
  const { family_data, siblings } = data;

  const [languageInput, setLanguageInput] = useState(
    family_data.guardian?.language_dialect?.join(", ") || ""
  );

  const [isFatherDeceased, setIsFatherDeceased] = useState(
    family_data.father?.is_deceased || false
  );
  const [isMotherDeceased, setIsMotherDeceased] = useState(
    family_data.mother?.is_deceased || false
  );
  const [isFatherNone, setIsFatherNone] = useState(
    family_data.father?.is_none || false
  );
  const [isMotherNone, setIsMotherNone] = useState(
    family_data.mother?.is_none || false
  );

  const fieldTypes = {
    first_name: "alphabet",
    last_name: "alphabet",
    age: "number",
    contact_number: "number",
    highest_educational_attainment: "general",
    job_occupation: "general",
    company_agency: "general",
    company_address: "general",
    address: "general",
    relationship_to_guardian: "alphabet",
  };

  const siblingFieldTypes = {
    first_name: "alphabet",
    last_name: "alphabet",
    age: "number",
    job_occupation: "general",
    company_school: "general",
    educational_attainment: "general",
  };

  const handleFieldChange = (section, field, value) => {
    if (readOnly) return;

    let filteredValue = value;
    const fieldType = fieldTypes[field];

    if (fieldType === "alphabet") filteredValue = filterAlphabetsOnly(value);
    else if (fieldType === "number") filteredValue = filterNumbersOnly(value);
    else if (fieldType === "general") filteredValue = filterGeneralText(value);

    updateData("family_data", {
      ...family_data,
      [section]: {
        ...family_data[section],
        [field]: filteredValue,
      },
    });
  };

  // FILLERS
  const fillDeceasedFields = (parent) => {
    const currentParent = family_data[parent] || {};

    updateData("family_data", {
      ...family_data,
      [parent]: {
        ...currentParent,
        first_name: currentParent.first_name || "",
        last_name: currentParent.last_name || "",
        age: null,
        contact_number: null,
        highest_educational_attainment: null,
        job_occupation: null,
        company_address: null,
        company_agency: null,
        is_deceased: true,
        is_none: false,
      },
    });

    // Clear errors for this parent
    clearParentErrors(parent);
  };

  const fillNoneFields = (parent) => {
    const fields = {
      first_name: null,
      last_name: null,
      age: null,
      contact_number: null,
      highest_educational_attainment: null,
      job_occupation: null,
      company_agency: null,
      company_address: null,
      is_none: true,
      is_deceased: false,
    };

    updateData("family_data", {
      ...family_data,
      [parent]: fields,
    });

    // Clear errors for this parent
    clearParentErrors(parent);
  };

  const clearParentFields = (parent) => {
    updateData("family_data", {
      ...family_data,
      [parent]: {
        is_deceased: false,
        is_none: false,
        first_name: "",
        last_name: "",
        age: "",
        contact_number: "",
        highest_educational_attainment: "",
        job_occupation: "",
        company_agency: "",
        company_address: "",
      },
    });
  };

  // Clear all validation errors for a parent
  const clearParentErrors = (parent) => {
    const parentErrorKeys = [
      `${parent}.first_name`,
      `${parent}.last_name`,
      `${parent}.age`,
      `${parent}.contact_number`,
      `${parent}.highest_educational_attainment`,
      `${parent}.job_occupation`,
      `${parent}.company_agency`,
      `${parent}.company_address`,
    ];

    const newErrors = { ...errors };
    parentErrorKeys.forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const handleParentToggle = (parent, field, value) => {
    if (readOnly) return;

    if (parent === "father") {
      if (field === "deceased") {
        setIsFatherDeceased(value);
        setIsFatherNone(false);
        value ? fillDeceasedFields("father") : clearParentFields("father");
      } else {
        setIsFatherNone(value);
        setIsFatherDeceased(false);
        value ? fillNoneFields("father") : clearParentFields("father");
      }
    } else {
      if (field === "deceased") {
        setIsMotherDeceased(value);
        setIsMotherNone(false);
        value ? fillDeceasedFields("mother") : clearParentFields("mother");
      } else {
        setIsMotherNone(value);
        setIsMotherDeceased(false);
        value ? fillNoneFields("mother") : clearParentFields("mother");
      }
    }
  };

  // SIBLING LOGIC
  const addSibling = () => {
    const newSibling = {
      first_name: "",
      last_name: "",
      sex: "",
      age: "",
      job_occupation: "",
      company_school: "",
      educational_attainment: "",
      students: [],
    };

    updateData(
      "siblings",
      Array.isArray(siblings) ? [...siblings, newSibling] : [newSibling]
    );
  };

  const removeSibling = (index) => {
  const updated = siblings.filter(s => !s._delete).map((sibling, i) =>
    i === index
      ? { ...sibling, _delete: true }
      : sibling
  );

  updateData("siblings", updated);
};


  const handleSiblingChange = (index, field, value) => {
    if (readOnly) return;

    let filteredValue = value;
    const fieldType = siblingFieldTypes[field];
    if (fieldType === "alphabet") filteredValue = filterAlphabetsOnly(value);
    else if (fieldType === "number") filteredValue = filterNumbersOnly(value);
    else if (fieldType === "general") filteredValue = filterGeneralText(value);

    updateData(
      "siblings",
      siblings.map((sibling, i) =>
        i === index ? { ...sibling, [field]: filteredValue } : sibling
      )
    );
  };

  // CONTACT & LANGUAGE HANDLERS
  const handleContactChange = (section, value) => {
    if (readOnly) return;
    const filtered = filterNumbersOnly(value).slice(0, 11);
    handleFieldChange(section, "contact_number", filtered);
  };

  const handleLanguageChange = (e) => {
    if (readOnly) return;
    const value = e.target.value;
    const filteredValue = filterGeneralText(value);
    setLanguageInput(filteredValue);
    handleFieldChange(
      "guardian",
      "language_dialect",
      filteredValue
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  };

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold text-gray-800 ">Family Data</h2>
      <small className="text-gray-600 block mb-4">
        Provide complete details of your parents and siblings; indicate "N/A",
        "Deceased", or "None" if applicable.
      </small>

      {/* Father Section */}
      <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-semibold text-gray-700">FATHER</p>
          <div className="flex gap-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isFatherDeceased}
                onChange={(e) =>
                  handleParentToggle("father", "deceased", e.target.checked)
                }
                disabled={readOnly}
              />
              <span className="text-gray-700">Deceased</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isFatherNone}
                onChange={(e) =>
                  handleParentToggle("father", "none", e.target.checked)
                }
                disabled={readOnly}
              />
              <span className="text-gray-700">None</span>
            </label>
          </div>
        </div>

        {!isFatherNone && (
          <>
            <div
              className={`grid grid-cols-1 md:grid-cols-2 ${
                isFatherDeceased ? "lg:grid-cols-2" : "lg:grid-cols-3"
              } gap-4`}
            >
              <FormField
                label="Father's First Name"
                type="text"
                value={family_data.father?.first_name || ""}
                onFocus={() =>
                  clearError(errors, setErrors, "father.first_name")
                }
                onChange={(e) =>
                  handleFieldChange("father", "first_name", e.target.value)
                }
                error={errors?.["father.first_name"]}
                required
              />
              <FormField
                label="Father's Last Name"
                type="text"
                value={family_data.father?.last_name || ""}
                onFocus={() =>
                  clearError(errors, setErrors, "father.last_name")
                }
                onChange={(e) =>
                  handleFieldChange("father", "last_name", e.target.value)
                }
                error={errors?.["father.last_name"]}
                required
              />
              {!isFatherDeceased && (
                <FormField
                  label="Age"
                  type="text"
                  value={family_data.father?.age || ""}
                  onChange={(e) =>
                    handleFieldChange("father", "age", e.target.value)
                  }
                  error={errors?.["father.age"]}
                  required
                />
              )}
            </div>

            {!isFatherDeceased && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <FormField
                    label="Highest Educational Attainment"
                    type="text"
                    value={
                      family_data.father?.highest_educational_attainment || ""
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "father",
                        "highest_educational_attainment",
                        e.target.value
                      )
                    }
                  />
                  <FormField
                    label="Job/Occupation"
                    type="text"
                    value={family_data.father?.job_occupation || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "father",
                        "job_occupation",
                        e.target.value
                      )
                    }
                  />
                  <FormField
                    label="Contact Number"
                    type="text"
                    value={family_data.father?.contact_number || ""}
                    onFocus={() =>
                      clearError(errors, setErrors, "father.contact_number")
                    }
                    onChange={(e) =>
                      handleContactChange("father", e.target.value)
                    }
                    error={errors?.["father.contact_number"]}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                  <FormField
                    label="Company/Agency"
                    type="text"
                    value={family_data.father?.company_agency || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "father",
                        "company_agency",
                        e.target.value
                      )
                    }
                  />
                  <div className="lg:col-span-2">
                    <FormField
                      label="Company Address"
                      type="text"
                      value={family_data.father?.company_address || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "father",
                          "company_address",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Mother Section */}
      <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-semibold text-gray-700">MOTHER</p>
          <div className="flex gap-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isMotherDeceased}
                onChange={(e) =>
                  handleParentToggle("mother", "deceased", e.target.checked)
                }
                disabled={readOnly}
              />
              <span className="text-gray-700">Deceased</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isMotherNone}
                onChange={(e) =>
                  handleParentToggle("mother", "none", e.target.checked)
                }
                disabled={readOnly}
              />
              <span className="text-gray-700">None</span>
            </label>
          </div>
        </div>

        {!isMotherNone && (
          <>
            <div
              className={`grid grid-cols-1 md:grid-cols-2 ${
                isMotherDeceased ? "lg:grid-cols-2" : "lg:grid-cols-3"
              } gap-4`}
            >
              <FormField
                label="Mother's First Name"
                type="text"
                value={family_data.mother?.first_name || ""}
                onFocus={() =>
                  clearError(errors, setErrors, "mother.first_name")
                }
                onChange={(e) =>
                  handleFieldChange("mother", "first_name", e.target.value)
                }
                error={errors?.["mother.first_name"]}
                required
              />
              <FormField
                label="Mother's Last Name"
                type="text"
                value={family_data.mother?.last_name || ""}
                onFocus={() =>
                  clearError(errors, setErrors, "mother.last_name")
                }
                onChange={(e) =>
                  handleFieldChange("mother", "last_name", e.target.value)
                }
                error={errors?.["mother.last_name"]}
                required
              />
              {!isMotherDeceased && (
                <FormField
                  label="Age"
                  type="text"
                  value={family_data.mother?.age || ""}
                  onChange={(e) =>
                    handleFieldChange("mother", "age", e.target.value)
                  }
                  error={errors?.["mother.age"]}
                  required
                />
              )}
            </div>

            {!isMotherDeceased && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <FormField
                    label="Highest Educational Attainment"
                    type="text"
                    value={
                      family_data.mother?.highest_educational_attainment || ""
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "mother",
                        "highest_educational_attainment",
                        e.target.value
                      )
                    }
                  />
                  <FormField
                    label="Job/Occupation"
                    type="text"
                    value={family_data.mother?.job_occupation || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "mother",
                        "job_occupation",
                        e.target.value
                      )
                    }
                  />
                  <FormField
                    label="Contact Number"
                    type="text"
                    value={family_data.mother?.contact_number || ""}
                    onChange={(e) =>
                      handleContactChange("mother", e.target.value)
                    }
                    error={errors?.["mother.contact_number"]}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                  <FormField
                    label="Company/Agency"
                    type="text"
                    value={family_data.mother?.company_agency || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "mother",
                        "company_agency",
                        e.target.value
                      )
                    }
                  />
                  <div className="lg:col-span-2">
                    <FormField
                      label="Company Address"
                      type="text"
                      value={family_data.mother?.company_address || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "mother",
                          "company_address",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Siblings Section */}
      <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-semibold text-gray-700">SIBLINGS</p>
          {!readOnly && (
            <Button variant="primary" onClick={addSibling}>
              + Add Sibling
            </Button>
          )}
        </div>

        {Array.isArray(siblings) &&
          siblings.map((sibling, index) => (
            <div
              key={index}
              className="border-t border-gray-300 pt-4 mt-4 space-y-4"
            >
              <p className="font-semibold text-gray-700">Sibling {index + 1}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  label="First Name"
                  type="text"
                  value={sibling.first_name || ""}
                  onChange={(e) =>
                    handleSiblingChange(index, "first_name", e.target.value)
                  }
                  required
                />
                <FormField
                  label="Last Name"
                  type="text"
                  value={sibling.last_name || ""}
                  onChange={(e) =>
                    handleSiblingChange(index, "last_name", e.target.value)
                  }
                  required
                />
                <FormField
                  label="Sex"
                  type="select"
                  value={sibling.sex || ""}
                  onChange={(e) =>
                    handleSiblingChange(index, "sex", e.target.value)
                  }
                  options={[
                    { value: "", label: "Select" },
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Age"
                  type="text"
                  value={sibling.age || ""}
                  onChange={(e) =>
                    handleSiblingChange(index, "age", e.target.value)
                  }
                  required
                />
                <FormField
                  label="Job/Occupation"
                  type="text"
                  value={sibling.job_occupation || ""}
                  onChange={(e) =>
                    handleSiblingChange(index, "job_occupation", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Company/School"
                  type="text"
                  value={sibling.company_school || ""}
                  onChange={(e) =>
                    handleSiblingChange(index, "company_school", e.target.value)
                  }
                />
                <FormField
                  label="Educational Attainment"
                  type="text"
                  value={sibling.educational_attainment || ""}
                  onChange={(e) =>
                    handleSiblingChange(
                      index,
                      "educational_attainment",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              {!readOnly && (
                <Button
                  variant="secondary"
                  onClick={() => removeSibling(index)}
                >
                  Remove Sibling
                </Button>
              )}
            </div>
          ))}
      </section>

      {/* Guardian Section */}
      <section className="p-6 border border-gray-200 rounded-xl bg-gray-50">
        <p className="text-lg font-semibold text-gray-700 mb-4">
          GUARDIAN WHILE STAYING IN UP
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Guardian's First Name"
            type="text"
            value={family_data.guardian?.first_name || ""}
            onChange={(e) =>
              handleFieldChange("guardian", "first_name", e.target.value)
            }
            error={errors?.["guardian.first_name"]}
            required
          />
          <FormField
            label="Guardian's Last Name"
            type="text"
            value={family_data.guardian?.last_name || ""}
            onChange={(e) =>
              handleFieldChange("guardian", "last_name", e.target.value)
            }
            error={errors?.["guardian.last_name"]}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField
            label="Contact Number"
            type="text"
            value={family_data.guardian?.contact_number || ""}
            onChange={(e) => handleContactChange("guardian", e.target.value)}
            error={errors?.["guardian.contact_number"]}
            required
          />
          <FormField
            label="Address"
            type="text"
            value={family_data.guardian?.address || ""}
            onChange={(e) =>
              handleFieldChange("guardian", "address", e.target.value)
            }
            error={errors?.["guardian.address"]}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField
            label="Relationship to Guardian"
            type="text"
            value={family_data.guardian?.relationship_to_guardian || ""}
            onChange={(e) =>
              handleFieldChange(
                "guardian",
                "relationship_to_guardian",
                e.target.value
              )
            }
            error={errors?.["guardian.relationship_to_guardian"]}
            required
          />
          <FormField
            label="Languages/Dialect Spoken at Home"
            type="text"
            value={languageInput}
            onChange={handleLanguageChange}
            error={errors?.["guardian.language_dialect"]}
            required
          />
        </div>
      </section>
    </div>
  );
};

export default SCIFFamilyData;
