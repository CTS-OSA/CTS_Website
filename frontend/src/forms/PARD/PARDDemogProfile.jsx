import React from "react";
import FormField from "../../components/FormField";
import { useEnumChoices } from "../../utils/enumChoices";

const PARDDemogProfile = ({ formData, setFormData, errors = {}, setErrors }) => {
    const { enums } = useEnumChoices();  


    // Select dropdown values
    const yearLevel = enums?.year_level|| [];
    const allDegreeOptions = enums?.degree_program || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            pard_demographic_profile: {
                ...prev.pard_demographic_profile,
                [`student_${name}`]: value
            }
        }));
        
        // Clear the specific field error when user types
        if (errors[`student_${name}`]) {
            setErrors(prev => ({
                ...prev,
                [`student_${name}`]: null
            }));
        }
    };
    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold text-2xl mb-5">
                DEMOGRAPHIC PROFILE
            </h3>

            {/* Form section */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <FormField
                        label="Surname"
                        type="text"
                        name="last_name"
                        value={formData.pard_demographic_profile?.student_last_name || ""}
                        onChange={handleChange}
                    />
                    {errors.student_last_name && <div className="text-[#D32F2F] text-xs  italic">{errors.student_last_name}</div>}
                </div>
                <div>
                    <FormField
                        label="First Name"
                        type="text"
                        name="first_name"
                        value={formData.pard_demographic_profile?.student_first_name || ""}
                        onChange={handleChange}
                    />
                    {errors.student_first_name && <div className="text-[#D32F2F] text-xs  italic">{errors.student_first_name}</div>}
                </div>
                <div>
                    <FormField
                        label="Middle Name"
                        type="text"
                        name="middle_name"
                        value={formData.pard_demographic_profile?.student_middle_name || ""}
                        onChange={handleChange}
                    />
                    {errors.student_middle_name && <div className="text-[#D32F2F] text-xs  italic">{errors.student_middle_name}</div>}
                </div>
                <div>
                    <FormField
                        label="Nickname"
                        type="text"
                        name="nickname"
                        value={formData.pard_demographic_profile?.student_nickname || ""}
                        onChange={handleChange}
                    />
                    {errors.student_nickname && <div className="text-[#D32F2F] text-xs  italic">{errors.student_nickname}</div>}
                </div>
                <div>
                    <FormField
                        label="Year Level"
                        type="select"
                        name="year"
                        value={formData.pard_demographic_profile?.student_year || ""}
                        onChange={handleChange}
                        options={yearLevel.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                        }))}
                    />
                    {errors.student_year && <div className="text-[#D32F2F] text-xs  italic">{errors.student_year}</div>}
                </div>
                <div>
                    <FormField
                        label="Program/Course"
                        type="select"
                        name="degree_program"
                        value={formData.pard_demographic_profile?.student_degree_program || ""}
                        onChange={handleChange}
                        options={allDegreeOptions.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                        }))}
                    />
                    {errors.student_degree_program && <div className="text-[#D32F2F] text-xs  italic">{errors.student_degree_program}</div>}
                </div>
            </div>
        </div>
    )
}

export default PARDDemogProfile;