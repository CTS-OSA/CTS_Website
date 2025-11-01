import React, { useState, useContext } from "react";
import { useApiRequest } from "../../context/ApiRequestContext";
import DefaultLayout from "../../components/DefaultLayout";
import StepIndicator from "../../components/StepIndicator";
import { AuthContext } from "../../context/AuthContext";


// Sections
import PARDIntroduction from "./PARDIntroduction";
import PARDConsent from "./PARDConsent";
import PARDDemogProfile from "./PARDDemogProfile";
import PARDContactInfo from "./PARDContactInfo";
import PARDPsychAssessment from "./PARDPsychAssessment";
import PARDAuthorization from "./PARDAuthorization";
import PARDSubmissionConfirmation from "./PARDSubmissionConfirmation";

import Button from "../../components/UIButton";
import ToastMessage from "../../components/ToastMessage";
import ConfirmDialog from "../../components/ConfirmDialog";
import ModalMessage from "../../components/ModalMessage";
import { useNavigate } from "react-router-dom";

const PARD = () => {
    const { request } = useApiRequest();
    const { profileData } = useContext(AuthContext);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formData, setFormData] = useState({
        pard_demographic_profile: {
            student_last_name: "",
            student_first_name: "",
            student_middle_name: "",
            student_nickname: "",
            student_year: "",
            student_degree_program: "",
        }
      });

    const [error, setError] = useState(null);
    

    const handleSaveDraft = async () => {
        if (!submissionId) {
        alert("Submission ID is missing. Try reloading the page.");
        return;
        }

        setLoading(true);
        try {
        const response = await saveDraft(submissionId, studentNumber, formData);

        if (response?.ok) {
            setShowDraftSuccessToast(true);
        } else {
            alert("Error saving draft.");
        }
        } catch (err) {
        alert("Failed to save draft.");
        } finally {
        setLoading(false);
        }
    };

    const handleNextStep = () => {
        // Uncomment when validation logic is available
        // const validationErrors = validateStep(step, formData);

        // if (
        //   validationErrors &&
        //   typeof validationErrors === "object" &&
        //   !Array.isArray(validationErrors) &&
        //   Object.keys(validationErrors).length > 0
        // ) {
        //   setErrors(validationErrors);
        //   return;
        // }

        // if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        //   const errorObj = {};
        //   validationErrors.forEach((err, index) => {
        //     errorObj[`error_${index}`] = err;
        //   });
        //   setErrors(errorObj);
        //   return;
        // }

        // setErrors(null);
        setStep((prev) => prev + 1);
    };

    const handleSubmit = () => {
        setShowConfirmation(true);
    };

    const handlePreviousStep = () => setStep((prev) => prev - 1);

    const handlePreview = () => {
        setIsPreviewOpen(true);
    };

    const steps = [
        { label: "Introduction" },
        { label: "Consent" },
        { label: "Demographic Profile" },
        { label: "Contact Information" },
        { label: "Psychosocial Assessment" },
        { label: "Authorization for Disclosure" },
    ];
    return (
        <>
            <DefaultLayout variant="student">
                <div className="absolute w-full left-0 -z-1"></div>
                
                {/* Mainfrom */}
                <div className="relative flex flex-col min-h-screen">
                    <div className="mx-auto w-3/4 flex flex-col items-center">
                    </div>
                    <div className="flex flex-col justify-center bg-upmaroon w-full h-60 text-white text-center">
                        <h1 className="font-bold text-4xl -mt-10">Psychosocial Assistance and<br></br> Referral Desk</h1>
                        <h3 className="text-lg">Online Appointment Schedule</h3>
                    </div>
                    <div className="bg-white rounded-[15px] p-8 shadow-md box-border w-3/4 mx-auto mb-[70px] -mt-15">
                        <div className="flex lg:flex-row flex-col w-full items-stretch">
                            <div className="lg:w-1/3 lg:bg-upmaroon rounded-lg p-4 pt-10">
                                <StepIndicator steps={steps} currentStep={step} />
                            </div>
                                <div className="main-form p-4 w-full flex flex-col">
                                <div className="flex-1">
                                    {!showConfirmation ? (
                                        <>
                                            {step === 1 && <PARDIntroduction/>}
                                            {step === 2 && <PARDConsent/>}
                                            {step === 3 && <PARDDemogProfile/>}
                                            {step === 4 && <PARDContactInfo/>}
                                            {step === 5 && <PARDPsychAssessment/>}
                                            {step === 6 && <PARDAuthorization/>}
                                        </>
                                    ) : (
                                        <PARDSubmissionConfirmation />
                                    )}
                                </div>
                                {!showConfirmation && (
                                    <div className="flex justify-end mt-auto">
                                        <div className="main-form-buttons">
                                        {/* Step 1: 'Save Draft' and 'Next' button */}
                                        {step === 1 && !loading && (
                                        <>
                                            <Button variant="primary" onClick={handleNextStep}>
                                                Next
                                            </Button>
                                        </>
                                        )}

                                        {/* Step 2 to 5: Save and next button */}
                                        {step >= 2 && step <= 5 && !loading && (
                                            <>  
                                                <div className="mt-22">
                                                    <Button
                                                    variant="secondary"
                                                    onClick={handlePreviousStep}
                                                    >
                                                    Back
                                                    </Button>
                                                    {!readOnly && (
                                                    <Button
                                                        variant="tertiary"
                                                        onClick={handleSaveDraft}
                                                        disabled={loading}
                                                        style={{ marginLeft: "0.5rem" }}
                                                    >
                                                        {loading ? "Saving Draft..." : "Save Draft"}
                                                    </Button>
                                                    )}
                                                    <Button
                                                    variant="primary"
                                                    onClick={handleNextStep}
                                                    style={{ marginLeft: "0.5rem" }}
                                                    >
                                                    Next
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                            {/* Step 6: 'Back', 'Save Draft', 'Preview', and 'Submit' buttons */}
                                            {step === 6 && !loading && (
                                            <>
                                                <Button
                                                variant="secondary"
                                                onClick={handlePreviousStep}
                                                >
                                                Back
                                                </Button>
                                                {!readOnly && (
                                                <Button
                                                    variant="tertiary"
                                                    onClick={handleSaveDraft}
                                                    disabled={loading}
                                                    style={{ marginLeft: "0.5rem" }}
                                                >
                                                    {loading ? "Saving Draft..." : "Save Draft"}
                                                </Button>
                                                )}

                                                <Button
                                                variant="tertiary"
                                                onClick={handlePreview}
                                                style={{ marginLeft: "0.5rem" }}
                                                >
                                                Preview
                                                </Button>

                                                {isPreviewOpen && (
                                                <RSPreview
                                                    formData={formData}
                                                    onClose={() => setIsPreviewOpen(false)}
                                                />
                                                )}

                                                {!readOnly && (
                                                <Button
                                                    variant="primary"
                                                    onClick={handleSubmit}
                                                    style={{ marginLeft: "0.5rem" }}
                                                >
                                                    Submit
                                                </Button>
                                                )}
                                            </>
                                            )}

                                            {/* Loading Indicator */}
                                            {loading && <div>Loading...</div>}

                                            {/* Error Message */}
                                            {error && <div className="error-message">{error}</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DefaultLayout>
        </>
    )
}

export default PARD;