import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import "./css/SCIFpdf.css";
import FormHeader from "./FormHeader";
import CustomRadio from "../components/CustomRadio";
import CustomCheckbox from "../components/CustomCheckbox";
import AutoResizeTextarea from "../components/AutoResizeTextarea";
import html2pdf from "html2pdf.js";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { calculateAge } from "../utils/helperFunctions";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import ToastMessage from "../components/ToastMessage";
import Button from "../components/UIButton";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import BackToTopButton from "../components/BackToTop";
import { useEnumChoices } from "../utils/enumChoices";
import { getProfilePhotoUrl, getProfileInitials } from "../utils/profileUtils";
import {
  filterAlphabetsOnly,
  filterNumbersOnly,
  filterGeneralText,
  filterDecimalNumbers,
} from "../utils/inputFilters";
import { Pencil, Plus, X, Trash2 } from "lucide-react";

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

const DECIMAL_ALLOWED_FIELDS = new Set(["height", "weight"]);

const PERSONAL_DATA_FIELDS = new Set([
  "last_name",
  "first_name",
  "middle_name",
  "nickname",
  "sex",
  "age",
  "religion",
  "birth_rank",
  "birthdate",
  "birthplace",
  "permanent_address_line_1",
  "permanent_address_line_2",
  "permanent_address_barangay",
  "permanent_address_city",
  "permanent_address_province",
  "permanent_address_region",
  "permanent_address_zip_code",
  "landline_number",
  "email",
  "contact_number",
  "student_number",
  "degree_program",
  "date_initial_entry",
]);

// Personal data is maintained in separate profile flows and should remain view-only here.
const ALLOW_PERSONAL_DATA_EDITS = false;

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

const getFirstNonEmptyString = (values = []) => {
  for (const value of values || []) {
    if (typeof value === "string") {
      const trimmed = safeTrim(value);
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return "";
};

const formatCounselorDisplayName = (profile) => {
  if (!profile || typeof profile !== "object") return "";
  const firstName = safeTrim(profile.first_name);
  const lastName = safeTrim(profile.last_name);
  const baseName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (baseName) return baseName;
  const nickname = safeTrim(profile.nickname);
  if (nickname) return nickname;
  const email = safeTrim(profile.email || profile.user?.email);
  return email;
};

const formatGuidanceTimestamp = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const deriveGuidanceAuditInfo = (
  guidanceNotesMeta,
  submission,
  fallbackName = ""
) => {
  const timestamp =
    guidanceNotesMeta?.date_added ||
    submission?.saved_on ||
    submission?.updated_at ||
    submission?.submitted_on ||
    null;
  const profileCandidates = [
    guidanceNotesMeta?.specialist_profile,
    guidanceNotesMeta?.specialist_details,
    guidanceNotesMeta?.specialist,
    guidanceNotesMeta?.counselor,
  ];
  const profileName =
    profileCandidates
      .map((candidate) => formatCounselorDisplayName(candidate))
      .find((name) => !!name) || "";
  const stringName = getFirstNonEmptyString([
    guidanceNotesMeta?.counselor_name,
    guidanceNotesMeta?.specialist_name,
    guidanceNotesMeta?.updated_by,
  ]);
  return {
    timestamp,
    updatedBy: profileName || stringName || fallbackName || "",
  };
};

const MIN_TABLE_ROWS = 1;
const createEmptyRow = () => ({
  year: "",
  semester: "",
  school_year_start: "",
  school_year_end: "",
  name: "",
  position: "",
});
const hasTableRowContent = (row) =>
  Boolean(
    row.year ||
    row.semester ||
    row.school_year_start ||
    row.school_year_end ||
    row.name ||
    row.position
  );
const SEMESTER_OPTIONS = [
  { value: "1st Semester", label: "1st Semester" },
  { value: "2nd Semester", label: "2nd Semester" },
  { value: "Midyear", label: "Midyear" },
];
const normalizeSemesterLabel = (value) => {
  const trimmed = safeTrim(value).toLowerCase();
  if (!trimmed) return "";
  const match = SEMESTER_OPTIONS.find(
    (opt) => opt.value.toLowerCase() === trimmed
  );
  if (match) return match.value;
  if (trimmed.startsWith("1")) return "1st Semester";
  if (trimmed.startsWith("2")) return "2nd Semester";
  if (trimmed.includes("mid")) return "Midyear";
  return safeTrim(value);
};
const parseAcademicYearParts = (value) => {
  if (!value || typeof value !== "string") {
    return { semester: "", school_year_start: "", school_year_end: "" };
  }
  const normalized = value.toLowerCase();
  const yearMatches = value.match(/(\d{4})/g) || [];
  const [startYear = "", endYear = ""] = yearMatches;
  const semesterMatch = normalized.match(
    /(1st|first|2nd|second|midyear|mid-year|mid year|summer)/i
  );
  const semester = semesterMatch
    ? normalizeSemesterLabel(semesterMatch[0])
    : "";
  return {
    semester,
    school_year_start: startYear,
    school_year_end: endYear,
  };
};
const formatAcademicYearLabel = (semester, schoolYearStart, schoolYearEnd) => {
  const parts = [];
  if (semester) parts.push(semester);
  if (schoolYearStart || schoolYearEnd) {
    const start = schoolYearStart || "????";
    const end = schoolYearEnd || "????";
    parts.push(`SY ${start}-${end}`);
  }
  return parts.join(" ").trim();
};
const sanitizeTableRows = (rows, { keepEmptyRows = false } = {}) => {
  const sanitized = (Array.isArray(rows) ? rows : []).map((row) => {
    const parsedParts = parseAcademicYearParts(row?.year || "");
    const semester =
      normalizeSemesterLabel(row?.semester) || parsedParts.semester || "";
    const schoolYearStart =
      safeTrim(row?.school_year_start) || parsedParts.school_year_start || "";
    const schoolYearEnd =
      safeTrim(row?.school_year_end) || parsedParts.school_year_end || "";
    const academicYearLabel =
      safeTrim(row?.year) ||
      formatAcademicYearLabel(semester, schoolYearStart, schoolYearEnd);
    return {
      year: academicYearLabel,
      semester,
      school_year_start: schoolYearStart,
      school_year_end: schoolYearEnd,
      name: safeTrim(row?.name),
      position: safeTrim(row?.position),
    };
  });

  if (keepEmptyRows) {
    return sanitized.length ? sanitized : [createEmptyRow()];
  }
  return sanitized.filter(hasTableRowContent);
};
const buildTableRows = (items) => {
  const rows = sanitizeTableRows(items, { keepEmptyRows: true });
  while (rows.length < MIN_TABLE_ROWS) {
    rows.push(createEmptyRow());
  }
  return rows;
};

const sanitizePsychometricRows = (rows, { keepEmptyRows = false } = {}) => {
  const sanitized = (Array.isArray(rows) ? rows : []).map((row) => ({
    id: row?.id ?? null,
    testing_date: row?.testing_date || "",
    test_name: safeTrim(row?.test_name),
    raw_score: safeTrim(row?.raw_score),
    percentile: safeTrim(row?.percentile),
    classification: safeTrim(row?.classification),
  }));

  if (keepEmptyRows) {
    return sanitized;
  }

  return sanitized.filter(
    (row) =>
      row.id != null ||
      row.testing_date ||
      row.test_name ||
      row.raw_score ||
      row.percentile ||
      row.classification
  );
};

const createEmptySiblingRow = () => ({
  id: null,
  submission: null,
  students: [],
  first_name: "",
  last_name: "",
  sex: "",
  age: "",
  job_occupation: "",
  company_school: "",
  educational_attainment: "",
});

const hasSiblingContent = (row) =>
  row.first_name ||
  row.last_name ||
  row.sex ||
  row.age ||
  row.job_occupation ||
  row.company_school ||
  row.educational_attainment;

const sanitizeSiblingRows = (rows, { keepEmptyRows = false } = {}) => {
  const sanitized = (Array.isArray(rows) ? rows : []).map((row) => ({
    id: row?.id ?? null,
    submission: row?.submission ?? null,
    students: Array.isArray(row?.students)
      ? row.students
      : row?.students
        ? [row.students]
        : [],
    first_name: safeTrim(row?.first_name),
    last_name: safeTrim(row?.last_name),
    sex: safeTrim(row?.sex),
    age: safeTrim(row?.age),
    job_occupation: safeTrim(row?.job_occupation),
    company_school: safeTrim(row?.company_school),
    educational_attainment: safeTrim(row?.educational_attainment),
  }));

  if (keepEmptyRows) {
    return sanitized.length ? sanitized : [createEmptySiblingRow()];
  }
  return sanitized.filter(hasSiblingContent);
};

const buildSiblingRows = (siblings) => {
  if (!Array.isArray(siblings) || siblings.length === 0) {
    return [createEmptySiblingRow()];
  }
  return siblings.map((sibling) => ({
    id: sibling?.id ?? null,
    submission: sibling?.submission ?? null,
    students: Array.isArray(sibling?.students)
      ? sibling.students
      : sibling?.students
        ? [sibling.students]
        : [],
    first_name: sibling?.first_name || "",
    last_name: sibling?.last_name || "",
    sex: sibling?.sex || "",
    age: sibling?.age?.toString() || "",
    job_occupation: sibling?.job_occupation || "",
    company_school: sibling?.company_school || "",
    educational_attainment: sibling?.educational_attainment || "",
  }));
};

const createEmptySchoolRecordRow = () => ({
  id: null,
  submission: null,
  school_id: null,
  school_address_id: null,
  education_level: "",
  school_name: "",
  address_line_1: "",
  barangay: "",
  city_municipality: "",
  province: "",
  region: "",
  zip_code: "",
  start_year: "",
  end_year: "",
  honors_received: "",
  senior_high_gpa: "",
});

const REQUIRED_SCHOOL_LEVELS = ["Primary", "Junior High", "Senior High"];

const ensureRequiredSchoolLevels = (records = []) => {
  if (!Array.isArray(records)) {
    return SCHOOL_LEVEL_ORDER.map((level) => ({
      ...createEmptySchoolRecordRow(),
      education_level: level,
    }));
  }
  const ensured = [...records];
  SCHOOL_LEVEL_ORDER.forEach((level) => {
    if (
      !ensured.some(
        (record) =>
          normalizeEducationLevel(record?.education_level).toLowerCase() ===
          level.toLowerCase()
      )
    ) {
      ensured.push({
        ...createEmptySchoolRecordRow(),
        education_level: level,
      });
    }
  });
  return orderSchoolRecords(ensured);
};

const hasSchoolRecordContent = (row) =>
  row.education_level ||
  row.school_name ||
  row.address_line_1 ||
  row.barangay ||
  row.city_municipality ||
  row.province ||
  row.region ||
  row.zip_code ||
  row.start_year ||
  row.end_year ||
  row.honors_received;

const sanitizeSchoolRecordRows = (rows, { keepEmptyRows = false } = {}) => {
  const sanitized = (Array.isArray(rows) ? rows : []).map((row) => ({
    id: row?.id ?? null,
    submission: row?.submission ?? null,
    school_id: row?.school_id ?? null,
    school_address_id: row?.school_address_id ?? null,
    education_level: normalizeEducationLevel(row?.education_level),
    school_name: safeTrim(row?.school_name),
    address_line_1: safeTrim(row?.address_line_1),
    barangay: safeTrim(row?.barangay),
    city_municipality: safeTrim(row?.city_municipality),
    province: safeTrim(row?.province),
    region: safeTrim(row?.region),
    zip_code: safeTrim(row?.zip_code),
    start_year: safeTrim(row?.start_year),
    end_year: safeTrim(row?.end_year),
    honors_received: safeTrim(row?.honors_received),
    senior_high_gpa: safeTrim(row?.senior_high_gpa),
  }));

  if (keepEmptyRows) {
    const filled = sanitized.length ? sanitized : [createEmptySchoolRecordRow()];
    return orderSchoolRecords(filled);
  }
  return orderSchoolRecords(sanitized.filter(hasSchoolRecordContent));
};

const buildSchoolRecordRows = (records) => {
  if (!Array.isArray(records) || records.length === 0) {
    return [createEmptySchoolRecordRow()];
  }
  const mapped = records.map((record) => ({
    id: record?.id ?? null,
    submission: record?.submission ?? null,
    school_id: record?.school?.id ?? null,
    school_address_id: record?.school?.school_address?.id ?? null,
    education_level: normalizeEducationLevel(record?.education_level),
    school_name: record?.school?.name || "",
    address_line_1: record?.school?.school_address?.address_line_1 || "",
    barangay: record?.school?.school_address?.barangay || "",
    city_municipality: record?.school?.school_address?.city_municipality || "",
    province: record?.school?.school_address?.province || "",
    region: record?.school?.school_address?.region || "",
    zip_code: record?.school?.school_address?.zip_code || "",
    start_year:
      record?.start_year === null || record?.start_year === undefined
        ? ""
        : String(record.start_year),
    end_year:
      record?.end_year === null || record?.end_year === undefined
        ? ""
        : String(record.end_year),
    honors_received: record?.honors_received || "",
    senior_high_gpa: record?.senior_high_gpa
      ? String(record.senior_high_gpa)
      : "",
  }));
  return orderSchoolRecords(mapped);
};

const composeSchoolAddressString = (record) => {
  const parts = [
    record?.address_line_1,
    record?.barangay,
    record?.city_municipality,
    record?.province,
    record?.region,
    record?.zip_code,
  ]
    .map((part) => safeTrim(part))
    .filter(Boolean);
  return parts.join("\n");
};

const formatSchoolAddressInline = (record) => {
  const parts = [
    record?.address_line_1,
    record?.barangay,
    record?.city_municipality,
    record?.province,
    record?.region,
    record?.zip_code,
  ]
    .map((part) => safeTrim(part))
    .filter(Boolean);
  return parts.join(", ");
};

const normalizeEducationLevel = (value) => {
  const trimmed = safeTrim(value);
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower.includes("primary") || lower.includes("elementary")) {
    return "Primary";
  }
  if (lower.includes("junior")) {
    return "Junior High";
  }
  if (lower.includes("senior")) {
    return "Senior High";
  }
  if (lower.includes("college") || lower.includes("tertiary")) {
    return "College";
  }
  return trimmed;
};

const getSeniorHighGpaValue = (records = []) => {
  for (const record of records || []) {
    if (normalizeEducationLevel(record?.education_level) === "Senior High") {
      const gpa = safeTrim(record?.senior_high_gpa);
      if (gpa) return gpa;
    }
  }
  return "";
};

const applySeniorHighGpaValue = (records = [], gpa = "") =>
  (Array.isArray(records) ? records : []).map((record) => {
    if (normalizeEducationLevel(record?.education_level) === "Senior High") {
      return {
        ...record,
        senior_high_gpa: safeTrim(gpa),
      };
    }
    return record;
  });

const SCHOOL_LEVEL_ORDER = ["Primary", "Junior High", "Senior High", "College"];
const getLevelOrderIndex = (level) => {
  const normalized = normalizeEducationLevel(level);
  const idx = SCHOOL_LEVEL_ORDER.findIndex(
    (entry) => entry.toLowerCase() === normalized.toLowerCase()
  );
  return idx === -1 ? SCHOOL_LEVEL_ORDER.length : idx;
};
const orderSchoolRecords = (records = []) =>
  (Array.isArray(records) ? records : [])
    .map((record, idx) => ({ record, idx }))
    .sort((a, b) => {
      const diff =
        getLevelOrderIndex(a.record?.education_level) -
        getLevelOrderIndex(b.record?.education_level);
      if (diff !== 0) return diff;
      return a.idx - b.idx;
    })
    .map(({ record }) => record);

const formatSiblingFullName = (sibling) => {
  const first = safeTrim(sibling?.first_name);
  const last = safeTrim(sibling?.last_name);
  return [first, last].filter(Boolean).join(" ").trim();
};

const splitSiblingFullName = (value) => {
  const trimmed = safeTrim(value);
  if (!trimmed) {
    return { first_name: "", last_name: "" };
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

const defaultGraduationInfo = () => ({
  semester: "",
  graduation_date: "",
  graduation_degree_program: "",
  honors_received: "",
});

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
  const { role, profileData: authProfileData, user } =
    useContext(AuthContext);
  const isStudentUser = role === "student";
  const hasAdminPrivileges = role === "admin" || isAdmin;
  const canEdit = hasAdminPrivileges;
  const canEditPersonalData = canEdit && ALLOW_PERSONAL_DATA_EDITS;
  const canViewPsychSections = hasAdminPrivileges;
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
  const [organizationRows, setOrganizationRows] = useState(() =>
    buildTableRows()
  );
  const [awardRows, setAwardRows] = useState(() => buildTableRows());
  const [siblingRows, setSiblingRows] = useState(() => buildSiblingRows());
  const [schoolRecordRows, setSchoolRecordRows] = useState(() =>
    buildSchoolRecordRows()
  );
  useEffect(() => {
    const derivedGpa = safeTrim(getSeniorHighGpaValue(schoolRecordRows));
    if (!derivedGpa) return;
    setFormState((prev) => {
      if (safeTrim(prev.senior_high_gpa) || prev.senior_high_gpa === derivedGpa) {
        return prev;
      }
      return { ...prev, senior_high_gpa: derivedGpa };
    });
  }, [schoolRecordRows]);
  const [graduationInfo, setGraduationInfo] = useState(() =>
    defaultGraduationInfo()
  );
  const [activeModalType, setActiveModalType] = useState(null);
  const psychStorageKey = profileData?.student_number
    ? `scif_psychometric_${profileData.student_number}`
    : null;
  const organizationStorageKey = profileData?.student_number
    ? `scif_organizations_${profileData.student_number}`
    : null;
  const awardStorageKey = profileData?.student_number
    ? `scif_awards_${profileData.student_number}`
    : null;
  const siblingStorageKey = profileData?.student_number
    ? `scif_siblings_${profileData.student_number}`
    : null;
  const schoolRecordStorageKey = profileData?.student_number
    ? `scif_school_records_${profileData.student_number}`
    : null;
  const graduationStorageKey = profileData?.student_number
    ? `scif_graduation_${profileData.student_number}`
    : null;
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
  const loadPsychometricCache = useCallback(() => {
    if (!psychStorageKey || typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(psychStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [psychStorageKey]);

  const savePsychometricCache = useCallback(
    (rows) => {
      if (!psychStorageKey || typeof window === "undefined") return;
      try {
        if (rows && rows.length) {
          localStorage.setItem(psychStorageKey, JSON.stringify(rows));
        } else {
          localStorage.removeItem(psychStorageKey);
        }
      } catch {
        // ignore storage errors
      }
    },
    [psychStorageKey]
  );
  const loadOrganizationCache = useCallback(() => {
    if (!organizationStorageKey || typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(organizationStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [organizationStorageKey]);

  const saveOrganizationCache = useCallback(
    (rows) => {
      if (!organizationStorageKey || typeof window === "undefined") return;
      try {
        const normalized = sanitizeTableRows(rows).filter(hasTableRowContent);
        if (normalized.length) {
          localStorage.setItem(
            organizationStorageKey,
            JSON.stringify(normalized)
          );
        } else {
          localStorage.removeItem(organizationStorageKey);
        }
      } catch {
        // ignore storage errors
      }
    },
    [organizationStorageKey]
  );

  const loadAwardCache = useCallback(() => {
    if (!awardStorageKey || typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(awardStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [awardStorageKey]);

  const saveAwardCache = useCallback(
    (rows) => {
      if (!awardStorageKey || typeof window === "undefined") return;
      try {
        const normalized = sanitizeTableRows(rows).filter(hasTableRowContent);
        if (normalized.length) {
          localStorage.setItem(awardStorageKey, JSON.stringify(normalized));
        } else {
          localStorage.removeItem(awardStorageKey);
        }
      } catch {
        // ignore storage errors
      }
    },
    [awardStorageKey]
  );
  const loadSiblingCache = useCallback(() => {
    if (!siblingStorageKey || typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(siblingStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [siblingStorageKey]);

  const saveSiblingCache = useCallback(
    (rows) => {
      if (!siblingStorageKey || typeof window === "undefined") return;
      try {
        const normalized = sanitizeSiblingRows(rows);
        if (normalized.length) {
          localStorage.setItem(siblingStorageKey, JSON.stringify(normalized));
        } else {
          localStorage.removeItem(siblingStorageKey);
        }
      } catch {
        // ignore storage errors
      }
    },
    [siblingStorageKey]
  );

  const loadSchoolRecordCache = useCallback(() => {
    if (!schoolRecordStorageKey || typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(schoolRecordStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [schoolRecordStorageKey]);

  const saveSchoolRecordCache = useCallback(
    (rows) => {
      if (!schoolRecordStorageKey || typeof window === "undefined") return;
      try {
        const normalized = sanitizeSchoolRecordRows(rows);
        if (normalized.length) {
          localStorage.setItem(
            schoolRecordStorageKey,
            JSON.stringify(normalized)
          );
        } else {
          localStorage.removeItem(schoolRecordStorageKey);
        }
      } catch {
        // ignore
      }
    },
    [schoolRecordStorageKey]
  );
  const loadGraduationCache = useCallback(() => {
    if (!graduationStorageKey || typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(graduationStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [graduationStorageKey]);

  const saveGraduationCache = useCallback(
    (info) => {
      if (!graduationStorageKey || typeof window === "undefined") return;
      try {
        const normalized = {
          semester: safeTrim(info?.semester),
          graduation_date: safeTrim(info?.graduation_date),
          graduation_degree_program: safeTrim(info?.graduation_degree_program),
          honors_received: safeTrim(info?.honors_received),
        };
        if (
          normalized.semester ||
          normalized.graduation_date ||
          normalized.graduation_degree_program ||
          normalized.honors_received
        ) {
          localStorage.setItem(
            graduationStorageKey,
            JSON.stringify(normalized)
          );
        } else {
          localStorage.removeItem(graduationStorageKey);
        }
      } catch {
        // ignore
      }
    },
    [graduationStorageKey]
  );
  const openModal = (type) => {
    if (!canEdit) return;
    setActiveModalType(type);
  };
  const closeModal = () => setActiveModalType(null);
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
    senior_high_gpa: "",
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
    psychometric_data: [],
    guidance_notes: "",
    privacy_consent: {
      student_number: "",
      has_consented: false,
      submission: "",
    },
  });
  const [guidanceNotesAudit, setGuidanceNotesAudit] = useState({
    timestamp: null,
    updatedBy: "",
  });
  const photoUrl = getProfilePhotoUrl(profileData);
  const photoInitials = getProfileInitials(profileData);
  const submissionId = formData?.submission?.id;

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
      psychometric_data,
      siblings: siblingList,
    } = formData;
    const seniorHighGpaValue = getSeniorHighGpaValue(previous_school_record);

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

    const psychometricEntries = Array.isArray(psychometric_data)
      ? psychometric_data.map((entry) => ({
        id: entry?.id ?? null,
        testing_date: entry?.testing_date || "",
        test_name: entry?.test_name || "",
        raw_score: entry?.raw_score || "",
        percentile: entry?.percentile || "",
        classification: entry?.classification || "",
      }))
      : [];
    let initialPsychometric =
      psychometricEntries && psychometricEntries.length > 0
        ? psychometricEntries
        : [];
    if (initialPsychometric.length === 0) {
      const cached = loadPsychometricCache();
      if (Array.isArray(cached) && cached.length > 0) {
        initialPsychometric = cached;
      }
    }

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
      father_name: `${family_data.father?.first_name || ""} ${family_data.father?.last_name || ""
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
      mother_name: `${family_data.mother?.first_name || ""} ${family_data.mother?.last_name || ""
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
      guardian_name: `${family_data.guardian?.first_name || ""} ${family_data.guardian?.last_name || ""
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
      psychometric_data: initialPsychometric,
      scholarships_and_assistance: scholarshipsArray,
      guidance_notes: guidance_notes?.notes || "",
      senior_high_gpa: safeTrim(seniorHighGpaValue) || "",
    };

    setFormState(preparedState);

    const incomingSiblingRows = buildSiblingRows(siblingList);
    const hasSiblingData = incomingSiblingRows.some(hasSiblingContent);
    let siblingRowsToUse = incomingSiblingRows;
    if (!hasSiblingData) {
      const cachedSiblings = loadSiblingCache();
      if (Array.isArray(cachedSiblings) && cachedSiblings.length > 0) {
        siblingRowsToUse = sanitizeSiblingRows(cachedSiblings, {
          keepEmptyRows: true,
        });
      }
    }
    setSiblingRows(
      siblingRowsToUse.length ? siblingRowsToUse : [createEmptySiblingRow()]
    );

    const incomingSchoolRows = buildSchoolRecordRows(previous_school_record);
    const hasSchoolRecords = incomingSchoolRows.some(hasSchoolRecordContent);
    let schoolRowsToUse = incomingSchoolRows;
    if (!hasSchoolRecords) {
      const cachedSchoolRecords = loadSchoolRecordCache();
      if (Array.isArray(cachedSchoolRecords) && cachedSchoolRecords.length) {
        schoolRowsToUse = sanitizeSchoolRecordRows(cachedSchoolRecords, {
          keepEmptyRows: true,
        });
      }
    }
    const schoolRowsForState = schoolRowsToUse.length
      ? schoolRowsToUse
      : [createEmptySchoolRecordRow()];
    setSchoolRecordRows(schoolRowsForState);

    const incomingOrgRows = buildTableRows(formData?.organizations);
    const incomingAwardRows = buildTableRows(formData?.awards);
    const cachedOrgs = loadOrganizationCache();
    const cachedAwards = loadAwardCache();
    const orgRowsToUse =
      (!incomingOrgRows.some(hasTableRowContent) && cachedOrgs?.length
        ? buildTableRows(cachedOrgs)
        : incomingOrgRows) || buildTableRows();
    const awardRowsToUse =
      (!incomingAwardRows.some(hasTableRowContent) && cachedAwards?.length
        ? buildTableRows(cachedAwards)
        : incomingAwardRows) || buildTableRows();

    setOrganizationRows(orgRowsToUse);
    setAwardRows(awardRowsToUse);

    const cachedGraduation = loadGraduationCache();
    setGraduationInfo(cachedGraduation ?? defaultGraduationInfo());
    seniorHighRecordRef.current = seniorHighRecord || null;
    savePsychometricCache(initialPsychometric);
    const counselorDisplayName = formatCounselorDisplayName(authProfileData);
    const derivedAudit = deriveGuidanceAuditInfo(
      guidance_notes,
      submission,
      counselorDisplayName
    );
    setGuidanceNotesAudit(derivedAudit);
  }, [
    formData,
    profileData,
    authProfileData,
    loadOrganizationCache,
    loadAwardCache,
    loadGraduationCache,
    loadPsychometricCache,
    savePsychometricCache,
    loadSiblingCache,
    loadSchoolRecordCache,
  ]);

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
    if (!canEditPersonalData && PERSONAL_DATA_FIELDS.has(field)) {
      return;
    }
    const sanitizedValue =
      field === "senior_high_gpa"
        ? filterDecimalNumbers(value)
        : sanitizeNumericInput(field, value);
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
    if (field === "senior_high_gpa") {
      const trimmedValue = safeTrim(sanitizedValue);
      setSchoolRecordRows((prev) =>
        applySeniorHighGpaValue(prev, trimmedValue)
      );
    }
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

  const handleOpenModal = (type) => openModal(type);

  const handleSaveSiblings = (rows) => {
    if (!canEdit) return;
    const sanitized = sanitizeSiblingRows(rows, { keepEmptyRows: true });
    const normalized = sanitized.length ? sanitized : [createEmptySiblingRow()];
    setSiblingRows(normalized);
    saveSiblingCache(normalized);
    closeModal();
  };

  const handleSaveSchoolRecords = (rows) => {
    if (!canEdit) return;
    const sanitized = sanitizeSchoolRecordRows(rows, { keepEmptyRows: true });
    const gpaValue = getSeniorHighGpaValue(sanitized);
    const normalizedRecords = applySeniorHighGpaValue(sanitized, gpaValue);
    const normalized = normalizedRecords.length
      ? normalizedRecords
      : [createEmptySchoolRecordRow()];
    setSchoolRecordRows(normalized);
    saveSchoolRecordCache(normalized);
    setFormState((prev) => ({
      ...prev,
      senior_high_gpa: safeTrim(gpaValue),
    }));
    closeModal();
  };

  const handleSaveOrganizations = (rows) => {
    if (!canEdit) return;
    const sanitized = sanitizeTableRows(rows, { keepEmptyRows: true });
    const normalized = sanitized.length ? sanitized : [createEmptyRow()];
    setOrganizationRows(normalized);
    saveOrganizationCache(normalized);
    closeModal();
  };

  const handleSaveAwards = (rows) => {
    if (!canEdit) return;
    const sanitized = sanitizeTableRows(rows, { keepEmptyRows: true });
    const normalized = sanitized.length ? sanitized : [createEmptyRow()];
    setAwardRows(normalized);
    saveAwardCache(normalized);
    closeModal();
  };

  const handleGraduationFieldChange = (field, value) => {
    if (!canEdit) return;
    setGraduationInfo((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };
      saveGraduationCache(next);
      return next;
    });
  };

  const handlePsychometricChange = (index, field, value) => {
    if (!canEdit) return;
    setFormState((prev) => {
      const nextRows = Array.isArray(prev.psychometric_data)
        ? [...prev.psychometric_data]
        : [];
      nextRows[index] = {
        ...nextRows[index],
        [field]: value,
      };
      savePsychometricCache(nextRows);
      return {
        ...prev,
        psychometric_data: nextRows,
      };
    });
  };

  const handleAddPsychometricRow = () => {
    if (!canEdit) return;
    setFormState((prev) => {
      const existing = Array.isArray(prev.psychometric_data)
        ? prev.psychometric_data
        : [];
      const updated = [
        ...existing,
        {
          id: null,
          testing_date: "",
          test_name: "",
          raw_score: "",
          percentile: "",
          classification: "",
        },
      ];
      savePsychometricCache(updated);
      return {
        ...prev,
        psychometric_data: updated,
      };
    });
  };

  const handleRemovePsychometricRow = (index) => {
    if (!canEdit) return;
    setFormState((prev) => {
      const nextRows = Array.isArray(prev.psychometric_data)
        ? [...prev.psychometric_data]
        : [];
      nextRows.splice(index, 1);
      savePsychometricCache(nextRows);
      return {
        ...prev,
        psychometric_data: nextRows,
      };
    });
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

  const psychometricRows = Array.isArray(formState.psychometric_data)
    ? formState.psychometric_data
    : [];

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
      guidance_notes: {
        notes: safeTrim(formState.guidance_notes),
      },
    };

    payload.organizations =
      sanitizeTableRows(organizationRows).filter(hasTableRowContent);
    payload.awards = sanitizeTableRows(awardRows).filter(hasTableRowContent);
    payload.psychometric_data = sanitizePsychometricRows(
      formState.psychometric_data
    );

    const sanitizedSiblingRows = sanitizeSiblingRows(siblingRows);
    payload.siblings = sanitizedSiblingRows.map((row) => {
      const siblingPayload = {
        student_number: profileData.student_number,
        first_name: safeTrim(row.first_name),
        last_name: safeTrim(row.last_name),
        sex: safeTrim(row.sex),
        age: safeTrim(row.age),
        job_occupation: safeTrim(row.job_occupation),
        company_school: safeTrim(row.company_school),
        educational_attainment: safeTrim(row.educational_attainment),
        students:
          Array.isArray(row?.students) && row.students.length
            ? row.students
            : [profileData.student_number],
      };
      if (row?.id) {
        siblingPayload.id = row.id;
      }
      if (row?.submission || submissionId) {
        siblingPayload.submission = row?.submission ?? submissionId;
      }
      return siblingPayload;
    });

    const trimmedSeniorHighGpa = safeTrim(formState.senior_high_gpa);
    const formatSchoolRecordRow = (row) => {
      const level = normalizeEducationLevel(row?.education_level);
      const isSeniorHigh = level === "Senior High";
      const schoolRecordPayload = {
        student_number: profileData.student_number,
        education_level: level,
        start_year: safeTrim(row?.start_year),
        end_year: safeTrim(row?.end_year),
        honors_received: safeTrim(row?.honors_received),
        senior_high_gpa: isSeniorHigh
          ? trimmedSeniorHighGpa || safeTrim(row?.senior_high_gpa)
          : "",
        school: {
          name: safeTrim(row?.school_name),
          school_address: {
            address_line_1: safeTrim(row?.address_line_1),
            barangay: safeTrim(row?.barangay),
            city_municipality: safeTrim(row?.city_municipality),
            province: safeTrim(row?.province),
            region: safeTrim(row?.region),
            zip_code: safeTrim(row?.zip_code),
          },
        },
      };
      if (row?.id) {
        schoolRecordPayload.id = row.id;
      }
      if (row?.submission || submissionId) {
        schoolRecordPayload.submission = row?.submission ?? submissionId;
      }
      if (row?.school_id) {
        schoolRecordPayload.school.id = row.school_id;
      }
      if (row?.school_address_id) {
        schoolRecordPayload.school.school_address.id = row.school_address_id;
      }
      return schoolRecordPayload;
    };

    const sanitizedSchoolRecords = sanitizeSchoolRecordRows(schoolRecordRows);
    const orderedSchoolRecords = orderSchoolRecords(sanitizedSchoolRecords);
    if (orderedSchoolRecords.length > 0) {
      payload.previous_school_record = orderedSchoolRecords.map(
        formatSchoolRecordRow
      );
    } else if (seniorHighRecordRef.current) {
      const fallbackRows = buildSchoolRecordRows([seniorHighRecordRef.current]);
      payload.previous_school_record = fallbackRows.map(formatSchoolRecordRow);
    } else {
      payload.previous_school_record = [];
    }
    console.log("Payload:", payload);

    return payload;
  };

  const updateStudentProfile = async (payload, submissionId) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      appendFormDataValue(formData, key, value);
    });

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

      const sanitizedOrgRowsForState = sanitizeTableRows(organizationRows);
      const sanitizedAwardRowsForState = sanitizeTableRows(awardRows);
      const sanitizedSiblingRowsForState = sanitizeSiblingRows(siblingRows, {
        keepEmptyRows: true,
      });
      const sanitizedSiblingRowsForCache = sanitizeSiblingRows(siblingRows);
      const sanitizedSchoolRowsForState = sanitizeSchoolRecordRows(
        schoolRecordRows,
        { keepEmptyRows: true }
      );
      const sanitizedSchoolRowsForCache =
        sanitizeSchoolRecordRows(schoolRecordRows);
      const sanitizedPsychRowsForState = sanitizePsychometricRows(
        formState.psychometric_data,
        { keepEmptyRows: true }
      );
      const sanitizedPsychRowsForCache = sanitizePsychometricRows(
        formState.psychometric_data
      );

      setOrganizationRows(buildTableRows(sanitizedOrgRowsForState));
      setAwardRows(buildTableRows(sanitizedAwardRowsForState));
      setSiblingRows(
        sanitizedSiblingRowsForState.length
          ? sanitizedSiblingRowsForState
          : [createEmptySiblingRow()]
      );
      setSchoolRecordRows(
        sanitizedSchoolRowsForState.length
          ? sanitizedSchoolRowsForState
          : [createEmptySchoolRecordRow()]
      );
      setFormState((prev) => ({
        ...prev,
        psychometric_data: sanitizedPsychRowsForState,
      }));
      saveOrganizationCache(sanitizedOrgRowsForState);
      saveAwardCache(sanitizedAwardRowsForState);
      saveSiblingCache(sanitizedSiblingRowsForCache);
      saveSchoolRecordCache(sanitizedSchoolRowsForCache);
      savePsychometricCache(sanitizedPsychRowsForCache);
      const latestModifierName =
        formatCounselorDisplayName(authProfileData) ||
        formatCounselorDisplayName(user) ||
        "Administrator";
      setGuidanceNotesAudit({
        timestamp: new Date().toISOString(),
        updatedBy: latestModifierName,
      });

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

  // const handleDownload = async () => {
  //   const element = pdfRef.current;
  //   if (!element) {
  //     setDownloadToast("Unable to prepare the file. Please reload the page.");
  //     return false;
  //   }

  //   const clone = element.cloneNode(true);
  //   const normalizeColor = (() => {
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");
  //     return (value) => {
  //       if (!ctx || !value) return value;
  //       try {
  //         ctx.fillStyle = value;
  //         return ctx.fillStyle;
  //       } catch {
  //         return value;
  //       }
  //     };
  //   })();

  //   const container = document.createElement("div");
  //   container.style.position = "fixed";
  //   container.style.left = "-10000px";
  //   container.style.top = "0";
  //   container.style.zIndex = "-1";
  //   container.appendChild(clone);
  //   document.body.appendChild(container);

  //   const sourceNodes = [element, ...element.querySelectorAll("*")];
  //   const targetNodes = [clone, ...clone.querySelectorAll("*")];

  //   sourceNodes.forEach((sourceEl, idx) => {
  //     const targetEl = targetNodes[idx];
  //     if (!targetEl) return;
  //     const computed = window.getComputedStyle(sourceEl);
  //     targetEl.style.color = normalizeColor(computed.color);
  //     targetEl.style.backgroundColor = normalizeColor(
  //       computed.backgroundColor
  //     );
  //     targetEl.style.borderColor = normalizeColor(computed.borderColor);
  //   });

  //   const opt = {
  //     margin: 0.5,
  //     filename: "SCIF_file.pdf",
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  //   };

  //   try {
  //     await html2pdf().set(opt).from(clone).save();
  //     return true;
  //   } catch (error) {
  //     console.error("Failed to generate PDF:", error);
  //     setDownloadToast("Unable to generate the PDF. Please try again.");
  //     return false;
  //   } finally {
  //     document.body.removeChild(container);
  //   }
  // };

  const handleDownload = async () => {
    const element = pdfRef.current;
    if (!element) {
      setDownloadToast("Unable to prepare the file. Please reload the page.");
      return;
    }

    const clone = element.cloneNode(true);
    const targetWidthInches = 8.5;
    const pageMarginInches = 0.33;
    clone.style.width = `${targetWidthInches}in`;
    clone.style.maxWidth = `${targetWidthInches}in`;
    clone.style.boxSizing = "border-box";
    clone.style.backgroundColor = "#ffffff";
    clone.style.padding = `${pageMarginInches}in`;
    clone.style.margin = "0 auto";

    const pdfSpecificStyles = document.createElement("style");
    pdfSpecificStyles.textContent = `
      .siblings-table,
      .school-records-table,
      .scif-table,
      .psychometric-table {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .siblings-table thead,
      .school-records-table thead,
      .scif-table thead,
      .psychometric-table thead {
        display: table-header-group;
      }
      .no-page-break {
        page-break-after: avoid;
        break-after: avoid;
      }
    `;
    clone.insertBefore(pdfSpecificStyles, clone.firstChild || null);

    const workingWrapper = document.createElement("div");
    workingWrapper.style.position = "fixed";
    workingWrapper.style.left = "-10000px";
    workingWrapper.style.top = "0";
    workingWrapper.style.zIndex = "-1";
    workingWrapper.appendChild(clone);
    document.body.appendChild(workingWrapper);

    clone
      .querySelectorAll("[data-pdf-hide]")
      .forEach((el) => el.parentNode && el.parentNode.removeChild(el));

    const originalFields = element.querySelectorAll("input, textarea, select");
    const cloneFields = clone.querySelectorAll("input, textarea, select");

    const getBorderColor = (computed) =>
      computed.borderBottomColor &&
        computed.borderBottomColor !== "rgba(0, 0, 0, 0)"
        ? computed.borderBottomColor
        : "#000";

    const getBorderWidth = (computed) =>
      computed.borderBottomWidth && computed.borderBottomWidth !== "0px"
        ? computed.borderBottomWidth
        : "1px";

    cloneFields.forEach((cloneEl, i) => {
      const originalEl = originalFields[i];
      if (!originalEl) return;

      const computed = window.getComputedStyle(originalEl);
      const rect = originalEl.getBoundingClientRect();

      if (
        (originalEl.type === "radio" || originalEl.type === "checkbox") &&
        cloneEl.closest(".custom-radio, .custom-checkbox")
      ) {
        return;
      }

      if (originalEl.type === "checkbox" || originalEl.type === "radio") {
        const fallbackSize =
          rect.height > 0
            ? rect.height
            : rect.width > 0
              ? rect.width
              : parseFloat(computed.fontSize || "14") * 1.2 || 16;

        const parentLabel =
          cloneEl.parentElement &&
            cloneEl.parentElement.tagName &&
            cloneEl.parentElement.tagName.toUpperCase() === "LABEL"
            ? cloneEl.parentElement
            : null;
        const targetComputed = window.getComputedStyle(
          parentLabel || originalEl
        );

        const wrapperTag = parentLabel ? "label" : "span";
        const wrapper = document.createElement(wrapperTag);
        if (parentLabel) {
          wrapper.className = parentLabel.className || "";
        }
        const inlineDisplay =
          targetComputed.display === "inline" ||
          targetComputed.display === "inline-block";
        wrapper.style.display = inlineDisplay ? "inline-flex" : "flex";
        wrapper.style.alignItems =
          originalEl.type === "checkbox" ? "flex-start" : "center";
        wrapper.style.justifyContent = "flex-start";
        wrapper.style.gap = "0.4rem";
        wrapper.style.padding = targetComputed.padding;
        wrapper.style.margin = targetComputed.margin;
        wrapper.style.boxSizing = "border-box";
        wrapper.style.fontSize = targetComputed.fontSize;
        wrapper.style.fontFamily = targetComputed.fontFamily;
        wrapper.style.color = targetComputed.color || "#000";
        wrapper.style.flexWrap = "wrap";
        if (parentLabel && targetComputed.width !== "auto") {
          wrapper.style.width = targetComputed.width;
        }

        const indicator = document.createElement("span");
        const isRadio = originalEl.type === "radio";
        const isCheckbox = originalEl.type === "checkbox";

        indicator.style.width = fallbackSize + "px";
        indicator.style.height = fallbackSize + "px";
        indicator.style.minWidth = fallbackSize + "px";
        indicator.style.minHeight = fallbackSize + "px";
        indicator.style.border = `${getBorderWidth(
          computed
        )} solid ${getBorderColor(computed)}`;
        indicator.style.borderRadius = isRadio ? "999px" : "3px";
        indicator.style.display = "flex";
        indicator.style.alignItems = "center";
        indicator.style.justifyContent = "center";
        indicator.style.boxSizing = "border-box";
        indicator.style.backgroundColor = "#fff";

        if (isCheckbox && originalEl.checked) {
          indicator.textContent = "✓";
          indicator.style.fontSize = fallbackSize * 0.8 + "px";
          indicator.style.lineHeight = "1";
        }

        if (isRadio && originalEl.checked) {
          const dot = document.createElement("span");
          const dotSize = Math.max(fallbackSize * 0.5, 4);
          dot.style.display = "block";
          dot.style.width = dotSize + "px";
          dot.style.height = dotSize + "px";
          dot.style.borderRadius = "50%";
          dot.style.backgroundColor = getBorderColor(computed);
          dot.style.margin = "auto";
          indicator.appendChild(dot);
        }

        if (parentLabel) {
          indicator.style.marginRight = "0.35rem";
          indicator.style.display = "inline-flex";
          parentLabel.insertBefore(indicator, cloneEl);
          parentLabel.removeChild(cloneEl);
          return;
        }

        const contentContainer = document.createElement("span");
        contentContainer.style.display = "inline-flex";
        contentContainer.style.flex = "1";
        contentContainer.style.flexWrap = "wrap";
        contentContainer.style.alignItems = "flex-start";
        contentContainer.style.gap = "0.25rem";

        let siblingNode = cloneEl.nextSibling;
        const allowedTags = new Set(["SPAN", "SMALL", "STRONG", "LABEL"]);
        while (
          siblingNode &&
          (siblingNode.nodeType === Node.TEXT_NODE ||
            (siblingNode.nodeType === Node.ELEMENT_NODE &&
              allowedTags.has(siblingNode.nodeName.toUpperCase())))
        ) {
          const nextSibling = siblingNode.nextSibling;
          contentContainer.appendChild(siblingNode);
          siblingNode = nextSibling;
        }

        if (!contentContainer.hasChildNodes()) {
          const fallbackText =
            originalEl.getAttribute("value") ||
            originalEl.getAttribute("aria-label") ||
            (isRadio
              ? originalEl.checked
                ? "Selected"
                : ""
              : originalEl.checked
                ? "Yes"
                : "No");
          if (fallbackText) {
            const span = document.createElement("span");
            span.textContent = fallbackText;
            contentContainer.appendChild(span);
          }
        }

        const isCertifyCheckbox =
          isCheckbox && originalEl.classList?.contains("certify-checkbox");

        if (isCertifyCheckbox) {
          indicator.style.borderRadius = "4px";
          indicator.style.borderColor = "#7b1113";
          indicator.style.marginTop = "0.2rem";
          if (originalEl.checked) {
            indicator.style.backgroundColor = "#7b1113";
            indicator.style.color = "#fff";
            indicator.textContent = "✓";
            indicator.style.fontWeight = "bold";
          } else {
            indicator.style.backgroundColor = "#fff";
          }
          wrapper.style.width = "100%";
          wrapper.style.alignItems = "flex-start";
        }

        wrapper.appendChild(indicator);
        if (contentContainer.hasChildNodes()) {
          wrapper.appendChild(contentContainer);
        }

        if (parentLabel) {
          parentLabel.replaceWith(wrapper);
        } else {
          cloneEl.replaceWith(wrapper);
        }
        return;
      }

      let value = originalEl.value || "";
      if (originalEl.tagName === "SELECT") {
        const selected = originalEl.options[originalEl.selectedIndex];
        value = selected ? selected.text : value;
      }

      const textDiv = document.createElement("div");
      textDiv.textContent = value || "\u00a0";
      textDiv.style.display = "block";
      textDiv.style.fontSize = computed.fontSize;
      textDiv.style.fontFamily = computed.fontFamily;
      textDiv.style.fontWeight = computed.fontWeight;
      textDiv.style.lineHeight = computed.lineHeight;
      textDiv.style.color = computed.color;
      textDiv.style.padding = computed.padding;
      textDiv.style.margin = computed.margin;

      const width = rect.width || originalEl.offsetWidth;
      if (width) {
        textDiv.style.width = width + "px";
        textDiv.style.maxWidth = width + "px";
        textDiv.style.minWidth = width + "px";
      } else if (computed.width) {
        textDiv.style.width = computed.width;
        textDiv.style.maxWidth = computed.width;
      }

      const height = rect.height || originalEl.offsetHeight;
      if (height) {
        textDiv.style.minHeight = height + "px";
      } else if (computed.height && computed.height !== "auto") {
        textDiv.style.minHeight = computed.height;
      }
      textDiv.style.height = "auto";

      textDiv.style.whiteSpace = "pre-wrap";
      textDiv.style.wordBreak = "break-word";
      textDiv.style.overflowWrap = "break-word";
      textDiv.style.boxSizing = "border-box";

      textDiv.style.borderBottom = `${getBorderWidth(
        computed
      )} solid ${getBorderColor(computed)}`;

      cloneEl.replaceWith(textDiv);
    });

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore font loading errors */
      }
    }

    const imgs = clone.querySelectorAll("img");
    await Promise.all(
      Array.from(imgs).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = img.onerror = resolve;
          })
      )
    );

    const options = {
      margin: [0, 0, 0, 0],
      filename: "SCIF_profile.pdf",
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
    };

    try {
      await html2pdf().set(options).from(clone).save();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setDownloadToast("Unable to generate the PDF. Please try again.");
    } finally {
      document.body.removeChild(workingWrapper);
    }
  };

  if (!profileData || !formData) return <div>Loading...</div>;

  const {
    family_data,
    personality_traits,
    health_data,
    scholarship,
    family_relationship,
    counseling_info,
    submission,
    privacy_consent,
  } = formData;
  const guidanceNotesLastModified = guidanceNotesAudit.timestamp
    ? formatGuidanceTimestamp(guidanceNotesAudit.timestamp)
    : "Not yet saved";
  const guidanceNotesUpdatedBy =
    guidanceNotesAudit.updatedBy?.trim() || "Not recorded";

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
          <CustomRadio
            key={option.key}
            name="health_condition"
            value={option.key}
            label={option.label}
            checked={selectedValue === option.key}
            onChange={() => onChange(option.key)}
            disabled={!canEdit}
            className="mr-2"
          />
        ))}
      </div>
    );
  };

  const PreviousSchoolRecordsTable = ({ records }) => {
    const tableRows =
      Array.isArray(records) && records.length
        ? records
        : [createEmptySchoolRecordRow()];

    return (
      <div style={{ pageBreakInside: "avoid" }}>
        {canEdit && (
          <div className="flex justify-end -mt-14 -mb-2" data-pdf-hide>
            <button
              type="button"
              className="text-white text-xs font-semibold flex relative items-center gap-2 hover:scale-105 transition-all duration-300 ease-in-out bg-upmaroon hover:bg-red-[#991B1B] p-2 rounded"
              onClick={() => handleOpenModal("schoolRecords")}
            >
              <Pencil size={16} /> Edit Previous School Record
            </button>
          </div>
        )}

        <table className="w-full border-collapse mt-4 text-xs">
          <thead>
            <tr>
              <th className="border border-[#9ca3af] px-2.5 py-2 text-left bg-[#f3f4f6]">Level</th>
              <th className="border border-[#9ca3af] px-2.5 py-2 text-left bg-[#f3f4f6]">Name of School</th>
              <th className="border border-[#9ca3af] px-2.5 py-2 text-left bg-[#f3f4f6]">Address</th>
              <th className="border border-[#9ca3af] px-2.5 py-2 text-left bg-[#f3f4f6]">Inclusive Years</th>
              <th className="border border-[#9ca3af] px-2.5 py-2 text-left bg-[#f3f4f6]">Honor/s</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((record, idx) => {
              const address =
                formatSchoolAddressInline(record) ||
                composeSchoolAddressString(record) ||
                "";
              const inclusiveYears =
                record.start_year || record.end_year
                  ? `${record.start_year || ""}${record.start_year || record.end_year ? " - " : ""}${record.end_year || ""}`
                  : "";

              const isSrHigh = normalizeEducationLevel(record.education_level) === "Senior High";
              return (
                <tr key={record.id || idx}>
                  <td className="border border-[#9ca3af] px-2.5 py-1 align-top">{record.education_level || "-"}</td>
                  <td className="border border-[#9ca3af] px-2.5 py-1 align-top">{record.school_name || "-"}</td>
                  <td className="border border-[#9ca3af] px-2.5 py-1 align-top">{address || "-"}</td>
                  <td className="border border-[#9ca3af] px-2.5 py-1 align-top">{inclusiveYears || "-"}</td>
                  <td className="border border-[#9ca3af] px-2.5 py-1 align-top">
                    <div className="flex flex-col gap-1">
                      <span>{record.honors_received || "-"}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const SiblingsTable = ({ rows }) => {
    const tableRows =
      Array.isArray(rows) && rows.length ? rows : [createEmptySiblingRow()];
    return (
      <div>
        {canEdit && (
          <div className="flex -mb-10 -mt-14" data-pdf-hide>
            <button
              type="button"
              className="text-white text-xs font-semibold mt-3 flex relative items-center gap-2 hover:scale-105 transition-all duration-300 ease-in-out bg-upmaroon hover:bg-red-[#991B1B] p-2 rounded"
              onClick={() => handleOpenModal("siblings")}
            >
              <Pencil size={16} /> Edit Sibling/s Record
            </button>
          </div>
        )}
        <table className="w-full border-collapse mt-12 text-xs">
          <thead>
            <tr>
              <th className="border border-black px-4 py-3 text-left bg-[#f3f4f6] font-bold">
                Brothers/Sisters
              </th>
              <th className="border border-black px-4 py-3 text-left bg-[#f3f4f6] font-bold">
                Sex
              </th>
              <th className="border border-black px-4 py-3 text-left bg-[#f3f4f6] font-bold">
                Age
              </th>
              <th className="border border-black px-4 py-3 text-left bg-[#f3f4f6] font-bold">
                Job/Occupation
              </th>
              <th className="border border-black px-4 py-3 text-left bg-[#f3f4f6] font-bold">
                Company/School
              </th>
              <th className="border border-black px-4 py-3 text-left bg-[#f3f4f6] font-bold">
                Educational Attainment
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((sibling, index) => (
              <tr key={sibling.id || index}>
                <td className="border border-black px-4 py-1 align-top">
                  {formatSiblingFullName(sibling) || "-"}
                </td>
                <td
                  className="border border-black px-4 py-1 align-top"
                  style={{ minWidth: "85px" }}
                >
                  {sibling.sex || "-"}
                </td>
                <td
                  className="border border-black px-4 py-1 align-top"
                  style={{ minWidth: "70px" }}
                >
                  {sibling.age || "-"}
                </td>
                <td className="border border-black px-4 py-1 align-top">
                  {sibling.job_occupation || "-"}
                </td>
                <td className="border border-black px-4 py-1 align-top">
                  {sibling.company_school || "-"}
                </td>
                <td className="border border-black px-4 py-1 align-top">
                  {sibling.educational_attainment || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const SiblingsEditorModal = ({ open, rows, onClose, onSave }) => {
    const [localRows, setLocalRows] = useState(() =>
      sanitizeSiblingRows(rows, { keepEmptyRows: true })
    );

    useEffect(() => {
      if (open) {
        setLocalRows(sanitizeSiblingRows(rows, { keepEmptyRows: true }));
      }
    }, [rows, open]);

    const handleChange = (index, field, value) => {
      const filterMap = {
        first_name: filterAlphabetsOnly,
        last_name: filterAlphabetsOnly,
        age: filterNumbersOnly,
        job_occupation: filterGeneralText,
        company_school: filterGeneralText,
        educational_attainment: filterGeneralText,
      };
      const filterFn = filterMap[field];
      const filteredValue = filterFn ? filterFn(value) : value;
      setLocalRows((prev) =>
        prev.map((row, idx) =>
          idx === index ? { ...row, [field]: filteredValue } : row
        )
      );
    };

    const handleAddRow = () => {
      setLocalRows((prev) => [...prev, createEmptySiblingRow()]);
    };

    const handleRemoveRow = (index) => {
      setLocalRows((prev) => {
        const next = prev.filter((_, idx) => idx !== index);
        return next.length ? next : [createEmptySiblingRow()];
      });
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      onSave(localRows);
    };

    if (!open) return null;

    return (
      <Modal>
        <form
          data-pdf-hide
          className="rounded-lg shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1F2937]">
              Edit Siblings
            </h3>
            <button
              type="button"
              className="text-sm text-[#6B7280] hover:text-[#374151] cursor-pointer hover:scale-110"
              onClick={onClose}
            >
              <X />
            </button>
          </div>

          <div className="space-y-8">
            {localRows.map((sibling, index) => (
              <div
                key={`sibling-editor-${index}`}
                className="p-4 border border-[#E5E7EB] rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-[#374151]">
                    Sibling {index + 1}
                  </p>
                  {localRows.length > 1 && (
                    <button
                      type="button"
                      variant="secondary"
                      className="text-upmaroon hover:text-red-700 cursor-pointer hover:scale-110 relative flex items-center gap-1 text-sm font-medium transition-all duration-200 ease-in-out"
                      onClick={() => handleRemoveRow(index)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    type="text"
                    value={sibling.first_name}
                    onChange={(e) =>
                      handleChange(index, "first_name", e.target.value)
                    }
                    required
                  />
                  <FormField
                    label="Last Name"
                    type="text"
                    value={sibling.last_name}
                    onChange={(e) =>
                      handleChange(index, "last_name", e.target.value)
                    }
                    required
                  />
                  <FormField
                    label="Sex"
                    type="select"
                    value={sibling.sex}
                    onChange={(e) => handleChange(index, "sex", e.target.value)}
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                    ]}
                    required
                  />
                  <FormField
                    label="Age"
                    type="text"
                    value={sibling.age}
                    onChange={(e) => handleChange(index, "age", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    label="Job/Occupation"
                    type="text"
                    value={sibling.job_occupation}
                    onChange={(e) =>
                      handleChange(index, "job_occupation", e.target.value)
                    }
                  />
                  <FormField
                    label="Company/School"
                    type="text"
                    value={sibling.company_school}
                    onChange={(e) =>
                      handleChange(index, "company_school", e.target.value)
                    }
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    label="Educational Attainment"
                    type="text"
                    value={sibling.educational_attainment}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "educational_attainment",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button type="button" variant="secondary" onClick={handleAddRow}>
              + Add Sibling
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal >
    );
  };

  const SchoolRecordsEditorModal = ({
    open,
    records,
    onClose,
    onSave,
    shouldUseRegionDropdown,
    regionOptions,
  }) => {
    const deriveRecords = useCallback(() => {
      const sanitized = sanitizeSchoolRecordRows(records, {
        keepEmptyRows: true,
      });
      const ensured = ensureRequiredSchoolLevels(sanitized);
      const currentGpa = getSeniorHighGpaValue(ensured);
      return applySeniorHighGpaValue(ensured, currentGpa);
    }, [records]);

    const [localRecords, setLocalRecords] = useState(() => deriveRecords());
    const [seniorHighGpa, setSeniorHighGpa] = useState(() =>
      safeTrim(getSeniorHighGpaValue(localRecords))
    );

    useEffect(() => {
      if (open) {
        const nextRecords = deriveRecords();
        setLocalRecords(nextRecords);
        setSeniorHighGpa(safeTrim(getSeniorHighGpaValue(nextRecords)));
      }
    }, [records, open, deriveRecords]);

    const levelDefinitions = [
      { key: "Primary", label: "Primary School", required: true },
      { key: "Junior High", label: "Junior High School", required: true },
      { key: "Senior High", label: "Senior High School", required: true },
      { key: "College", label: "College", required: false },
    ];

    const updateRecordField = (index, field, value, filterFn = null) => {
      const filteredValue = filterFn ? filterFn(value) : value;
      setLocalRecords((prev) =>
        prev.map((record, idx) =>
          idx === index ? { ...record, [field]: filteredValue } : record
        )
      );
    };

    const addRecordForLevel = (levelKey) => {
      setLocalRecords((prev) => [
        ...prev,
        {
          ...createEmptySchoolRecordRow(),
          education_level: levelKey,
        },
      ]);
    };

    const removeRecordAt = (levelKey, globalIndex) => {
      setLocalRecords((prev) => {
        const levelCount = prev.filter(
          (record) =>
            (record.education_level || "").toLowerCase() ===
            levelKey.toLowerCase()
        ).length;
        const isRequired = REQUIRED_SCHOOL_LEVELS.some(
          (requiredLevel) =>
            requiredLevel.toLowerCase() === levelKey.toLowerCase()
        );
        if (isRequired && levelCount <= 1) {
          return prev;
        }
        return prev.filter((_, idx) => idx !== globalIndex);
      });
    };

    const handleSeniorHighGpaChange = (value) => {
      const filtered = filterDecimalNumbers(value);
      setSeniorHighGpa(filtered);
      setLocalRecords((prev) => applySeniorHighGpaValue(prev, filtered));
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const syncedRecords = applySeniorHighGpaValue(
        localRecords,
        seniorHighGpa
      );
      onSave(syncedRecords);
    };

    if (!open) return null;

    return (
      <Modal>
        <form
          data-pdf-hide
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1F2937]">
              Edit Previous School Records
            </h3>
            <button
              type="button"
              className="text-sm text-[#6B7280] hover:text-[#374151] hover:scale-110"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="space-y-10">
            {levelDefinitions.map((level) => {
              const levelEntries = localRecords
                .map((record, idx) => ({ record, idx }))
                .filter(
                  ({ record }) =>
                    normalizeEducationLevel(record.education_level).toLowerCase() ===
                    level.key.toLowerCase()
                );
              const levelLabel = level.label;
              return (
                <section
                  key={level.key}
                  className="border border-[#E5E7EB] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-[#1F2937]">
                      {levelLabel}
                    </h4>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => addRecordForLevel(level.key)}
                      className="text-xs"
                    >
                      + Add {level.key} Record
                    </Button>
                  </div>
                  {level.key === "Senior High" && (
                    <div className="mt-2 mb-4">
                      <FormField
                        label="Senior High Gen. Ave."
                        type="text"
                        value={seniorHighGpa}
                        onChange={(e) => handleSeniorHighGpaChange(e.target.value)}
                      />
                    </div>
                  )}
                  {levelEntries.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">
                      No {level.key.toLowerCase()} records yet.
                    </p>
                  ) : (
                    levelEntries.map(({ record, idx: globalIndex }, entryIdx) => (
                      <div
                        key={`${level.key}-${globalIndex}`}
                        className="border border-[#F3F4F6] rounded-md p-4 mb-4 last:mb-0"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-[#374151]">
                            {level.key} Record {entryIdx + 1}
                          </p>
                          <div className="flex gap-2">
                            {(levelEntries.length > 1 ||
                              !level.required) && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="text-xs"
                                  onClick={() =>
                                    removeRecordAt(level.key, globalIndex)
                                  }
                                >
                                  Remove
                                </Button>
                              )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="School Name"
                            type="text"
                            value={record.school_name}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "school_name",
                                e.target.value,
                                filterGeneralText
                              )
                            }
                            required
                          />
                          <FormField
                            label="Address Line 1"
                            type="text"
                            value={record.address_line_1}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "address_line_1",
                                e.target.value,
                                filterGeneralText
                              )
                            }
                            required
                          />
                          <FormField
                            label="Barangay"
                            type="text"
                            value={record.barangay}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "barangay",
                                e.target.value,
                                filterGeneralText
                              )
                            }
                            required
                          />
                          <FormField
                            label="City / Municipality"
                            type="text"
                            value={record.city_municipality}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "city_municipality",
                                e.target.value,
                                filterGeneralText
                              )
                            }
                            required
                          />
                          <FormField
                            label="Province"
                            type="text"
                            value={record.province}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "province",
                                e.target.value,
                                filterGeneralText
                              )
                            }
                            required
                          />
                          {shouldUseRegionDropdown ? (
                            <FormField
                              label="Region"
                              type="select"
                              value={record.region}
                              onChange={(e) =>
                                updateRecordField(
                                  globalIndex,
                                  "region",
                                  e.target.value
                                )
                              }
                              options={regionOptions}
                              required
                            />
                          ) : (
                            <FormField
                              label="Region"
                              type="text"
                              value={record.region}
                              onChange={(e) =>
                                updateRecordField(
                                  globalIndex,
                                  "region",
                                  e.target.value,
                                  filterGeneralText
                                )
                              }
                              required
                            />
                          )}
                          <FormField
                            label="ZIP Code"
                            type="text"
                            value={record.zip_code}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "zip_code",
                                e.target.value,
                                filterNumbersOnly
                              )
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <FormField
                            label="Start Year"
                            type="text"
                            value={record.start_year}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "start_year",
                                e.target.value,
                                filterNumbersOnly
                              )
                            }
                            required
                          />
                          <FormField
                            label="End Year"
                            type="text"
                            value={record.end_year}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "end_year",
                                e.target.value,
                                filterNumbersOnly
                              )
                            }
                            required
                          />
                          <FormField
                            label="Honors Received"
                            type="text"
                            value={record.honors_received}
                            onChange={(e) =>
                              updateRecordField(
                                globalIndex,
                                "honors_received",
                                e.target.value,
                                filterGeneralText
                              )
                            }
                          />
                        </div>
                      </div>
                    ))
                  )}
                </section>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Records
            </Button>
          </div>
        </form>
      </Modal>
    );
  };

  const ActivitiesEditorModal = ({
    open,
    rows,
    onClose,
    onSave,
    title,
    nameLabel,
  }) => {
    const [localRows, setLocalRows] = useState(() =>
      sanitizeTableRows(rows, { keepEmptyRows: true })
    );

    useEffect(() => {
      if (open) {
        setLocalRows(sanitizeTableRows(rows, { keepEmptyRows: true }));
      }
    }, [rows, open]);

    const handleChange = (index, field, value, filterFn = null) => {
      const filteredValue = filterFn ? filterFn(value) : value;
      setLocalRows((prev) =>
        prev.map((row, idx) =>
          idx === index ? { ...row, [field]: filteredValue } : row
        )
      );
    };

    const handleAddRow = () => {
      setLocalRows((prev) => [...prev, createEmptyRow()]);
    };

    const handleRemoveRow = (index) => {
      setLocalRows((prev) => {
        const next = prev.filter((_, idx) => idx !== index);
        return next.length ? next : [createEmptyRow()];
      });
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      onSave(localRows);
    };

    if (!open) return null;

    return (
      <Modal>
        <form
          data-pdf-hide
          className="bg-white rounded-lg shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1F2937]">{title}</h3>
            <button
              type="button"
              className="text-sm text-[#6B7280] hover:text-[#374151] hover:scale-115 cursor-pointer"
              onClick={onClose}
            >
              <X />
            </button>
          </div>

          <div className="space-y-8">
            {localRows.map((row, index) => (
              <div
                key={`activity-${index}`}
                className="border border-[#E5E7EB] rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-[#374151]">
                    Organization {index + 1}
                  </p>
                  {localRows.length > 1 && (
                    <button
                      type="button"
                      variant="secondary"
                      className="text-upmaroon hover:text-[]] cursor-pointer hover:scale-110 relative flex items-center gap-1 text-sm font-medium transition-all duration-200 ease-in-out"
                      onClick={() => handleRemoveRow(index)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Semester"
                    type="select"
                    value={row.semester}
                    onChange={(e) =>
                      handleChange(index, "semester", e.target.value)
                    }
                    options={[
                      { value: "", label: "Select" },
                      ...SEMESTER_OPTIONS,
                    ]}
                    required
                  />
                  <FormField
                    label="School Year Start"
                    type="text"
                    value={row.school_year_start}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "school_year_start",
                        e.target.value,
                        filterNumbersOnly
                      )
                    }
                    required
                  />
                  <FormField
                    label="School Year End"
                    type="text"
                    value={row.school_year_end}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "school_year_end",
                        e.target.value,
                        filterNumbersOnly
                      )
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    label={nameLabel}
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "name",
                        e.target.value,
                        filterGeneralText
                      )
                    }
                    required
                  />
                  <FormField
                    label="Position"
                    type="text"
                    value={row.position}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "position",
                        e.target.value,
                        filterGeneralText
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button type="button" variant="secondary" onClick={handleAddRow}>
              + Add Entry
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    );
  };

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
              <CustomRadio
                key={option.value}
                name="closest_to"
                value={option.value}
                label={option.label}
                checked={selectedValue === option.value}
                onChange={() => handleClosestOptionChange(option.value)}
                disabled={!canEdit}
                className="mr-2"
              />
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

      <div
        className="pdf w-[8.5in] bg-white p-8 leading-tight"
        ref={pdfRef}
        style={{ fontSize: "11px", width: "816px" }}
      >
        <fieldset
          disabled={isStudentUser}
          style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}
        >
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
          <div
            className="SCIF-section-1 SCIF-section"
            style={{ pageBreakAfter: "always" }}
          >
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
                    readOnly={!canEditPersonalData}
                    disabled={!canEditPersonalData}
                  />
                  <input
                    type="text"
                    value={formState.first_name}
                    onChange={(e) =>
                      handleFieldChange("first_name", e.target.value)
                    }
                    readOnly={!canEditPersonalData}
                    disabled={!canEditPersonalData}
                  />
                  <input
                    type="text"
                    value={formState.middle_name}
                    onChange={(e) =>
                      handleFieldChange("middle_name", e.target.value)
                    }
                    readOnly={!canEditPersonalData}
                    disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
                    />
                  </label>
                  {errors.religion && (
                    <div className="error-state-message">{errors.religion}</div>
                  )}
                </div>
                <div className="-mt-2">
                  <label>
                    BIRTH RANK:
                    <input
                      type="text"
                      value={formState.birth_rank}
                      onChange={(e) =>
                        handleFieldChange("birth_rank", e.target.value)
                      }
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
                    />
                  </label>
                </div>
              </div>
              <div className="SCIF-inline flex-row">
                <div className="-mt-2">
                  <label className="field-lg">
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
                        disabled={!canEditPersonalData || enumsLoading}
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
                        readOnly={!canEditPersonalData}
                        disabled={!canEditPersonalData}
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
                  <label className="field-sm">
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
                      readOnly={!canEditPersonalData}
                      disabled={!canEditPersonalData}
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
                    readOnly={!canEditPersonalData}
                    disabled={!canEditPersonalData}
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
                    readOnly={!canEditPersonalData}
                    disabled={!canEditPersonalData}
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
                    readOnly={!canEditPersonalData}
                    disabled={!canEditPersonalData}
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
                        handleFieldChange(
                          "father_job_occupation",
                          e.target.value
                        )
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
                        handleFieldChange(
                          "father_company_agency",
                          e.target.value
                        )
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
                  <label>
                    <span>Contact No.: </span>
                    <input
                      type="text"
                      value={formState.father_contact_number}
                      onChange={(e) =>
                        handleFieldChange(
                          "father_contact_number",
                          e.target.value
                        )
                      }
                      readOnly={!canEdit}
                    />
                  </label>
                </div>
                <div className="SCIF-inline flex-row">
                  <div className="-mt-2">
                    <label className="field-lg">
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
                        handleFieldChange(
                          "mother_job_occupation",
                          e.target.value
                        )
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
                        handleFieldChange(
                          "mother_company_agency",
                          e.target.value
                        )
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
                  <label>
                    <span>Contact No.: </span>
                    <input
                      type="text"
                      value={formState.mother_contact_number}
                      onChange={(e) =>
                        handleFieldChange(
                          "mother_contact_number",
                          e.target.value
                        )
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
                    alt={`${profileData?.first_name || ""} ${profileData?.last_name || ""
                      } ID`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
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
                readOnly={!canEditPersonalData}
                disabled={!canEditPersonalData}
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
                readOnly={!canEditPersonalData}
                disabled={!canEditPersonalData}
              />
              <div className="error-state-message text-center">
                {errors.degree_program}
              </div>
              <label>DEGREE PROGRAM</label>

              <input
                type="text"
                readOnly={!canEditPersonalData}
                disabled={!canEditPersonalData}
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
                <label>
                  Semester / AY:
                  <input
                    type="text"
                    value={graduationInfo.semester}
                    onChange={(e) =>
                      handleGraduationFieldChange("semester", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
                <label>DATE OF GRADUATION</label>
                <input
                  type="text"
                  value={graduationInfo.graduation_date}
                  onChange={(e) =>
                    handleGraduationFieldChange(
                      "graduation_date",
                      e.target.value
                    )
                  }
                  readOnly={!canEdit}
                />
                <label>DEGREE PROGRAM</label>
                <input
                  type="text"
                  value={graduationInfo.graduation_degree_program}
                  onChange={(e) =>
                    handleGraduationFieldChange(
                      "graduation_degree_program",
                      e.target.value
                    )
                  }
                  readOnly={!canEdit}
                />
                <label>HONORS RECEIVED</label>
                <input
                  type="text"
                  value={graduationInfo.honors_received}
                  onChange={(e) =>
                    handleGraduationFieldChange(
                      "honors_received",
                      e.target.value
                    )
                  }
                  readOnly={!canEdit}
                />
              </div>
            </div>
          </div>
          <div className="SCIF-section" style={{ marginTop: "10px" }}>
            <div>
              <SiblingsTable rows={siblingRows} />
            </div>
          </div>
          <div className="SCIF-section">
            <div className="-mt-10">
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
                      handleFieldChange(
                        "guardian_contact_number",
                        e.target.value
                      )
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
                    Relationship to guardian:{" "}
                    <input
                      type="text"
                      value={
                        formState.guardian_relationship_to_guardian || "N/A"
                      }
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
                  <label className="field-xm">
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
            <div className="mb-5 font-bold -mt-10">HEALTH DATA:</div>
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
                    onChange={(e) =>
                      handleFieldChange("height", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
                <label className="">
                  Weight (kg):
                  <input
                    type="text"
                    value={formState.weight}
                    onChange={(e) =>
                      handleFieldChange("weight", e.target.value)
                    }
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

            <div className="flex justify-between gap-4 -mt-10">
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

            <div className="flex justify-between -mt-8 gap-4">
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

            <div className="-mt-8">
              <label>
                Reason:{" "}
                <AutoResizeTextarea
                  value={
                    formState.reason_of_hospitalization || "Not Applicable"
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "reason_of_hospitalization",
                      e.target.value
                    )
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
          </div>
          <div className="SCIF-section school">
            <div className="mb-5 -mt-6 font-bold">PREVIOUS SCHOOL RECORD</div>
            <PreviousSchoolRecordsTable records={schoolRecordRows} />
            <label className="field-xs flex justify-end">
              <span>Senior High GPA:</span>
              <input
                type="text"
                value={formState.senior_high_gpa}
                onChange={(e) =>
                  handleFieldChange(
                    "senior_high_gpa",
                    e.target.value
                  )
                }
                readOnly={!canEdit}
              />
            </label>
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
          <div className="SCIF-section" style={{ pageBreakInside: "avoid" }}>
            <div className="mb-5 -mt-6 font-bold">
              MEMBERSHIP TO ORGANIZATION IN COLLEGE (Do not fill out this yet)
            </div>
            {canEdit && (
              <div className="flex justify-end -mt-14" data-pdf-hide>
                <button
                  type="button"
                  className="text-white text-xs font-semibold flex relative items-center gap-2 hover:scale-105 transition-all duration-300 ease-in-out bg-upmaroon hover:bg-red-[#991B1B] p-2 rounded"
                  onClick={() => handleOpenModal("organizations")}
                >
                  <Pencil size={16} /> Edit Organization/s Record
                </button>
              </div>
            )}
            <table className="scif-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Name of Organization</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {organizationRows.map((org, idx) => (
                  <tr key={`organization-row-${idx}`}>
                    <td>
                      {formatAcademicYearLabel(
                        org.semester,
                        org.school_year_start,
                        org.school_year_end
                      ) ||
                        org.year ||
                        "-"}
                    </td>
                    <td>{org.name || "-"}</td>
                    <td>{org.position || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="SCIF-section" style={{ pageBreakInside: "avoid" }}>
            <div className="mb-5 font-bold -mt-2">
              AWARDS RECEIVED WHILE IN COLLEGE (leave this portion blank)
            </div>
            {canEdit && (
              <div className="flex justify-end -mt-14" data-pdf-hide>
                <button
                  type="button"
                  className="text-white text-xs font-semibold flex relative items-center gap-2 hover:scale-105 transition-all duration-300 ease-in-out bg-upmaroon hover:bg-red-[#991B1B] p-2 rounded"
                  onClick={() => handleOpenModal("awards")}
                >
                  <Pencil size={16} /> Edit Award/s Received
                </button>
              </div>
            )}
            <table className="scif-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Award</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {awardRows.map((award, idx) => (
                  <tr key={`award-row-${idx}`}>
                    <td>
                      {formatAcademicYearLabel(
                        award.semester,
                        award.school_year_start,
                        award.school_year_end
                      ) ||
                        award.year ||
                        "-"}
                    </td>
                    <td>{award.name || "-"}</td>
                    <td>{award.position || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="SCIF-section" style={{ pageBreakInside: "avoid" }}>
            <div className="mb-5 -mt-4 font-bold">OTHER PERSONAL INFORMATION</div>
            <div className="-mt-6">
              <label>
                <span className="label">
                  Why did you enroll in UP Mindanao?{" "}
                </span>
                <AutoResizeTextarea
                  value={formState.enrollment_reason || ""}
                  onChange={(e) =>
                    handleFieldChange("enrollment_reason", e.target.value)
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <div className="flex gap-4 mt-3 flex-wrap items-center">
                <span className="font-semibold">
                  Does your program match your goal?
                </span>
                <div className="flex gap-6 flex-row">
                  <CustomRadio
                    name="degree_program_aspiration"
                    value="yes"
                    label="Yes"
                    checked={formState.degree_program_aspiration === true}
                    onChange={() =>
                      handleFieldChange("degree_program_aspiration", true)
                    }
                    disabled={!canEdit}
                  />
                  <CustomRadio
                    name="degree_program_aspiration"
                    value="no"
                    label="No"
                    checked={formState.degree_program_aspiration === false}
                    onChange={() =>
                      handleFieldChange("degree_program_aspiration", false)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <label className="field-lg ml-4 flex-1">
                  If not, why?
                  <input
                    type="text"
                    value={formState.aspiration_explanation || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "aspiration_explanation",
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
            <div className="-mt-8">
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
            <div className="-mt-8">
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
            <div className="-mt-8">
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
            <div className="-mt-8">
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
            <div className="-mt-4">
              <label>
                Personal Characteristics:
                <AutoResizeTextarea
                  value={formState.personal_characteristics || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "personal_characteristics",
                      e.target.value
                    )
                  }
                  readOnly={!canEdit}
                />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <div className="flex justify-between gap-4 mt-3">
                <label>
                  <span>Who do you open up to? </span>
                  <AutoResizeTextarea
                    value={formState.problem_confidant}
                    onChange={(e) =>
                      handleFieldChange("problem_confidant", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
              <div className="w-full gap-4 mt-4">
                <label>
                  <span>Why?</span>
                  <AutoResizeTextarea
                    value={formState.confidant_reason}
                    onChange={(e) =>
                      handleFieldChange("confidant_reason", e.target.value)
                    }
                    readOnly={!canEdit}
                  />
                </label>
              </div>
            </div>
            <div className="-mt-7">
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
              <div className="flex justify-between gap-4 mt-6">
                <label>
                  <span>Any previous counseling?</span>
                </label>
                <div className="flex gap-4 flex-row">
                  <CustomRadio
                    name="previous_counseling"
                    value="yes"
                    label="Yes"
                    checked={formState.previous_counseling === true}
                    onChange={() =>
                      handleFieldChange("previous_counseling", true)
                    }
                    disabled={!canEdit}
                  />
                  <CustomRadio
                    name="previous_counseling"
                    value="no"
                    label="No"
                    checked={formState.previous_counseling === false}
                    onChange={() =>
                      handleFieldChange("previous_counseling", false)
                    }
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
            {formState.previous_counseling && (
              <>
                <div className="SCIF-inline flex-row">
                  <div className="flex justify-between gap-4">
                    <label className="field-xl">
                      If yes, where:{" "}
                      <input
                        type="text"
                        value={formState.counseling_location || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "counseling_location",
                            e.target.value
                          )
                        }
                        readOnly={!canEdit}
                      />
                    </label>
                    <label className="field-md">
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
                <div className="-mt-10">
                  <label>
                    Why?
                    <AutoResizeTextarea
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
          <div className="flex justify-end mt-5">
            <div className="flex flex-col gap-1">
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
          <div>
            {canViewPsychSections && (
              <div className="SCIF-section" style={{ pageBreakInside: "avoid" }}>

                <div className="font-bold text-[12px] mt-10">PSYCHOMETRIC DATA</div>
                {canEdit && (
                  <div className="flex justify-end -mt-14" data-pdf-hide>
                    <button
                      type="button"
                      className="text-white text-xs font-semibold flex relative items-center gap-2 hover:scale-105 transition-all duration-300 ease-in-out bg-upmaroon hover:bg-red-[#991B1B] p-2 rounded"
                      onClick={handleAddPsychometricRow}
                    >
                      <Plus size={16} /> Add Psychometric Record
                    </button>
                  </div>
                )}
                {psychometricRows.length === 0 ? (
                  <p className="text-sm mt-6 text-[#525252]">
                    No psychometric data recorded.
                  </p>
                ) : (

                  <table className="psychometric-table">
                    <thead>
                      <tr>
                        <th>Date of Testing</th>
                        <th>Name of Test</th>
                        <th>Raw Score</th>
                        <th>Percentile/IQ</th>
                        <th>Classification</th>
                        {canEdit && <th data-pdf-hide>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {psychometricRows.map((row, idx) => (
                        <tr key={row.id ?? idx}>
                          <td>
                            {canEdit ? (
                              <input
                                type="date"
                                className="w-full px-2 py-1 text-xs border border-[#D4D4D4] rounded"
                                value={row.testing_date || ""}
                                onChange={(e) =>
                                  handlePsychometricChange(
                                    idx,
                                    "testing_date",
                                    e.target.value
                                  )
                                }
                              />
                            ) : row.testing_date ? (
                              new Date(row.testing_date).toLocaleDateString()
                            ) : (
                              ""
                            )}
                          </td>
                          <td>
                            {canEdit ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-xs border border-[#D4D4D4] rounded"
                                value={row.test_name || ""}
                                onChange={(e) =>
                                  handlePsychometricChange(
                                    idx,
                                    "test_name",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              row.test_name || ""
                            )}
                          </td>
                          <td>
                            {canEdit ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-xs border border-[#D4D4D4] rounded"
                                value={row.raw_score || ""}
                                onChange={(e) =>
                                  handlePsychometricChange(
                                    idx,
                                    "raw_score",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              row.raw_score || ""
                            )}
                          </td>
                          <td>
                            {canEdit ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-xs border border-[#D4D4D4] rounded"
                                value={row.percentile || ""}
                                onChange={(e) =>
                                  handlePsychometricChange(
                                    idx,
                                    "percentile",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              row.percentile || ""
                            )}
                          </td>
                          <td>
                            {canEdit ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-xs border border-[#D4D4D4] rounded"
                                value={row.classification || ""}
                                onChange={(e) =>
                                  handlePsychometricChange(
                                    idx,
                                    "classification",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              row.classification || ""
                            )}
                          </td>
                          {canEdit && (
                            <td data-pdf-hide>
                              <button
                                type="button"
                                className="text-[#B91C1C] text-xs underline"
                                onClick={() => handleRemovePsychometricRow(idx)}
                                data-pdf-hide
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            <div style={{ pageBreakInside: "avoid" }}>
              <div className="SCIF-section">
                <div className="section-title">
                  GUIDANCE SERVICES SPECIALIST’ NOTES: (Leave it blank)
                </div>
                <textarea
                  className="guidance-notes"
                  rows={5}
                  readOnly={!canEdit}
                  placeholder="No notes added."
                  value={formState.guidance_notes || ""}
                  onChange={(e) =>
                    handleFieldChange("guidance_notes", e.target.value)
                  }
                />
                <div className="text-xs italic text-[#525252] flex flex-wrap gap-x-4 gap-y-1 mb-4 -mt-2" data-pdf-hide>
                  <span>Date modified: {guidanceNotesLastModified} by: {guidanceNotesUpdatedBy}</span>
                </div>
              </div>
              <div className="font-bold mb-5">Privacy Statement: </div>
              <div className="font-bold  mt-5 text-justify">
                The University of the Philippines takes your privacy seriously
                and we are committed to protecting your personal information.
                For the UP Privacy Policy, please visit{" "}
                <a
                  href="https://privacy.up.edu.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://privacy.up.edu.ph
                </a>
              </div>
              <div className="flex justify-between">
                <CustomCheckbox
                  name="has_consented"
                  value="true"
                  checked={privacy_consent.has_consented === true}
                  onChange={() => { }}
                  disabled
                />

                <span className="text-justify -ml-50 mt-4">
                  I have read the University of the Philippines' Privacy Notice
                  for Students. I understand that for the UP System to carry out
                  its mandate under the 1987 Constitution, the UP Charter, and
                  other laws, the University must necessarily process my
                  personal and sensitive personal information. Therefore, I
                  recognize the authority of the University of the Philippines
                  to process my personal and sensitive personal information,
                  pursuant to the UP Privacy Notice and applicable laws.
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <label className="field-md">
                  Name of Student:{" "}
                  <input type="text" value={formState.name} readOnly />
                </label>
                <label>
                  Signature of Student:{" "}
                  <input type="text" readOnly={!canEdit} />
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
          </div>
        </fieldset>
      </div>
      {activeModalType === "siblings" && (
        <SiblingsEditorModal
          open
          rows={siblingRows}
          onClose={closeModal}
          onSave={handleSaveSiblings}
        />
      )}
      {activeModalType === "schoolRecords" && (
        <SchoolRecordsEditorModal
          open
          records={schoolRecordRows}
          onClose={closeModal}
          onSave={handleSaveSchoolRecords}
          shouldUseRegionDropdown={shouldUseRegionDropdown}
          regionOptions={regionOptions}
        />
      )}
      {activeModalType === "organizations" && (
        <ActivitiesEditorModal
          open
          rows={organizationRows}
          onClose={closeModal}
          onSave={handleSaveOrganizations}
          title="Edit Organization Memberships"
          nameLabel="Name of Organization"
        />
      )}
      {activeModalType === "awards" && (
        <ActivitiesEditorModal
          open
          rows={awardRows}
          onClose={closeModal}
          onSave={handleSaveAwards}
          title="Edit Awards"
          nameLabel="Award"
        />
      )}
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
