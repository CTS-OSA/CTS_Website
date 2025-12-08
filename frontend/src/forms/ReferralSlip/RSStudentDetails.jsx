import React from "react";
import FormField from "../../components/FormField";
import { clearError } from "../../utils/helperFunctions";
import { useEnumChoices } from "../../utils/enumChoices";
import { filterAlphabetsOnly, filterNumbersOnly } from "../../utils/inputFilters";

const RSStudentDetails = ({
  formData,
  setFormData,
  errors = {},
  setErrors,
}) => {
  const { enums } = useEnumChoices();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Apply input filters
    if (["first_name", "last_name", "gender"].includes(name)) {
      filteredValue = filterAlphabetsOnly(value);
    }
    if (name === "contact_number") {
      filteredValue = filterNumbersOnly(value);
    }

    setFormData((prev) => ({
      ...prev,
      referral: {
        ...prev.referral,
        referred_person: {
          ...prev.referral.referred_person,
          [name]: filteredValue,
        },
      },
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const allDegreeOptions = enums?.degree_program || [];

  return (
    <div className="form-container">
      <h2 className="text-upmaroon text-2xl font-bold pb-4">
        STUDENT TO BE REFERRED DETAILS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Last Name"
          type="text"
          name="last_name"
          value={formData.referral.referred_person?.last_name || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "last_name")}
          required
          error={errors?.["last_name"]}
        />
        <FormField
          label="First Name"
          type="text"
          name="first_name"
          value={formData.referral.referred_person?.first_name || ""}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "first_name")}
          required
          error={errors?.["first_name"]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        <div>
          <FormField
            label="Current Year Level"
            name="year_level"
            type="select"
            value={formData.referral.referred_person?.year_level || ""}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, "year_level")}
            required
            error={errors?.["year_level"]}
            options={
              enums?.year_level?.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })) || []
            }
          />
        </div>

        <FormField
          label="Degree Program"
          name="degree_program"
          type="select"
          value={formData.referral.referred_person?.degree_program}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "degree_program")}
          required
          error={errors?.["degree_program"]}
          options={allDegreeOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Gender"
          type="text"
          name="gender"
          value={formData.referral.referred_person?.gender}
          onChange={handleChange}
          onFocus={() => clearError(errors, setErrors, "gender")}
          required
          error={errors?.["gender"]}
        />
        <FormField
          label="Mobile Number"
          name="contact_number"
          value={formData.referral.referred_person?.contact_number}
          onBlur={() => clearError(errors, setErrors, "contact_number")}
          onChange={handleChange}
          error={errors?.["contact_number"]}
          required
        />
      </div>
    </div>
  );
};

export default RSStudentDetails;
