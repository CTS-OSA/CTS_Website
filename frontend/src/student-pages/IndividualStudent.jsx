import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Button from "../components/UIButton";
import { ReadonlyField, EditableField } from "../components/EditableField";
import FormField from "../components/FormField";
import "./css/individualStudentInfo.css";
import { useEnumChoices } from "../utils/enumChoices";
import ToastMessage from "../components/ToastMessage";
import ConfirmDialog from "../components/ConfirmDialog";
import Loader from "../components/Loader";
import { validatePhotoFile } from "../utils/photoValidation";
import { formatDate } from "../utils/helperFunctions";
import {
  validateEditableProfile,
  mergeProfileAndFormData,
} from "../utils/formValidationUtils";

const ALPHA_REGEX = /^[A-Za-z\s]*$/;
const NON_ALPHA_REGEX = /[^A-Za-z\s]/g;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 600;

const REQUIRED_FIELDS = [
  { path: ["first_name"], label: "First Name" },
  { path: ["last_name"], label: "Last Name" },
  { path: ["sex"], label: "Sex" },
  { path: ["religion"], label: "Religion" },
  { path: ["birthdate"], label: "Birthdate" },
  { path: ["birthplace"], label: "Birth Place" },
  { path: ["birth_rank"], label: "Birth Rank" },
  { path: ["contact_number"], label: "Contact Number" },
  {
    path: ["permanent_address", "address_line_1"],
    label: "Permanent Address Line 1",
  },
  { path: ["permanent_address", "barangay"], label: "Permanent Barangay" },
  {
    path: ["permanent_address", "city_municipality"],
    label: "Permanent City/Municipality",
  },
  { path: ["permanent_address", "province"], label: "Permanent Province" },
  { path: ["permanent_address", "region"], label: "Permanent Region" },
  { path: ["permanent_address", "zip_code"], label: "Permanent ZIP Code" },
  {
    path: ["address_while_in_up", "address_line_1"],
    label: "Address While in UP Line 1",
  },
  {
    path: ["address_while_in_up", "barangay"],
    label: "Address While in UP Barangay",
  },
  {
    path: ["address_while_in_up", "city_municipality"],
    label: "Address While in UP City/Municipality",
  },
  {
    path: ["address_while_in_up", "province"],
    label: "Address While in UP Province",
  },
  {
    path: ["address_while_in_up", "region"],
    label: "Address While in UP Region",
  },
  {
    path: ["address_while_in_up", "zip_code"],
    label: "Address While in UP ZIP Code",
  },
];

const FIELD_LABEL_MAP = REQUIRED_FIELDS.reduce((acc, field) => {
  acc[field.path.join(".")] = field.label;
  return acc;
}, {});

const getValueFromPath = (source, path) =>
  path.reduce((acc, key) => {
    if (acc === undefined || acc === null) {
      return undefined;
    }
    return acc[key];
  }, source);

const isBlankValue = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim() === "";
  }
  return false;
};

const StudentSideInfo = ({
  profileData,
  submittedForms = [],
  onUpdate,
  isAdmin = false
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData || {});
  const { enums, loading: enumsLoading, error: enumsError } = useEnumChoices();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const location = useLocation();

  const getFieldKey = (path) => (Array.isArray(path) ? path : [path]).join(".");

  const clearFieldError = (path) => {
    const key = getFieldKey(path);
    setValidationErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const setFieldError = (path, message) => {
    const key = getFieldKey(path);
    setValidationErrors((prev) => ({
      ...prev,
      [key]: message,
    }));
  };

  const setValueByPath = (path, value) => {
    const normalizedPath = Array.isArray(path) ? path : [path];
    setFormData((prev) => {
      const next = { ...prev };
      let cursor = next;
      for (let i = 0; i < normalizedPath.length - 1; i += 1) {
        const key = normalizedPath[i];
        const current = cursor[key];
        cursor[key] =
          current && typeof current === "object" ? { ...current } : {};
        cursor = cursor[key];
      }
      cursor[normalizedPath[normalizedPath.length - 1]] = value;
      return next;
    });
    clearFieldError(normalizedPath);
  };

  const handleTrimmedBlur = (path) => (event) => {
    const normalizedPath = Array.isArray(path) ? path : [path];
    const trimmedValue = (event.target.value || "").trim();
    setValueByPath(normalizedPath, trimmedValue);
  };

  const handleRequiredBlur = (path) => (event) => {
    const normalizedPath = Array.isArray(path) ? path : [path];
    const trimmedValue = (event.target.value || "").trim();
    setValueByPath(normalizedPath, trimmedValue);
    if (trimmedValue === "") {
      const key = normalizedPath.join(".");
      const label = FIELD_LABEL_MAP[key] || "This field";
      setFieldError(normalizedPath, `${label} is required.`);
    }
  };

  const handleAlphaInputChange = (path) => (event) => {
    const normalizedPath = Array.isArray(path) ? path : [path];
    const incomingValue = event.target.value || "";
    const sanitizedValue = ALPHA_REGEX.test(incomingValue)
      ? incomingValue
      : incomingValue.replace(NON_ALPHA_REGEX, "");
    setValueByPath(normalizedPath, sanitizedValue);
  };

  const validateRequiredFields = () => {
    const errors = {};
    REQUIRED_FIELDS.forEach(({ path: fieldPath, label }) => {
      const value = getValueFromPath(formData, fieldPath);
      if (isBlankValue(value)) {
        errors[fieldPath.join(".")] = `${label} is required.`;
      }
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setToast("Please fill out all required fields.");
      return false;
    }

    return true;
  };
  if (!profileData) {
    return <Loader />;
  }

  const {
    first_name,
    last_name,
    student_number,
    date_initial_entry,
    date_initial_entry_sem,
    email,
  } = formData;

  const [photoPreview, setPhotoPreview] = useState(null);

const handleView = (form, isAdmin = false, studentId = null) => {
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  const slug = slugify(form.form_type);

  // Forms that should use special admin routing
  const SPECIAL_ADMIN_FORMS = [
    "psychosocial-assistance-and-referral-desk",
    "counseling-referral-slip"
  ];

  // ADMIN VIEW
  if (isAdmin && studentId) {
    if (form.status === "submitted") {

      // Special forms → different route
      if (SPECIAL_ADMIN_FORMS.includes(slug)) {
        navigate(`/admin/${slug}/${form.id}`);
      } else {
        // Default admin route
        navigate(`/admin/student-forms/${studentId}/${slug}`);
      }
    }
    return;
  }

  // STUDENT VIEW
  if (form.status === "draft") {
    navigate(`/forms/${slug}`);
  } else if (form.status === "submitted") {
    navigate(`/submitted-forms/${slug}/${form.id}`);
  }
};


  const updateProfileData = (updatedFields) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedFields,
    }));
    Object.keys(updatedFields).forEach((field) => clearFieldError([field]));
  };

  const updateNestedField = (parentField, updatedFields) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] || {}),
        ...updatedFields,
      },
    }));
    Object.keys(updatedFields).forEach((field) =>
      clearFieldError([parentField, field])
    );
  };

  const handleUpdate = async () => {
    const mergedData = mergeProfileAndFormData(profileData, formData);
    if (errors.photo || !profileData.photo) {
      setToast( "Please upload a valid profile photo before saving.");
      setValidationErrors((prev) => ({
        ...prev,
        photo: errors.photo || "Please upload a valid photo.",
      }));
      return;
    }
    const editableErrors = validateEditableProfile(mergedData);

    setValidationErrors(editableErrors);
    if (Object.keys(editableErrors).length > 0) {
      setToast("Please fix the highlighted errors before saving.");
      return;
    }

    setConfirmAction("save");
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setConfirmAction("cancel");
    setShowConfirm(true);
  };

  const getChangedFields = (original, updated) => {
    const changes = {};
    
    Object.keys(updated).forEach((key) => {
      if (typeof updated[key] === 'object' && updated[key] !== null && !Array.isArray(updated[key])) {
        const nestedChanges = {};
        
        Object.keys(updated[key]).forEach((nestedKey) => {
          if (original[key]?.[nestedKey] !== updated[key][nestedKey]) {
            nestedChanges[nestedKey] = updated[key][nestedKey];
          }
        });

        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = nestedChanges;
        }

      } else if (original[key] !== updated[key]) {
        changes[key] = updated[key];
      }
    });

    return changes;
  };

  const handleConfirmDialog = async () => {
    if (confirmAction === "save") {
      const changedFields = getChangedFields(profileData, formData);
      if (photoFile) {
        changedFields.photoFile = photoFile;
      }
      await onUpdate(changedFields);
      setToast("Profile updated successfully!");
      setValidationErrors({});
    } else if (confirmAction === "cancel") {
      setFormData(profileData);
      setToast("Changes were discarded.");
      setValidationErrors({});
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
      photoUrl = `${imagePath}`;
    }
    setPhotoPreview(photoUrl);
    setValidationErrors({});
  }, [profileData]);

  useEffect(() => {
    if (location.state?.showSuccess) {
      setShowSuccessToast(true);
    }
  }, [location.state]);

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6 mb-8 border-b-gray">
        <div className="w-full lg:w-1/3 max-w-md mx-auto p-6 text-center overflow-visible">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 mx-auto flex items-center justify-center rounded-2xl overflow-hidden shadow-lg border-2 border-upmaroon group">
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
            <ReadonlyField label="Student Number" value={student_number} />
            <EditableField
              label="Status"
              type="select"
              value={formData.status || ""}
              onChange={(e) =>
                updateProfileData({ status: e.target.value })
              }
              options={enums?.student_status || []}
              readOnly={!(isEditing && isAdmin)}
              error={validationErrors["status"]}
            />
            <EditableField
              label="Current Year Level"
              type="select"
              value={formData.current_year_level || ""}
              onChange={(e) =>
                updateProfileData({ current_year_level: e.target.value })
              }
              options={enums?.year_level || []}
              readOnly={!isEditing}
              error={validationErrors["current_year_level"]}
            />
            <EditableField
              label="Degree Program"
              type="select"
              value={formData.degree_program || ""}
              onChange={(e) =>
                updateProfileData({ degree_program: e.target.value })
              }
              readOnly={!isEditing}
              options={
                enumsLoading
                  ? [{ value: "", label: "Loading degree programs..." }]
                  : enumsError
                  ? [{ value: "", label: "Error loading degree programs" }]
                  : enums?.degree_program || []
              }
              error={validationErrors["degree_program"]}
            />
            <EditableField
              label="College / Department"
              type="select"
              value={formData.college || ""}
              onChange={(e) => updateProfileData({ college: e.target.value })}
              options={enums?.college || []}
              readOnly={!isEditing}
            />
            <ReadonlyField label="UP Mail" value={email} />
            <ReadonlyField
              label="Date of Initial Entry"
              value={`${date_initial_entry_sem} - AY ${date_initial_entry}`}
            />
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-white rounded-xl p-6 sm:p-8 overflow-visible">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-[1.2rem] font-semibold mb-3 text-upmaroon lg:text-left text-center">
                PERSONAL INFORMATION
              </h2>
              <div className="grid lg:grid-cols-3 gap-4 pb-4">
                <FormField
                  label="First Name"
                  value={formData.first_name || ""}
                  onChange={handleAlphaInputChange("first_name")}
                  onBlur={handleRequiredBlur("first_name")}
                  readOnly={!isEditing}
                  required
                  pattern="^[A-Za-z ]+$"
                  title="First name should only contain letters and spaces."
                  error={validationErrors["first_name"]}
                />
                <FormField
                  label="Last Name"
                  value={formData.last_name || ""}
                  onChange={handleAlphaInputChange("last_name")}
                  onBlur={handleRequiredBlur("last_name")}
                  readOnly={!isEditing}
                  required
                  pattern="^[A-Za-z ]+$"
                  title="Last name should only contain letters and spaces."
                  error={validationErrors["last_name"]}
                />
                <FormField
                  label="Middle Name"
                  value={formData.middle_name || ""}
                  onChange={handleAlphaInputChange("middle_name")}
                  onBlur={handleTrimmedBlur("middle_name")}
                  readOnly={!isEditing}
                  pattern="^[A-Za-z ]*$"
                  title="Middle name should only contain letters and spaces."
                  error={validationErrors["middle_name"]}
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-4 pb-4">
                <FormField
                  label="Nickname"
                  value={formData.nickname || ""}
                  onChange={handleAlphaInputChange("nickname")}
                  onBlur={handleTrimmedBlur("nickname")}
                  readOnly={!isEditing}
                  pattern="^[A-Za-z ]*$"
                  title="Nickname should only contain letters and spaces."
                  error={validationErrors["nickname"]}
                />
                <FormField
                  label="Sex"
                  value={formData.sex || ""}
                  onChange={handleAlphaInputChange("sex")}
                  onBlur={handleRequiredBlur("sex")}
                  readOnly={!isEditing}
                  required
                  pattern="^[A-Za-z ]+$"
                  title="Sex should only contain letters."
                  error={validationErrors["sex"]}
                />
                <FormField
                  label="Religion"
                  value={formData.religion || ""}
                  onChange={handleAlphaInputChange("religion")}
                  onBlur={handleRequiredBlur("religion")}
                  readOnly={!isEditing}
                  required
                  pattern="^[A-Za-z ]+$"
                  title="Religion should only contain letters and spaces."
                  error={validationErrors["religion"]}
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-4 pb-4">
                <FormField
                  label="Birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) =>
                    updateProfileData({ birthdate: e.target.value })
                  }
                  readOnly={!isEditing}
                  required
                  error={validationErrors["birthdate"]}
                />
                <FormField
                  label="Birth Place"
                  value={formData.birthplace || ""}
                  onChange={handleAlphaInputChange("birthplace")}
                  onBlur={handleRequiredBlur("birthplace")}
                  readOnly={!isEditing}
                  required
                  pattern="^[A-Za-z ]+$"
                  title="Birth place should only contain letters and spaces."
                  error={validationErrors["birth_place"]}
                />
                <FormField
                  label="Birth Rank"
                  value={formData.birth_rank}
                  onChange={(e) =>
                    updateProfileData({ birth_rank: e.target.value })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["birth_rank"]}
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-4 pb-4">
                <FormField
                  label="Contact Number"
                  value={formData.contact_number}
                  onChange={(e) =>
                    updateProfileData({ contact_number: e.target.value })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["contact_number"]}
                />
                <FormField
                  label="Landline Number"
                  value={formData?.landline_number || "None"}
                  onChange={(e) =>
                    updateProfileData({ landline_number: e.target.value })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["landline_number"]}
                />
              </div>

              <h2 className="text-[1.2rem] font-semibold mb-3 text-upmaroon lg:text-left text-center">
                PERMANENT ADDRESS
              </h2>
              <div className="grid lg:grid-cols-2 gap-4 pb-4">
                <FormField
                  label="Address Line 1"
                  value={formData.permanent_address?.address_line_1 || ""}
                  onChange={(e) =>
                    updateNestedField("permanent_address", {
                      address_line_1: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["permanent_address.address_line_1"]}
                />
                <FormField
                  label="Address Line 2"
                  value={formData.permanent_address?.address_line_2 || "N/A"}
                  onChange={(e) =>
                    updateNestedField("permanent_address", {
                      address_line_2: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["permanent_address.address_line_2"]}
                />
              </div>
              <div className="grid lg:grid-cols-2 gap-4 pb-4">
                <FormField
                  label="Barangay"
                  value={formData.permanent_address?.barangay || ""}
                  onChange={(e) =>
                    updateNestedField("permanent_address", {
                      barangay: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["permanent_address.barangay"]}
                />
                <FormField
                  label="City/Municipality"
                  value={formData.permanent_address?.city_municipality || ""}
                  onChange={(e) =>
                    updateNestedField("permanent_address", {
                      city_municipality: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={
                    validationErrors["permanent_address.city_municipality"]
                  }
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-4 pb-4">
                <FormField
                  label="Province"
                  value={formData.permanent_address?.province || ""}
                  onChange={(e) =>
                    updateNestedField("permanent_address", {
                      province: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["permanent_address.province"]}
                />
                <FormField
                  label="Region"
                  type="select"
                  value={formData.permanent_address?.region || ""}
                  disabled={!isEditing}
                  onChange={(e) =>
                    updateNestedField("permanent_address", {
                      region: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  options={
                    enums?.region?.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    })) || []
                  }
                  error={validationErrors["permanent_address.region"]}
                />
                <FormField
                  label="ZIP code"
                  value={formData.permanent_address?.zip_code || ""}
                  onChange={(e) =>
                    updateNestedField("permanent_address", {
                      zip_code: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["permanent_address.zip_code"]}
                />
              </div>

              <h2 className="text-[1.2rem] font-semibold mb-3 text-upmaroon lg:text-left text-center">
                ADDRESS WHILE IN UP
              </h2>
              <div className="grid lg:grid-cols-2 gap-4 pb-4">
                <FormField
                  label="Address Line 1"
                  value={formData.address_while_in_up?.address_line_1 || ""}
                  onChange={(e) =>
                    updateNestedField("address_while_in_up", {
                      address_line_1: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["address_while_in_up.address_line_1"]}
                />
                <FormField
                  label="Address Line 2"
                  value={formData.address_while_in_up?.address_line_2 || "N/A"}
                  onChange={(e) =>
                    updateNestedField("address_while_in_up", {
                      address_line_2: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["address_while_in_up.address_line_2"]}
                />
              </div>
              <div className="grid lg:grid-cols-2 gap-4 pb-4">
                <FormField
                  label="Barangay"
                  value={formData.address_while_in_up?.barangay || ""}
                  onChange={(e) =>
                    updateNestedField("address_while_in_up", {
                      barangay: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["address_while_in_up.barangay"]}
                />
                <FormField
                  label="City/Municipality"
                  value={formData.address_while_in_up?.city_municipality || ""}
                  onChange={(e) =>
                    updateNestedField("address_while_in_up", {
                      city_municipality: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={
                    validationErrors["address_while_in_up.city_municipality"]
                  }
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-4 pb-4">
                <FormField
                  label="Province"
                  value={formData.address_while_in_up?.province || ""}
                  onChange={(e) =>
                    updateNestedField("address_while_in_up", {
                      province: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["address_while_in_up.province"]}
                />
                <FormField
                  label="Region"
                  type="select"
                  value={formData.address_while_in_up?.region || ""}
                  disabled={!isEditing}
                  onChange={(e) =>
                    updateNestedField("address_while_in_up", {
                      region: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  options={
                    enums?.region?.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    })) || []
                  }
                  error={validationErrors["address_while_in_up.region"]}
                />
                <FormField
                  label="ZIP code"
                  value={formData.address_while_in_up?.zip_code || ""}
                  onChange={(e) =>
                    updateNestedField("address_while_in_up", {
                      zip_code: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  error={validationErrors["address_while_in_up.zip_code"]}
                />
              </div>
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
                <Button
                  variant="primary"
                  onClick={() => {
                    setValidationErrors({});
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Forms Section */}
      <div className="p-2 w-full border-t-black">
        <h2 className="text-[1.2rem] font-semibold mb-3 text-upmaroon flex flex-col items-start">
          SUBMITTED FORMS
        </h2>
        {submittedForms.length === 0 ? (
          <p>No submitted forms yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="dashboard-table min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Form Type</th>
                  <th>Date Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submittedForms.map((form) => (
                  <tr key={form.id}>
                    <td>{form.form_type}</td>
                    <td className="text-center">
                      {formatDate(form.submitted_on || form.saved_on)}
                    </td>
                    <td className="text-center">
                      <button
                        className="view-button"
                        onClick={() =>
                          handleView(form, isAdmin, profileData.student_number)
                        }
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default StudentSideInfo;
