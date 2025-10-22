import React, { useState } from "react";
import FormField from "../../components/FormField"; // Import your FormField component
import "../SetupProfile/css/multistep.css";
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

    if (fieldType === "alphabet") {
      filteredValue = filterAlphabetsOnly(value);
    } else if (fieldType === "number") {
      filteredValue = filterNumbersOnly(value);
    } else if (fieldType === "general") {
      filteredValue = filterGeneralText(value);
    }

    updateData("family_data", {
      ...family_data,
      [section]: {
        ...family_data[section],
        [field]: filteredValue,
      },
    });
  };

  const addSibling = () => {
    if (Array.isArray(siblings)) {
      updateData("siblings", [
        ...siblings,
        {
          first_name: "",
          last_name: "",
          sex: "",
          age: null,
          job_occupation: "",
          company_school: "",
          educational_attainment: "",
          students: [],
        },
      ]);
    } else {
      updateData("siblings", [
        {
          first_name: "",
          last_name: "",
          sex: "",
          age: null,
          job_occupation: "",
          company_school: "",
          educational_attainment: "",
          students: [],
        },
      ]);
    }
  };

  const removeSibling = (index) => {
    updateData(
      "siblings",
      siblings.filter((_, i) => i !== index)
    );
  };

  const handleSiblingChange = (index, field, value) => {
    if (readOnly) return;

    let filteredValue = value;
    const fieldType = siblingFieldTypes[field];

    if (fieldType === 'alphabet') {
      filteredValue = filterAlphabetsOnly(value);
    } else if (fieldType === 'number') {
      filteredValue = filterNumbersOnly(value);
    } else if (fieldType === 'general') {
      filteredValue = filterGeneralText(value);
    }

    updateData(
      "siblings",
      siblings.map((sibling, i) =>
        i === index ? { ...sibling, [field]: filteredValue } : sibling
      )
    );
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
    <div className="form-section">
      <fieldset className="form-section" disabled={readOnly}>
        <h2 className="step-title">Family Data</h2>
        <small>
          Provide complete details of your parents and siblings; indicate “N/A”
          or “Deceased” if applicable. If your guardians are also your parents,
          write “N/A” or leave the guardian section blank; otherwise, specify
          your guardian while staying in UP.
        </small>

        {/* Father */}
        <section className="subsection-form family-data-father">
          <p className="step-info">
            <strong>FATHER</strong>
          </p>
          <div className="form-row three-columns">
            <FormField
              label="Father's First Name"
              type="text"
              value={family_data.father?.first_name || ""}
              onFocus={() => clearError(errors, setErrors, "father.first_name")}
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
              onFocus={() => clearError(errors, setErrors, "father.last_name")}
              onChange={(e) =>
                handleFieldChange("father", "last_name", e.target.value)
              }
              error={errors?.["father.last_name"]}
              required
            />
            <FormField
              label="Age"
              type="text"
              value={family_data.father?.age ?? ""}
              onFocus={() => clearError(errors, setErrors, "father.age")}
              onChange={(e) =>
                handleFieldChange("father", "age", e.target.value)
              }
              error={errors?.["father.age"]}
              required
            />
          </div>
          <div className="form-row three-columns">
            <FormField
              label="Highest Educational Attainment"
              type="text"
              value={family_data.father?.highest_educational_attainment || ""}
              onFocus={() =>
                clearError(
                  errors,
                  setErrors,
                  "father.highest_educational_attainment"
                )
              }
              onChange={(e) =>
                handleFieldChange(
                  "father",
                  "highest_educational_attainment",
                  e.target.value
                )
              }
              error={errors?.["father.highest_educational_attainment"]}
            />
            <FormField
              label="Job/Occupation"
              type="text"
              value={family_data.father?.job_occupation || ""}
              onFocus={() =>
                clearError(errors, setErrors, "father.job_occupation")
              }
              onChange={(e) =>
                handleFieldChange("father", "job_occupation", e.target.value)
              }
              error={errors?.["father.job_occupation"]}
            />
            <FormField
              label="Contact Number"
              type="text"
              value={family_data.father?.contact_number || ""}
              onFocus={() =>
                clearError(errors, setErrors, "father.contact_number")
              }
              onChange={(e) =>
                handleFieldChange("father", "contact_number", e.target.value)
              }
              error={errors?.["father.contact_number"]}
              required
            />
          </div>
          <div className="form-row three-columns">
            <div>
              <FormField
                label="Company/Agency"
                type="text"
                value={family_data.father?.company_agency || ""}
                onFocus={() =>
                  clearError(errors, setErrors, "father.company_agency")
                }
                onChange={(e) =>
                  handleFieldChange("father", "company_agency", e.target.value)
                }
                error={errors?.["father.company_agency"]}
              />
            </div>
            <div className="span-two-columns">
              <FormField
                label="Company Address"
                type="text"
                value={family_data.father?.company_address || ""}
                onFocus={() =>
                  clearError(errors, setErrors, "father.company_address")
                }
                onChange={(e) =>
                  handleFieldChange("father", "company_address", e.target.value)
                }
                error={errors?.["father.company_address"]}
              />
            </div>
          </div>
        </section>

        {/* Mother */}
        <section className="subsection-form family-data-mother">
          <p className="step-info">
            <strong>MOTHER</strong>
          </p>
          <div className="form-row three-columns">
            <FormField
              label="Mother's First Name"
              type="text"
              value={family_data.mother?.first_name || ""}
              onFocus={() => clearError(errors, setErrors, "mother.first_name")}
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
              onFocus={() => clearError(errors, setErrors, "mother.last_name")}
              onChange={(e) =>
                handleFieldChange("mother", "last_name", e.target.value)
              }
              error={errors?.["mother.last_name"]}
              required
            />
            <FormField
              label="Age"
              type="text"
              value={family_data.mother?.age ?? ""}
              onFocus={() => clearError(errors, setErrors, "mother.age")}
              onChange={(e) =>
                handleFieldChange("mother", "age", e.target.value)
              }
              error={errors?.["mother.age"]}
              required
            />
          </div>
          <div className="form-row three-columns">
            <FormField
              label="Highest Educational Attainment"
              type="text"
              value={family_data.mother?.highest_educational_attainment || ""}
              onFocus={() =>
                clearError(
                  errors,
                  setErrors,
                  "mother.highest_educational_attainment"
                )
              }
              onChange={(e) =>
                handleFieldChange(
                  "mother",
                  "highest_educational_attainment",
                  e.target.value
                )
              }
              error={errors?.["mother.highest_educational_attainment"]}
            />
            <FormField
              label="Job/Occupation"
              type="text"
              value={family_data.mother?.job_occupation || ""}
              onFocus={() =>
                clearError(errors, setErrors, "mother.job_occupation")
              }
              onChange={(e) =>
                handleFieldChange("mother", "job_occupation", e.target.value)
              }
              error={errors?.["mother.job_occupation"]}
            />
            <FormField
              label="Contact Number"
              type="text"
              value={family_data.mother?.contact_number || ""}
              onFocus={() =>
                clearError(errors, setErrors, "mother.contact_number")
              }
              onChange={(e) =>
                handleFieldChange("mother", "contact_number", e.target.value)
              }
              error={errors?.["mother.contact_number"]}
              required
            />
          </div>
          <div className="form-row three-columns">
            <div>
              <FormField
                label="Company/Agency"
                type="text"
                value={family_data.mother?.company_agency || ""}
                onFocus={() =>
                  clearError(errors, setErrors, "mother.company_agency")
                }
                onChange={(e) =>
                  handleFieldChange("mother", "company_agency", e.target.value)
                }
                error={errors?.["mother.company_agency"]}
              />
            </div>
            <div className="span-two-columns">
              <FormField
                label="Company Address"
                type="text"
                value={family_data.mother?.company_address || ""}
                onFocus={() =>
                  clearError(errors, setErrors, "mother.company_address")
                }
                onChange={(e) =>
                  handleFieldChange("mother", "company_address", e.target.value)
                }
                error={errors?.["mother.company_address"]}
              />
            </div>
          </div>
        </section>

        {/* Siblings */}
        <section className="subsection-form family-data-sibling">
          <p className="step-info">
            <strong>SIBLINGS</strong>
          </p>
          {Array.isArray(siblings) &&
            siblings.map((sibling, index) => (
              <div
                key={index}
                className="sibling-section"
                style={{ marginBottom: "2rem" }}
              >
                <p>
                  <strong>Sibling {index + 1}</strong>
                </p>
                <div
                  className="form-row three-columns"
                  style={{ marginTop: "2rem" }}
                >
                  <FormField
                    label="First Name"
                    type="text"
                    value={sibling.first_name || ""}
                    onFocus={() =>
                      clearError(
                        errors,
                        setErrors,
                        `siblings[${index}].first_name`
                      )
                    }
                    onChange={(e) =>
                      handleSiblingChange(index, "first_name", e.target.value)
                    }
                    error={errors?.[`siblings[${index}].first_name`]}
                    required
                  />
                  <FormField
                    label="Last Name"
                    type="text"
                    value={sibling.last_name || ""}
                    onFocus={() =>
                      clearError(
                        errors,
                        setErrors,
                        `siblings[${index}].last_name`
                      )
                    }
                    onChange={(e) =>
                      handleSiblingChange(index, "last_name", e.target.value)
                    }
                    error={errors?.[`siblings[${index}].last_name`]}
                    required
                  />
                  <FormField
                    label="Sex"
                    type="select"
                    value={sibling.sex || ""}
                    onFocus={() =>
                      clearError(errors, setErrors, `siblings[${index}].sex`)
                    }
                    onChange={(e) =>
                      handleSiblingChange(index, "sex", e.target.value)
                    }
                    options={[
                      { value: "", label: "Select" },
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                    ]}
                    error={errors?.[`siblings[${index}].sex`]}
                    required
                  />
                </div>
                <div className="form-row">
                  <FormField
                    label="Age"
                    type="text"
                    value={sibling.age ?? ""}
                    onFocus={() =>
                      clearError(errors, setErrors, `siblings[${index}].age`)
                    }
                    onChange={(e) =>
                      handleSiblingChange(index, "age", e.target.value)
                    }
                    error={errors?.[`siblings[${index}].age`]}
                    required
                  />
                  <FormField
                    label="Job/Occupation"
                    type="text"
                    value={sibling.job_occupation || ""}
                    onFocus={() =>
                      clearError(
                        errors,
                        setErrors,
                        `siblings[${index}].job_occupation`
                      )
                    }
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "job_occupation",
                        e.target.value
                      )
                    }
                    error={errors?.[`siblings[${index}].job_occupation`]}
                  />
                </div>
                <div className="form-row">
                  <FormField
                    label="Company/School"
                    type="text"
                    value={sibling.company_school || ""}
                    onFocus={() =>
                      clearError(
                        errors,
                        setErrors,
                        `siblings[${index}].company_school`
                      )
                    }
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "company_school",
                        e.target.value
                      )
                    }
                    error={errors?.[`siblings[${index}].company_school`]}
                  />
                  <FormField
                    label="Educational Attainment"
                    type="text"
                    value={sibling.educational_attainment || ""}
                    onFocus={() =>
                      clearError(
                        errors,
                        setErrors,
                        `siblings[${index}].educational_attainment`
                      )
                    }
                    onChange={(e) =>
                      handleSiblingChange(
                        index,
                        "educational_attainment",
                        e.target.value
                      )
                    }
                    error={
                      errors?.[`siblings[${index}].educational_attainment`]
                    }
                    required
                  />
                </div>
                {!readOnly && (
                  <Button
                    variant="secondary"
                    onClick={() => removeSibling(index)}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Remove Sibling
                  </Button>
                )}
              </div>
            ))}
          <div className="step-button-form">
            {!readOnly && (
              <Button
                variant="primary"
                onClick={addSibling}
                style={{ marginLeft: "0.5rem" }}
              >
                Add Sibling
              </Button>
            )}
          </div>
        </section>

        {/* Guardian */}
        <section className="subsection-form family-data-guardian">
          <p className="step-info">
            <strong>GUARDIAN WHILE STAYING IN UP</strong>
          </p>
          <div className="form-row">
            <FormField
              label="Guardian's First Name"
              type="text"
              value={family_data.guardian?.first_name || ""}
              onFocus={() =>
                clearError(errors, setErrors, "guardian.first_name")
              }
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
              onFocus={() =>
                clearError(errors, setErrors, "guardian.last_name")
              }
              onChange={(e) =>
                handleFieldChange("guardian", "last_name", e.target.value)
              }
              error={errors?.["guardian.last_name"]}
              required
            />
          </div>
          <div className="form-row">
            <FormField
              label="Contact Number"
              type="text"
              value={family_data.guardian?.contact_number || ""}
              onFocus={() =>
                clearError(errors, setErrors, "guardian.contact_number")
              }
              onChange={(e) =>
                handleFieldChange("guardian", "contact_number", e.target.value)
              }
              error={errors?.["guardian.contact_number"]}
              required
            />
            <FormField
              label="Address"
              type="text"
              value={family_data.guardian?.address || ""}
              onFocus={() => clearError(errors, setErrors, "guardian.address")}
              onChange={(e) =>
                handleFieldChange("guardian", "address", e.target.value)
              }
              error={errors?.["guardian.address"]}
              required
            />
          </div>
          <div className="form-row">
            <FormField
              label="Relationship to Guardian"
              type="text"
              value={family_data.guardian?.relationship_to_guardian || ""}
              onFocus={() =>
                clearError(
                  errors,
                  setErrors,
                  "guardian.relationship_to_guardian"
                )
              }
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
              helpertext="e.g., Tagalog, English"
              required
              error={errors?.["guardian.language_dialect"]}
            />
          </div>
        </section>
      </fieldset>
    </div>
  );
};

export default SCIFFamilyData;
