import React, { useContext, useRef, useState, useEffect } from "react";
// import "./css/pdfStyle.css";
import "./css/SCIFpdf.css";
// import "../forms/SetupProfile/css/multistep.css";
import FormHeader from "./FormHeader";
import AutoResizeTextarea from "../components/AutoResizeTextarea";
import html2pdf from "html2pdf.js";
import { calculateAge } from "../utils/helperFunctions";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import ToastMessage from "../components/ToastMessage";
import Button from "../components/UIButton";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import BackToTopButton from "../components/BackToTop";
import { useEnumChoices } from "../utils/enumChoices";

const INTEGER_ONLY_FIELDS = new Set([
  "birth_rank",
  "permanent_address_zip_code",
  "age",
  "landline_number",
  "contact_number",
  "father_contact_number",
  "mother_contact_number",
  "guardian_contact_number",
  "father_age",
  "mother_age",
]);

const DECIMAL_ALLOWED_FIELDS = new Set(["height", "weight", "senior_high_gpa"]);

const sanitizeNumericInput = (field, value) => {
  if (typeof value !== "string") return value;
  if (INTEGER_ONLY_FIELDS.has(field)) {
    return value.replace(/\D/g, "");
  }
  if (DECIMAL_ALLOWED_FIELDS.has(field)) {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 1) return cleaned;
    const [first, ...rest] = parts;
    return `${first}.${rest.join("")}`;
  }
  return value;
};

const safeTrim = (value) =>
  typeof value === "string" ? value.trim() : value ?? "";

const splitFullName = (fullName) => {
  if (typeof fullName !== "string") {
    return { first_name: "", last_name: "" };
  }
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { first_name: "", last_name: "" };
  }
  if (trimmed.includes(",")) {
    const [last, first] = trimmed.split(",");
    return {
      first_name: safeTrim(first),
      last_name: safeTrim(last),
    };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: "" };
  }
  return {
    first_name: parts.slice(0, -1).join(" "),
    last_name: parts.slice(-1)[0],
  };
};

const listFromInput = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => safeTrim(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeScholarshipEntries = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => safeTrim(entry)).filter(Boolean);
};

const getProfilePhotoUrl = (profile) =>
  profile?.photo?.image || profile?.photo?.url || "";

const getProfileInitials = (profile) => {
  if (!profile) return "ID";
  const first = profile.first_name?.charAt(0) || "";
  const last = profile.last_name?.charAt(0) || "";
  const initials = `${first}${last}`.trim();
  return initials.toUpperCase() || "ID";
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
};

const SCIFProfileView = ({ profileData, formData, isAdmin }) => {
  const pdfRef = useRef();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const { request } = useApiRequest();
  const { enums, loading: enumsLoading, error: enumsError } = useEnumChoices();
  const regionOptions = enums?.region || [];
  const shouldUseRegionDropdown =
    !enumsError && (regionOptions.length > 0 || enumsLoading);
  const seniorHighRecordRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const canEdit = role === "admin" || isAdmin;
  const errorAliasMap = {
    "father.first_name": "father_name",
    "father.last_name": "father_name",
    "mother.first_name": "mother_name",
    "mother.last_name": "mother_name",
    "guardian.first_name": "guardian_name",
    "guardian.last_name": "guardian_name",
  };
  const parentFields = [
    "age",
    "job_occupation",
    "company_agency",
    "company_address",
    "highest_educational_attainment",
    "contact_number",
  ];
  parentFields.forEach((field) => {
    errorAliasMap[`father.${field}`] = `father_${field}`;
    errorAliasMap[`mother.${field}`] = `mother_${field}`;
  });
  errorAliasMap["guardian.contact_number"] = "guardian_contact_number";
  errorAliasMap["guardian.address"] = "guardian_address";
  errorAliasMap["guardian.relationship_to_guardian"] =
    "guardian_relationship_to_guardian";
  errorAliasMap["guardian.language_dialect"] = "guardian_language_dialect";
  const [formState, setFormState] = useState({
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
        is_deceased: "",
        is_none: "",
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
        is_deceased: "",
        is_none: "",
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
  const photoUrl = getProfilePhotoUrl(profileData);
  const photoInitials = getProfileInitials(profileData);

  useEffect(() => {
    if (!formData || !profileData) return;

    const {
      family_data,
      personality_traits,
      health_data,
      previous_school_record,
      family_relationship,
      counseling_info,
      guidance_notes,
      scholarship,
    } = formData;

    const father = family_data?.father;
    const mother = family_data?.mother;
    const guardian = family_data?.guardian;
    const seniorHighRecord = Array.isArray(previous_school_record)
      ? previous_school_record.find((r) => r.education_level === "Senior High")
      : null;

    const scholarshipsArray = Array.isArray(
      scholarship?.scholarships_and_assistance
    )
      ? scholarship.scholarships_and_assistance
      : scholarship?.scholarships_and_assistance
      ? [scholarship.scholarships_and_assistance]
      : [];

    const preparedState = {
      // Personal Information
      name: `${submission.student}`,
      last_name: profileData.last_name || "",
      first_name: profileData.first_name || "",
      middle_name: profileData.middle_name || "",
      nickname: profileData.nickname || "",
      sex: profileData.sex || "",
      age: calculateAge(profileData.birthdate) || "",
      religion: profileData.religion || "",
      birth_rank: profileData.birth_rank || "",
      birthdate: profileData.birthdate || "",
      birthplace: profileData.birthplace || "",

      // Permanent Address
      permanent_address_line_1:
        profileData.permanent_address?.address_line_1 || "",
      permanent_address_line_2:
        profileData.permanent_address?.address_line_2 || "",
      permanent_address_barangay: profileData.permanent_address?.barangay || "",
      permanent_address_city:
        profileData.permanent_address?.city_municipality || "",
      permanent_address_province: profileData.permanent_address?.province || "",
      permanent_address_region: profileData.permanent_address?.region || "",
      permanent_address_zip_code: profileData.permanent_address?.zip_code || "",

      // Contact Information
      landline_number: profileData.landline_number || "",
      email: profileData.email || "",
      contact_number: profileData.contact_number || "",

      // Student Information
      student_number: profileData.student_number || "",
      degree_program: profileData.degree_program || "",
      date_initial_entry:
        `${profileData.date_initial_entry_sem} - AY ${profileData.date_initial_entry}` ||
        "",

      // Father Information
      father_name: `${family_data.father?.first_name || ""} ${
        family_data.father?.last_name || ""
      }`.trim(),
      father_age: family_data.father?.age || "",
      father_job_occupation: family_data.father?.job_occupation || "",
      father_company_agency: family_data.father?.company_agency || "",
      father_company_address: family_data.father?.company_address || "",
      father_highest_educational_attainment:
        family_data.father?.highest_educational_attainment || "",
      father_contact_number: family_data.father?.contact_number || "",
      father_is_deceased: !!family_data.father?.is_deceased,
      father_is_none: !!family_data.father?.is_none,

      // Mother Information
      mother_name: `${family_data.mother?.first_name || ""} ${
        family_data.mother?.last_name || ""
      }`.trim(),
      mother_age: family_data.mother?.age || "",
      mother_job_occupation: family_data.mother?.job_occupation || "",
      mother_company_agency: family_data.mother?.company_agency || "",
      mother_company_address: family_data.mother?.company_address || "",
      mother_highest_educational_attainment:
        family_data.mother?.highest_educational_attainment || "",
      mother_contact_number: family_data.mother?.contact_number || "",
      mother_is_deceased: !!family_data.mother?.is_deceased,
      mother_is_none: !!family_data.mother?.is_none,

      // Guardian Information
      guardian_name: `${family_data.guardian?.first_name || ""} ${
        family_data.guardian?.last_name || ""
      }`.trim(),
      guardian_contact_number: family_data.guardian?.contact_number || "",
      guardian_address: family_data.guardian?.address || "",
      guardian_relationship_to_guardian:
        family_data.guardian?.relationship_to_guardian || "",
      guardian_language_dialect: family_data.guardian?.language_dialect || [],

      // Health Information
      health_condition: health_data.health_condition || "",
      height: health_data.height || "",
      weight: health_data.weight || "",
      eyesight: health_data.eye_sight || "",
      hearing: health_data.hearing || "",
      physical_disabilities: Array.isArray(health_data.physical_disabilities)
        ? health_data.physical_disabilities.join(", ")
        : health_data.physical_disabilities || "",
      common_ailments: Array.isArray(health_data.common_ailments)
        ? health_data.common_ailments.join(", ")
        : health_data.common_ailments || "",
      last_hospitalization: health_data.last_hospitalization || "",
      reason_of_hospitalization: health_data.reason_of_hospitalization || "",

      // Academic Records
      senior_high_gpa: previous_school_record[0]?.senior_high_gpa || "",

      // Personality & Aspirations
      enrollment_reason: personality_traits.enrollment_reason || "",
      degree_program_aspiration:
        personality_traits.degree_program_aspiration ?? null,
      aspiration_explanation: personality_traits.aspiration_explanation || "",
      special_talents: personality_traits.special_talents || "",
      musical_instruments: personality_traits.musical_instruments || "",
      hobbies: personality_traits.hobbies || "",
      likes_in_people: personality_traits.likes_in_people || "",
      dislikes_in_people: personality_traits.dislikes_in_people || "",

      // Family Relationships
      closest_to: family_relationship.closest_to || "",
      specify_other: family_relationship.specify_other || "",

      // Counseling Information
      personal_characteristics: counseling_info.personal_characteristics || "",
      problem_confidant: counseling_info.problem_confidant || "",
      confidant_reason: counseling_info.confidant_reason || "",
      anticipated_problems: counseling_info.anticipated_problems || "",
      previous_counseling: !!counseling_info.previous_counseling,
      counseling_location: counseling_info.counseling_location || "",
      counseling_counselor: counseling_info.counseling_counselor || "",
      counseling_reason: counseling_info.counseling_reason || "",

      // Additional Notes
      scholarships_and_assistance:
        scholarship.scholarships_and_assistance || [],
      guidance_notes: guidance_notes?.notes || "",
    };

    setFormState(preparedState);
    seniorHighRecordRef.current = seniorHighRecord || null;
  }, [formData, profileData]);

  const handleDownloadClick = () => {
    setShowDownloadConfirm(true);
  };

  const handleConfirmDownload = () => {
    setShowDownloadConfirm(false);
    handleDownload();
    setDownloadToast("Download started!");
  };

  const handleCancelDownload = () => {
    setShowDownloadConfirm(false);
    setDownloadToast("Download cancelled.");
  };

  const handleReturn = () => {
    if (canEdit && profileData.student_number) {
      navigate(`/admin/students/${profileData.student_number}`);
    } else {
      navigate("/myprofile");
    }
  };

  const handleFieldChange = (field, value) => {
    if (!canEdit) return;
    const sanitizedValue = sanitizeNumericInput(field, value);
    setFormState((prev) => {
      const next = { ...prev, [field]: sanitizedValue };
      if (field === "previous_counseling" && !value) {
        next.counseling_location = "";
        next.counseling_counselor = "";
        next.counseling_reason = "";
      }
      if (field === "degree_program_aspiration" && value === true) {
        next.aspiration_explanation = "";
      }
      return next;
    });
  };

  const handleConditionChange = (key) => {
    if (!canEdit) return;
    setFormState((prev) => ({
      ...prev,
      health_condition: key,
    }));
  };

  const handleClosestOptionChange = (key) => {
    if (!canEdit) return;
    setFormState((prev) => ({
      ...prev,
      closest_to: key,
      specify_other: key === "Other" ? prev.specify_other : "",
    }));
  };

  const handleScholarshipChange = (idx, e) => {
    if (!canEdit) return;
    const list = Array.isArray(formState.scholarships_and_assistance)
      ? [...formState.scholarships_and_assistance]
      : [];
    const updated = [...list];
    updated[idx] = e.target.value;
    setFormState((prev) => ({
      ...prev,
      scholarships_and_assistance: updated,
    }));
  };

  const flattenErrors = (errorData) => {
    if (!errorData || typeof errorData !== "object") return {};
    const normalized = {};

    const assignMessage = (key, message) => {
      const normalizedKey = key.replace(/\./g, "_");
      normalized[key] = message;
      normalized[normalizedKey] = message;
      if (errorAliasMap[key]) {
        normalized[errorAliasMap[key]] = message;
      }
      if (key.includes("permanent_address")) {
        normalized.permanent_address = message;
      }
    };

    Object.entries(errorData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        assignMessage(key, value.join(" "));
      } else if (value && typeof value === "object") {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          const nestedMessage = Array.isArray(nestedValue)
            ? nestedValue.join(" ")
            : String(nestedValue);
          assignMessage(`${key}.${nestedKey}`, nestedMessage);
        });
      } else if (value !== null && value !== undefined) {
        assignMessage(key, String(value));
      }
    });

    return normalized;
  };

  const appendFormDataValue = (formData, key, value) => {
    if (value === undefined || value === null) return;
    if (typeof File !== "undefined" && value instanceof File) {
      formData.append(key, value);
      return;
    }
    if (typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        appendFormDataValue(formData, `${key}.${subKey}`, subValue);
      });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        appendFormDataValue(formData, `${key}.${index}`, item);
      });
      return;
    }
    formData.append(key, value);
  };

  const buildStudentProfilePayload = () => ({
    last_name: safeTrim(formState.last_name),
    first_name: safeTrim(formState.first_name),
    middle_name: safeTrim(formState.middle_name),
    nickname: safeTrim(formState.nickname),
    sex: safeTrim(formState.sex),
    religion: safeTrim(formState.religion),
    birth_rank: safeTrim(formState.birth_rank),
    birthdate: safeTrim(formState.birthdate),
    birthplace: safeTrim(formState.birthplace),
    contact_number: safeTrim(formState.contact_number),
    landline_number: safeTrim(formState.landline_number),
    degree_program: safeTrim(formState.degree_program),
    email: safeTrim(formState.email),
    permanent_address: {
      address_line_1: safeTrim(formState.permanent_address_line_1),
      address_line_2: safeTrim(formState.permanent_address_line_2),
      barangay: safeTrim(formState.permanent_address_barangay),
      city_municipality: safeTrim(formState.permanent_address_city),
      province: safeTrim(formState.permanent_address_province),
      region: safeTrim(formState.permanent_address_region),
      zip_code: safeTrim(formState.permanent_address_zip_code),
    },
  });

  const buildScifPayload = () => {
    const father = splitFullName(formState.father_name);
    const mother = splitFullName(formState.mother_name);
    const guardian = splitFullName(formState.guardian_name);
    const guardianLanguages = Array.isArray(formState.guardian_language_dialect)
      ? formState.guardian_language_dialect
      : listFromInput(formState.guardian_language_dialect);

    const payload = {
      family_data: {
        student_number: profileData.student_number,
        father: {
          first_name: father.first_name,
          last_name: father.last_name,
          age: safeTrim(formState.father_age),
          job_occupation: safeTrim(formState.father_job_occupation),
          company_agency: safeTrim(formState.father_company_agency),
          company_address: safeTrim(formState.father_company_address),
          highest_educational_attainment: safeTrim(
            formState.father_highest_educational_attainment
          ),
          contact_number: safeTrim(formState.father_contact_number),
          is_deceased: Boolean(formState.father_is_deceased),
          is_none: Boolean(formState.father_is_none),
        },
        mother: {
          first_name: mother.first_name,
          last_name: mother.last_name,
          age: safeTrim(formState.mother_age),
          job_occupation: safeTrim(formState.mother_job_occupation),
          company_agency: safeTrim(formState.mother_company_agency),
          company_address: safeTrim(formState.mother_company_address),
          highest_educational_attainment: safeTrim(
            formState.mother_highest_educational_attainment
          ),
          contact_number: safeTrim(formState.mother_contact_number),
          is_deceased: Boolean(formState.mother_is_deceased),
          is_none: Boolean(formState.mother_is_none),
        },
        guardian: {
          first_name: guardian.first_name,
          last_name: guardian.last_name,
          contact_number: safeTrim(formState.guardian_contact_number),
          address: safeTrim(formState.guardian_address),
          relationship_to_guardian: safeTrim(
            formState.guardian_relationship_to_guardian
          ),
          language_dialect: guardianLanguages,
        },
      },
      health_data: {
        student_number: profileData.student_number,
        health_condition: safeTrim(formState.health_condition),
        height: safeTrim(formState.height),
        weight: safeTrim(formState.weight),
        eye_sight: safeTrim(formState.eyesight),
        hearing: safeTrim(formState.hearing),
        physical_disabilities: listFromInput(formState.physical_disabilities),
        common_ailments: listFromInput(formState.common_ailments),
        last_hospitalization: safeTrim(formState.last_hospitalization),
        reason_of_hospitalization: safeTrim(
          formState.reason_of_hospitalization
        ),
      },
      scholarship: {
        student_number: profileData.student_number,
        scholarships_and_assistance: normalizeScholarshipEntries(
          formState.scholarships_and_assistance
        ),
      },
      personality_traits: {
        student_number: profileData.student_number,
        enrollment_reason: safeTrim(formState.enrollment_reason),
        degree_program_aspiration:
          formState.degree_program_aspiration === null
            ? null
            : Boolean(formState.degree_program_aspiration),
        aspiration_explanation: safeTrim(formState.aspiration_explanation),
        special_talents: safeTrim(formState.special_talents),
        musical_instruments: safeTrim(formState.musical_instruments),
        hobbies: safeTrim(formState.hobbies),
        likes_in_people: safeTrim(formState.likes_in_people),
        dislikes_in_people: safeTrim(formState.dislikes_in_people),
      },
      family_relationship: {
        student_number: profileData.student_number,
        closest_to: safeTrim(formState.closest_to),
        specify_other: safeTrim(formState.specify_other),
      },
      counseling_info: {
        student_number: profileData.student_number,
        personal_characteristics: safeTrim(formState.personal_characteristics),
        problem_confidant: safeTrim(formState.problem_confidant),
        confidant_reason: safeTrim(formState.confidant_reason),
        anticipated_problems: safeTrim(formState.anticipated_problems),
        previous_counseling: toBoolean(formState.previous_counseling),
        counseling_location: safeTrim(formState.counseling_location),
        counseling_counselor: safeTrim(formState.counseling_counselor),
        counseling_reason: safeTrim(formState.counseling_reason),
      },
      guidance_notes: safeTrim(formState.guidance_notes),
    };

    if (seniorHighRecordRef.current) {
      const record = seniorHighRecordRef.current;
      const schoolAddress = record.school?.school_address
        ? {
            ...record.school.school_address,
          }
        : {
            address_line_1: "",
            barangay: "",
            city_municipality: "",
            province: "",
            region: "",
            zip_code: "",
          };
      const school = record.school
        ? {
            ...record.school,
            school_address: schoolAddress,
          }
        : {
            name: "",
            school_address: schoolAddress,
          };
      payload.previous_school_record = [
        {
          id: record.id,
          student_number: profileData.student_number,
          education_level: record.education_level || "Senior High",
          start_year: record.start_year || "",
          end_year: record.end_year || "",
          honors_received: record.honors_received || "",
          senior_high_gpa: safeTrim(formState.senior_high_gpa),
          school,
        },
      ];
    }
    console.log("Payload:", payload);

    return payload;
  };

  const submissionId = formData?.submission?.id;
  console.log("Submission ID:", submissionId);

  const updateStudentProfile = async (payload, submissionId) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      appendFormDataValue(formData, key, value);
    });

    console.log("IDDD:", submissionId);
    return request(
      `http://localhost:8000/api/forms/admin-edit/${submissionId}/`,
      {
        method: "PATCH",
        body: formData,
        headers: {},
      }
    );
  };

  const handleSubmit = async () => {
    if (!canEdit) return;
    const newErrors = {};

    if (
      !formState.first_name?.trim() ||
      !formState.last_name?.trim() ||
      !formState.middle_name?.trim()
    ) {
      newErrors.first_name = "Name cannot be empty.";
    }

    if (!formState.sex?.trim()) {
      newErrors.sex = "Sex cannot be empty.";
    }

    if (!formState.religion?.trim()) {
      newErrors.religion = "Religion cannot be empty.";
    }

    if (!formState.health_condition?.trim()) {
      newErrors.health_condition = "Health condition must be selected.";
    }

    if (!formState.permanent_address_line_1?.trim()) {
      newErrors["permanent_address.address_line_1"] =
        "Street/House number is required.";
    }
    if (!formState.permanent_address_barangay?.trim()) {
      newErrors["permanent_address.barangay"] = "Barangay is required.";
    }
    if (!formState.permanent_address_city?.trim()) {
      newErrors["permanent_address.city_municipality"] =
        "City/Municipality is required.";
    }
    if (!formState.permanent_address_province?.trim()) {
      newErrors["permanent_address.province"] = "Province is required.";
    }
    if (!formState.permanent_address_region?.trim()) {
      newErrors["permanent_address.region"] = "Region is required.";
    }
    if (!formState.permanent_address_zip_code?.trim()) {
      newErrors["permanent_address.zip_code"] = "ZIP code is required.";
    }

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    console.log("Form state:", formState);
    if (Object.keys(newErrors).length > 0) {
      setDownloadToast("Please fix the highlighted fields.");
      return;
    }

    const profilePayload = buildStudentProfilePayload();
    const scifPayload = buildScifPayload();

    // const submissionId = formData?.submission?.id;
    // console.log("Submission ID:", submissionId);

    if (!submissionId) {
      setDownloadToast(
        "Submission data is not available. Please reload the page."
      );
      return;
    }

    try {
      setIsSaving(true);
      const profileResponse = await updateStudentProfile(
        profilePayload,
        submissionId
      );

      if (!profileResponse || !profileResponse.ok) {
        const profileData = await profileResponse?.json().catch(() => ({}));
        setDownloadToast(
          profileData?.message ||
            profileData?.error ||
            "Failed to update personal information."
        );

        return;
      }

      const response = await request(`/api/forms/admin-edit/${submissionId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scifPayload),
      });

      if (!response) {
        setDownloadToast("Unable to reach the server. Please try again.");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiErrors = flattenErrors(data);
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        }
        setDownloadToast(
          data?.message ||
            data?.error ||
            "Failed to update form. Please review the fields."
        );
        return;
      }

      setErrors({});
      setDownloadToast(data?.message || "Changes saved successfully.");
    } catch (error) {
      console.error("Error updating form:", error);
      console.log("Id:", submissionId);
      setDownloadToast("Failed to update form.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    const element = pdfRef.current;
    if (!element) {
      setDownloadToast("Unable to prepare the file. Please reload the page.");
      return false;
    }

    const clone = element.cloneNode(true);
    const normalizeColor = (() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      return (value) => {
        if (!ctx || !value) return value;
        try {
          ctx.fillStyle = value;
          return ctx.fillStyle;
        } catch {
          return value;
        }
      };
    })();

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.zIndex = "-1";
    container.appendChild(clone);
    document.body.appendChild(container);

    const sourceNodes = [element, ...element.querySelectorAll("*")];
    const targetNodes = [clone, ...clone.querySelectorAll("*")];

    sourceNodes.forEach((sourceEl, idx) => {
      const targetEl = targetNodes[idx];
      if (!targetEl) return;
      const computed = window.getComputedStyle(sourceEl);
      targetEl.style.color = normalizeColor(computed.color);
      targetEl.style.backgroundColor = normalizeColor(
        computed.backgroundColor
      );
      targetEl.style.borderColor = normalizeColor(computed.borderColor);
    });

    const opt = {
      margin: 0.5,
      filename: "SCIF_file.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(clone).save();
      return true;
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setDownloadToast("Unable to generate the PDF. Please try again.");
      return false;
    } finally {
      document.body.removeChild(container);
    }
  };

  if (!profileData || !formData) return <div>Loading...</div>;

  const {
    family_data,
    personality_traits,
    health_data,
    previous_school_record,
    scholarship,
    siblings,
    family_relationship,
    counseling_info,
    submission,
    privacy_consent,
    organizations,
    awards,
  } = formData;

  const ConditionOptions = [
    { key: "Excellent", label: "Excellent" },
    { key: "Very Good", label: "Very Good" },
    { key: "Good", label: "Good" },
    { key: "Poor", label: "Poor" },
  ];

  const closestOptions = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Brother", label: "Brother(s)" },
    { value: "Sister", label: "Sister(s)" },
    { value: "Other", label: "Others (specify)" },
  ];

  const HealthConditionRadio = ({ selectedValue, onChange }) => {
    return (
      <div className="flex items-center gap-2 mb-0">
        <label className="whitespace-nowrap">Health Condition:</label>

        {ConditionOptions.map((option) => (
          <label key={option.key} className="flex items-center gap-1">
            <input
              type="radio"
              name="health_condition"
              value={option.key}
              checked={selectedValue === option.key}
              onChange={() => onChange(option.key)}
              disabled={!canEdit}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  };

  const PreviousSchoolRecordsTable = ({ records }) => {
    if (!Array.isArray(records) || records.length === 0) {
      return <p>No school records available.</p>;
    }

    return (
      <table className="w-full border-collapse mt-4 text-xs">
        <thead>
          <tr>
            <th className="border border-gray-400 px-2.5 py-2 text-left bg-gray-100">
              Level
            </th>
            <th className="border border-gray-400 px-2.5 py-2 text-left bg-gray-100">
              Name of School
            </th>
            <th className="border border-gray-400 px-2.5 py-2 text-left bg-gray-100">
              Address
            </th>
            <th className="border border-gray-400 px-2.5 py-2 text-left bg-gray-100">
              Inclusive Years
            </th>
            <th className="border border-gray-400 px-2.5 py-2 text-left bg-gray-100">
              Honor/s
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => {
            const address = [
              record.school.school_address.address_line_1,
              record.school.school_address.barangay,
              record.school.school_address.city_municipality,
              record.school.school_address.province,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <tr key={record.id || idx}>
                <td className="border border-gray-400 px-2.5 py-2">
                  {record.education_level}
                </td>
                <td className="border border-gray-400 px-2.5 py-2">
                  {record.school.name}
                </td>
                <td className="border border-gray-400 px-2.5 py-2">
                  {address}
                </td>
                <td className="border border-gray-400 px-2.5 py-2">{`${record.start_year} - ${record.end_year}`}</td>
                <td className="border border-gray-400 px-2.5 py-2">
                  {record.honors_received}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const SiblingsTable = ({ siblings }) => {
    if (!Array.isArray(siblings) || siblings.length === 0) {
      return <p>No sibling data available.</p>;
    }

    return (
      <table className="w-full border-collapse mt-12 text-xs">
        <thead>
          <tr>
            <th className="border border-black px-4 py-3 text-left bg-gray-100 font-bold">
              Brothers/Sisters
            </th>
            <th className="border border-black px-4 py-3 text-left bg-gray-100 font-bold">
              Sex
            </th>
            <th className="border border-black px-4 py-3 text-left bg-gray-100 font-bold">
              Age
            </th>
            <th className="border border-black px-4 py-3 text-left bg-gray-100 font-bold">
              Job/Occupation
            </th>
            <th className="border border-black px-4 py-3 text-left bg-gray-100 font-bold">
              Company/School
            </th>
            <th className="border border-black px-4 py-3 text-left bg-gray-100 font-bold">
              Educational Attainment
            </th>
          </tr>
        </thead>
        <tbody>
          {siblings.map((sibling, index) => (
            <tr key={sibling.id || index}>
              <td className="border border-black px-4 py-3">
                {sibling.first_name} {sibling.last_name}
              </td>
              <td className="border border-black px-4 py-3">{sibling.sex}</td>
              <td className="border border-black px-4 py-3">{sibling.age}</td>
              <td className="border border-black px-4 py-3">
                {sibling.job_occupation}
              </td>
              <td className="border border-black px-4 py-3">
                {sibling.company_school}
              </td>
              <td className="border border-black px-4 py-3">
                {sibling.educational_attainment}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const seniorHighRecord = Array.isArray(previous_school_record)
    ? previous_school_record.find((r) => r.education_level === "Senior High")
    : null;

  const ClosestToRadio = ({
    selectedValue,
    specifyOther,
    errorClosest,
    errorSpecify,
  }) => {
    return (
      <div className="">
        <div className="flex">
          <div className="flex items-center gap-2 mb-0">
            <label className="whitespace-nowrap">Closest to:</label>

            {closestOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="closest_to"
                  value={option.value}
                  checked={selectedValue === option.value}
                  onChange={() => handleClosestOptionChange(option.value)}
                  disabled={!canEdit}
                />
                {option.label}
              </label>
            ))}
          </div>
          {selectedValue === "Other" && (
            <div className="-mt-2">
              <input
                type="text"
                value={specifyOther || ""}
                readOnly={!canEdit}
                placeholder="Specify other"
                onChange={(e) =>
                  handleClosestOptionChange("specify_other", e.target.value)
                }
                className="ml-4"
              />
            </div>
          )}
          {errorClosest && (
            <div className="error-state-message">{errorClosest}</div>
          )}
          {selectedValue === "Other" && errorSpecify && (
            <div className="error-state-message">{errorSpecify}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="pdf-buttons">
        <Button
          variant="secondary"
          onClick={handleReturn}
          style={{ marginLeft: "10px" }}
          className="pdf-button"
        >
          Return to Profile
        </Button>
        {canEdit && (
          <Button
            variant="secondary"
            onClick={handleSubmit}
            className="pdf-button"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleDownloadClick}
          className="pdf-button"
        >
          Download as PDF
        </Button>
      </div>

      <div className="pdf" ref={pdfRef}>
        <FormHeader />
        <div className="sub-info">
          <div className="right">
            <p>
              <strong>OSA-CTS Form 01</strong>
            </p>
            <p>
              <strong>Revised 2022</strong>
            </p>
          </div>
          <div className="left">
            <p>
              <strong>CONFIDENTIAL FILE</strong>
            </p>
          </div>
        </div>
        <h3>STUDENT CUMULATIVE INFORMATION FILE (SCIF)</h3>
        <div className="SCIF-section-1 SCIF-section">
          <div className="SCIF-left">
            <div className="section-title">PERSONAL DATA:</div>
            <div className="SCIF-Name">
              <div className="SCIF-name-value">
                <input
                  type="text"
                  value={formState.last_name}
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                  readOnly={!canEdit}
                />
                <input
                  type="text"
                  value={formState.first_name}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                  readOnly={!canEdit}
                />
                <input
                  type="text"
                  value={formState.middle_name}
                  onChange={(e) =>
                    handleFieldChange("middle_name", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </div>
              <div className="flex gap-10 ml-15">
                <label>FAMILY NAME</label>
                <label>FIRST NAME</label>
                <label>MIDDLE NAME</label>
              </div>
              {errors.first_name && (
                <div className="error-state-message flex justify-center">
                  {errors.first_name}
                </div>
              )}
            </div>
            <div className="SCIF-inline flex-row">
              <div className="">
                <label>
                  NICKNAME:
                  <input
                    type="text"
                    value={formState.nickname}
                    onChange={(e) =>
                      handleFieldChange("nickname", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                  <div className="error-state-message text-center">
                    {errors.nickname}
                  </div>
                </label>
              </div>
              <div className="">
                <label className="field-sm">
                  SEX:
                  <select
                    value={formState.sex}
                    onChange={(e) => handleFieldChange("sex", e.target.value)}
                    disabled={!canEdit}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </label>
                {errors.sex && (
                  <div className="error-state-message">{errors.sex}</div>
                )}
              </div>
              <div className="">
                <label className="field-sm">
                  AGE:{" "}
                  <input
                    type="text"
                    value={
                      isNaN(calculateAge(formState.birthdate))
                        ? ""
                        : calculateAge(formState.birthdate).toString()
                    }
                    onChange={(e) => handleFieldChange("age", e.target.value)}
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
            <div className="SCIF-inline flex-row">
              <div className="-mt-2">
                <label className="field-lg">
                  RELIGION:{" "}
                  <input
                    type="text"
                    value={formState.religion}
                    onChange={(e) =>
                      handleFieldChange("religion", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
                {errors.religion && (
                  <div className="error-state-message">{errors.religion}</div>
                )}
              </div>
              <div className="-mt-2">
                <label className="field-sm">
                  BIRTH RANK:
                  <input
                    type="text"
                    value={formState.birth_rank}
                    onChange={(e) =>
                      handleFieldChange("birth_rank", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
            <div className="SCIF-inline flex-row">
              <div className="-mt-2">
                <label>
                  BIRTH DATE
                  <input
                    type="text"
                    value={formState.birthdate}
                    onChange={(e) =>
                      handleFieldChange("birthdate", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="-mt-2">
                <label className="field-lg">
                  BIRTH PLACE
                  <input
                    type="text"
                    value={formState.birthplace}
                    onChange={(e) =>
                      handleFieldChange("birthplace", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
            <div className="">
              <div className="-mt-8">
                <label>
                  Address Line 1:
                  <input
                    type="text"
                    value={formState.permanent_address_line_1}
                    onChange={(e) =>
                      handleFieldChange(
                        "permanent_address_line_1",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
                {errors["permanent_address.address_line_1"] && (
                  <div className="error-state-message text-center">
                    {errors["permanent_address.address_line_1"]}
                  </div>
                )}
              </div>
            </div>
            <div className="SCIF-inline">
              <div className="">
                <label className="field-lg">
                  Address Line 2:
                  <input
                    type="text"
                    value={formState.permanent_address_line_2}
                    onChange={(e) =>
                      handleFieldChange(
                        "permanent_address_line_2",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="">
                <label>
                  Barangay:
                  <input
                    type="text"
                    value={formState.permanent_address_barangay}
                    onChange={(e) =>
                      handleFieldChange(
                        "permanent_address_barangay",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
            <div className="SCIF-inline flex-row">
              <div className="-mt-2">
                <label>
                  City/Municipality:
                  <input
                    type="text"
                    value={formState.permanent_address_city}
                    onChange={(e) =>
                      handleFieldChange(
                        "permanent_address_city",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="-mt-2">
                <label className="field-lg">
                  Province:
                  <input
                    type="text"
                    value={formState.permanent_address_province}
                    onChange={(e) =>
                      handleFieldChange(
                        "permanent_address_province",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
            <div className="SCIF-inline flex-row">
              <div className="-mt-2">
                <label className="field-xl">
                  Region:
                  {shouldUseRegionDropdown ? (
                    <select
                      value={formState.permanent_address_region}
                      onChange={(e) =>
                        handleFieldChange(
                          "permanent_address_region",
                          e.target.value
                        )
                      }
                      disabled={!canEdit || enumsLoading}
                    >
                      <option value="">
                        {enumsLoading
                          ? "Loading regions..."
                          : "Select a region"}
                      </option>
                      {regionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formState.permanent_address_region}
                      onChange={(e) =>
                        handleFieldChange(
                          "permanent_address_region",
                          e.target.value
                        )
                      }
                      readOnly={!canEdit}
                    />
                  )}
                </label>
                {errors["permanent_address.region"] && (
                  <div className="error-state-message text-center">
                    {errors["permanent_address.region"]}
                  </div>
                )}
                {enumsError && (
                  <div className="error-state-message text-center">
                    Unable to load region options. Please enter the region
                    manually.
                  </div>
                )}
              </div>
              <div className="-mt-2">
                <label className="field-xs">
                  ZIP Code:
                  <input
                    type="text"
                    value={formState.permanent_address_zip_code}
                    onChange={(e) =>
                      handleFieldChange(
                        "permanent_address_zip_code",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
            <div className="-mt-10">
              <label>
                LANDLINE/CONTACT NO.:{" "}
                <input
                  type="text"
                  value={formState.landline_number || ""}
                  onChange={(e) =>
                    handleFieldChange("landline_number", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
            <div className="-mt-6">
              <label>
                EMAIL:
                <input
                  type="text"
                  value={formState.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  readOnly={!canEdit}
                />
              </label>
            </div>
            <div className="-mt-6">
              <label>
                CELLPHONE/MOBILE NO.:{" "}
                <input
                  type="text"
                  value={formState.contact_number}
                  onChange={(e) =>
                    handleFieldChange("contact_number", e.target.value)
                  }
                  readOnly={!canEdit}
                />
                <div className="error-state-message text-center">
                  {errors.contact_number}
                </div>
              </label>
            </div>
            <div className="">
              <div className="mb-5 font-bold">FAMILY DATA:</div>
              <div className="SCIF-inline flex-row">
                <label className="field-lg">
                  Father’s Name:{" "}
                  <input
                    type="text"
                    value={formState.father_name}
                    readOnly={!canEdit}
                    onChange={(e) =>
                      handleFieldChange("father_name", e.target.value)
                    }
                  />
                </label>
                <div className="error-state-message text-center">
                  {errors.father_name}
                </div>
                <label>
                  Age:
                  <input
                    type="text"
                    value={formState.father_age}
                    onChange={(e) =>
                      handleFieldChange("father_age", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
                <div className="error-state-message text-center">
                  {errors.father_age}
                </div>
              </div>
              <div className="-mt-8">
                <label className="">
                  Occupation:{" "}
                  <input
                    type="text"
                    value={formState.father_job_occupation}
                    onChange={(e) =>
                      handleFieldChange("father_job_occupation", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
                <div className="error-state-message text-center">
                  {errors.father_job_occupation}
                </div>
              </div>
              <div className="-mt-6">
                <label>
                  Company:{" "}
                  <input
                    type="text"
                    value={formState.father_company_agency}
                    onChange={(e) =>
                      handleFieldChange("father_company_agency", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="-mt-6">
                <label>
                  <span className="label" style={{ width: "30%" }}>
                    Company Address:{" "}
                  </span>
                  <input
                    type="text"
                    value={formState.father_company_address}
                    onChange={(e) =>
                      handleFieldChange(
                        "father_company_address",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="SCIF-inline flex-row">
                <label className="field-xm">
                  <span>Highest Educ'l Attainment:</span>
                  <input
                    type="text"
                    value={formState.father_highest_educational_attainment}
                    onChange={(e) =>
                      handleFieldChange(
                        "father_highest_educational_attainment",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
                <label className="field-sm">
                  <span>Contact No.: </span>
                  <input
                    type="text"
                    value={formState.father_contact_number}
                    onChange={(e) =>
                      handleFieldChange("father_contact_number", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="SCIF-inline flex-row">
                <div className="-mt-2">
                  <label className="field-xl">
                    Mother’s Name:{" "}
                    <input
                      type="text"
                      value={formState.mother_name}
                      readOnly={!canEdit}
                      onChange={(e) =>
                        handleFieldChange("mother_name", e.target.value)
                      }
                    />
                  </label>
                  <div className="error-state-message text-center">
                    {errors.mother_name}
                  </div>
                </div>
                <div className="-mt-2">
                  <label>
                    Age:
                    <input
                      type="text"
                      value={formState.mother_age}
                      onChange={(e) =>
                        handleFieldChange("mother_age", e.target.value)
                      }
                      readOnly={!canEdit}
                    />
                  </label>
                  <div className="error-state-message text-center">
                    {errors.mother_age}
                  </div>
                </div>
              </div>
              <div className="-mt-8">
                <label className="">
                  Occupation:{" "}
                  <input
                    type="text"
                    value={formState.mother_job_occupation}
                    onChange={(e) =>
                      handleFieldChange("mother_job_occupation", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
                <div className="error-state-message text-center">
                  {errors.mother_job_occupation}
                </div>
              </div>
              <div className="-mt-6">
                <label>
                  Company:{" "}
                  <input
                    type="text"
                    value={formState.mother_company_agency}
                    onChange={(e) =>
                      handleFieldChange("mother_company_agency", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="-mt-6">
                <label>
                  <span className="label" style={{ width: "30%" }}>
                    Company Address:{" "}
                  </span>
                  <input
                    type="text"
                    value={formState.mother_company_address}
                    onChange={(e) =>
                      handleFieldChange(
                        "mother_company_address",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="SCIF-inline flex-row">
                <label className="field-xm">
                  <span>Highest Educ'l Attainment:</span>
                  <input
                    type="text"
                    value={formState.mother_highest_educational_attainment}
                    onChange={(e) =>
                      handleFieldChange(
                        "mother_highest_educational_attainment",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
                <label className="field-sm">
                  <span>Contact No.: </span>
                  <input
                    type="text"
                    value={formState.mother_contact_number}
                    onChange={(e) =>
                      handleFieldChange("mother_contact_number", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="SCIF-right">
            <div
              className="bigger_avatar"
              style={{ borderRadius: "0", width: "200px", height: "200px" }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${profileData?.first_name || ""} ${
                    profileData?.last_name || ""
                  } ID`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                `${photoInitials}`
              )}
            </div>

            <input
              type="text"
              value={formState.student_number}
              onChange={(e) =>
                handleFieldChange("student_number", e.target.value)
              }
              readOnly={!canEdit}
            />
            <div className="error-state-message text-center">
              {errors.student_number}
            </div>
            <label>STUDENT NUMBER</label>
            <input
              type="text"
              value={formState.degree_program}
              onChange={(e) =>
                handleFieldChange("degree_program", e.target.value)
              }
              readOnly={!canEdit}
            />
            <div className="error-state-message text-center">
              {errors.degree_program}
            </div>
            <label>DEGREE PROGRAM</label>

            <input
              type="text"
              readOnly={!canEdit}
              value={formState.date_initial_entry}
              onChange={(e) =>
                handleFieldChange("date_initial_entry", e.target.value)
              }
            />
            <div className="error-state-message text-center">
              {errors.date_initial_entry}
            </div>
            <label>DATE OF INITIAL ENTRY</label>

            <div className="graduation">
              <label
                style={{ textAlign: "center", textDecoration: "underline" }}
              >
                Do not fill-out this portion
              </label>
              <input type="text" readOnly value=" Sem. AY 20    -20     " />
              <input type="text" readOnly value=""></input>
              <label>DATE OF GRADUATION</label>
              <input type="text" readOnly value=""></input>
              <label>DEGREE PROGRAM</label>
              <input type="text" readOnly value=""></input>
              <label>HONORS RECEIVED</label>
            </div>
          </div>
        </div>
        <div className="SCIF-section">
          <div className="-mt-10">
            <SiblingsTable siblings={siblings} />
          </div>
        </div>
        <div className="SCIF-section">
          <div className="-mt-8">
            <div className="SCIF-inline flex-row">
              <label className="field-xl">
                Guardian while in UP:
                <input
                  type="text"
                  value={formState.guardian_name || "N/A"}
                  onChange={(e) =>
                    handleFieldChange("guardian_name", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
              <label>
                Contact No.:{" "}
                <input
                  type="text"
                  value={formState.guardian_contact_number || "N/A"}
                  onChange={(e) =>
                    handleFieldChange("guardian_contact_number", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
            <div className="-mt-10">
              <label>
                Address:{" "}
                <input
                  type="text"
                  value={formState.guardian_address || "N/A"}
                  onChange={(e) =>
                    handleFieldChange("guardian_address", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <div className="">
                <label className="field-xm">
                  Relationship: to guardian{" "}
                  <input
                    type="text"
                    value={formState.guardian_relationship_to_guardian || "N/A"}
                    onChange={(e) =>
                      handleFieldChange(
                        "guardian_relationship_to_guardian",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="-mt-2">
                <label className="field-lg">
                  Languages/Dialects Spoken at Home:{" "}
                  <input
                    type="text"
                    value={
                      formState.guardian_language_dialect ||
                      (!canEdit ? "N/A" : "")
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "guardian_language_dialect",
                        e.target.value
                      )
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="SCIF-section">
          <div className="mb-5 font-bold">HEALTH DATA:</div>
          <div className="-mt-5">
            <HealthConditionRadio
              selectedValue={formState.health_condition}
              onChange={handleConditionChange}
            />
          </div>
          <div className="SCIF-inline flex-row">
            <div className="flex justify-between gap-4 mt-4">
              <label className="">
                Height (m):
                <input
                  type="text"
                  value={formState.height}
                  onChange={(e) => handleFieldChange("height", e.target.value)}
                  readOnly={!canEdit}
                />
              </label>
              <label className="">
                Weight (kg):
                <input
                  type="text"
                  value={formState.weight}
                  onChange={(e) => handleFieldChange("weight", e.target.value)}
                  readOnly={!canEdit}
                />
              </label>
              <label className="field-md">
                Eyesight [Good, Medium, Poor]:{" "}
                <input
                  type="text"
                  value={formState.eyesight}
                  readOnly={!canEdit}
                  onChange={(e) =>
                    handleFieldChange("eyesight", e.target.value)
                  }
                />
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-4 -mt-8">
            <label>
              Hearing [Good, Medium, Poor]:{" "}
              <input
                type="text"
                value={formState.hearing}
                onChange={(e) => handleFieldChange("hearing", e.target.value)}
                readOnly={!canEdit}
              />
            </label>
            <label>
              Any Physical Disabilities:{" "}
              <input
                type="text"
                value={
                  Array.isArray(formState.physical_disabilities)
                    ? formState.physical_disabilities.join(", ")
                    : formState.physical_disabilities || "None"
                }
                onChange={(e) =>
                  handleFieldChange("physical_disabilities", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>

          <div className="flex justify-between -mt-6 gap-4">
            <label>
              Frequent Ailments:{" "}
              <input
                type="text"
                value={formState.common_ailments || "None"}
                onChange={(e) =>
                  handleFieldChange("common_ailments", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
            <label>
              Last Hospitalization:{" "}
              <input
                type="text"
                value={formState.last_hospitalization || "Not Applicable"}
                onChange={(e) =>
                  handleFieldChange("last_hospitalization", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>

          <div className="-mt-6">
            <label>
              Reason:{" "}
              <textarea
                value={formState.reason_of_hospitalization || "Not Applicable"}
                onChange={(e) =>
                  handleFieldChange("reason_of_hospitalization", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>
        </div>
        <div className="SCIF-section school">
          <div className="mb-5 font-bold">PREVIOUS SCHOOL RECORD</div>
          <PreviousSchoolRecordsTable records={previous_school_record} />
          <div className="-mt-4 flex justify-end gap-4">
            <div className="flex">
              <label className="field-xs">
                SR. HIGH GEN. AVE:
                <input
                  type="text"
                  value={formState.senior_high_gpa}
                  onChange={(e) =>
                    handleFieldChange("senior_high_gpa", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="-mt-2">
          <div className="mb-5 font-bold">
            LIST OF SCHOLARSHIPS & FINANCIAL ASSISTANCE WHILE IN COLLEGE :
          </div>
          {Array.isArray(formState.scholarships_and_assistance) &&
          formState.scholarships_and_assistance.length > 0 ? (
            formState.scholarships_and_assistance.map((item, idx) => (
              <div key={idx} className="SCIF-inline">
                <input
                  type="text"
                  value={formState.scholarships_and_assistance[idx]}
                  onChange={(e) => handleScholarshipChange(idx, e)}
                  style={{ width: "90%" }}
                  readOnly={!canEdit}
                />
              </div>
            ))
          ) : (
            <label>No scholarships listed.</label>
          )}
        </div>
        <div className="SCIF-section">
          <div className="mb-5 font-bold">
            MEMBERSHIP TO ORGANIZATION IN COLLEGE (Do not fill out this yet)
          </div>

          {organizations && organizations.length > 0 ? (
            <table className="scif-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Name of Organization</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, idx) => (
                  <tr key={idx}>
                    <td>{org.year}</td>
                    <td>{org.name}</td>
                    <td>{org.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <label>No organization data available.</label>
          )}
        </div>
        <div className="SCIF-section">
          <div className="mb-5 font-bold">
            AWARDS RECEIVED WHILE IN COLLEGE (leave this portion blank)
          </div>

          {awards && awards.length > 0 ? (
            <table className="scif-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Award</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {awards.map((award, idx) => (
                  <tr key={idx}>
                    <td>{award.year}</td>
                    <td>{award.name}</td>
                    <td>{award.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <label>No awards data available.</label>
          )}
        </div>
        <div className="SCIF-section">
          <div className="mb-5 font-bold">OTHER PERSONAL INFORMATION</div>
          <div className="-mt-6">
            <label>
              <span className="label">Why did you enroll in UP Mindanao? </span>
              <textarea
                value={formState.enrollment_reason || ""}
                onChange={(e) =>
                  handleFieldChange("enrollment_reason", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>
          <div className="SCIF-inline flex-row">
            <div className="flex justify-between gap-4 mt-6">
              <label>
                <span className="label">
                  Does your program match your goal?
                </span>
              </label>
              <div className="flex gap-10">
                <label className="">
                  <input
                    type="radio"
                    name="degree_program_aspiration"
                    checked={formState.degree_program_aspiration === true}
                    onChange={() =>
                      handleFieldChange("degree_program_aspiration", true)
                    }
                    disabled={!canEdit}
                  />
                  Yes
                </label>
                <label className="">
                  <input
                    type="radio"
                    name="degree_program_aspiration"
                    checked={formState.degree_program_aspiration === false}
                    onChange={() =>
                      handleFieldChange("degree_program_aspiration", false)
                    }
                    disabled={!canEdit}
                  />
                  No
                </label>
              </div>
              <label className="field-xl">
                If not, why?
                <input
                  type="text"
                  value={formState.aspiration_explanation || ""}
                  onChange={(e) =>
                    handleFieldChange("aspiration_explanation", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label">Special Talents:</span>{" "}
              <input
                type="text"
                value={formState.special_talents || ""}
                onChange={(e) =>
                  handleFieldChange("special_talents", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span>Musical Instruments: </span>
              <input
                type="text"
                value={formState.musical_instruments || ""}
                onChange={(e) =>
                  handleFieldChange("musical_instruments", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              Hobbies:{" "}
              <input
                type="text"
                value={formState.hobbies || ""}
                onChange={(e) => handleFieldChange("hobbies", e.target.value)}
                readOnly={!canEdit}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "15%" }}>
                Likes in People:{" "}
              </span>
              <input
                type="text"
                value={formState.likes_in_people || ""}
                onChange={(e) =>
                  handleFieldChange("likes_in_people", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              {" "}
              <span className="label" style={{ width: "18%" }}>
                Dislikes in People:{" "}
              </span>
              <input
                type="text"
                value={formState.dislikes_in_people || ""}
                onChange={(e) =>
                  handleFieldChange("dislikes_in_people", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>
          <div className="flex justify-between -mt-5 gap-4">
            <ClosestToRadio
              selectedValue={formState.closest_to}
              specifyOther={formState.specify_other}
              errorClosest={
                errors.closest_to || errors["family_relationship.closest_to"]
              }
              errorSpecify={
                errors.specify_other ||
                errors["family_relationship.specify_other"]
              }
            />
          </div>
          <div className="-mt-2">
            <label>
              Personal Characteristics:
              <textarea
                value={formState.personal_characteristics || ""}
                onChange={(e) =>
                  handleFieldChange("personal_characteristics", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>
          <div className="SCIF-inline flex-row">
            <div className="flex justify-between gap-4 mt-6">
              <label className="field-md">
                <span>Who do you open up to? </span>
                <input
                  type="text"
                  value={formState.problem_confidant}
                  onChange={(e) =>
                    handleFieldChange("problem_confidant", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
              <label>
                <span>Why?</span>
                <textarea
                  value={formState.confidant_reason}
                  onChange={(e) =>
                    handleFieldChange("confidant_reason", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
          </div>
          <div className="-mt-6">
            <label>
              <span className="label">Potential Problems:</span>{" "}
              <textarea
                value={formState.anticipated_problems || ""}
                onChange={(e) =>
                  handleFieldChange("anticipated_problems", e.target.value)
                }
                readOnly={!canEdit}
              />
            </label>
          </div>
          <div className="SCIF-inline flex row">
            <div className="flex justify-between gap-4 mt-10">
              <label>
                <span>Any previous counseling?</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="previous_counseling"
                    checked={formState.previous_counseling === true}
                    onChange={() =>
                      handleFieldChange("previous_counseling", true)
                    }
                    disabled={!canEdit}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="previous_counseling"
                    checked={formState.previous_counseling === false}
                    onChange={() =>
                      handleFieldChange("previous_counseling", false)
                    }
                    disabled={!canEdit}
                  />
                  No
                </label>
              </div>
            </div>
          </div>
          {formState.previous_counseling && (
            <>
              <div className="SCIF-inline flex-row">
                <div className="flex justify-between mt-2 gap-4">
                  <label className="field-xl">
                    If yes, where:{" "}
                    <input
                      type="text"
                      value={formState.counseling_location || ""}
                      onChange={(e) =>
                        handleFieldChange("counseling_location", e.target.value)
                      }
                      readOnly={!canEdit}
                    />
                  </label>
                  <label className="field-lg">
                    To whom?{" "}
                    <input
                      type="text"
                      value={formState.counseling_counselor || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "counseling_counselor",
                          e.target.value
                        )
                      }
                      readOnly={!canEdit}
                    />
                  </label>
                </div>
              </div>
              <div className="SCIF-inline flex-row">
                <label>
                  Why?
                  <textarea
                    value={formState.counseling_reason || ""}
                    onChange={(e) =>
                      handleFieldChange("counseling_reason", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end mt-10">
          <div className="flex flex-col gap-8">
            <div>
              <label>________________________________________</label>
              <label className="justify-center">
                SIGNATURE OVER PRINTED NAME:{" "}
              </label>
            </div>
            <div>
              <label>________________________________________</label>
              <label className="flex justify-center">DATE SIGNED</label>
            </div>
          </div>
        </div>
        <div className="SCIF-section">
          <div className="section-title">
            PSYCHOMETRIC DATA (Leave it blank)
          </div>
          <table className="psychometric-table">
            <thead>
              <tr>
                <th>Date of Testing</th>
                <th>Name of Test</th>
                <th>Raw Score</th>
                <th>Percentile/IQ</th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {/* Example hardcoded rows */}
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="SCIF-section">
          <div className="section-title">
            GUIDANCE SERVICES SPECIALIST’ NOTES: (Leave it blank)
          </div>
          <textarea
            className="guidance-notes"
            rows={5}
            readOnly={!canEdit}
            placeholder="____________________________________________________________________________________________&#10;____________________________________________________________________________________________&#10;____________________________________________________________________________________________"
            value={formState.guidance_notes || ""}
            onChange={(e) =>
              handleFieldChange("guidance_notes", e.target.value)
            }
          />
        </div>
        <div className="font-bold mb-5">Privacy Statement: </div>
        <div className="font-bold text-upmaroon mt-5 text-justify">
          The University of the Philippines takes your privacy seriously and we
          are committed to protecting your personal information. For the UP
          Privacy Policy, please visit{" "}
          <a
            href="https://privacy.up.edu.ph"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://privacy.up.edu.ph
          </a>
        </div>
        <div className="mt-10 text-justify">
          <div className="SCIF-inline">
            <input
              type="checkbox"
              name="has_consented"
              checked={privacy_consent.has_consented === true}
              readOnly
              className="certify-checkbox"
            />
            <span className="certify-text">
              I have read the University of the Philippines’ Privacy Notice for
              Students. I understand that for the UP System to carry out its
              mandate under the 1987 Constitution, the UP Charter, and other
              laws, the University must necessarily process my personal and
              sensitive personal information. Therefore, I recognize the
              authority of the University of the Philippines to process my
              personal and sensitive personal information, pursuant to the UP
              Privacy Notice and applicable laws.
            </span>
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <label className="field-md">
            Name of Student:{" "}
            <input type="text" value={formState.name} readOnly />
          </label>
          <label>
            Signature of Student: <input type="text" readOnly={!canEdit} />
          </label>
          <label>
            Date Signed:{" "}
            <input
              type="date"
              value={new Date(submission.submitted_on).toLocaleDateString(
                "en-CA"
              )}
              readOnly
            />
          </label>
        </div>
      </div>
      <BackToTopButton />
      {showDownloadConfirm && (
        <ConfirmDialog
          title="Confirm Download"
          message="Are you sure you want to download this file?"
          onConfirm={handleConfirmDownload}
          onCancel={handleCancelDownload}
          confirmLabel="Download"
          cancelLabel="Cancel"
        />
      )}

      {downloadToast && (
        <ToastMessage
          message={downloadToast}
          onClose={() => setDownloadToast(null)}
        />
      )}
    </>
  );
};

export default SCIFProfileView;
