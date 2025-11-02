import React from "react";
import FormField from "../../components/FormField";

const PARDContactInfo = ({ formData, setFormData, errors = {}, setErrors }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            pard_contact_info: {
                ...prev.pard_contact_info,
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
            <h3 className="text-upmaroon font-bold text-2xl mb-3">
                CONTACT INFO
            </h3>

            {/* Form section */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <FormField
                        label="Contact Number"
                        type="text"
                        name="contact_number"
                    />
                    {errors.student_contact_number && <div className="text-[#D32F2F] text-xs  italic">{errors.student_contact_number}</div>}
                </div>
                <div>
                    <FormField
                        label="Email Address"
                        type="text"
                        name="email_address"
                    />
                    {errors.student_email && <div className="text-[#D32F2F] text-xs  italic">{errors.student_email}</div>}
                </div>
                <div className="col-span-2">
                    <FormField
                        label="Hometown Address"
                        type="text"
                        name="address"
                        />
                    {errors.student_hometown_address && <div className="text-[#D32F2F] text-xs  italic">{errors.student_hometown_address}</div>}
                </div>
                <div className="col-span-2">
                    <FormField
                        label="Current Address"
                        type="text"
                        name="current_address"
                        />
                    {errors.student_current_address && <div className="text-[#D32F2F] text-xs  italic">{errors.student_current_address}</div>}
                </div>
                <div>
                    <label>
                        Preferred day to be contacted
                    </label>
                    <FormField
                        type="date"
                        name="date"
                        onChange={handleChange}
                        />
                    {errors.student_preferred_date && <div className="text-[#D32F2F] text-xs  italic">{errors.student_preferred_date}</div>}
                </div>
                <div>
                    <label>
                        Preferred time to be contacted
                    </label>
                    <FormField
                        type="time"
                        name="time"
                        onChange={handleChange}
                        />
                    {errors.student_preferred_time && <div className="text-[#D32F2F] text-xs  italic">{errors.student_preferred_time}</div>}
                </div>
            </div>

        </div>
    )
}

export default PARDContactInfo;