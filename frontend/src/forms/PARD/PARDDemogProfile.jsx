import React from "react";
import FormField from "../../components/FormField";
import { useEnumChoices } from "../../utils/enumChoices";

const PARDDemogProfile = ({ formData, setFormData, errors, setErrors }) => {
    const { enums } = useEnumChoices();

    // Select dropdown values
    const yearLevel = enums?.year_level|| [];
    const allDegreeOptions = enums?.degree_program || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold text-2xl mb-3">
                DEMOGRAPHIC PROFILE
            </h3>

            {/* Form section */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <FormField
                        label="Surname"
                        type="text"
                        name="surname"
                    />
                </div>
                <div>
                    <FormField
                        label="First Name"
                        type="text"
                        name="first_name"
                    />
                </div>
                <div>
                    <FormField
                        label="Middle Name"
                        type="text"
                        name="middle_name"
                    />
                </div>
                <div>
                    <FormField
                        label="Nickname"
                        type="text"
                        name="nickname"
                    />
                </div>
                <div>
                    <FormField
                        label="Year Level"
                        type="select"
                        name="year"
                        onChange={handleChange}
                        options={yearLevel.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                        }))}
                    />
                </div>
                <div>
                    <FormField
                        label="Program/Course"
                        type="select"
                        name="course"
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
            </div>
        </div>
    )
}

export default PARDDemogProfile;