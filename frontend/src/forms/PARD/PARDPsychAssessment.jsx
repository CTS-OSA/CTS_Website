import React from "react";
import FormField from "../../components/FormField";

const PARDPsychAssessment = ({ formData, setFormData }) => {
    
    const profession = ["Psychologist", "Psychiatrist", "General Physician", "Not yet"]
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold text-2xl mb-3">
                PSYCHOSOCIAL ASSESSMENT
            </h3>

            <h4 className="text-sm mb-5">Chief complaint(s)/problems/concerns/disturbances:</h4>

            <hr />
            {/* Form section */}
            <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                    <label>
                        Started when (attacks or episodes):    
                    </label>
                    <FormField
                        type="date"
                        name="date"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>
                        If you have been diagnosed, when?   
                    </label>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                id="yes"
                                name="is_diagnosed"
                                value="yes"
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
                                onChange={handleChange}
                            />
                            <label htmlFor="no">No</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
            
                <div className="col-span-2">
                    <FormField
                        label="Symptoms observed"
                        type="text"
                        name="symptoms_observed"
                    />
                </div>
                <div>
                    <label>
                        Preferred Communication platform
                    </label>
                    <FormField
                        type="select"
                        name="communication_platform"
                        onChange={handleChange}
                        options={[
                            { value: "zoom", label: "Zoom" },
                            { value: "face_to_face", label: "Face to Face" }
                        ]}
                    />
                </div>
                
                <div>
                    <label>
                        If you have been diagnosed, when?   
                    </label>
                    <FormField
                        type="date"
                        name="date"
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>
                        Have been diagnosed by: 
                    </label>

                    {/* CHECKBOX SECTION*/}
                    <div className="mt-3">
                        {profession.map((option) => (
                            <div key={option} className="flex items-center gap-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    id={option}
                                    name="diagnosed_by"
                                    value={option}
                                />
                                <label htmlFor={option}>{option}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PARDPsychAssessment;