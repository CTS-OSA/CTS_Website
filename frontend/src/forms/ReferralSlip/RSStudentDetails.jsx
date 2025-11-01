import React from "react";
import FormField from "../../components/FormField";
import { clearError } from "../../utils/helperFunctions";
import { useEnumChoices } from "../../utils/enumChoices";

const RSStudentDetails = ({ formData, setFormData, errors, setErrors }) => {
  const { enums, loading, error } = useEnumChoices();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const allDegreeOptions = enums?.degree_program || [];
  return (
    <div className="form-container">
      <h2 className="text-upmaroon text-2xl font-bold pb-4">
        Student to be referred details
      </h2>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Last Name"
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
          label="First Name"
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

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Current Year Level"
          name="current_year_level"
          type="select"
          //   value={formData.current_year_level}
          onChange={handleChange}
          //   onFocus={() =>
          //     clearError(errors, setErrors, "education.current_year_level")
          //   }
          //   required
          //   error={errors?.["education.current_year_level"]}
          options={
            enums?.year_level?.map((opt) => ({
              value: opt.value,
              label: opt.label,
            })) || []
          }
        />

        <FormField
          label="Degree Program"
          name="degree_program"
          type="select"
          //   value={formData.degree_program}
          onChange={handleChange}
          //   onFocus={() =>
          //     clearError(errors, setErrors, "education.degree_program")
          //   }
          //   required
          //   error={errors?.["education.degree_program"]}
          options={allDegreeOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
        />
      </div>

      <div className="grid gap-4 pb-4">
        <FormField
          label="Gender"
          name="gender"
          //   value={formData.gender}
          onChange={handleChange}
          //   onFocus={() => clearError(errors, setErrors, "personal_info.gender")}
          //   error={errors?.["personal_info.gender"]}
          required
        />

        <div className="grid gap-4 pb-4">
          <FormField
            label="Mobile Number"
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

export default RSStudentDetails;
