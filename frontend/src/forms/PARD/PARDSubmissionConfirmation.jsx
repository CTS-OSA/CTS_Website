import React from "react";
import submitcheck from "../../assets/submit-check.svg";

const PARDSubmissionConfirmation = () => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    
    return (
        <div className="flex flex-col justify-center h-[90%]">
            <img src={submitcheck} alt="Submission successful" className="mx-auto mb-4 w-24 h-24" />
            <h3 className="text-upmaroon font-bold text-2xl mb-3 text-center">
                SUBMITTED
            </h3>
            <h5 className="text-center text-sm">Thank you! Your form has been successfully submitted.</h5>
        </div>
    )
}

export default PARDSubmissionConfirmation;