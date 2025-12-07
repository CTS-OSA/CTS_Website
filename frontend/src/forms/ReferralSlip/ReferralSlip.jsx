import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import RSStudentDetails from "./RSStudentDetails";
import RSRefferal from "./RSReferral";
import RSReferrer from "./RSReferrer";
import ReferralSubmissionConfirmation from "./ReferralSubmissionConfirmation";
import { useFormApi } from "./RSApi";
import Button from "../../components/UIButton";
import ToastMessage from "../../components/ToastMessage";
import ModalMessage from "../../components/ModalMessage";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../components/DefaultLayout";
import StepIndicator from "../../components/StepIndicator";
import RSPreview from "./RSPreview";
import RSSubmit from "./RSSubmit";
import ConfirmDialog from "../../components/ConfirmDialog";

const ReferralSlip = () => {
  const { profileData } = useContext(AuthContext);
  const isLoggedIn = !!profileData;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDraftSuccessToast, setShowDraftSuccessToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Change to Referral Slip APIs
  const {
    submitReferral,
  } = useFormApi();
  const [formData, setFormData] = useState({
    referral: {
      referred_person: {
        first_name: "",
        last_name: "",
        contact_number: "",
        degree_program: "",
        year_level: "",
        gender: "",
      },
      reason_for_referral: "",
      initial_actions_taken: "",
    },
  });

  const steps = [
    { label: "Student Details" },
    { label: "Referral Details" },
    { label: "Referrer Information" },
    { label: "Certify, Preview, and Submit" },
  ];
  const totalSteps = steps.length;

  const rules = {
    referral: {
      referred_person: {
        last_name: {
          required: true,
          message: "This field is required.",
        },
        first_name: {
          required: true,
          message: "This field is required.",
        },
        year_level: {
          required: true,
          message: "This field is required.",
        },
        degree_program: {
          required: true,
          message: "This field is required.",
        },
        gender: {
          required: true,
          message: "This field is required.",
        },
        contact_number: {
          required: true,
          message: "This field is required.",
          pattern: /^(\+63|0)\d{9,10}$/,
          patternMessage: "Please enter a valid phone number.",
        },
      },
      reason_for_referral: {
        required: true,
        message: "This field is required.",
      },
      initial_actions_taken: {
        required: true,
        message: "This field is required.",
      },
    },
    referrer_details: {
      last_name: {
        required: true,
        message: "This field is required.",
      },
      first_name: {
        required: true,
        message: "This field is required.",
      },
      department: {
        required: true,
        message: "This field is required.",
      },
      email: {
        required: true,
        message: "This field is required.",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: "Please enter a valid email address.",
      },
      contact_number: {
        required: true,
        message: "This field is required.",
        pattern: /^(\+63|0)\d{9,10}$/,
        patternMessage: "Please enter a valid phone number.",
      },
    },
  };

  const validateStep = (stepNumber) => {
    const errors = {};

    const stepMap = {
      1: ["referral", "referred_person"],
      2: ["referral"],
    };

    const path = stepMap[stepNumber];
    if (!path) return {};

    let currentData = formData;
    let currentRules = rules;

    for (const key of path) {
      currentData = currentData[key] || {};
      currentRules = currentRules[key] || {};
    }

    for (const field in currentRules) {
      const rule = currentRules[field];
      const value = currentData[field];

      if (rule.required && !value?.toString().trim()) {
        errors[field] = rule.message;
        continue;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors[field] = rule.patternMessage;
      }
    }

    return errors;
  };

  useEffect(() => {
    if (profileData?.is_complete !== true) {
      navigate("/myprofile");
    }
  }, [profileData, navigate]);

  const handleNextStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setError(null);
    setErrors({});
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePreviousStep = () => setStep((prev) => Math.max(1, prev - 1));

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirmAction = () => {
    setShowConfirmDialog(false);
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitReferral(formData);

      if (result.success) {
        setShowConfirmation(true);
        setShowSuccessToast(true);
        setTimeout(() => {
          navigate("/student");
        }, 3000);
      } else {
        if (result.status === 400 && result.data.errors) {
          alert(
            "Validation errors:\n" + JSON.stringify(result.data.errors, null, 2)
          );
        } else if (result.data.error) {
          alert(`Error: ${result.data.error}`);
        } else if (result.data.message) {
          alert(`Error: ${result.data.message}`);
        } else {
          alert("Unknown error occurred.");
        }
      }
    } catch (err) {
      alert("Failed to submit form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DefaultLayout variant="student">
        {/* Background rectangle */}
        <div className="absolute w-full h-[26em] left-0 top-0 bg-upmaroon -z-10"></div>
        {/* Main Form */}
        <div className="relative flex flex-col min-h-screen">
          <div className="mt-10 mx-auto w-11/12 lg:w-3/4 max-w-5xl flex flex-col items-center">
            <div className="w-full text-center text-white mb-6 px-2">
              <h1 className="font-bold text-3xl lg:text-4xl">
                Counseling Referral Slip
              </h1>
              <p className="mt-4 text-sm lg:text-base w-full max-w-2xl mx-auto">
                Refers a student for counseling services to address personal,
                academic, or behavioral concerns
              </p>
            </div>

            {/* Main Form - Steps and Fields */}
            <div className="bg-white rounded-[15px] p-4 sm:p-8 w-full mx-auto mb-16 shadow-md box-border">
              <div className="flex flex-col lg:flex-row w-full items-stretch gap-6">
                <div className="w-full lg:w-1/2 xl:w-1/3 lg:bg-upmaroon rounded-lg p-4 lg:p-6">
                  <StepIndicator steps={steps} currentStep={step} />
                </div>
                <div className="main-form w-full flex flex-col">
                  <div className="flex-1">
                    {!showConfirmation ? (
                      <>
                        {step === 1 && (
                          <RSStudentDetails
                            formData={formData}
                            setFormData={setFormData}
                            step={step}
                            errors={errors}
                            setErrors={setErrors}
                          />
                        )}
                        {step === 2 && (
                          <RSRefferal
                            formData={formData}
                            setFormData={setFormData}
                            step={step}
                            errors={errors}
                            setErrors={setErrors}
                          />
                        )}
                        {step === 3 && <RSReferrer profileData={profileData} />}
                        {step === 4 && <RSSubmit formData={formData} />}
                      </>
                    ) : (
                      <ReferralSubmissionConfirmation isLoggedIn={isLoggedIn} />
                    )}
                    {/* Error Message */}
                    {error && (
                      <div className="text-[#D32F2F] text-xs ml-4 mt-4 italic">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Buttons Section */}
                  {!showConfirmation && (
                    <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 mt-6">
                      {step > 1 && (
                        <Button
                          variant="secondary"
                          onClick={handlePreviousStep}
                          disabled={loading}
                        >
                          Back
                        </Button>
                      )}

                      {step < totalSteps ? (
                        <Button
                          variant="primary"
                          onClick={handleNextStep}
                          disabled={loading}
                        >
                          Next
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="tertiary"
                            onClick={handlePreview}
                            disabled={loading}
                          >
                            Preview
                          </Button>
                          {!readOnly && (
                            <Button
                              variant="primary"
                              onClick={handleConfirmSubmit}
                              disabled={loading}
                            >
                              {loading ? "Submitting..." : "Submit"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isPreviewOpen && (
          <RSPreview
            formData={formData}
            profileData={profileData}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}

        {showConfirmDialog && (
          <ConfirmDialog
            title="Are you sure?"
            message="Please confirm that you want to submit your form."
            onConfirm={handleConfirmAction}
            onCancel={handleConfirmCancel}
          />
        )}

        {showSuccessToast && (
          <ToastMessage
            message="Your form has been successfully submitted!"
            onClose={() => setShowSuccessToast(false)}
            duration={5000}
          />
        )}

        {showDraftSuccessToast && (
          <ToastMessage
            message="Your draft has been saved successfully!"
            onClose={() => setShowDraftSuccessToast(false)}
            duration={2000}
          />
        )}
        {showPrivacyModal && (
          <ModalMessage
            title="Privacy Consent Required"
            message="You must agree to the Privacy Statement before submitting the form."
            onClose={() => setShowPrivacyModal(false)}
            showCloseButton={true}
            buttons={[]}
          />
        )}
      </DefaultLayout>
    </>
  );
};

export default ReferralSlip;
