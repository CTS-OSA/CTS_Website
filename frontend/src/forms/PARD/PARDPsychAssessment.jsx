import React from "react";
import FormField from "../../components/FormField";

const PARDPsychAssessment = ({ formData, setFormData, errors = {}, setErrors }) => {
    
    const profession = ["Psychologist", "Psychiatrist", "General Physician", "Not yet"]
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => {
            const prevAssessment = prev.pard_psych_assessment || {};

            // Handle checkbox for diagnosed_by
            if (type === "checkbox" && name === "diagnosed_by") {
            const prevSelected = prevAssessment.diagnosed_by || [];
            let updatedSelection;

            if (checked) {
                // Add to array
                updatedSelection = [...prevSelected, value];
            } else {
                // Remove from array
                updatedSelection = prevSelected.filter((item) => item !== value);
            }

            return {
                ...prev,
                pard_psych_assessment: {
                ...prevAssessment,
                diagnosed_by: updatedSelection,
                },
            };
            }

            // Handle other field types normally
            return {
            ...prev,
            pard_psych_assessment: {
                ...prevAssessment,
                [name]: value,
            },
            };
        });

        // Clear field-specific error if any
        if (errors[name]) {
            setErrors((prev) => ({
            ...prev,
            [name]: null,
            }));
        }
        };


    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold text-xl sm:text-2xl mb-3 ">
                PSYCHOSOCIAL ASSESSMENT
            </h3>

            <h4 className="text-sm md:text-base mb-5">Chief complaint(s)/problems/concerns/disturbances:</h4>

            <hr />

            {/* Form section */}
            <div className="grid grid-cols-2 gap-10 mt-3">
                <div>
                    <label className="text-sm sm:text-base">
                        Started when (attacks or episodes):    
                    </label>
                    <FormField
                        type="date"
                        name="date_started"
                        value={formData.pard_psych_assessment?.date_started || ""}
                        onChange={handleChange}
                    />
                    {errors.date_started && <div className="text-[#D32F2F] text-xs  italic">{errors.date_started}</div>}
                </div>
                <div>
                    <label className="text-sm sm:text-base">
                        Currently on medication?
                    </label>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                id="yes"
                                name="is_diagnosed"
                                value="yes"
                                checked={formData.pard_psych_assessment?.is_currently_on_medication === "yes"}
                                onChange={handleChange}
                            />
                            <label htmlFor="yes">Yes</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                id="no"
                                name="is_diagnosed"
                                value="no"
                                checked={formData.pard_psych_assessment?.is_diagnosed === "no"}
                                onChange={handleChange}
                            />
                            <label htmlFor="no">No</label>
                        </div>
                    </div>
                    {errors.is_diagnosed && <div className="text-[#D32F2F] text-xs  italic">{errors.is_diagnosed}</div>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
            
                <div className="col-span-2">
                    <FormField
                        label="Symptoms observed"
                        type="text"
                        name="symptoms_observed"
                        value={formData.pard_psych_assessment?.symptoms_observed || ""}
                        onChange={handleChange}
                    />
                    {errors.symptoms_observed && <div className="text-[#D32F2F] text-xs  italic">{errors.symptoms_observed}</div>}
                </div>
                <div>
                    <label className="text-sm sm:text-base">
                        Preferred Communication platform
                    </label>
                    <FormField
                        type="select"
                        name="communication_platform"
                        value={formData.pard_psych_assessment?.communication_platform || ""}
                        onChange={handleChange}
                        options={[
                            { value: "zoom", label: "Zoom" },
                            { value: "face_to_face", label: "Face to Face" }
                        ]}
                    />
                    {errors.communication_platform && <div className="text-[#D32F2F] text-xs  italic">{errors.communication_platform}</div>}
                </div>
                
                <div>
                    <label className="text-sm sm:text-base">
                        If you have been diagnosed, when?   
                    </label>
                    <FormField
                        type="date"
                        name="date_diagnosed"
                        onChange={handleChange}
                        value={formData.pard_psych_assessment?.date_diagnosed || ""}
                    />
                    {errors.date_diagnosed && <div className="text-[#D32F2F] text-xs  italic">{errors.date_diagnosed}</div>}
                </div>

                <div>
                    <label className="text-sm sm:text-base">
                        Have been diagnosed by: 
                    </label>

                    {/* CHECKBOX SECTION*/}
                    <div className="mt-3">
                        {profession.map((option) => (
                            <div key={option} className="flex items-center gap-2 mb-2 text-sm md:text-base">
                                <input
                                    type="checkbox"
                                    id={option}
                                    name="diagnosed_by"
                                    value={option}
                                    checked={
                                        formData.pard_psych_assessment?.diagnosed_by?.includes(option) || false
                                    }
                                    onChange={handleChange}
                                />
                                <label htmlFor={option}>{option}</label>
                            </div>
                        ))}

                    </div>
                    {errors.diagnosed_by && <div className="text-[#D32F2F] text-xs  italic">{errors.diagnosed_by}</div>}
                </div>
            </div>
        </div>
    )
}

export default PARDPsychAssessment;