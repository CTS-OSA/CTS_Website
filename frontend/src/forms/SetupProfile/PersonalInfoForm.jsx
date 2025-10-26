import React from "react";
import FormField from "../../components/FormField"; // Adjust path if needed
import "./css/multistep.css";
import { clearError } from "../../utils/helperFunctions";

const PersonalInfoForm = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const monthOptions = [...Array(12).keys()].map((i) => ({
    value: i + 1,
    label: new Date(2025, i).toLocaleString("default", { month: "long" }),
  }));

  const dayOptions = [...Array(31).keys()].map((i) => ({
    value: i + 1,
    label: i + 1,
  }));

  const yearOptions = [...Array(100).keys()].map((i) => {
    const year = 2025 - i;
    return { value: year, label: year };
  });

  return (
    <div className="form-container">
      <h2 className="text-[#7b1113] text-2xl font-bold pb-4">Personal Information</h2>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Last Name"
          name="family_name"
          value={formData.family_name}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.family_name")
          }
          error={errors?.["personal_info.family_name"]}
          required
        />
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
          label="Religion"
          name="religion"
          value={formData.religion}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.religion")
          }
          error={errors?.["personal_info.religion"]}
        />
      </div>

      <div className="birthdate-group">
        <label className="font-semibold">Birthdate*
        </label>
        <div
          className="grid lg:grid-cols-3 gap-4 pb-4"
          style={{ marginTop: "1rem" }}
        >
          <FormField
            label="Month"
            name="birthMonth"
            type="select"
            value={formData.birthMonth}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "personal_info.birthMonth")
            }
            error={errors?.["personal_info.birthMonth"]}
            required
            options={[{ value: "", label: "Month" }, ...monthOptions]}
          />
          <FormField
            label="Day"
            name="birthDay"
            type="select"
            value={formData.birthDay}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "personal_info.birthDay")
            }
            error={errors?.["personal_info.birthDay"]}
            required
            options={[{ value: "", label: "Day" }, ...dayOptions]}
          />
          <FormField
            label="Year"
            name="birthYear"
            type="select"
            value={formData.birthYear}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "personal_info.birthYear")
            }
            error={errors?.["personal_info.birthYear"]}
            required
            options={[{ value: "", label: "Year" }, ...yearOptions]}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Birth Place"
          name="birth_place"
          value={formData.birth_place}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.birth_place")
          }
          error={errors?.["personal_info.birth_place"]}
          required
        />
        <FormField
          label="Birth Rank"
          name="birth_rank"
          type="number"
          min="1"
          value={formData.birth_rank}
          onChange={handleChange}
          error={errors?.["personal_info.birth_rank"]}
          onBlur={() => {
            clearError(errors, setErrors, "personal_info.birth_rank")
          }}
          required
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Mobile Number"
          name="mobile_number"
          value={formData.mobile_number}
          onBlur={() => clearError(errors, setErrors, "personal_info.mobile_number")}
          onChange={handleChange}
          error={errors?.["personal_info.mobile_number"]}
          required
        />
        <FormField
          label="Landline Number"
          name="landline_number"
          value={formData.landline_number}
          onChange={handleChange}
          onFocus={() =>
            clearError(errors, setErrors, "personal_info.landline_number")
          }
          error={errors?.["personal_info.landline_number"]}
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
