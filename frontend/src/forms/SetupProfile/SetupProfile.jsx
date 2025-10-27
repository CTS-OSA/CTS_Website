import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonalInfoForm from "./PersonalInfoForm";
import EducationInfoForm from "./EducationInfoForm";
import AddressInfoForm from "./AddressInfoForm";

import { apiRequest } from "../../utils/apiUtils";
import ProgressBar from "../../components/ProgressBar";
import PreviewModal from "./PreviewForm";
import Button from "../../components/UIButton";
import ToastMessage from "../../components/ToastMessage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import { useApiRequest } from "../../context/ApiRequestContext";
import {
  validatePersonalInfo,
  validateEducation,
  validateAddress,
} from "../../utils/formValidationUtils";
import DefaultLayout from "../../components/DefaultLayout";
import StepIndicator from "../../components/StepIndicator";

const ALPHA_REGEX = /^[A-Za-z\s]*$/;
const NON_ALPHA_REGEX = /[^A-Za-z\s]/g;
const PERSONAL_INFO_ALPHA_FIELDS = new Set([
  "family_name",
  "first_name",
  "middle_name",
  "nickname",
  "sex",
  "religion",
  "birth_place",
]);

const sanitizePersonalInfoFields = (state) => {
  if (!state || typeof state !== "object") {
    return state;
  }

  let changed = false;
  const nextState = { ...state };

  PERSONAL_INFO_ALPHA_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(nextState, field)) {
      const value = nextState[field];
      if (typeof value === "string" && value.length > 0) {
        const sanitizedValue = ALPHA_REGEX.test(value)
          ? value
          : value.replace(NON_ALPHA_REGEX, "");
        if (sanitizedValue !== value) {
          nextState[field] = sanitizedValue;
          changed = true;
        }
      }
    }
  });

  return changed ? nextState : state;
};

function formatAddress(data, type) {
  return {
    line1: data[`${type}_address_line_1`],
    barangay: data[`${type}_barangay`],
    city_municipality: data[`${type}_city_municipality`],
    province: data[`${type}_province`],
    region: data[`${type}_region`],
    zip: data[`${type}_zip_code`],
  };
}

const MultiStepForm = () => {
  const { request } = useApiRequest();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const { profileData, setProfileData } = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    family_name: "",
    first_name: "",
    middle_name: "",
    nickname: "",
    sex: "",
    religion: "",
    birth_rank: "",
    birthdate: "",
    birth_place: "",
    landline_number: "",
    mobile_number: "",
    // Education
    student_number: "",
    college: "",
    degree_program: "",
    current_year_level: "",
    date_initial_entry: "",
    date_initial_entry_sem: "",
    // Permanent Address
    permanent_region: "",
    permanent_province: "",
    permanent_city_municipality: "",
    permanent_barangay: "",
    permanent_address_line_1: "",
    permanent_address_line_2: "",
    permanent_zip_code: "",
    // Address While In UP
    up_region: "",
    up_province: "",
    up_city_municipality: "",
    up_barangay: "",
    up_address_line_1: "",
    up_address_line_2: "",
    up_zip_code: "",
  });

  const setPersonalInfoFormData = (updater) => {
    setFormData((prev) => {
      const rawNext = typeof updater === "function" ? updater(prev) : updater;

      if (!rawNext || typeof rawNext !== "object") {
        return rawNext;
      }

      return sanitizePersonalInfoFields(rawNext);
    });
  };

  useEffect(() => {
    if (profileData === undefined) return;

    if (profileData?.is_complete) {
      navigate("/myprofile");
    } else {
      setLoading(false);
    }
  }, [profileData]);

  if (loading || profileData === undefined) {
    return <Loader />;
  }

  const validateStep = async (
    step,
    formData,
    sameAsPermanent = false,
    request
  ) => {
    switch (step) {
      case 1:
        return validatePersonalInfo(formData);

      case 2:
        return await validateEducation(formData, request);

      case 3:
        return validateAddress(
          formatAddress(formData, "permanent"),
          "permanent"
        );

      case 4:
        if (sameAsPermanent) return {};
        return validateAddress(formatAddress(formData, "up"), "up");

      case 5:
        return {};

      default:
        return {};
    }
  };

  const handleNextStep = async () => {
    const validationErrors = await validateStep(
      step,
      formData,
      sameAsPermanent,
      request
    );
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

  const handlePreviousStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSameAsPermanentToggle = () => {
    const newValue = !sameAsPermanent;
    setSameAsPermanent(newValue);

    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        up_region: prev.permanent_region,
        up_province: prev.permanent_province,
        up_city_municipality: prev.permanent_city_municipality,
        up_barangay: prev.permanent_barangay,
        up_address_line_1: prev.permanent_address_line_1,
        up_address_line_2: prev.permanent_address_line_2,
        up_zip_code: prev.permanent_zip_code,
      }));
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e) => {
    const sanitizedFormData = sanitizePersonalInfoFields(formData);

    if (sanitizedFormData !== formData) {
      setFormData(sanitizedFormData);
    }

    const birthdate = `${sanitizedFormData.birthYear}-${String(
      sanitizedFormData.birthMonth
    ).padStart(2, "0")}-${String(sanitizedFormData.birthDay).padStart(2, "0")}`;

    const payload = {
      student_number: sanitizedFormData.student_number,
      college: sanitizedFormData.college,
      current_year_level: sanitizedFormData.current_year_level,
      degree_program: sanitizedFormData.degree_program,
      date_initial_entry: sanitizedFormData.date_initial_entry,
      date_initial_entry_sem: sanitizedFormData.date_initial_entry_sem,
      last_name: sanitizedFormData.family_name,
      first_name: sanitizedFormData.first_name,
      middle_name: sanitizedFormData.middle_name,
      nickname: sanitizedFormData.nickname,
      sex: sanitizedFormData.sex,
      birth_rank: sanitizedFormData.birth_rank,
      birthdate: birthdate,
      birthplace: sanitizedFormData.birth_place,
      contact_number: sanitizedFormData.mobile_number,
      landline_number: sanitizedFormData.landline_number,
      religion: sanitizedFormData.religion,
      permanent_address: {
        address_line_1: sanitizedFormData.permanent_address_line_1,
        address_line_2: sanitizedFormData.permanent_address_line_2,
        barangay: sanitizedFormData.permanent_barangay,
        city_municipality: sanitizedFormData.permanent_city_municipality,
        province: sanitizedFormData.permanent_province,
        region: sanitizedFormData.permanent_region,
        zip_code: sanitizedFormData.permanent_zip_code,
      },
      address_while_in_up: {
        address_line_1: sanitizedFormData.up_address_line_1,
        address_line_2: sanitizedFormData.up_address_line_2,
        barangay: sanitizedFormData.up_barangay,
        city_municipality: sanitizedFormData.up_city_municipality,
        province: sanitizedFormData.up_province,
        region: sanitizedFormData.up_region,
        zip_code: sanitizedFormData.up_zip_code,
      },
      is_complete: true,
    };

    try {
      setLoading(true);

      const response = await apiRequest(
        "http://localhost:8000/api/forms/student/profile/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to submit profile");

      const result = await response.json();
      setProfileData(result);
      setLoading(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        navigate("/myprofile", { state: { showSuccess: true } });
      }, 2000);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
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

  const steps = [
    { label: "Basic Details" },
    { label: "Education Info" },
    { label: "Address Info" },
    { label: "Preview & Submit" },
  ];

  return (
    <DefaultLayout variant="student">
      {/* Background Rectangle */}
      <div className="absolute w-full h-[26em] left-0 top-0 bg-upmaroon -z-1"></div>
      {/* Main Form */}
      <div className="relative flex flex-col min-h-screen">
        <div className="mt-[30px] mx-auto w-3/4 flex flex-col items-center">
          <div className="main-form-info">
            <h1 className="left-1/2 text-center font-bold text-[2rem] text-white">
              SETUP YOUR PROFILE
            </h1>
            <p className="text-center text-white my-5 text-base lg:w-2xl w-sm">
              Please complete this profile accurately. Your information will
              help the Office of Student Affairs provide the appropriate
              guidance, support, and services during your stay at UP Mindanao.
            </p>
          </div>

          <div className="bg-white rounded-[15px] p-8 w-full mx-auto mb-[70px] shadow-md box-border">
            <div className="flex lg:flex-row flex-col w-full">
              <div className="lg:w-1/3 lg:bg-[#7b1113] rounded-lg p-4 pt-10 lg:min-h-[450px]">
                <StepIndicator steps={steps} currentStep={step} />
              </div>
              <div className="main-form p-4 w-full">
                {step === 1 && (
                  <PersonalInfoForm
                    formData={formData}
                    setFormData={setPersonalInfoFormData}
                    step={step}
                    errors={errors}
                    setErrors={setErrors}
                  />
                )}
                {step === 2 && (
                  <EducationInfoForm
                    formData={formData}
                    setFormData={setFormData}
                    step={step}
                    errors={errors}
                    setErrors={setErrors}
                  />
                )}
                {step === 3 && (
                  <AddressInfoForm
                    formData={formData}
                    setFormData={setFormData}
                    addressLabel="Permanent Address"
                    disabled={false}
                    prefix="permanent"
                    errors={errors}
                    setErrors={setErrors}
                  />
                )}
                {step === 4 && (
                  <AddressInfoForm
                    formData={formData}
                    setFormData={setFormData}
                    addressLabel="Address while in UP"
                    checkboxLabel="Same as Permanent Address"
                    sameAsPermanent={sameAsPermanent}
                    handleSameAsPermanentToggle={handleSameAsPermanentToggle}
                    disabled={sameAsPermanent}
                    prefix="up"
                  />
                )}
                <div className="main-form-buttons">
                  {/* Step 1: Only 'Next' button */}
                  {step === 1 && (
                    <Button variant="primary" onClick={handleNextStep}>
                      Next
                    </Button>
                  )}

                  {/* Steps 2-4: 'Back' and 'Next' buttons */}
                  {step >= 2 && step <= 3 && (
                    <>
                      <Button variant="secondary" onClick={handlePreviousStep}>
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleNextStep}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Next
                      </Button>
                    </>
                  )}

                  {/* Step 5: 'Back', 'Preview', and 'Submit' buttons */}
                  {step === 4 && (
                    <>
                      <Button variant="secondary" onClick={handlePreviousStep}>
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handlePreview}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Preview
                      </Button>
                      {isPreviewOpen && (
                        <PreviewModal
                          data={formData}
                          onClose={() => setIsPreviewOpen(false)}
                        />
                      )}
                      <Button
                        variant="primary"
                        onClick={handleConfirmSubmit}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Submit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          title="Are you sure?"
          message="Please confirm that you want to submit your form."
          onConfirm={handleConfirmAction}
          onCancel={handleConfirmCancel}
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <ToastMessage
          message="Your form has been successfully submitted!"
          onClose={() => setShowSuccessToast(false)}
          duration={5000}
        />
      )}
    </DefaultLayout>
  );
};

export default MultiStepForm;
