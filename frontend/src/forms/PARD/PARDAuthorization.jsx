import React from "react";

const PARDAuthorization = ({ formData, setFormData, setError }) => {
    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold text-xl sm:text-2xl mb-3">
                AUTHORIZATION FOR DISCLOSURE
            </h3>

            <p className="leading-7 text-sm sm:text-base">
                By signing up and clicking "submit", I gave my full consent to the CTS-OSA to
                provide such information to its MH partners for Psychosocial Support and
                Referral Services.    
            </p>
            
            {/* CHECKBOX SECTION*/}
            <div className="mt-10">
                <div className="flex items-center gap-2 text-sm sm:text-base">
                    <input 
                        type="checkbox" 
                        required
                        checked={formData.authorization_agreed}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, authorization_agreed: e.target.checked }));
                            if (e.target.checked) {
                                setError(null);
                            }
                    }}/>
                    <span>Yes, I give my full consent.</span>
                </div>
            </div>

        </div>
    )
}

export default PARDAuthorization;