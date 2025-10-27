import React, { useContext, useState, useEffect } from "react";
import { useApiRequest } from "../../context/ApiRequestContext";
import { AuthContext } from "../../context/AuthContext";
import BISPersonalData from "./BISPersonalData";
import BISSocioeconomic from "./BISSocioeconomic";
import BISPreferences from "./BISPreferences";
import BISPresentScholastic from "./BISPresentScholastic";
import BISCertify from "./BISCertify";
import BISPreview from "./BISPreview";
import ProgressBar from "../../components/ProgressBar";
import Navbar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../SetupProfile/css/multistep.css";
import { useFormApi } from "./BISApi";
import {
  validatePreferences,
  validateScholasticStatus,
  validateSocioEconomicStatus,
  validateSupport,
} from "../../utils/BISValidation";
import Button from "../../components/UIButton";
import ToastMessage from "../../components/ToastMessage";
import ConfirmDialog from "../../components/ConfirmDialog";
import ModalMessage from "../../components/ModalMessage";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../components/DefaultLayout";
import StepIndicator from "../../components/StepIndicator";

const BISForm = () => {
  const { request } = useApiRequest();
  const { profileData } = useContext(AuthContext);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();
  const {
    createDraftSubmission,
    getFormBundle,
    saveDraft,
    finalizeSubmission,
  } = useFormApi();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDraftSuccessToast, setShowDraftSuccessToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formData, setFormData] = useState({
    socio_economic_status: {
      student_number: "",
      has_scholarship: "",
      scholarships: "",
      scholarship_privileges: "",
      monthly_allowance: "",
      spending_habit: "",
    },
    scholastic_status: {
      student_number: "",
      intended_course: "",
      first_choice_course: "",
      admitted_course: "",
      next_plan: "",
    },
    preferences: {
      student_number: "",
      influence: "",
      reason_for_enrolling: "",
      transfer_plans: "",
      transfer_reason: "",
      shift_plans: "",
      planned_shift_degree: "",
      reason_for_shifting: "",
    },
    student_support: {
      student_number: "",
      support: [],
      other_notes: "",
      other_scholarship: "",
      combination_notes: "",
    },
    privacy_consent: {
      student_number: "",
      has_consented: "",
    },
  });

  const [step, setStep] = useState(1);
  const [submissionId, setSubmissionId] = useState(null);
  const [studentNumber, setStudentNumber] = useState(
    profileData?.student_number
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [readOnly, setReadOnly] = useState(false);

  const validateStep = (step, formData) => {
    switch (step) {
      case 2:
        const errors = {
          ...validateSocioEconomicStatus(formData),
          ...validateSupport(formData),
        };
        return errors;
      case 3:
        return validatePreferences(formData);
      case 4:
        return validateScholasticStatus(formData);
      case 5:
        if (!formData.privacy_consent.has_consented) {
          setShowPrivacyModal(true);
          return false;
        }
        return true;
      default:
        return true;
    }
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

        if (!response) {
          response = await createDraftSubmission(studentNumber);
          response = await getFormBundle(studentNumber);
        }

        if (response) {
          setFormData({
            socio_economic_status: response.socio_economic_status || {},
            scholastic_status: response.scholastic_status || {},
            preferences: response.preferences || {},
            student_support: response.student_support || {},
            privacy_consent: response.privacy_consent || false,
          });
          setSubmissionId(response.submission.id);

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
    const validationErrors = validateStep(step, formData);

    if (
      validationErrors &&
      typeof validationErrors === "object" &&
      !Array.isArray(validationErrors) &&
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const errorObj = {};
      validationErrors.forEach((err, index) => {
        errorObj[`error_${index}`] = err;
      });
      setErrors(errorObj);
      return;
    }

    setErrors(null);
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

  const handleSubmit = async () => {
    if (!formData?.privacy_consent?.has_consented) {
      setShowPrivacyModal(true);
      return;
    }

    setLoading(true);
    try {
      const result = await finalizeSubmission(
        submissionId,
        studentNumber,
        formData
      );

      if (result.success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          navigate("/submitted-forms/basic-information-sheet");
        }, 2000);
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
    { label: "Personal Data" },
    { label: "Socioeconomic Status" },
    { label: "School Preferences" },
    { label: "Present Scholastic" },
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
                Basic Information Sheet
              </h1>
              <p className="text-center text-white my-5 text-base w-full max-w-2xl mx-auto whitespace-normal">
                Please PROVIDE the information asked for. The data contained in
                this form will be kept confidential and will serve as your
                record. Please fill in the blanks carefully and sincerely.
              </p>
            </div>

            <div className="bg-white rounded-[15px] p-8 w-full mx-auto mb-[70px] shadow-md box-border">
              <div className="flex lg:flex-row flex-col w-full items-stretch">
                <div className="lg:w-1/3 lg:bg-upmaroon rounded-lg p-4 pt-10">
                  <StepIndicator steps={steps} currentStep={step} />
                </div>
                <div className="main-form p-4 w-full">
                  {step === 1 && <BISPersonalData profileData={profileData} />}
                  {step === 2 && (
                    <BISSocioeconomic
                      data={{
                        socio_economic_status: formData.socio_economic_status,
                        student_support: formData.student_support,
                      }}
                      updateData={(newData) =>
                        setFormData((prev) => ({
                          ...prev,
                          socio_economic_status: {
                            ...prev.socio_economic_status,
                            ...newData.socio_economic_status,
                          },
                          student_support: {
                            ...prev.student_support,
                            ...newData.student_support,
                          },
                        }))
                      }
                      readOnly={readOnly}
                      errors={errors}
                      setErrors={setErrors}
                    />
                  )}
                  {step === 3 && (
                    <BISPreferences
                      data={formData.preferences}
                      updateData={(newData) =>
                        setFormData((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, ...newData },
                        }))
                      }
                      readOnly={readOnly}
                      errors={errors}
                      setErrors={setErrors}
                    />
                  )}
                  {step === 4 && (
                    <BISPresentScholastic
                      data={formData.scholastic_status}
                      updateData={(newData) =>
                        setFormData((prev) => ({
                          ...prev,
                          scholastic_status: {
                            ...prev.scholastic_status,
                            ...newData,
                          },
                        }))
                      }
                      readOnly={readOnly}
                      errors={errors}
                      setErrors={setErrors}
                    />
                  )}
                  {step === 5 && (
                    <BISCertify
                      data={formData}
                      updateData={(isChecked) =>
                        setFormData((prev) => ({
                          ...prev,
                          privacy_consent: {
                            ...prev.privacy_consent,
                            has_consented: isChecked,
                          },
                        }))
                      }
                      readOnly={readOnly}
                    />
                  )}

                  <div className="main-form-buttons">
                    {/* Step 1: Only 'Next' button */}
                    {step === 1 && !loading && (
                      <Button variant="primary" onClick={handleNextStep}>
                        Next
                      </Button>
                    )}

                    {step >= 2 && step <= 4 && !loading && (
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
                          variant="primary"
                          onClick={handleNextStep}
                          style={{ marginLeft: "0.5rem" }}
                        >
                          Next
                        </Button>
                      </>
                    )}

                    {/* Step 5: 'Back', 'Save Draft', 'Preview', and 'Submit' buttons */}
                    {step === 5 && !loading && (
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
                          <BISPreview
                            profileData={profileData}
                            formData={formData}
                            onClose={() => setIsPreviewOpen(false)}
                          />
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

                    {/* Error Message */}
                    {error && <div className="error-message">{error}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

export default BISForm;
