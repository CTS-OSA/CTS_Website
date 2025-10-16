import React, { useState, useContext, useEffect } from "react";
import Navbar from "../../components/NavBar";
import Footer from "../../components/Footer";
import ProgressBar from "../../components/ProgressBar";
import SCIFCredentials from "./SCIFCredentials";
import SCIFPersonalData from "./SCIFPersonalData";
import SCIFFamilyData from "./SCIFFamilyData";
import SCIFHealthData from "./SCIFHealthData";
import SCIFPreviousSchoolRecord from "./SCIFPreviousSchoolRecord";
import SCIFScholarships from "./SCIFScholarships";
import SCIFOtherPersonalData from "./SCIFOtherPersonalData";
import SCIFCertify from "./SCIFCertify";
import SCIFPreview from "./SCIFPreview";
import "../SetupProfile/css/multistep.css";
import { useApiRequest } from "../../context/ApiRequestContext";
import { AuthContext } from "../../context/AuthContext";
import { useFormApi } from "../SCIF/SCIFApi";
import {
  validateParent,
  validateGuardian,
  validateSibling,
  validateHealthData,
  validatePreviousSchool,
  validatePersonalityTraits,
  validateFamilyRelationship,
  validateCounselingInfo,
} from "../../utils/SCIFValidation";
import Loader from "../../components/Loader";
import Button from "../../components/UIButton";
import ToastMessage from "../../components/ToastMessage";
import ConfirmDialog from "../../components/ConfirmDialog";
import ModalMessage from "../../components/ModalMessage";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../components/DefaultLayout";

const SCIF = () => {
  const { request } = useApiRequest();
  const { profileData } = useContext(AuthContext);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const {
    createDraftSubmission,
    getFormBundle,
    saveDraft,
    finalizeSubmission,
  } = useFormApi();
  const [step, setStep] = useState(0);
  const [submissionId, setSubmissionId] = useState(null);
  const [studentNumber, setStudentNumber] = useState(
    profileData?.student_number
  );
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDraftSuccessToast, setShowDraftSuccessToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    family_data: {
      student_number: "",
      mother: {
        first_name: "",
        last_name: "",
        age: "",
        job_occupation: "",
        company_agency: "",
        company_address: "",
        highest_educational_attainment: "",
        contact_number: "",
        submission: "",
      },
      father: {
        first_name: "",
        last_name: "",
        age: "",
        job_occupation: "",
        company_agency: "",
        company_address: "",
        highest_educational_attainment: "",
        contact_number: "",
        submission: "",
      },
      guardian: {
        first_name: "",
        last_name: "",
        contact_number: "",
        address: "",
        relationship_to_guardian: "",
        language_dialect: [],
        submission: "",
      },
    },
    siblings: [
      {
        first_name: "",
        last_name: "",
        sex: "",
        age: "",
        job_occupation: "",
        company_school: "",
        educational_attainment: "",
        students: [],
        submission: "",
      },
    ],
    previous_school_record: [
      {
        student_number: "",
        school: {
          name: "",
          school_address: {
            address_line_1: "",
            barangay: "",
            city_municipality: "",
            province: "",
            region: "",
            zip_code: "",
          },
        },
        education_level: "",
        start_year: "",
        end_year: "",
        honors_received: "",
        senior_high_gpa: "",
        submission: "",
      },
    ],
    health_data: {
      student_number: "",
      health_condition: "",
      height: "",
      weight: "",
      eye_sight: "",
      hearing: "",
      physical_disabilities: [],
      common_ailments: [],
      last_hospitalization: "",
      reason_of_hospitalization: "",
      submission: "",
    },
    scholarship: {
      student_number: "",
      scholarships_and_assistance: [],
      submission: "",
    },
    personality_traits: {
      student_number: "",
      enrollment_reason: "",
      degree_program_aspiration: "",
      aspiration_explanation: "",
      special_talents: "",
      musical_instruments: "",
      hobbies: "",
      likes_in_people: "",
      dislikes_in_people: "",
      submission: "",
    },
    family_relationship: {
      student_number: "",
      closest_to: "",
      specify_other: "",
      submission: "",
    },
    counseling_info: {
      student_number: "",
      personal_characteristics: "",
      problem_confidant: "",
      confidant_reason: "",
      anticipated_problems: "",
      previous_counseling: "",
      counseling_location: "",
      counseling_counselor: "",
      counseling_reason: "",
      submission: "",
    },
    privacy_consent: {
      student_number: "",
      has_consented: false,
      submission: "",
    },
  });

  const validateStep = (step, formData) => {
    switch (step) {
      case 2:
        const errors = {
          ...validateParent(formData),
          ...validateGuardian(formData),
          ...validateSibling(formData),
        };

        return errors;
      case 3:
        return validateHealthData(formData);
      case 4:
        return validatePreviousSchool(formData.previous_school_record);
      case 5:
        return true;
      case 6:
        const personalDataErrors = {
          ...validatePersonalityTraits(formData.personality_traits),
          ...validateFamilyRelationship(formData.family_relationship),
          ...validateCounselingInfo(formData.counseling_info),
        };

        return personalDataErrors;

      case 7:
        const consentErrors = validatePrivacyConsent(formData);
        if (consentErrors.length > 0) {
          return consentErrors;
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
          await createDraftSubmission(studentNumber);
          response = await getFormBundle(studentNumber);
        }

        if (response?.submission) {
          const newSubmissionId = response.submission.id;
          setSubmissionId(newSubmissionId);
          setSubmissionStatus(response.submission.status);

          setFormData((prev) => ({
            family_data: {
              ...prev.family_data,
              ...response.family_data,
              submission: newSubmissionId,
              student_number: studentNumber,
            },
            siblings: Array.isArray(response.siblings)
              ? response.siblings.map((sibling) => ({
                  ...sibling,
                  submission: newSubmissionId,
                  students: sibling.students?.length
                    ? sibling.students
                    : [studentNumber],
                }))
              : [],
            previous_school_record: Array.isArray(
              response.previous_school_record
            )
              ? response.previous_school_record.map((record) => ({
                  ...record,
                  submission: newSubmissionId,
                  student_number: studentNumber,
                }))
              : [],
            health_data: {
              ...prev.health_data,
              ...response.health_data,
              submission: newSubmissionId,
              student_number: studentNumber,
            },
            scholarship: {
              ...prev.scholarship,
              ...response.scholarship,
              submission: newSubmissionId,
              student_number: studentNumber,
            },
            personality_traits: {
              ...prev.personality_traits,
              ...response.personality_traits,
              submission: newSubmissionId,
              student_number: studentNumber,
            },
            family_relationship: {
              ...prev.family_relationship,
              ...response.family_relationship,
              submission: newSubmissionId,
              student_number: studentNumber,
            },
            counseling_info: {
              ...prev.counseling_info,
              ...response.counseling_info,
              submission: newSubmissionId,
              student_number: studentNumber,
            },
            privacy_consent: {
              ...prev.privacy_consent,
              ...response.privacy_consent,
              submission: newSubmissionId,
              student_number: studentNumber,
            },
          }));
        }
      } catch (err) {
        setError("Error fetching or creating form.");
      } finally {
        setLoading(false);
      }
    };

    if (studentNumber) fetchFormData();
  }, [studentNumber]);

  useEffect(() => {
    if (submissionStatus === "submitted") {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
  }, [submissionStatus]);

  const handleSaveDraft = async () => {
    if (!submissionId) {
      setError("Submission ID is missing. Try reloading the page.");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      const response = await saveDraft(submissionId, studentNumber, formData);
      
      if (response?.ok) {
        setShowDraftSuccessToast(true);
      } else {
        let errorMessage = "Some fields are invalid. Please review the highlighted errors.";
        
        if (response?.data) {
          if (response.data.errors) {
            const errorMessages = Object.entries(response.data.errors)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`;
                }
                return `${field}: ${messages}`;
              })
              .join(' | ');
            errorMessage = errorMessages;
          } else if (response.data.error) {
            errorMessage = response.data.error;
          } else if (response.data.message) {
            errorMessage = response.data.message;
          }
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      setError(err.message || "Failed to save draft. Please try again.");
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
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

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
    setError(null);
    
    try {
      const result = await finalizeSubmission(
        submissionId,
        studentNumber,
        formData
      );

      if (result.success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          navigate("/submitted-forms/student-cumulative-information-file");
        }, 2000);
      } else {
        let errorMessage = "Failed to submit form.";
        
        if (result.status === 400 && result.data.errors) {
          const errorMessages = Object.entries(result.data.errors)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join(' | ');
          errorMessage = errorMessages;
        } else if (result.data.error) {
          errorMessage = result.data.error;
        } else if (result.data.message) {
          errorMessage = result.data.message;
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      setError(err.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !submissionId) {
    return <Loader />;
  }

  return (
    <>
      <div className="background-rectangle"></div>

      <DefaultLayout variant="student">
      <div className="content-wrapper">
        <div className="mainStepForm">
          <div className="main-form-info">
            <h1 className="main-form-title">
              Student Cumulative Information Sheet
            </h1>
            <p className="main-form-subtitle">
              Please fill out the form below to complete your profile.
            </p>
          </div>
          <div className="main-form-card">
            <ProgressBar currentStep={step} totalSteps={8} />
            {step === 0 && <SCIFCredentials data={profileData} />}
            {step === 1 && <SCIFPersonalData data={profileData} />}
            {step === 2 && (
              <SCIFFamilyData
                data={{
                  family_data: formData.family_data,
                  siblings: formData.siblings,
                }}
                updateData={(sectionKey, newData) =>
                  setFormData((prev) => ({
                    ...prev,
                    [sectionKey]: newData,
                  }))
                }
                readOnly={readOnly}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {step === 3 && (
              <SCIFHealthData
                data={{
                  ...formData.health_data,
                }}
                updateData={(newData) =>
                  setFormData((prev) => ({
                    ...prev,
                    health_data: {
                      ...prev.health_data,
                      ...newData,
                      student_number: studentNumber,
                      submission: submissionId,
                    },
                  }))
                }
                readOnly={readOnly}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {step === 4 && (
              <SCIFPreviousSchoolRecord
                data={formData.previous_school_record}
                updateData={(newData) =>
                  setFormData((prev) => ({
                    ...prev,
                    previous_school_record: newData,
                  }))
                }
                readOnly={readOnly}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {step === 5 && (
              <SCIFScholarships
                data={formData.scholarship}
                updateData={(newData) =>
                  setFormData((prev) => ({
                    ...prev,
                    scholarship: newData,
                  }))
                }
                readOnly={readOnly}
                errors={errors}
              />
            )}
            {step === 6 && (
              <SCIFOtherPersonalData
                data={{
                  personality_traits: formData.personality_traits,
                  family_relationship: formData.family_relationship,
                  counseling_info: formData.counseling_info,
                }}
                updateData={(sectionKey, newData) =>
                  setFormData((prev) => ({
                    ...prev,
                    [sectionKey]: { ...prev[sectionKey], ...newData },
                  }))
                }
                readOnly={readOnly}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {step === 7 && (
              <SCIFCertify
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
            
            {error && <div className="scif-error-message">{error}</div>}

            <div className="main-form-buttons">
              {/* Step 0: Only 'Next' button */}
              {step === 0 && !loading && (
                <Button variant="primary" onClick={handleNextStep}>
                  Next
                </Button>
              )}

              {/* Steps 1-6: 'Back', 'Save Draft', and 'Next' buttons */}
              {step >= 1 && step <= 6 && !loading && (
                <>
                  <Button variant="secondary" onClick={handlePreviousStep}>
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

              {/* Step 7: 'Back', 'Save Draft', 'Preview', and 'Submit' buttons */}
              {step === 7 && !loading && (
                <>
                  <Button variant="secondary" onClick={handlePreviousStep}>
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
                    <SCIFPreview
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

export default SCIF;