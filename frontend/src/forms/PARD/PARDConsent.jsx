import React from "react";

const PARDConsent = () => {
    return (
        <div className="p-4">
            <h3 className="text-upmaroon font-bold mb-3">
                CONSENT
            </h3>
            <p className="leading-7">
                I agree to be contacted through the indicated platform of communication by the
                CTS-OSA as indicated in the preferred time of the
                client/counselee/student/personnel. I have read and understood the provisions
                indicated in the instructions, confidentiality, data security, and recording. I hereby
                authorize the CTS-OSA to collect the data indicated herein for psychosocial
                support and referral purposes and for files only. I understand that my personal
                information is protected by RA 10173, Data Privacy Act of 2012, and that the data
                collected will not be shared to the other entities other than the purpose stated.
            </p>
            
            {/* CHECKBOX SECTION*/}
            <div className="mt-10">
                <div className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Yes, I hereby agree and understand.</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <input type="checkbox" />
                    <span>No, I don't agree and understand.</span>
                </div>
            </div>


        </div>
    )
}

export default PARDConsent;