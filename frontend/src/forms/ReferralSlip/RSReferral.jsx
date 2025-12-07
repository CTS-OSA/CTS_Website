import React from "react";
import { clearError } from "../../utils/helperFunctions";
import FormField from "../../components/FormField";
import { filterGeneralText } from "../../utils/inputFilters";

const RSRefferal = ({
  formData,
  setFormData,
  readOnly = false,
  errors = {},
  setErrors,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name;
    let filteredValue = filterGeneralText(value);

    setFormData((prev) => ({
      ...prev,
      referral: {
        ...prev.referral,
        [fieldName]: filteredValue,
      },
    }));
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <fieldset disabled={readOnly} className="space-y-6">
        <h2 className="text-upmaroon text-2xl font-bold">
          REFERRAL DETAILS
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Reason for Referral
          </label>
          <FormField
            type="textarea"
            name="reason_for_referral"
            value={formData.referral.reason_for_referral || ""}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, "reason_for_referral")}
            error={errors?.["reason_for_referral"]}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Initial Actions Taken
          </label>
          <FormField
            type="textarea"
            name="initial_actions_taken"
            value={formData.referral.initial_actions_taken || ""}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "initial_actions_taken")
            }
            error={errors?.["initial_actions_taken"]}
          />
        </div>
      </fieldset>
    </div>
  );
};

export default RSRefferal;
