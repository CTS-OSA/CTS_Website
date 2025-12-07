import React from "react";
import FormField from "../../components/FormField";

const PARDContactInfo = ({ formData, setFormData, errors = {}, setErrors }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        const fieldName = name;
        
        setFormData((prev) => ({
            ...prev,
            pard_contact_info: {
                ...prev.pard_contact_info,
                [fieldName]: value
            }
        }));
        
        // Clear the specific field error when user types
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: null
            }));
        }
    };

    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold text-xl sm:text-2xl mb-3">
                CONTACT INFO
            </h3>

            {/* Form section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FormField
                        label="Contact Number"
                        type="text"
                        name="student_contact_number"
                        value={formData.pard_contact_info?.student_contact_number || ""}
                        // onChange={handleChange}
                        readOnly
                    />
                    {/* {errors.student_contact_number && <div className="text-[#D32F2F] text-xs  italic">{errors.student_contact_number}</div>} */}
                </div>
                <div>
                    <FormField
                        label="Email Address"
                        type="text"
                        name="student_email"
                        value={formData.pard_contact_info?.student_email || ""}
                        // onChange={handleChange}
                        readOnly
                    />
                    {/* {errors.student_email && <div className="text-[#D32F2F] text-xs  italic">{errors.student_email}</div>} */}
                </div>
                <div className="md:col-span-2">
                    <FormField
                        label="Hometown Address"
                        type="text"
                        name="hometown_address"
                        value={formData.pard_contact_info?.hometown_address || ""}
                        // onChange={handleChange}
                        readOnly
                        />
                    {/* {errors.hometown_address && <div className="text-[#D32F2F] text-xs  italic">{errors.hometown_address}</div>} */}
                </div>
                <div className="md:col-span-2">
                    <FormField
                        label="Current Address"
                        type="text"
                        name="current_address"
                        value={formData.pard_contact_info?.current_address || ""}
                        // onChange={handleChange}
                        readOnly
                        />
                    {/* {errors.current_address && <div className="text-[#D32F2F] text-xs  italic">{errors.current_address}</div>} */}
                </div>
                <div>
                    <label className="text-xs sm:text-sm md:text-base">
                        Preferred day to be contacted
                    </label>
                    <FormField
                        type="date"
                        name="preferred_date"
                        value={formData.pard_contact_info?.preferred_date || ""}
                        onChange={handleChange}
                        />
                    {errors.preferred_date && <div className="text-[#D32F2F] text-xs  italic">{errors.preferred_date}</div>}
                </div>
                <div>
                    <label className="text-xs sm:text-sm md:text-base">
                        Preferred time to be contacted
                    </label>
                    <FormField
                        type="time"
                        name="preferred_time"
                        value={formData.pard_contact_info?.preferred_time || ""}
                        onChange={handleChange}
                        />
                    {errors.preferred_time && <div className="text-[#D32F2F] text-xs  italic">{errors.preferred_time}</div>}
                </div>
            </div>

        </div>
    )
}

export default PARDContactInfo;
