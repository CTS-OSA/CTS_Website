import React from "react";
import FormField from "../../components/FormField"; // Adjust path if needed
import { clearError } from "../../utils/helperFunctions";

const AdminPersonalInfo = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  return (

    <div className="form-container">
      <h2 className="text-[#7b1113] text-2xl font-bold pb-4">Personal Information</h2>

      <div className="grid lg:grid-cols-3 gap-4 pb-4">
        <FormField
          label="First Name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.first_name")
          }
          error={errors?.["personal_info.first_name"]}
          required
        />
        <FormField
          label="Last Name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.last_name")
          }
          error={errors?.["personal_info.last_name"]}
          required
        />
        <FormField
          label="Suffix"
          name="suffix"
          value={formData.suffix}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.suffix")
          }
          error={errors?.["personal_info.suffix"]}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Middle Name"
          name="middle_name"
          value={formData.middle_name}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.middle_name")
          }
          error={errors?.["personal_info.middle_name"]}
        />
        <FormField
          label="Nickname"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.nickname")
          }
          error={errors?.["personal_info.nickname"]}
          required
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Sex"
          name="sex"
          type="select"
          value={formData.sex}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "personal_info.sex")}
          error={errors?.["personal_info.sex"]}
          required
          options={[
            { value: "", label: "Select Sex" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />
        <FormField
          label="Birthdate"
          name="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "personal_info.birthdate")}
          error={errors?.["personal_info.birthdate"]}
          required
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Contact Number"
          name="contact_number"
          value={formData.contact_number}
          onBlur={() => clearError(errors, setErrors, "personal_info.contact_number")}
          onChange={handleChange}
          error={errors?.["personal_info.contact_number"]}
          required
        />
      </div>
    </div>
  );
};

export default AdminPersonalInfo;
