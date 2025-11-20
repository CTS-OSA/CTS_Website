// Updated CounselorSideInfo component with layout similar to provided design

import React, { useState, useEffect, useMemo } from "react";
import { ReadonlyField, EditableField } from "../components/EditableField";
import FormField from "../components/FormField";
import Button from "../components/UIButton";
import Loader from "../components/Loader";
import ConfirmDialog from "../components/ConfirmDialog";
import ToastMessage from "../components/ToastMessage";
import { validatePhotoFile } from "../utils/photoValidation";

const BASE_SEX_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const formatListValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "";
};

const parseListField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const sanitizeLicenses = (licenseList) => {
  if (!Array.isArray(licenseList)) return [];
  return licenseList
    .map((license) => ({
      ...license,
      name: license?.name?.trim() || "",
      number: license?.number?.trim() || "",
    }))
    .filter((license) => license.name || license.number);
};

const CounselorSideInfo = ({ profileData, onUpdate, isAdmin = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData || {});
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  if (!profileData) return <Loader />;

  const updateProfileData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleUpdate = () => {
    if (!validateForm()) return;
    setConfirmAction("save");
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setConfirmAction("cancel");
    setShowConfirm(true);
  };

  const handleFieldChange = (field, value) => {
    updateProfileData({ [field]: value });
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAddLicense = () => {
    const updated = [...(licenses || []), { name: "", number: "" }];
    updateProfileData({ licenses: updated });
  };

  const handleLicenseFieldChange = (index, key, value) => {
    const updated = [...licenses];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    updateProfileData({ licenses: updated });
    const errorKey = `license_${index}_${key}`;
    setErrors((prev) => {
      if (!prev[errorKey]) return prev;
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
  };

  const validateForm = () => {
    const fieldErrors = {};
    const textFields = [
      { key: "first_name", label: "First name" },
      { key: "last_name", label: "Last name" },
      { key: "nickname", label: "Nickname" },
    ];

    textFields.forEach(({ key, label }) => {
      const value = formData[key];
      if (!value || !value.toString().trim()) {
        fieldErrors[key] = `${label} is required.`;
      }
    });

    if (!formData.sex) {
      fieldErrors.sex = "Sex is required.";
    }

    if (!formData.birthdate) {
      fieldErrors.birthdate = "Birthdate is required.";
    }

    const positionList = parseListField(formData.position);
    if (positionList.length === 0) {
      fieldErrors.position = "Position is required.";
    }

    const contactValue = (formData.contact_number ?? "").toString().trim();
    if (!contactValue) {
      fieldErrors.contact_number = "Contact number is required.";
    } else if (!/^\d{11}$/.test(contactValue)) {
      fieldErrors.contact_number = "Contact number must be exactly 11 digits.";
    }

    (formData.licenses || []).forEach((license, idx) => {
      const name = (license?.name ?? "").toString().trim();
      const number = (license?.number ?? "").toString().trim();

      if (!name) {
        fieldErrors[`license_${idx}_name`] = "License name is required.";
      }
      if (!number) {
        fieldErrors[`license_${idx}_number`] = "License number is required.";
      }
    });

    const finalErrors = { ...fieldErrors };
    if (errors.photo) {
      finalErrors.photo = errors.photo;
    }

    setErrors(finalErrors);
    return Object.keys(finalErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (confirmAction === "save") {
      const normalizedPosition = parseListField(formData.position);
      const normalizedPostNominal = parseListField(formData.post_nominal);
      const normalizedLicenses = sanitizeLicenses(formData.licenses);

      const payload = {
        ...formData,
        position: normalizedPosition,
        post_nominal: normalizedPostNominal,
        licenses: normalizedLicenses,
      };

      if (photoFile) {
        payload.photoFile = photoFile;
      }

      await onUpdate(payload);
      setFormData((prev) => ({
        ...prev,
        position: normalizedPosition,
        post_nominal: normalizedPostNominal,
        licenses: normalizedLicenses,
      }));
      setToast("Profile updated successfully!");
    } else {
      setFormData(profileData);
      setToast("Changes discarded.");
    }
    setIsEditing(false);
    setShowConfirm(false);
    setErrors((prev) => (prev?.photo ? { photo: prev.photo } : {}));
  };

  useEffect(() => {
    setFormData(profileData);
    const imgPath = profileData?.photo?.image;
    if (imgPath) setPhotoPreview(imgPath);
  }, [profileData]);

  const {
    first_name,
    middle_name,
    last_name,
    email,
    nickname,
    suffix,
    sex,
    birthdate,
    contact_number,
    position = [],
    post_nominal = [],
    licenses = [],
  } = formData;

  const formattedPosition = formatListValue(position);
  const formattedPostNominal = formatListValue(post_nominal);
  const suffixText = (suffix ?? "").toString().trim();
  const postNominalText = formattedPostNominal
    ? formattedPostNominal.trim()
    : "";
  const baseName = [first_name, last_name]
    .map((part) => part?.toString().trim())
    .filter(Boolean)
    .join(" ");
  const nameExtras = [];
  if (suffixText) nameExtras.push(suffixText);
  if (postNominalText) nameExtras.push(postNominalText);
  const displayName =
    baseName && nameExtras.length
      ? `${baseName}, ${nameExtras.join(", ")}`
      : baseName || nameExtras.join(", ");

  const sexOptions = useMemo(() => {
    if (!sex || BASE_SEX_OPTIONS.some((opt) => opt.value === sex)) {
      return BASE_SEX_OPTIONS;
    }
    return [{ value: sex, label: sex }, ...BASE_SEX_OPTIONS];
  }, [sex]);

  return (
    <div className="flex flex-col lg:flex-row w-full gap-6 p-4">
      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-[28%] bg-white rounded-xl shadow p-6 flex flex-col items-center text-center max-w-md mx-auto lg:mx-0">
        {/* Profile Photo */}
        <div className="relative w-20 h-20 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-gray-300 group mx-auto">
          {photoPreview ? (
            <img src={photoPreview} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-upmaroon text-white flex items-center justify-center text-4xl font-bold">
              {first_name?.charAt(0)}
              {last_name?.charAt(0)}
            </div>
          )}

          {/* Edit overlay */}
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white cursor-pointer">
              <span className="text-sm font-semibold">Change Photo</span>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  validatePhotoFile(
                    file,
                    (renamed, preview) => {
                      setPhotoFile(renamed);
                      setPhotoPreview(preview);
                      setErrors((prev) => ({ ...prev, photo: null }));
                    },
                    (err) => setErrors((prev) => ({ ...prev, ...err }))
                  );
                }}
              />
            </div>
          )}
        </div>

        {errors.photo && (
          <p className="text-red-500 text-xs italic mt-2">{errors.photo}</p>
        )}

        {/* Name */}
        <h2 className="mt-4 text-xs sm:text-xl font-semibold">
          {displayName || "Counselor"}
        </h2>
        <p className="text-xs sm:text-base text-gray-500 mb-4">
          {formattedPosition || "Specialist"}
        </p>

        <ReadonlyField label="Email" value={email} />
        <EditableField
          label="Contact Number"
          value={contact_number || ""}
          readOnly={!isEditing}
          onChange={(e) => handleFieldChange("contact_number", e.target.value)}
          error={isEditing ? errors.contact_number : ""}
        />
      </div>

      {/* RIGHT MAIN INFO CARD */}
      <div className="w-full lg:w-[72%] bg-white rounded-xl shadow p-8 mt-6 lg:mt-0">
        {/* Basic Info Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="font-roboto text-lg md:text-xl font-semibold text-gray-800">
            Basic Information
          </h2>
          {!isAdmin && !isEditing && (
            <button
              className="text-upmaroon font-semibold hover:cursor-pointer hover:scale-105 hover:font-bold transition duration-100"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>

        {/* BASIC INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="md:col-span-2">
            <FormField
              label="First Name"
              value={first_name || ""}
              readOnly={!isEditing}
              onChange={(e) => handleFieldChange("first_name", e.target.value)}
              error={isEditing ? errors.first_name : ""}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              label="Middle Name"
              value={middle_name || ""}
              readOnly={!isEditing}
              onChange={(e) => handleFieldChange("middle_name", e.target.value)}
              error={isEditing ? errors.middle_name : ""}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              label="Last Name"
              value={last_name || ""}
              readOnly={!isEditing}
              onChange={(e) => handleFieldChange("last_name", e.target.value)}
              error={isEditing ? errors.last_name : ""}
            />
          </div>
          <div className="md:col-span-3">
            <FormField
              label="Suffix"
              value={suffix || ""}
              readOnly={!isEditing}
              onChange={(e) => handleFieldChange("suffix", e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <FormField
              label="Post Nominal"
              value={formattedPostNominal}
              readOnly={!isEditing}
              onChange={(e) =>
                handleFieldChange("post_nominal", e.target.value)
              }
            />
          </div>
          <div className="md:col-span-3">
            <FormField
              label="Sex"
              type="select"
              options={sexOptions}
              value={sex || ""}
              readOnly={!isEditing}
              onChange={(e) => handleFieldChange("sex", e.target.value)}
              error={isEditing ? errors.sex : ""}
            />
          </div>
          <div className="md:col-span-3">
            <FormField
              label="Nickname"
              value={nickname || ""}
              readOnly={!isEditing}
              onChange={(e) => handleFieldChange("nickname", e.target.value)}
              error={isEditing ? errors.nickname : ""}
            />
          </div>
          <div className="md:col-span-3">
            <FormField
              label="Birthdate"
              type="date"
              value={birthdate || ""}
              readOnly={!isEditing}
              onChange={(e) => handleFieldChange("birthdate", e.target.value)}
              error={isEditing ? errors.birthdate : ""}
            />
          </div>
          <div className="md:col-span-3">
            <FormField
              label="Position"
              value={formattedPosition}
              readOnly={!isEditing}
              onChange={(e) => handleFieldChange("position", e.target.value)}
              error={isEditing ? errors.position : ""}
            />
          </div>
        </div>

        {/* LICENSES */}
        <h2 className="font-roboto text-lg font-semibold mb-2">Licenses</h2>
        {isEditing && (
          <button
            type="button"
            className="text-sm text-upmaroon font-semibold mb-4 cursor-pointer hover:font-bold hover:scale-105 transition duration-100"
            onClick={handleAddLicense}
          >
            + Add License
          </button>
        )}
        {licenses.length === 0 && (
          <p className="text-sm text-gray-500">No licenses added</p>
        )}

        {licenses.map((license, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              label={`License #${idx + 1} Name`}
              value={license.name || ""}
              readOnly={!isEditing}
              onChange={(e) =>
                handleLicenseFieldChange(idx, "name", e.target.value)
              }
              error={isEditing ? errors[`license_${idx}_name`] : ""}
            />
            <FormField
              label={`License #${idx + 1} Number`}
              value={license.number || ""}
              readOnly={!isEditing}
              onChange={(e) =>
                handleLicenseFieldChange(idx, "number", e.target.value)
              }
              error={isEditing ? errors[`license_${idx}_number`] : ""}
            />
          </div>
        ))}

        {/* BUTTONS */}
        {isEditing && (
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="primary" onClick={handleUpdate}>
              Save
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title={
            confirmAction === "save" ? "Save Changes?" : "Discard Changes?"
          }
          message={
            confirmAction === "save"
              ? "Do you want to save your changes?"
              : "Discard all changes?"
          }
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {toast && <ToastMessage message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CounselorSideInfo;
