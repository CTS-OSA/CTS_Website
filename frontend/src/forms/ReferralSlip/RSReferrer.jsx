import React from "react";
import FormField from "../../components/FormField";
import { clearError } from "../../utils/helperFunctions";

const RSReferrer = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name;

    setFormData((prev) => ({
      ...prev,
      referrer_details: {
        ...prev.referrer_details,
        [fieldName]: value,
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
    <div className="form-container">
      <h2 className="text-upmaroon text-2xl font-bold pb-4">
        REFERRER DETAILS
      </h2>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Referrer's Last Name"
          name="referrer_last_name"
          value={formData.referrer_details.referrer_last_name || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "referrer_last_name")}
          error={errors?.["referrer_last_name"]}
          required
        />
        <FormField
          label="Referrer's First Name"
          name="referrer_first_name"
          value={formData.referrer_details.referrer_first_name || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "referrer_first_name")}
          error={errors?.["referrer_first_name"]}
          required
        />
      </div>

      <div className="grid gap-4 pb-4">
        <FormField
          label="Unit/Department"
          name="referrer_department"
          value={formData.referrer_details.referrer_department || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "referrer_department")}
          error={errors?.["referrer_department"]}
          required
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Email Address"
          type="email"
          name="referrer_email"
          value={formData.referrer_details.referrer_email || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "referrer_email")}
          error={errors?.["referrer_email"]}
          required
        />
        <FormField
          label="Contact Number"
          name="referrer_contact_number"
          value={formData.referrer_details.referrer_contact_number || ""}
          onBlur={() =>
            clearError(errors, setErrors, "referrer_contact_number")
          }
          onChange={handleChange}
          error={errors?.["referrer_contact_number"]}
          required
        />
      </div>
    </div>
  );
};

export default RSReferrer;
