import React from "react";

const PARDAuthorization = () => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold text-2xl mb-3">
                AUTHORIZATION FOR DISCLOSURE
            </h3>

            <p className="leading-7">
                By signing up and clicking "submit", I gave my full consent to the CTS-OSA to
                provide such information to its MH partners for Psychosocial Support and
                Referral Services.    
            </p>
            
            {/* CHECKBOX SECTION*/}
            <div className="mt-10">
                <div className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Yes, I give my full consent.</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <input type="checkbox" />
                    <span>No, I don’t give my full consent.</span>
                </div>
            </div>

        </div>
    )
}

export default PARDAuthorization;