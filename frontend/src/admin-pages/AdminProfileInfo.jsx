import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DisplayField from "../components/DisplayField";
import Button from "../components/UIButton";
import { ReadonlyField, EditableField } from "../components/EditableField";
import FormField from "../components/FormField";
import ToastMessage from "../components/ToastMessage";
import ConfirmDialog from "../components/ConfirmDialog";
import Loader from "../components/Loader";
import { validatePhotoFile } from "../utils/photoValidation";

const CounselorSideInfo = ({
  profileData,
  submittedForms = [],
  onUpdate,
  isAdmin = false,
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData || {});
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  if (!profileData) {
    return <Loader />;
  }

  const {
    first_name,
    last_name,
    position,
    contact_number,
    email,
    licenses = [],
    photo,
  } = formData;

  const updateProfileData = (updatedFields) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const updateNestedField = (parentField, updatedFields) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        ...updatedFields,
      },
    }));
  };

  const handleUpdate = () => {
    setConfirmAction("save");
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setConfirmAction("cancel");
    setShowConfirm(true);
  };

  const handleConfirmDialog = async () => {
    if (confirmAction === "save") {
      await onUpdate(formData);
      setToast("Profile updated successfully!");
    } else if (confirmAction === "cancel") {
      setFormData(profileData);
      setToast("Changes were discarded.");
    }
    setIsEditing(false);
    setShowConfirm(false);
    setConfirmAction(null);
  };

  useEffect(() => {
    setFormData(profileData);
    let photoUrl = null;
    const imagePath = profileData?.photo?.image;

    if (imagePath && typeof imagePath === "string" && imagePath.trim() !== "") {
      photoUrl = `${"http://localhost:8000/"}${imagePath}`;
    }
    setPhotoPreview(photoUrl);
    setValidationErrors({});
  }, [profileData]);

  return (
    <div className="lg:flex gap-8 mb-8 border-b-gray">
      <div className="lg:w-[30%] w-2/3 xs:w-full justify-center mx-auto p-6 text-center overflow-y-auto">
        <div className="counselor_side_info">
          <div className="relative w-50 h-50 mx-auto flex items-center justify-center rounded-2xl overflow-hidden shadow-lg border-2 border-upmaroon group">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={`${first_name} ${last_name} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-upmaroon text-white text-[2.5rem] font-bold w-full h-full flex items-center justify-center">
                {first_name?.charAt(0)}
                {last_name?.charAt(0)}
              </div>
            )}

            {/* Overlay shown only in edit mode */}
            {isEditing && (
              <div className="absolute inset-0 bg-upmaroon bg-opacity-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 13V20C21 20.5523 20.5523 21 20 21H4C3.44771 21 3 20.5523 3 20V4C3 3.44771 3.44771 3 4 3H11"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 13.36V17H10.6586L21 6.65405L17.3475 3L7 13.36Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="text-white font-semibold text-sm">
                  Change Photo
                </span>

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    validatePhotoFile(
                      file,
                      (renamedFile, previewURL) => {
                        setPhotoFile(renamedFile);
                        setPhotoPreview(previewURL);
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.photo;
                          return newErrors;
                        });
                      },
                      (errorObj) => {
                        setErrors((prev) => ({ ...prev, ...errorObj }));
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }
                    );
                  }}
                />
              </div>
            )}
          </div>
          {errors?.photo && (
            <p className="text-red-500 text-sm font-medium mt-2 text-center italic">
              {errors.photo}
            </p>
          )}

          <div>
            <ReadonlyField label="Email" value={email} />
            <EditableField
              label="Position"
              type="text"
              value={position || ""}
              onChange={(e) => updateProfileData({ position: e.target.value })}
              readOnly={!isEditing}
            />
            <EditableField
              label="Contact Number"
              type="text"
              value={contact_number || ""}
              onChange={(e) =>
                updateProfileData({ contact_number: e.target.value })
              }
              readOnly={!isEditing}
            />
          </div>
        </div>
      </div>

      <div className="w-[70%] bg-white rounded-xl p-8 overflow-y-auto mx-auto">
        <div className="flex flex-col gap-6">
          <div className="info-group">
            <h2 className="text-[1.2rem] font-semibold mb-3 text-upmaroon lg:text-left text-center">
              PERSONAL INFORMATION
            </h2>
            <div className="grid lg:grid-cols-3 gap-4 pb-4">
              <FormField
                label="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  updateProfileData({ first_name: e.target.value })
                }
                readOnly={!isEditing}
              />
              <FormField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) =>
                  updateProfileData({ last_name: e.target.value })
                }
                readOnly={!isEditing}
              />
              <FormField
                label="Middle Name"
                value={formData.middle_name || ""}
                onChange={(e) =>
                  updateProfileData({ middle_name: e.target.value })
                }
                readOnly={!isEditing}
              />
            </div>

            <div className="licenses-section">
              <h2 className="text-[1.2rem] font-semibold mb-3 text-upmaroon lg:text-left text-center">
                LICENSES
              </h2>
              {licenses.length === 0 && <p>No licenses added yet.</p>}
              {licenses.map((license, idx) => (
                <div key={idx} className="grid lg:grid-cols-2 gap-4 pb-4">
                  <FormField
                    label={`License #${idx + 1} Name`}
                    value={license.name || ""}
                    onChange={(e) => {
                      const updatedLicenses = [...licenses];
                      updatedLicenses[idx].name = e.target.value;
                      updateProfileData({ licenses: updatedLicenses });
                    }}
                    readOnly={!isEditing}
                  />
                  <FormField
                    label={`License #${idx + 1} Number`}
                    value={license.number || ""}
                    onChange={(e) => {
                      const updatedLicenses = [...licenses];
                      updatedLicenses[idx].number = e.target.value;
                      updateProfileData({ licenses: updatedLicenses });
                    }}
                    readOnly={!isEditing}
                  />
                </div>
              ))}
            </div>

            <div>
              {isEditing ? (
                <>
                  <Button variant="primary" onClick={handleUpdate}>
                    Save
                  </Button>
                  <Button variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                !isAdmin && (
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title={
            confirmAction === "save" ? "Save Changes?" : "Discard Changes?"
          }
          message={
            confirmAction === "save"
              ? "Do you want to save the updates you made?"
              : "Are you sure you want to discard all changes?"
          }
          onConfirm={handleConfirmDialog}
          onCancel={() => {
            setShowConfirm(false);
            setConfirmAction(null);
          }}
        />
      )}

      {showSuccessToast && (
        <ToastMessage
          message="Your profile has been successfully set up!"
          onClose={() => setShowSuccessToast(false)}
          duration={5000}
        />
      )}

      {toast && <ToastMessage message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CounselorSideInfo;
