import React, { useContext, useState, useEffect } from "react";
import { useApiRequest } from "../../context/ApiRequestContext";
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
  const { request } = useApiRequest();
  const { profileData } = useContext(AuthContext);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submissionId, setSubmissionId] = useState(null);
  const [studentNumber, setStudentNumber] = useState(
    profileData?.student_number
  );
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
    createDraftSubmission,
    getFormBundle,
    saveDraft,
    finalizeSubmission,
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

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        let response = await getFormBundle(studentNumber);
        console.log("Fetched response:", response);

        if (!response) {
          response = await createDraftSubmission(studentNumber);
          response = await getFormBundle(studentNumber);
        }
        console.log(response);
        console.log("ID", response.submission.id);

        if (response) {
          setFormData({
            referral: response.referral || {},
          });
          setSubmissionId(response.submission.id);
          console.log(submissionId);

          if (response.submission.status === "submitted") {
            setReadOnly(true);
          }
        } else {
          setError("Failed to create or fetch the form.");
        }
      } catch (err) {
        setError("Error fetching or creating form.");
      } finally {
        setLoading(false);
      }
    };

    if (studentNumber) fetchFormData();
  }, [studentNumber]);

  const handleNextStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setError(null);
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => setStep((prev) => prev - 1);

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

  const handleSaveDraft = async () => {
    if (!submissionId) {
      alert("Submission ID is missing. Try reloading the page.");
      return;
    }

    setLoading(true);
    try {
      const response = await saveDraft(submissionId, formData);
      console.log("New Id:", submissionId);
      console.log("form:", formData);
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await finalizeSubmission(submissionId, formData);

      if (result.success) {
        setShowConfirmation(true);
        setShowSuccessToast(true);
        setTimeout(() => {
          navigate("/submitted-forms/counseling-referral-slip");
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

  const steps = [
    { label: "Student Details" },
    { label: "Referral Details" },
    { label: "Referrer Information" },
    { label: "Certify, Preview, and Submit" },
  ];

  return (
    <>
      <DefaultLayout variant="student">
        {/* Background rectangle */}
        <div className="absolute w-full h-[26em] left-0 top-0 bg-upmaroon -z-1"></div>
        {/* Main Form */}
        <div className="relative flex flex-col min-h-screen">
          <div className="mt-[30px] mx-auto w-3/4 flex flex-col items-center">
            <div className="main-form-info">
              <h1 className="left-1/2 text-center font-bold text-[2rem] text-white">
                Counseling Referral Slip
              </h1>
              <p className="text-center text-white my-5 text-base w-full max-w-2xl mx-auto whitespace-normal">
                {" "}
                Refers a student for counseling services to address personal,
                academic, or behavioral concerns
              </p>
            </div>

            {/* Main Form - Steps and Fields */}
            <div className="bg-white rounded-[15px] p-8 w-full mx-auto mb-[70px] shadow-md box-border">
              <div className="flex lg:flex-row flex-col w-full items-stretch">
                <div className="lg:w-1/3 lg:bg-upmaroon rounded-lg p-4 pt-10">
                  <StepIndicator steps={steps} currentStep={step} />
                </div>
                <div className="main-form p-4 w-full flex flex-col">
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
                        {step === 4 && <RSSubmit />}
                      </>
                    ) : (
                      <ReferralSubmissionConfirmation />
                    )}
                    {/* Error Message */}
                    {error && (
                      <div className="text-[#D32F2F] text-xs ml-4 mt-4 italic">
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Buttons Section */}
                  <div className="flex justify-end mt-auto">
                    <div className="main-form-buttons">
                      {/* Step 1: 'Next' button */}
                      {step === 1 && !loading && (
                        <>
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
                          <Button variant="primary" onClick={handleNextStep}>
                            {" "}
                            Next{" "}
                          </Button>
                        </>
                      )}

                      {step >= 2 && step <= 3 && !loading && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={handlePreviousStep}
                          >
                            {" "}
                            Back{" "}
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
                            {" "}
                            Next{" "}
                          </Button>
                        </>
                      )}

                      {/* Step 4: 'Back', 'Save Draft', 'Preview', and 'Submit' buttons */}
                      {step === 4 && !loading && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={handlePreviousStep}
                          >
                            {" "}
                            Back{" "}
                          </Button>
                          <Button
                            variant="tertiary"
                            onClick={handlePreview}
                            style={{ marginLeft: "0.5rem" }}
                          >
                            {" "}
                            Preview{" "}
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
                          {!readOnly && (
                            <Button
                              variant="primary"
                              onClick={handleConfirmSubmit}
                              style={{ marginLeft: "0.5rem" }}
                            >
                              Submit
                            </Button>
                          )}
                        </>
                      )}

                      {/* Loading Indicator */}
                      {loading && <div>Loading...</div>}
                    </div>
                  </div>
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
