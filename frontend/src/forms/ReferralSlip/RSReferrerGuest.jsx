import React from "react";
import FormField from "../../components/FormField";
import { clearError } from "../../utils/helperFunctions";

const RSReferrerGuest = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name;

    setFormData((prev) => ({
      ...prev,
      referral: {
        ...prev.referral,
        referrer: {
          ...prev.referral.referrer,
          [fieldName]: value,
        },
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
          name="last_name"
          value={formData.referral.referrer?.last_name || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "last_name")}
          error={errors?.["last_name"]}
          required
        />
        <FormField
          label="Referrer's First Name"
          name="first_name"
          value={formData.referral.referrer?.first_name || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "first_name")}
          error={errors?.["first_name"]}
          required
        />
      </div>

      <div className="grid gap-4 pb-4">
        <FormField
          label="Unit/Department"
          name="department_unit"
          value={formData.referral.referrer?.department_unit || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "department_unit")}
          error={errors?.["department_unit"]}
          required
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={formData.referral.referrer?.email || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "email")}
          error={errors?.["email"]}
          required
        />
        <FormField
          label="Contact Number"
          name="contact_number"
          value={formData.referral.referrer?.contact_number || ""}
          onBlur={() => clearError(errors, setErrors, "contact_number")}
          onChange={handleChange}
          error={errors?.["contact_number"]}
          required
        />
      </div>
    </div>
  );
};

export default RSReferrerGuest;
