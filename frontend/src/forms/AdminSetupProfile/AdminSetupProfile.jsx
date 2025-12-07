import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminPersonalInfo from "./AdminPersonalInfo"; // Customize for counselor fields
import AdminLicenses from "./AdminLicenses"; // New step for licenses
import AdminPhoto from "./AdminPhoto";
import CounselorPreviewModal from "./PreviewForm";
import { apiRequest } from "../../utils/apiUtils";
import Button from "../../components/UIButton";
import ToastMessage from "../../components/ToastMessage";
import ConfirmDialog from "../../components/ConfirmDialog";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import { useApiRequest } from "../../context/ApiRequestContext";
import StepIndicator from "../../components/StepIndicator";
import DefaultLayout from "../../components/DefaultLayout";

const ALPHA_REGEX = /^[A-Za-z\s]*$/;
const NON_ALPHA_REGEX = /[^A-Za-z\s]/g;
const PERSONAL_INFO_ALPHA_FIELDS = new Set([
  "last_name",
  "first_name",
  "middle_name",
  "nickname",
  "sex",
]);

const sanitizePersonalInfoFields = (state) => {
  if (!state || typeof state !== "object") return state;
  let changed = false;
  const nextState = { ...state };
  PERSONAL_INFO_ALPHA_FIELDS.forEach((field) => {
    if (nextState[field] && typeof nextState[field] === "string") {
      const sanitizedValue = ALPHA_REGEX.test(nextState[field])
        ? nextState[field]
        : nextState[field].replace(NON_ALPHA_REGEX, "");
      if (sanitizedValue !== nextState[field]) {
        nextState[field] = sanitizedValue;
        changed = true;
      }
    }
  });
  return changed ? nextState : state;
};

const AdminSetupProfile = () => {
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const { profileData, setProfileData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    nickname: "",
    suffix: "",
    sex: "",
    birthdate: "",
    contact_number: "",
    position: [],
    post_nominal: [],
    licenses: [],
  });

  const setPersonalInfoFormData = (updater) => {
    setFormData((prev) => {
      const nextState = typeof updater === "function" ? updater(prev) : updater;
      return sanitizePersonalInfoFields(nextState);
    });
  };

  useEffect(() => {
    if (profileData?.is_complete) {
      navigate("/myprofile");
    } else {
      setLoading(false);
    }
  }, [profileData]);

  if (loading) return <Loader />;

  const validateStep = (step) => {
    const stepErrors = {};
    switch (step) {
      case 1:
        [
          "first_name",
          "last_name",
          "sex",
          "birthdate",
          "contact_number",
        ].forEach((field) => {
          if (!formData[field]) stepErrors[field] = "This field is required.";
        });
        break;
      case 2: // Licenses
        if (formData.licenses.length === 0) {
          stepErrors.licenses = "At least one license is required.";
        }
        break;
      case 3: // Photo
        if (!photoFile) stepErrors.photo = "Profile photo is required.";
        break;
      default:
        break;
    }
    return stepErrors;
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => setStep((prev) => prev - 1);

  const handlePreview = () => setIsPreviewOpen(true);

  const handleSubmit = async () => {
    const sanitizedFormData = sanitizePersonalInfoFields(formData);

    if (sanitizedFormData !== formData) {
      setFormData(sanitizedFormData);
    }

    const payload = new FormData();

    if (!photoFile) {
      setErrors({ photo: "A staff photo is required." });
      return;
    }
    payload.append("photo", photoFile, photoFile.name);

    Object.keys(sanitizedFormData).forEach((key) => {
      if (["licenses", "position", "post_nominal"].includes(key)) {
        payload.append(key, JSON.stringify(sanitizedFormData[key]));
      } else {
        payload.append(key, sanitizedFormData[key] ?? "");
      }
    });

    try {
      setLoading(true);
      const response = await apiRequest(
        "http://localhost:8000/api/forms/counselors/create/",
        { method: "POST", credentials: "include", body: payload }
      );
      if (!response.ok) throw new Error("Failed to submit profile");
      const result = await response.json();
      setProfileData(result);
      setLoading(false);
      setShowSuccessToast(true);
      setTimeout(() => navigate("/admin/myprofile"), 2000);
    } catch (err) {
      setLoading(false);
      setErrors({ submit: err.message });
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
    { label: "Personal Info" },
    { label: "Licenses" },
    { label: "Upload Photo & Preview" },
  ];

  return (
    <DefaultLayout variant="admin">
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
              <div className="lg:w-1/3 lg:bg-upmaroon rounded-lg p-4 pt-10 lg:min-h-[450px]">
                <StepIndicator steps={steps} currentStep={step} />
              </div>
              <div className="main-form p-4 w-full">
                {step === 1 && (
                  <AdminPersonalInfo
                    formData={formData}
                    setFormData={setPersonalInfoFormData}
                    errors={errors}
                  />
                )}
                {step === 2 && (
                  <AdminLicenses
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                  />
                )}
                {step === 3 && (
                  <AdminPhoto
                    photoFile={photoFile}
                    setPhotoFile={setPhotoFile}
                    photoPreview={photoPreview}
                    setPhotoPreview={setPhotoPreview}
                    errors={errors}
                    setErrors={setErrors}
                  />
                )}
                <div className="flex justify-end mt-auto">
                  <div className="main-form-buttons">
                    {/* Step 1: Only 'Next' button */}
                    {step === 1 && (
                      <Button variant="primary" onClick={handleNextStep}>
                        Next
                      </Button>
                    )}

                    {/* Steps 2-4: 'Back' and 'Next' buttons */}
                    {step == 2 && (
                      <>
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
                      </>
                    )}

                    {/* Step 6: 'Back', 'Preview', and 'Submit' buttons */}
                    {step === 3 && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={handlePreviousStep}
                        >
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
                          <CounselorPreviewModal
                            data={formData}
                            onClose={() => setIsPreviewOpen(false)}
                            photoPreview={photoPreview}
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
      </div>
      {isPreviewOpen && (
        <CounselorPreviewModal
          data={formData}
          photoPreview={photoPreview}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
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

export default AdminSetupProfile;
