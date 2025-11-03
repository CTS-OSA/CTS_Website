import React from "react";
import FormField from "../../components/FormField";
import { clearError } from "../../utils/helperFunctions";
import { useEnumChoices } from "../../utils/enumChoices";

const RSReferrer = ({ formData, setFormData, errors, setErrors }) => {
  const { enums, loading, error } = useEnumChoices();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <div className="form-container">
      <h2 className="text-upmaroon text-2xl font-bold pb-4">
        REFERRER DETAILS
      </h2>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Referrer's Last Name"
          name="family_name"
          //   value={formData.family_name}
          onChange={handleChange}
          //   onFocus={() =>
          //     clearError(errors, setErrors, "personal_info.family_name")
          //   }
          //   error={errors?.["personal_info.family_name"]}
          required
        />
        <FormField
          label="Referrer's First Name"
          name="first_name"
          //   value={formData.first_name}
          onChange={handleChange}
          //   onFocus={() =>
          //     clearError(errors, setErrors, "personal_info.first_name")
          //   }
          //   error={errors?.["personal_info.first_name"]}
          required
        />
      </div>

      <div className="grid gap-4 pb-4">
        <FormField
          label="Unit/Department"
          name="first_name"
          //   value={formData.first_name}
          onChange={handleChange}
          //   onFocus={() =>
          //     clearError(errors, setErrors, "personal_info.first_name")
          //   }
          //   error={errors?.["personal_info.first_name"]}
          required
        />
      </div>

      <div className="grid gap-4 pb-4">
        <FormField
          label="Email Address"
          name="gender"
          //   value={formData.gender}
          onChange={handleChange}
          //   onFocus={() => clearError(errors, setErrors, "personal_info.gender")}
          //   error={errors?.["personal_info.gender"]}
          required
          type="email"
        />

        <div className="grid gap-4 pb-4">
          <FormField
            label="Contact Number"
            name="mobile_number"
            // value={formData.mobile_number}
            // onBlur={() =>
            //   clearError(errors, setErrors, "personal_info.mobile_number")
            // }
            onChange={handleChange}
            // error={errors?.["personal_info.mobile_number"]}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default RSReferrer;
