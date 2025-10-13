import React from "react";
import FormField from "../../components/FormField";
import "../SetupProfile/css/multistep.css";
import { clearError } from "../../utils/helperFunctions";

const ALPHA_REGEX = /^[A-Za-z\s]*$/;
const NON_ALPHA_REGEX = /[^A-Za-z\s]/g;

const BISPresentScholastic = ({
  data,
  updateData,
  errors,
  readOnly = false,
  setErrors
}) => {
  const sanitizeAlpha = (value) => {
    if (typeof value !== "string") return value;
    return ALPHA_REGEX.test(value) ? value : value.replace(NON_ALPHA_REGEX, "");
  };

  const handleChange = (e) => {
    if (readOnly) return;

    const { name, value } = e.target;
    const sanitizedValue = sanitizeAlpha(value);

    let updatedData = {
      ...data,
      [name]: sanitizedValue,
    };

    if (
      (name === "first_choice_course" || name === "admitted_course") &&
      updatedData.first_choice_course === updatedData.admitted_course
    ) {
      updatedData = {
        ...updatedData,
        next_plan: "",
      };
    }

    updateData(updatedData);
  };

  const showNextPlanField =
    data.first_choice_course &&
    data.admitted_course &&
    data.first_choice_course !== data.admitted_course;

  return (
    <div className="form-section">
      <fieldset className="form-section" disabled={readOnly}>
        <h2 className="step-title">Present Scholastic Information</h2>

        <div className="form-row full-width">
          <label className="form-label">
            What course did you intend to take up after graduation from Senior
            High?
          </label>
          <input
            type="text"
            className={`form-input ${
              errors?.["scholastic_status.intended_course"] ? "error" : ""
            }`}
            name="intended_course"
            value={data.intended_course || ""}
            onChange={handleChange}
            onFocus={() => {
              clearError("scholastic_status.intended_course");
              setErrors((prev) => ({
                ...prev,
                ["scholastic_status.intended_course"]: undefined,
              }));
            }}
          />
          {errors?.["scholastic_status.intended_course"] && (
            <small className="error-message">{errors["scholastic_status.intended_course"]}</small>
          )}
        </div>

        <div className="form-row full-width">
          <label className="form-label">
            What course did you indicate as 1st choice in the UPCAT application
            form?
          </label>
          <input
            type="text"
            className={`form-input ${
              errors?.["scholastic_status.first_choice_course"] ? "error" : ""
            }`}
            name="first_choice_course"
            value={data.first_choice_course || ""}
            onChange={handleChange}
            onFocus={() => {
              clearError("scholastic_status.first_choice_course");
              setErrors((prev) => ({
                ...prev,
                ["scholastic_status.first_choice_course"]: undefined,
              }));
            }}
          />
          {errors?.["scholastic_status.first_choice_course"] && (
            <small className="error-message">
              {errors["scholastic_status.first_choice_course"]}
            </small>
          )}
        </div>

        <div className="form-row full-width">
          <label className="form-label">
            What course were you admitted to?
          </label>
          <input
            type="text"
            className={`form-input ${
              errors?.["scholastic_status.admitted_course"] ? "error" : ""
            }`}
            name="admitted_course"
            value={data.admitted_course || ""}
            onChange={handleChange}
            onFocus={() => {
              clearError("scholastic_status.admitted_course");
              setErrors((prev) => ({
                ...prev,
                ["scholastic_status.admitted_course"]: undefined,
              }));
            }}
          />
          {errors?.["scholastic_status.admitted_course"] && (
            <small className="error-message">{errors["scholastic_status.admitted_course"]}</small>
          )}
        </div>

        {showNextPlanField && (
          <div className="form-row full-width">
            <label className="form-label">
              If your 1st choice in UPCAT is different from your admitted
              course, what would be your next plan?
            </label>
            <input
              type="text"
              className={`form-input ${errors?.["scholastic_status.next_plan"] ? "error" : ""}`}
              name="next_plan"
              value={data.next_plan || ""}
              onChange={handleChange}
              onFocus={() => {
                clearError("scholastic_status.next_plan");
                setErrors((prev) => ({
                  ...prev,
                  ["scholastic_status.next_plan"]: undefined,
                }));
              }}
            />
            {errors?.["scholastic_status.next_plan"] && (
              <small className="error-message">{errors["scholastic_status.next_plan"]}</small>
            )}
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default BISPresentScholastic;
