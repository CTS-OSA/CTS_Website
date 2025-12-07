import React, { useState, useContext, useEffect } from "react";
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
import { normalizeNumber, normalizeList } from "../../utils/normalization";
import Loader from "../../components/Loader";
import Button from "../../components/UIButton";
import ToastMessage from "../../components/ToastMessage";
import ConfirmDialog from "../../components/ConfirmDialog";
import ModalMessage from "../../components/ModalMessage";
import DefaultLayout from "../../components/DefaultLayout";
import StepIndicator from "../../components/StepIndicator";
import { useNavigate } from "react-router-dom";

// Step Components
import SCIFCredentials from "./SCIFCredentials";
import SCIFPersonalData from "./SCIFPersonalData";
import SCIFFamilyData from "./SCIFFamilyData";
import SCIFHealthData from "./SCIFHealthData";
import SCIFPreviousSchoolRecord from "./SCIFPreviousSchoolRecord";
import SCIFScholarships from "./SCIFScholarships";
import SCIFOtherPersonalData from "./SCIFOtherPersonalData";
import SCIFCertify from "./SCIFCertify";
import SCIFPreview from "./SCIFPreview";
import SCIFSubmissionConfirmation from "./SCIFSubmissionConfirmation";

const SCIF = () => {
  const { profileData } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    createDraftSubmission,
    getFormBundle,
    saveDraft,
    finalizeSubmission,
  } = useFormApi();

  // Steps are 0-indexed internally; StepIndicator expects 1-indexed currentStep
  const [step, setStep] = useState(1);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState(null);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDraftSuccessToast, setShowDraftSuccessToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const studentNumber = profileData?.student_number;

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
    previous_school_record: {
      records: [
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
      sameAsPrimary: {
        "Junior High": false,
        "Senior High": false,
      },
    },
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

  // Steps labels for StepIndicator
  const steps = [
    { label: "Credentials" },
    { label: "Personal Data" },
    { label: "Family Data" },
    { label: "Health Data" },
    { label: "Previous School" },
    { label: "Scholarships" },
    { label: "Other Personal Data" },
    { label: "Certify & Submit" },
  ];

  const formatErrorMessages = (errorData, parentKey = "") => {
    if (!errorData) return [];
    if (Array.isArray(errorData)) {
      if (!errorData.length) return [];
      const label = parentKey || "Error";
      return [`${label}: ${errorData.join(", ")}`];
    }
    if (typeof errorData === "object") {
      return Object.entries(errorData).flatMap(([key, value]) =>
        formatErrorMessages(value, parentKey ? `${parentKey}.${key}` : key)
      );
    }
    const label = parentKey || "Error";
    return [`${label}: ${errorData}`];
  };

  // ---------- Validation per step ----------
  const validateStep = (stepIndex, data) => {
    switch (stepIndex) {
      case 3: // Family Data
        return {
          ...validateParent(data),
          ...validateGuardian(data),
          ...validateSibling(data),
        };
      case 4: // Health Data
        return validateHealthData(data);
      case 5: // Previous School
        return validatePreviousSchool(data.previous_school_record.records);
      case 6: // Scholarships
        return true;
      case 7: // Other Personal Data
        return {
          ...validatePersonalityTraits(data.personality_traits),
          ...validateFamilyRelationship(data.family_relationship),
          ...validateCounselingInfo(data.counseling_info),
        };
      default:
        return true;
    }
  };

  // ---------- initial fetch ----------
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

          // Map response into formData shape while preserving defaults
          setFormData((prev) => ({
            family_data: {
              ...prev.family_data,
              ...response.family_data,
              submission: newSubmissionId,
              student_number: studentNumber,
            },
            siblings: Array.isArray(response.siblings)
              ? response.siblings.map((s) => ({
                ...s,
                submission: newSubmissionId,
                students: s.students?.length ? s.students : [studentNumber],
              }))
              : prev.siblings,
            previous_school_record: {
              records: Array.isArray(response.previous_school_record?.records)
                ? response.previous_school_record.records.map((r) => ({
                  ...r,
                  submission: newSubmissionId,
                  student_number: studentNumber,
                }))
                : Array.isArray(response.previous_school_record)
                  ? response.previous_school_record.map((r) => ({
                    ...r,
                    submission: newSubmissionId,
                    student_number: studentNumber,
                  }))
                  : prev.previous_school_record.records,
              sameAsPrimary:
                response.previous_school_record?.sameAsPrimary ||
                prev.previous_school_record.sameAsPrimary,
            },
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

          setHasFetchedData(true);
        }
      } catch (err) {
        setError(err.message || "Error fetching or creating form.");
      } finally {
        setLoading(false);
      }
    };

    if (studentNumber) fetchFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentNumber]);

  useEffect(() => {
    setReadOnly(submissionStatus === "submitted");
  }, [submissionStatus]);

  // ---------- Save Draft ----------
  const handleSaveDraft = async () => {
    if (!submissionId) {
      setError("Submission ID is missing. Try reloading the page.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const normalizedNumberData = normalizeNumber(formData);
      const dataToSave = normalizeList(normalizedNumberData);

      const response = await saveDraft(submissionId, studentNumber, dataToSave);

      if (response?.ok) {
        setShowDraftSuccessToast(true);
      } else {
        let errorMessage =
          "Some fields are invalid. Please review the highlighted errors.";

        if (response?.data) {
          if (response.data.errors) {
            const flattened = formatErrorMessages(response.data.errors);
            errorMessage =
              flattened.length > 0
                ? flattened.join(" | ")
                : errorMessage;
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

  // ---------- Navigation ----------
  const handleNextStep = () => {
    const nextStep = Math.min(step + 1, steps.length);
    if (readOnly) {
      setErrors(null);
      setError(null);
      setStep(nextStep);
      return;
    }
    const currentData = normalizeNumber(formData);
    const normalizedData = normalizeList(currentData);
    const validationErrors = validateStep(step, normalizedData);

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
    setStep(nextStep);
  };

  const handlePreviousStep = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  // ---------- Preview & Submit ----------
  const handlePreview = () => setIsPreviewOpen(true);
  const handleConfirmSubmit = () => setShowConfirmDialog(true);
  const handleConfirmCancel = () => setShowConfirmDialog(false);
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
      const normalizedNumberData = normalizeNumber(formData);
      const normalizedData = normalizeList(normalizedNumberData);
      const result = await finalizeSubmission(
        submissionId,
        studentNumber,
        normalizedData
      );

      if (result.success) {
        setShowSuccessToast(true);
        setShowConfirmation(true); // ✅ show the confirmation component instead

        setTimeout(() => {
          navigate("/student");
        }, 3000);
      } else {
        let errorMessage = "Failed to submit form.";

        if (result.status === 400 && result.data.errors) {
          const flattened = formatErrorMessages(result.data.errors);
          errorMessage =
            flattened.length > 0 ? flattened.join(" | ") : errorMessage;
        } else if (result.data?.error) {
          errorMessage = result.data.error;
        } else if (result.data?.message) {
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
    <DefaultLayout variant="student">
      {/* Top maroon banner (title + subtitle) */}
      <div className="absolute w-full h-88 left-0 top-0 bg-upmaroon -z-10" />
      <div className="relative flex flex-col min-h-screen">
        <div className="mt-10 mx-auto w-11/12 lg:w-3/4 flex flex-col items-center">
          {/* Header inside maroon banner area (centered title & subtitle) */}
          <div className="w-full max-w-4xl text-center text-white mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold">
              Student Cumulative Information File
            </h1>
            <p className="mt-3 text-sm lg:text-base max-w-2xl mx-auto">
              Please fill out the form below to complete your profile. Fields
              marked required must be completed before proceeding.
            </p>
          </div>

          {/* Card: two-column layout with left sidebar (maroon) and right white content */}
          <div className="w-full bg-transparent mt-6">
            <div className="grid grid-cols-1 gap-0">
              {/* Left sidebar - maroon background with StepIndicator */}
              <div className="bg-white rounded-[15px] p-8 w-full mx-auto mb-[70px] shadow-md box-border">
                <div className="flex lg:flex-row flex-col w-full items-stretch">
                  <div className="lg:w-1/2 xl:w-1/3 lg:bg-upmaroon rounded-lg p-4 pt-10">
                    <StepIndicator steps={steps} currentStep={step} />
                  </div>

                  {/* Right form area - white card */}

                  <div className="main-form p-4 w-full">
                    {!showConfirmation ? (
                      <>
                        {/* Render each step component here */}
                        {step === 1 && <SCIFCredentials data={profileData} />}
                        {step === 2 && <SCIFPersonalData data={profileData} />}
                        {step === 3 && (
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
                        {step === 4 && (
                          <SCIFHealthData
                            data={{ ...formData.health_data }}
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
                        {step === 5 && (
                          <SCIFPreviousSchoolRecord
                            data={formData.previous_school_record}
                            sameAsPrimaryStorageKey={`scif-same-as-primary-${studentNumber}`}
                            updateData={(updatedData) =>
                              setFormData((prev) => ({
                                ...prev,
                                previous_school_record: {
                                  records: updatedData.records,
                                  sameAsPrimary: updatedData.sameAsPrimary,
                                },
                              }))
                            }
                            readOnly={readOnly}
                            errors={errors}
                            setErrors={setErrors}
                          />
                        )}
                        {step === 6 && (
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
                            setErrors={setErrors}
                          />
                        )}
                        {step === 7 && (
                          <SCIFOtherPersonalData
                            data={{
                              personality_traits: formData.personality_traits,
                              family_relationship: formData.family_relationship,
                              counseling_info: formData.counseling_info,
                            }}
                            updateData={(sectionKey, newData) =>
                              setFormData((prev) => ({
                                ...prev,
                                [sectionKey]: {
                                  ...prev[sectionKey],
                                  ...newData,
                                },
                              }))
                            }
                            readOnly={readOnly}
                            errors={errors}
                            setErrors={setErrors}
                          />
                        )}
                        {step === 8 && (
                          <SCIFCertify
                            data={formData}
                            updateData={(newFormData) =>
                              setFormData(newFormData)
                            }
                            readOnly={readOnly}
                            showError={
                              !!error &&
                              !formData.privacy_consent?.has_consented
                            }
                          />
                        )}

                        {/* Error banner */}
                        {error && (
                          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded">
                            {error}
                          </div>
                        )}

                        {/* Buttons - bottom right aligned */}
                        <div className="flex justify-end items-center gap-3 mt-2">
                          {/* Back (disabled on first step) */}
                          {step > 1 && (
                            <Button
                              variant="secondary"
                              onClick={handlePreviousStep}
                            >
                              Back
                            </Button>
                          )}

                          {/* Save Draft (hidden in readOnly) */}
                          {!readOnly && (
                            <Button
                              variant="tertiary"
                              onClick={handleSaveDraft}
                              disabled={loading}
                            >
                              {loading ? "Saving Draft..." : "Save Draft"}
                            </Button>
                          )}

                          {/* On last step show Preview + Submit; otherwise show Next */}
                          {step < steps.length ? (
                            <Button variant="primary" onClick={handleNextStep}>
                              Next
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="tertiary"
                                onClick={handlePreview}
                              >
                                Preview
                              </Button>
                              {!readOnly && (
                                <Button
                                  variant="primary"
                                  onClick={handleConfirmSubmit}
                                >
                                  Submit
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <SCIFSubmissionConfirmation />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview modal (keeps same behavior) */}
          {isPreviewOpen && (
            <SCIFPreview
              profileData={profileData}
              formData={formData}
              onClose={() => setIsPreviewOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          title="Are you sure?"
          message="Please confirm that you want to submit your form."
          onConfirm={handleConfirmAction}
          onCancel={handleConfirmCancel}
        />
      )}

      {/* Draft Toasts */}

      {showDraftSuccessToast && (
        <ToastMessage
          message="Your draft has been saved successfully!"
          onClose={() => setShowDraftSuccessToast(false)}
          duration={2000}
        />
      )}

      {/* Privacy Modal */}
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
  );
};

export default SCIF;
