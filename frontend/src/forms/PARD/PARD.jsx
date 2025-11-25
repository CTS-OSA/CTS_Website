import React, { useState, useContext, useEffect } from "react";

import { AuthContext } from "../../context/AuthContext";
import DefaultLayout from "../../components/DefaultLayout";
import StepIndicator from "../../components/StepIndicator";

// Sections
import PARDIntroduction from "./PARDIntroduction";
import PARDConsent from "./PARDConsent";
import PARDDemogProfile from "./PARDDemogProfile";
import PARDContactInfo from "./PARDContactInfo";
import PARDPsychAssessment from "./PARDPsychAssessment";
import PARDAuthorization from "./PARDAuthorization";
import PARDSubmissionConfirmation from "./PARDSubmissionConfirmation";

import Button from "../../components/UIButton";
import ConfirmDialog from "../../components/ConfirmDialog";

import { useFormApi } from "./PARDApi";
import { useNavigate } from "react-router-dom";

const PARD = () => {
  const { profileData } = useContext(AuthContext);
  const navigate = useNavigate();
  const { getStudentData, submitForm } = useFormApi();
  const [step, setStep] = useState(1);
  const [submissionId, setSubmissionId] = useState(null);
  const [studentNumber, setStudentNumber] = useState(
    profileData?.student_number
  );

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      if (studentNumber) {
        try {
          const data = await getStudentData(studentNumber);

          if (data && data.student_profile) {
            // Set submission ID from the response
            if (data.submission && data.submission.id) {
              setSubmissionId(data.submission.id);
              if (data.submission.status === "submitted") {
                setReadOnly(true);
              }
            }

            const student = data.student_profile;
            const permanentAddr = data.permanent_address;
            const upAddr = data.address_while_in_up;
            const student_email = data.user;

            setFormData((prev) => ({
              ...prev,
              pard_demographic_profile: {
                student_last_name: student?.last_name || "",
                student_first_name: student?.first_name || "",
                student_middle_name: student?.middle_name || "",
                student_nickname: student?.nickname || "",
                student_year: student?.current_year_level || "",
                student_degree_program: student?.degree_program || "",
              },
              pard_contact_info: {
                ...prev.pard_contact_info,
                student_contact_number: student?.contact_number || "",
                hometown_address: permanentAddr
                  ? `${permanentAddr.address_line_1}, ${permanentAddr.address_line_2}, ${permanentAddr.barangay}, ${permanentAddr.city_municipality}, ${permanentAddr.province}, ${permanentAddr.region}`
                  : "",
                current_address: upAddr
                  ? `${upAddr.address_line_1}, ${upAddr.address_line_2}, ${upAddr.barangay}, ${upAddr.city_municipality}, ${upAddr.province}, ${upAddr.region}`
                  : "",
                student_email: student_email?.email || "",
              },
            }));
            console.log("student data returned:", data);
          } else {
            setError("Failed to create or fetch the form.");
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (studentNumber) fetchStudentData();
  }, [studentNumber]);

  const [formData, setFormData] = useState({
    pard_demographic_profile: {
      student_last_name: "",
      student_first_name: "",
      student_middle_name: "",
      student_nickname: "",
      student_year: "",
      student_degree_program: "",
    },
    pard_contact_info: {
      student_contact_number: "",
      student_email: "",
      hometown_address: "",
      current_address: "",
      preferred_date: "",
      preferred_time: "",
    },
    pard_psych_assessment: {
      date_started: "",
      is_currently_on_medication: "",
      symptoms_observed: "",
      communication_platform: "",
      date_diagnosed: "",
      diagnosed_by: "",
    },
    consent_agreed: false,
    authorization_agreed: false,
  });

  // Set of rules for all input fields
  const rules = {
    pard_demographic_profile: {
      student_last_name: {
        required: true,
        message: "This field is required.",
      },
      student_first_name: {
        required: true,
        message: "This field is required.",
      },
      student_middle_name: {
        required: true,
        message: "This field is required.",
      },
      student_nickname: {
        required: true,
        message: "This field is required.",
      },
      student_year: {
        required: true,
        message: "This field is required.",
      },
      student_degree_program: {
        required: true,
        message: "This field is required.",
      },
    },
    pard_contact_info: {
      student_contact_number: {
        required: true,
        message: "This field is required.",
        pattern: /^[0-9]+$/,
        patternMessage: "Please enter a valid phone number.",
      },
      student_email: {
        required: true,
        message: "This field is required.",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: "Please enter a valid email address.",
      },
      hometown_address: {
        required: true,
        message: "This field is required.",
      },
      current_address: {
        required: true,
        message: "This field is required.",
      },
      preferred_date: {
        required: true,
        message: "This field is required.",
        greaterThan: new Date(),
        greaterThanMessage: "Please enter a valid date.",
      },
      preferred_time: {
        required: true,
        minTime: "8:00",
        maxTime: "16:00",
        timeRangeMessage: "Please enter a time within the office hours.",
        message: "This field is required.",
      },
    },
    pard_psych_assessment: {
      date_started: {
        required: true,
        message: "This field is required.",
      },
      is_currently_on_medication: {
        required: true,
        message: "This field is required.",
      },
      symptoms_observed: {
        required: true,
        message: "This field is required.",
      },
      communication_platform: {
        required: true,
        message: "This field is required.",
      },
      date_diagnosed: {
        required: true,
        message: "This field is required.",
        lesserThan: new Date(),
        lesserThanMessage: "Please enter a valid date.",
      },
      diagnosed_by: {
        required: true,
        message: "This field is required.",
      },
    },
  };

  const validateStep = (stepNumber) => {
    // NOTE: UNCOMMENT THIS TO VIEW VALIDATION
    const stepMap = {
      3: "pard_demographic_profile",
      4: "pard_contact_info",
      5: "pard_psych_assessment",
    };

    const sectionKey = stepMap[stepNumber];
    if (!sectionKey) return {};

    const sectionRules = rules[sectionKey];
    const sectionData = formData[sectionKey];
    const newErrors = {};

    Object.keys(sectionRules).forEach((fieldKey) => {
      const rule = sectionRules[fieldKey];
      const value = sectionData[fieldKey];

      if (rule.required && !value) {
        newErrors[fieldKey] = rule.message;
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[fieldKey] = rule.patternMessage;
      } else if (rule.greaterThan && value) {
        const inputDate = new Date(value);
        const currentDate = new Date(rule.greaterThan);
        if (inputDate <= currentDate) {
          newErrors[fieldKey] = rule.greaterThanMessage;
        }
      } else if (rule.lesserThan && value) {
        const inputDate = new Date(value);
        const currentDate = new Date(rule.lesserThan);
        if (inputDate >= currentDate) {
          newErrors[fieldKey] = rule.lesserThanMessage;
        }
      } else if (rule.minTime && rule.maxTime && value) {
        const [h, m] = value.split(":").map(Number);
        const totalMinutes = h * 60 + m;

        const [minH, minM] = rule.minTime.split(":").map(Number);
        const [maxH, maxM] = rule.maxTime.split(":").map(Number);

        const minMinutes = minH * 60 + minM;
        const maxMinutes = maxH * 60 + maxM;

        if (totalMinutes < minMinutes || totalMinutes > maxMinutes) {
          newErrors[fieldKey] =
            rule.timeRangeMessage || "Time is outside allowed range.";
        }
      }
    });

    return newErrors;
  };

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleNextStep = () => {
    // Validation for consent step 2
    if (step === 2 && !formData.consent_agreed) {
      setError("Please agree to the consent before proceeding.");
      return;
    }

    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setError(null);
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handleConfirmSubmit = () => {
    // Ensure agreed authorization consent before submission
    if (!formData.authorization_agreed) {
      setError("Please agree to the authorization before proceeding.");
      return;
    }

    setError(null);
    setShowConfirmDialog(true);
  };

  const handlePreviousStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
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
      const result = await submitForm(submissionId, formData);
      console.log("submission", result);
      if (result.success) {
        setShowConfirmation(true);
        // navigate("/student");
        // setTimeout(() => {
        //   navigate("/student");
        // }, 3000);
      } else {
        if (result.status === 400 && result.data.errors) {
          setError(
            "Validation errors: " + JSON.stringify(result.data.errors, null, 2)
          );
        } else if (result.data.error) {
          setError(`Error: ${result.data.error}`);
        } else if (result.data.message) {
          setError(`Error: ${result.data.message}`);
        } else {
          setError("Unknown error occurred.");
        }
      }
    } catch (err) {
      setError("Failed to submit form.");
    } finally {
      setLoading(false);
    }
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
        {/* Main form */}
        <div className="relative flex flex-col min-h-screen">
          <div className="mx-auto w-3/4 flex flex-col items-center"></div>
          <div className="flex flex-col justify-center bg-upmaroon w-full h-60 text-white text-center">
            <h1 className="font-bold text-2xl sm:text-4xl -mt-10">
              Psychosocial Assistance and<br></br> Referral Desk
            </h1>
            <h3 className="text-base sm:text-xl">
              Online Appointment Schedule
            </h3>
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
                      {step === 1 && <PARDIntroduction />}
                      {step === 2 && (
                        <PARDConsent
                          formData={formData}
                          setFormData={setFormData}
                          setError={setError}
                        />
                      )}
                      {step === 3 && (
                        <PARDDemogProfile
                          formData={formData}
                          setFormData={setFormData}
                          errors={errors}
                          setErrors={setErrors}
                        />
                      )}
                      {step === 4 && (
                        <PARDContactInfo
                          formData={formData}
                          setFormData={setFormData}
                          errors={errors}
                          setErrors={setErrors}
                        />
                      )}
                      {step === 5 && (
                        <PARDPsychAssessment
                          formData={formData}
                          setFormData={setFormData}
                          errors={errors}
                          setErrors={setErrors}
                        />
                      )}
                      {step === 6 && (
                        <PARDAuthorization
                          formData={formData}
                          setFormData={setFormData}
                          setError={setError}
                        />
                      )}
                    </>
                  ) : (
                    <PARDSubmissionConfirmation />
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="text-[#D32F2F] text-xs ml-4 italic">
                      {error}
                    </div>
                  )}
                </div>

                {/* BUTTONS FOR EACH SECTIONs */}
                {!showConfirmation && (
                  <div className="flex justify-end mt-auto">
                    <div className="main-form-buttons">
                      {/* Step 1: 'Next' button */}
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

                      {/* Step 6: 'Back', 'Preview', and 'Submit' buttons */}
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
                )}

                {showConfirmDialog && (
                  <ConfirmDialog
                    title="Are you sure?"
                    message="Please confirm that you want to submit your form."
                    onConfirm={handleConfirmAction}
                    onCancel={handleConfirmCancel}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default PARD;
