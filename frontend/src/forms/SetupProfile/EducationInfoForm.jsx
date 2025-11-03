import React from "react";
import FormField from "../../components/FormField";
import "./css/multistep.css";
import { useEnumChoices } from "../../utils/enumChoices";
import { clearError } from "../../utils/helperFunctions";

const EducationInfoForm = ({ formData, setFormData, errors, setErrors }) => {
  const { enums, loading, error } = useEnumChoices();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "degree_program" && enums?.degree_to_college) {
      const mappedColleges = enums.degree_to_college[value];
      if (mappedColleges?.length === 1) {
        setFormData((prev) => ({
          ...prev,
          degree_program: value,
          college: mappedColleges[0],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          degree_program: value,
          college: "",
        }));
      }
      return;
    }

    if (name === "college" && enums?.degree_to_college) {
      // Get valid degrees for selected college
      const validDegrees = Object.entries(enums.degree_to_college)
        .filter(([_, colleges]) => colleges.includes(value))
        .map(([degree]) => degree);

      setFormData((prev) => ({
        ...prev,
        college: value,
        degree_program: validDegrees.includes(prev.degree_program)
          ? prev.degree_program
          : "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data: {error}</div>;

  // Filter college options based on selected degree_program
  const filteredCollegeOptions = enums?.college?.filter((college) =>
    formData.degree_program
      ? enums?.degree_to_college?.[formData.degree_program]?.includes(
          college.value
        )
      : true
  );

  // Filter degree options based on selected college
  const filteredDegreeOptions = enums?.degree_program?.filter((degree) =>
    formData.college
      ? enums?.degree_to_college?.[degree.value]?.includes(formData.college)
      : true
  );

  return (
    <div className="form-container">
      <h2 className="text-upmaroon text-2xl font-bold pb-4">Education Information</h2>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <div className="form-group">
          <FormField
            label="Student Number"
            name="student_number"
            value={formData.student_number}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "education.student_number")
            }
            error={errors?.["education.student_number"]}
            required
          />
        </div>
        <div className="form-group">
          <FormField
            label="Current Year Level"
            name="current_year_level"
            type="select"
            value={formData.current_year_level}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "education.current_year_level")
            }
            required
            error={errors?.["education.current_year_level"]}
            options={
              enums?.year_level?.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })) || []
            }
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <div className="form-group">
          <FormField
            label="College / Department"
            name="college"
            type="select"
            value={formData.college}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, "education.college")}
            required
            error={errors?.["education.college"]}
            options={[
              { value: "", label: "-- Clear Selection --" },
              ...(filteredCollegeOptions?.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })) || []),
            ]}
          />
        </div>
        <div className="form-group">
          <FormField
            label="Degree Program"
            name="degree_program"
            type="select"
            value={formData.degree_program}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "education.degree_program")
            }
            required
            error={errors?.["education.degree_program"]}
            options={[
              { value: "", label: "-- Clear Selection --" },
              ...(filteredDegreeOptions?.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })) || []),
            ]}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pb-4">
        <div className="form-group">
          <FormField
            label="Academic Year of Initial Entry"
            name="date_initial_entry"
            value={formData.date_initial_entry}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "education.date_initial_entry")
            }
            required
            error={errors?.["education.date_initial_entry"]}
            placeholder="2023-2024"
          />
        </div>
        <div className="form-group">
          <FormField
            label="Semester"
            name="date_initial_entry_sem"
            type="select"
            value={formData.date_initial_entry_sem}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, "education.date_initial_entry_sem")
            }
            required
            error={errors?.["education.date_initial_entry_sem"]}
            options={
              enums?.semester?.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })) || []
            }
          />
        </div>
      </div>
    </div>
  );
};

export default EducationInfoForm;
