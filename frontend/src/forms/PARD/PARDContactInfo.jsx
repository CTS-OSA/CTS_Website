import React from "react";
import FormField from "../../components/FormField";

const PARDContactInfo = () => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold text-2xl mb-5">
                CONTACT INFORMATION
            </h3>

            {/* Form section */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <FormField
                        label="Contact Number"
                        type="text"
                        name="contact_number"
                    />
                </div>
                <div>
                    <FormField
                        label="Email Address"
                        type="text"
                        name="email_address"
                    />
                </div>
                <div>
                    <FormField
                        label="Hometown Address"
                        type="text"
                        name="address"
                    />
                </div>
                <div>
                    <FormField
                        label="Current Address"
                        type="text"
                        name="current_address"
                    />
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
                </div>
            </div>

        </div>
    )
}

export default PARDContactInfo;