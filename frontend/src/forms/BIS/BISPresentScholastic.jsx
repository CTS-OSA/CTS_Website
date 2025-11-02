import React from "react";
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
    <div className="p-4">
      <fieldset className="space-y-6" disabled={readOnly}>
        <h2 className="text-upmaroon text-2xl font-bold mb-5">
          Present Scholastic Information
        </h2>

        {/* Intended course */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            What course did you intend to take up after graduation from Senior High?
          </label>
          <input
            type="text"
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
            disabled={readOnly}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
              errors?.["scholastic_status.intended_course"] ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
          />
          {errors?.["scholastic_status.intended_course"] && (
            <small className="text-red-500 text-xs">
              {errors["scholastic_status.intended_course"]}
            </small>
          )}
        </div>

        {/* First choice course */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            What course did you indicate as 1st choice in the UPCAT application form?
          </label>
          <input
            type="text"
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
            disabled={readOnly}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
              errors?.["scholastic_status.first_choice_course"] ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
          />
          {errors?.["scholastic_status.first_choice_course"] && (
            <small className="text-red-500 text-xs">
              {errors["scholastic_status.first_choice_course"]}
            </small>
          )}
        </div>

        {/* Admitted course */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            What course were you admitted to?
          </label>
          <input
            type="text"
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
            disabled={readOnly}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
              errors?.["scholastic_status.admitted_course"] ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
          />
          {errors?.["scholastic_status.admitted_course"] && (
            <small className="text-red-500 text-xs">
              {errors["scholastic_status.admitted_course"]}
            </small>
          )}
        </div>

        {/* Conditional next plan field */}
        {showNextPlanField && (
          <div className="space-y-2 pl-6 border-l-4 border-upmaroon/20">
            <label className="block text-sm font-medium text-gray-700">
              If your 1st choice in UPCAT is different from your admitted course, what would be your next plan?
            </label>
            <textarea
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
              disabled={readOnly}
              rows={4}
              className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 resize-none ${
                errors?.["scholastic_status.next_plan"] ? "border-red-500" : "border-gray-300"
              } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
            />
            {errors?.["scholastic_status.next_plan"] && (
              <small className="text-red-500 text-xs">
                {errors["scholastic_status.next_plan"]}
              </small>
            )}
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default BISPresentScholastic;