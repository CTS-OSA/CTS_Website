import React from "react";
import "../SetupProfile/css/multistep.css";
import { clearError } from "../../utils/helperFunctions";
import FormField from "../../components/FormField";
import { filterGeneralText } from "../../utils/inputFilters";
const ALPHA_REGEX = /^[A-Za-z\s]*$/;
const ALPHA_SPACE_REGEX = /[^A-Za-z\s]/g;
const ALPHA_NUM_COMMA_DASH_REGEX = /[^A-Za-z0-9\s,-]/g;

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
      referral_details: {
        ...prev.referral_details,
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
    <div>
      <fieldset disabled={readOnly}>
        <h2 className="text-upmaroon text-2xl font-bold">REFERRAL DETAILS</h2>

        <div className="form-row full-width">
          <label className="form-label">Reason for Referral</label>
          <FormField
            type="textarea"
            name="reason_for_referral"
            value={formData.referral_details.reason_for_referral || ""}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, "reason_for_referral")}
            error={errors?.["reason_for_referral"]}
          />
        </div>

        <div className="form-row full-width">
          <label className="form-label">Initial Actions Taken</label>
          <FormField
            type="textarea"
            name="initial_actions_taken"
            value={formData.referral_details.initial_actions_taken || ""}
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
