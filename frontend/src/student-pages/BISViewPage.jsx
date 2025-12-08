import React, { useEffect, useRef, useState, useContext } from "react";
import "./css/BISpdf.css";
import "../forms/SetupProfile/css/multistep.css";
import FormHeader from "./FormHeader";
import { useNavigate } from "react-router-dom";
import AutoResizeTextarea from "../components/AutoResizeTextarea";
import html2pdf from "html2pdf.js";
import Button from "../components/UIButton";
import ToastMessage from "../components/ToastMessage";
import ConfirmDialog from "../components/ConfirmDialog";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import BackToTopButton from "../components/BackToTop";
import Loader from "../components/Loader";
import {
  validatePreferences,
  validateSupport,
  validateSocioEconomicStatus,
  validateScholasticStatus,
} from "../utils/BISValidation";
import CustomCheckbox from "../components/CustomCheckbox";

const BISProfileView = ({ profileData, formData, isAdmin = false }) => {
  const pdfRef = useRef();
  const { role } = useContext(AuthContext);
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [cachedShiftData, setCachedShiftData] = useState({
    planned_shift_degree: "",
    reason_for_shifting: "",
  });
  const [cachedSupportNotes, setCachedSupportNotes] = useState({});
  const [cachedTransferReason, setCachedTransferReason] = useState("");
  const [cachedNextPlan, setCachedNextPlan] = useState("");
  const [originalFormState, setOriginalFormState] = useState({});
  const [formState, setFormState] = useState({
    name: `${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}`,
    nickname: profileData.nickname || "",
    year_course: `${profileData.current_year_level} - ${profileData.degree_program}`,
    support: [],
    scholarship_notes: "",
    combination_notes: "",
    others_notes: "",
    scholarships: "",
    scholarship_privileges: "",
    monthly_allowance: "",
    spending_habit: "",
    influence: "",
    reason_for_enrolling: "",
    transfer_plans: "No",
    transfer_reason: "",
    shift_plans: "No",
    planned_shift_degree: "",
    reason_for_shifting: "",
    intended_course: "",
    first_choice_course: "",
    admitted_course: "",
    next_plan: "",
  });

  useEffect(() => {
    if (formData) {
      // Reverse mapping: convert backend codes back to frontend keys
      const backendToFrontendMap = {
        self: "self_supporting",
        both_parents: "both_parents",
        father_only: "father_only",
        mother_only: "mother_only",
        scholarship: "scholarship",
        combination: "combination",
        others: "others",
        gov_funded: "government_funded",
      };

      // Convert backend support codes to frontend keys
      const frontendSupport = (student_support?.support || []).map(
        (code) => backendToFrontendMap[code] || code
      );

      const newState = {
        name: `${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}`,
        nickname: profileData.nickname || "",
        year_course: `${profileData.current_year_level} - ${profileData.degree_program}`,
        support: frontendSupport,
        scholarship_notes: student_support?.other_scholarship || "",
        combination_notes: student_support?.combination_notes || "",
        others_notes: student_support?.other_notes || "",
        scholarships: socio_economic_status?.scholarships || "",
        scholarship_privileges:
          socio_economic_status?.scholarship_privileges || "",
        monthly_allowance: socio_economic_status?.monthly_allowance || "",
        spending_habit: socio_economic_status?.spending_habit || "",
        transfer_plans: preferences?.transfer_plans ? "Yes" : "No",
        influence: preferences?.influence || "",
        reason_for_enrolling: preferences?.reason_for_enrolling || "",
        transfer_reason: preferences?.transfer_reason || "",
        shift_plans: preferences?.shift_plans ? "Yes" : "No",
        planned_shift_degree: preferences?.planned_shift_degree || "",
        reason_for_shifting: preferences?.reason_for_shifting || "",
        intended_course: scholastic_status?.intended_course || "",
        first_choice_course: scholastic_status?.first_choice_course || "",
        admitted_course: scholastic_status?.admitted_course || "",
        next_plan: scholastic_status?.next_plan || "",
      };
      setFormState(newState);
      setOriginalFormState(newState);
      setCachedShiftData({
        planned_shift_degree: preferences?.planned_shift_degree || "",
        reason_for_shifting: preferences?.reason_for_shifting || "",
      });
    }
  }, [formData, profileData]);

  const handleDownloadClick = () => {
    setShowDownloadConfirm(true);
  };

  const handleConfirmDownload = async () => {
    setShowDownloadConfirm(false);
    await handleDownload();
    setDownloadToast("Download started!");
  };

  const handleCancelDownload = () => {
    setShowDownloadConfirm(false);
    setDownloadToast("Download cancelled.");
  };

  const handleDownload = async () => {
    const element = pdfRef.current;
    if (!element) return;

    element.classList.add("pdf-mode");

    const clone = element.cloneNode(true);
    const elementWidth =
      element.getBoundingClientRect().width || element.offsetWidth || 800;
    const printableWidth = Math.min(elementWidth, 720); // ~7.5in at 96dpi
    clone.style.maxWidth = `${printableWidth}px`;
    clone.style.width = `${printableWidth}px`;
    clone.style.boxSizing = "border-box";
    clone.style.backgroundColor = "#ffffff";
    clone.style.margin = "0 auto";
    clone.style.padding = window.getComputedStyle(element).padding || "0.5in";

    const workingWrapper = document.createElement("div");
    workingWrapper.style.position = "fixed";
    workingWrapper.style.left = "-10000px";
    workingWrapper.style.top = "0";
    workingWrapper.style.zIndex = "-1";
    workingWrapper.appendChild(clone);
    document.body.appendChild(workingWrapper);

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

    cloneFields.forEach((cloneEl, index) => {
      const originalEl = originalFields[index];
      if (!originalEl) return;

      const type = originalEl.getAttribute("type") || cloneEl.type || "";
      if (type === "button" || type === "submit") return;

      const computed = window.getComputedStyle(originalEl);
      const rect = originalEl.getBoundingClientRect();

      /* ---------------------------
     CHECKBOX HANDLING
  ---------------------------- */
      if (type === "checkbox") {
        const isPrivacyConsent =
          cloneEl.name === "has_consented" ||
          cloneEl.closest(".privacy-consent");

        const indicator = document.createElement("span");
        indicator.className = "pdf-checkbox-indicator";
        if (isPrivacyConsent)
          indicator.classList.add("pdf-checkbox-indicator--privacy");
        indicator.textContent = originalEl.checked ? "☑" : "☐";
        indicator.setAttribute(
          "data-checked",
          originalEl.checked ? "true" : "false"
        );

        // Font & spacing
        indicator.style.fontSize = computed.fontSize;
        indicator.style.lineHeight = "1";
        indicator.style.marginRight = "4px";

        const parentLabel = cloneEl.closest("label");
        if (parentLabel) {
          const privacyText = parentLabel.querySelector(".privacy-consent-text");
          if (privacyText && isPrivacyConsent) {
            privacyText.parentNode.insertBefore(indicator, privacyText);
          } else {
            parentLabel.insertBefore(indicator, cloneEl);
          }
          parentLabel.removeChild(cloneEl);

          parentLabel.style.display = "flex";
          parentLabel.style.gap = isPrivacyConsent ? "0.75rem" : "4px";
          parentLabel.style.alignItems = isPrivacyConsent
            ? "center"
            : "center";
          if (!isPrivacyConsent) {
            parentLabel.style.marginBottom = "4px";
          }
        } else {
          cloneEl.replaceWith(indicator);
        }
        return;
      }

      /* ---------------------------
     GET VALUE
  ---------------------------- */
      let value = originalEl.value || "";
      if (cloneEl.tagName === "SELECT") {
        const selected = originalEl.options[originalEl.selectedIndex];
        value = selected ? selected.text : value;
      }
      if (type === "date" && value) {
        value = new Date(value).toLocaleDateString("en-CA");
      }

      /* ---------------------------
     CREATE PDF-FRIENDLY DIV
  ---------------------------- */
      const textDiv = document.createElement("div");
      textDiv.className = "pdf-field-value";

      if (cloneEl.tagName === "TEXTAREA") textDiv.classList.add("multiline");
      textDiv.textContent = value || "\u00a0";

      // Typography
      textDiv.style.fontSize = computed.fontSize;
      textDiv.style.fontFamily = computed.fontFamily;
      textDiv.style.fontWeight = computed.fontWeight;
      textDiv.style.lineHeight = "2"; // tighter lines
      textDiv.style.color = computed.color || "#000";

      // Box & spacing
      textDiv.style.boxSizing = "border-box";
      textDiv.style.whiteSpace = "pre-wrap";
      textDiv.style.wordBreak = "break-word";
      textDiv.style.width = "100%";
      textDiv.style.maxWidth = "100%";
      textDiv.style.margin = "2px 0";
      textDiv.style.padding =
        cloneEl.tagName === "SELECT"
          ? "2px 6px"
          : cloneEl.tagName === "TEXTAREA"
            ? "2px 4px"
            : "2px 4px";

      // Border
      const borderColor =
        computed.borderBottomColor &&
          computed.borderBottomColor !== "rgba(0, 0, 0, 0)"
          ? computed.borderBottomColor
          : "#000";
      const borderWidth =
        computed.borderBottomWidth && computed.borderBottomWidth !== "0px"
          ? computed.borderBottomWidth
          : "1px";
      textDiv.style.borderBottom = `${borderWidth} solid ${borderColor}`;

      // Height matching (optional)
      const height = rect.height || originalEl.offsetHeight;
      if (height && height > 0) {
        textDiv.style.minHeight = "auto"; // prevent large gaps
      }

      // Display inline-block for selects
      if (cloneEl.tagName === "SELECT") textDiv.style.display = "inline-block";

      cloneEl.replaceWith(textDiv);
    });

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore font load issues */
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
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: "BIS_Profile.pdf",
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        scrollY: 0,
      },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    try {
      await html2pdf().set(options).from(clone).save();
    } catch (error) {
      console.error("Failed to generate BIS PDF:", error);
      setDownloadToast("Unable to generate the PDF. Please try again.");
    } finally {
      element.classList.remove("pdf-mode");
      document.body.removeChild(workingWrapper);
    }
  };

  const handleReturn = () => {
    if (role === "admin" && profileData.student_number) {
      navigate(`/admin/students/${profileData.student_number}`);
    } else {
      navigate("/myprofile");
    }
  };

  const handleFieldChange = (field, value) => {
    if (role === "admin") {
      // Special handling: first_choice_course / admitted_course affect next_plan
      if (field === "first_choice_course" || field === "admitted_course") {
        setFormState((prev) => {
          const newFirst =
            field === "first_choice_course" ? value : prev.first_choice_course;
          const newAdmitted =
            field === "admitted_course" ? value : prev.admitted_course;
          // If they become the same, cache next_plan and clear it
          if (newFirst === newAdmitted) {
            setCachedNextPlan(prev.next_plan || cachedNextPlan || "");
            // clear next_plan
            setErrors((prevErr) => ({ ...prevErr, next_plan: null }));
            return { ...prev, [field]: value, next_plan: "" };
          }
          // If they differ, restore cached next_plan if any
          const restored = cachedNextPlan || prev.next_plan || "";
          if (restored) {
            setCachedNextPlan("");
          }
          return { ...prev, [field]: value, next_plan: restored };
        });
      } else {
        setFormState((prev) => ({ ...prev, [field]: value }));
      }
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    }
  };

  const handleSupportChange = (key, checked) => {
    if (role === "admin") {
      if (!checked) {
        // cache the current notes before clearing
        setCachedSupportNotes((prevNotes) => ({
          ...prevNotes,
          [key]: formState[`${key}_notes`] || "",
        }));
        setFormState((prev) => ({
          ...prev,
          support: prev.support.filter((item) => item !== key),
          [`${key}_notes`]: "",
        }));
      } else {
        // restore cached notes if available
        const restored = cachedSupportNotes[key] || "";
        setFormState((prev) => {
          // Check if key already exists to prevent duplicates
          const updatedSupport = prev.support.includes(key)
            ? prev.support
            : [...prev.support, key];
          return {
            ...prev,
            support: updatedSupport,
            [`${key}_notes`]: restored || prev[`${key}_notes`] || "",
          };
        });
        setCachedSupportNotes((prevNotes) => {
          const copy = { ...prevNotes };
          delete copy[key];
          return copy;
        });
      }
      // Clear support error when selection changes
      if (errors.support) {
        setErrors((prev) => ({ ...prev, support: null }));
      }
    }
  };

  const getChangedFields = () => {
    const changes = [];
    for (const key in formState) {
      if (formState[key] !== originalFormState[key]) {
        const displayValue = Array.isArray(formState[key])
          ? formState[key].join(", ")
          : formState[key];
        const originalValue = Array.isArray(originalFormState[key])
          ? originalFormState[key].join(", ")
          : originalFormState[key];

        changes.push({
          field: key.replace(/_/g, " ").toUpperCase(),
          original: originalValue || "(empty)",
          updated: displayValue || "(empty)",
        });
      }
    }
    return changes;
  };

  const handleSubmitClick = () => {

    // Run validation before showing modal
    const apiData = mapFormStateToAPI();

    const validationErrors = {};
    Object.assign(validationErrors, validatePreferences(apiData));
    Object.assign(validationErrors, validateSupport(apiData));
    Object.assign(validationErrors, validateSocioEconomicStatus(apiData));
    Object.assign(validationErrors, validateScholasticStatus(apiData));

    if (Object.keys(validationErrors).length > 0) {
      const fieldErrors = {};

      for (const key in validationErrors) {
        fieldErrors[key] = validationErrors[key];
      }

      setErrors(fieldErrors);
      console.error("Validation Errors:", validationErrors);
      setDownloadToast(`Validation failed. Please check the form for errors.`);
      return;
    }
    const changes = getChangedFields();
    if (changes.length === 0) {
      setDownloadToast("No changes detected.");
      return;
    }

    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false);
    await handleSubmit();
  };

  const mapFormStateToAPI = () => {
    // Map frontend support keys to backend support codes
    const supportCodeMap = {
      self_supporting: "self",
      both_parents: "both_parents",
      father_only: "father_only",
      mother_only: "mother_only",
      scholarship: "scholarship",
      combination: "combination",
      others: "others",
      government_funded: "gov_funded",
    };

    return {
      student_support: {
        support: formState.support.map((key) => supportCodeMap[key] || key),
        other_scholarship: formState.scholarship_notes,
        combination_notes: formState.combination_notes,
        other_notes: formState.others_notes,
      },

      socio_economic_status: {
        scholarships: formState.scholarships,
        scholarship_privileges: formState.scholarship_privileges,
        monthly_allowance: formState.monthly_allowance,
        spending_habit: formState.spending_habit,
        has_scholarship: !!formState.scholarships,
      },

      preferences: {
        influence: formState.influence,
        reason_for_enrolling: formState.reason_for_enrolling,
        transfer_plans: formState.transfer_plans === "Yes",
        transfer_reason: formState.transfer_reason,
        shift_plans: formState.shift_plans === "Yes",
        planned_shift_degree: formState.planned_shift_degree,
        reason_for_shifting: formState.reason_for_shifting,
      },

      scholastic_status: {
        intended_course: formState.intended_course,
        first_choice_course: formState.first_choice_course,
        admitted_course: formState.admitted_course,
        next_plan: formState.next_plan,
      },
    };
  };

  const handleSubmit = async () => {
    // Guard: ensure formData exists
    if (!formData || !formData.submission) {
      setDownloadToast("Form data not loaded. Please refresh the page.");
      return;
    }

    // 1. Convert formState → API structured data
    const apiData = mapFormStateToAPI();

    // 2. Run validations from BISValidation
    const validationErrors = {};
    Object.assign(validationErrors, validatePreferences(apiData));
    Object.assign(validationErrors, validateSupport(apiData));
    Object.assign(validationErrors, validateSocioEconomicStatus(apiData));
    Object.assign(validationErrors, validateScholasticStatus(apiData));

    // 3. If errors exist, display them
    if (Object.keys(validationErrors).length > 0) {
      const fieldErrors = {};
      let errorMessages = [];

      for (const key in validationErrors) {
        const field = key.split(".").pop();
        fieldErrors[field] = validationErrors[key];
        errorMessages.push(`${key}: ${validationErrors[key]}`);
      }

      setErrors(fieldErrors);
      console.error("Validation Errors:", validationErrors);
      setDownloadToast(`Validation failed. Please check the form for errors.`);
      return;
    }

    // 4. Send to backend using admin-edit endpoint
    try {
      const submissionId = formData.submission.id;

      const response = await request(`/api/forms/admin-edit/${submissionId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (!response) {
        setDownloadToast("Unable to reach the server. Please try again.");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Show backend validation errors if available
        if (data.errors) {
          const backendErrors = Object.entries(data.errors)
            .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
            .join("\n");
          setDownloadToast(
            `Validation errors found. Please check the form for errors.`
          );
          return;
        }
        setDownloadToast(
          data?.message || data?.error || "Failed to update form."
        );
        return;
      }

      setErrors({});
      setDownloadToast(data?.message || "Changes saved successfully.");
    } catch (error) {
      console.error("Error updating form:", error);
      setDownloadToast("Failed to update form.");
    }
  };

  if (!formData) return <Loader />;
  const {
    student_support,
    socio_economic_status,
    preferences,
    scholastic_status,
    submission,
    privacy_consent,
  } = formData;

  const supportOptions = [
    { key: "self_supporting", label: "Self-supporting" },
    { key: "both_parents", label: "Both parents" },
    { key: "father_only", label: "Father only" },
    { key: "mother_only", label: "Mother only" },
    {
      key: "scholarship",
      label: `Scholarship (${student_support.other_scholarship || "Unspecified"
        })`,
    },
    {
      key: "combination",
      label: `Combination (${student_support.combination_notes || "Unspecified"
        })`,
    },
    {
      key: "others",
      label: `Others (${student_support.other_notes || "Unspecified"})`,
    },
    { key: "government_funded", label: "Government Funded" },
  ];

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
        {role === "admin" && (
          <Button
            variant="secondary"
            onClick={handleSubmitClick}
            className="pdf-button"
          >
            Save Changes
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
              <strong>OSA-CTS Form No. 02</strong>
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

        <h3>BASIC INFORMATION SHEET</h3>
        <p className="note">
          Note: Please PROVIDE the information asked for. The data contained in
          this form will be kept confidential and will serve as your record.
          Please fill in the blanks carefully and sincerely.
        </p>

        <div className="section-title">I. PERSONAL DATA</div>
        <div className="flex-row indented-section">
          <label>
            1. Name:{" "}
            <input
              type="text"
              value={formState.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              readOnly={role !== "admin"}
              disabled
            />
            {errors.name && (
              <div class="error-state-message">{errors.name}</div>
            )}
          </label>
          <label>
            2. Nickname:{" "}
            <input
              type="text"
              value={formState.nickname}
              onChange={(e) => handleFieldChange("nickname", e.target.value)}
              readOnly={role !== "admin"}
              disabled
            />
            {errors.nickname && (
              <div class="error-state-message">{errors.nickname}</div>
            )}
          </label>
          <label>
            3. Year & Course:{" "}
            <input
              type="text"
              value={formState.year_course}
              onChange={(e) => handleFieldChange("year_course", e.target.value)}
              readOnly={role !== "admin"}
              disabled
            />
            {errors.year_course && (
              <div class="error-state-message">{errors.year_course}</div>
            )}
          </label>
        </div>

        <div className="section-title">II. SOCIO-ECONOMIC STATUS</div>
        <div className="indented-section">
          <label>
            4. What is your means of support for your college education?
          </label>
          <ul className="checkbox-list indented-section">
            {supportOptions.map(({ key, label }) => {
              const hasInput = [
                "scholarship",
                "combination",
                "others",
              ].includes(key);
              const isChecked =
                Array.isArray(formState.support) &&
                formState.support.includes(key);

              return (
                <li key={key} data-support-key={key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        handleSupportChange(key, e.target.checked)
                      }
                      disabled={role !== "admin"}
                    />
                    {hasInput
                      ? key.charAt(0).toUpperCase() + key.slice(1)
                      : label}
                    {hasInput && formState.support.includes(key) && (
                      <>
                        <input
                          type="text"
                          value={formState[`${key}_notes`] || ""}
                          onChange={(e) =>
                            handleFieldChange(`${key}_notes`, e.target.value)
                          }
                          readOnly={role !== "admin"}
                          style={{ marginLeft: "10px", width: "200px" }}
                          placeholder={`Specify ${key}...`}
                        />
                        {errors[`student_support.${key}_notes`] && (
                          <div
                            className="error-state-message"
                            style={{ marginLeft: "10px", marginTop: "5px" }}
                          >
                            {errors[`student_support.${key}_notes`]}
                          </div>
                        )}
                      </>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
          {(errors.support || errors["student_support.support"]) && (
            <div className="error-state-message">
              {errors.support || errors["student_support.support"]}
            </div>
          )}

          <label>
            5. What other scholarships do you have aside from UP Socialized
            Tuition System?
            <input
              type="text"
              value={formState.scholarships}
              onChange={(e) =>
                handleFieldChange("scholarships", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.scholarships && (
              <div className="error-state-message">{errors.scholarships}</div>
            )}
          </label>
          <label>
            6. What are your privileges that you specified in no. (5):{" "}
            <input
              type="text"
              value={formState.scholarship_privileges}
              onChange={(e) =>
                handleFieldChange("scholarship_privileges", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.scholarship_privileges && (
              <div className="error-state-message">
                {errors.scholarship_privileges}
              </div>
            )}
          </label>
          <label>
            7. How much is your monthly allowance to be provided by your family
            when you reach college?{" "}
            <input
              type="number"
              step="0.01"
              value={formState.monthly_allowance}
              onChange={(e) =>
                handleFieldChange("monthly_allowance", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.monthly_allowance && (
              <div className="error-state-message">
                {errors.monthly_allowance}
              </div>
            )}
          </label>
          <label>
            8. What do you spend much on?{" "}
            <input
              value={formState.spending_habit}
              onChange={(e) =>
                handleFieldChange("spending_habit", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.spending_habit && (
              <div className="error-state-message">{errors.spending_habit}</div>
            )}
          </label>
        </div>
        <div className="section-title">III. SCHOOL PREFERENCES</div>
        <div className="indented-section">
          <label>
            9. Who influenced you to study in UP Mindanao?{" "}
            <input
              type="text"
              value={formState.influence}
              onChange={(e) => handleFieldChange("influence", e.target.value)}
              readOnly={role !== "admin"}
            />
            {errors.influence && (
              <div className="error-state-message">{errors.influence}</div>
            )}
          </label>
          <label>
            10. Indicate the reason/s for enrolling in UP Mindanao:{" "}
            <input
              value={formState.reason_for_enrolling}
              onChange={(e) =>
                handleFieldChange("reason_for_enrolling", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.reason_for_enrolling && (
              <div className="error-state-message">
                {errors.reason_for_enrolling}
              </div>
            )}
          </label>
          <label>
            11. Do you have plans of transferring to another UP Campus by 2nd
            year?{" "}
            <select
              value={formState.transfer_plans}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "No") {
                  // cache transfer reason and clear
                  setCachedTransferReason(formState.transfer_reason || "");
                  setFormState((prev) => ({
                    ...prev,
                    transfer_plans: "No",
                    transfer_reason: "",
                  }));
                } else if (v === "Yes") {
                  // restore cached value
                  setFormState((prev) => ({
                    ...prev,
                    transfer_plans: "Yes",
                    transfer_reason:
                      cachedTransferReason || prev.transfer_reason || "",
                  }));
                  setCachedTransferReason("");
                } else {
                  handleFieldChange("transfer_plans", v);
                }
              }}
              disabled={role !== "admin"}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.transfer_plans && (
              <div className="error-state-message">{errors.transfer_plans}</div>
            )}
          </label>
          <label>
            12. Why or why not?{" "}
            <input
              value={formState.transfer_reason}
              onChange={(e) =>
                handleFieldChange("transfer_reason", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.transfer_reason && (
              <div className="error-state-message">
                {errors.transfer_reason}
              </div>
            )}
          </label>
          <label>
            13. Do you have plans of shifting to another degree program by 2nd
            year?{" "}
            <select
              value={formState.shift_plans}
              onChange={(e) => {
                // Cache current values before clearing
                if (e.target.value === "No") {
                  setCachedShiftData({
                    planned_shift_degree: formState.planned_shift_degree,
                    reason_for_shifting: formState.reason_for_shifting,
                  });
                  setFormState((prev) => ({
                    ...prev,
                    shift_plans: "No",
                    planned_shift_degree: "",
                    reason_for_shifting: "",
                  }));
                } else if (e.target.value === "Yes") {
                  // Restore cached values
                  setFormState((prev) => ({
                    ...prev,
                    shift_plans: "Yes",
                    planned_shift_degree: cachedShiftData.planned_shift_degree,
                    reason_for_shifting: cachedShiftData.reason_for_shifting,
                  }));
                } else {
                  handleFieldChange("shift_plans", e.target.value);
                }
              }}
              disabled={role !== "admin"}
            >
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.shift_plans && (
              <div className="error-state-message">{errors.shift_plans}</div>
            )}
          </label>
          <label>
            14. If yes, what degree program?{" "}
            <input
              type="text"
              value={formState.planned_shift_degree}
              onChange={(e) =>
                handleFieldChange("planned_shift_degree", e.target.value)
              }
              readOnly={role !== "admin" || formState.shift_plans === "No"}
            />
            {errors.planned_shift_degree && (
              <div className="error-state-message">
                {errors.planned_shift_degree}
              </div>
            )}
          </label>
          <label>
            15. Why?{" "}
            <input
              value={formState.reason_for_shifting}
              onChange={(e) =>
                handleFieldChange("reason_for_shifting", e.target.value)
              }
              readOnly={role !== "admin" || formState.shift_plans === "No"}
            />
            {errors.reason_for_shifting && (
              <div className="error-state-message">
                {errors.reason_for_shifting}
              </div>
            )}
          </label>
        </div>

        <div className="section-title">IV. PRESENT SCHOLASTIC STATUS</div>
        <div className="indented-section">
          <label>
            16. What course did you intend to take up after graduation from
            Senior High?{" "}
            <input
              type="text"
              value={formState.intended_course}
              onChange={(e) =>
                handleFieldChange("intended_course", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.intended_course && (
              <div className="error-state-message">
                {errors.intended_course}
              </div>
            )}
          </label>
          <label>
            17. What course did you indicate as 1st choice in the UPCAT
            application form?{" "}
            <input
              type="text"
              value={formState.first_choice_course}
              onChange={(e) =>
                handleFieldChange("first_choice_course", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.first_choice_course && (
              <div className="error-state-message">
                {errors.first_choice_course}
              </div>
            )}
          </label>
          <label>
            18. What course were you admitted?{" "}
            <input
              type="text"
              value={formState.admitted_course}
              onChange={(e) =>
                handleFieldChange("admitted_course", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            {errors.admitted_course && (
              <div className="error-state-message">
                {errors.admitted_course}
              </div>
            )}
          </label>
          <label>
            19. If (17) is different (18), what would be your next plan?{" "}
            <input
              value={
                formState.first_choice_course === formState.admitted_course
                  ? ""
                  : formState.next_plan || ""
              }
              onChange={(e) => handleFieldChange("next_plan", e.target.value)}
              readOnly={
                role !== "admin" ||
                formState.first_choice_course === formState.admitted_course
              }
            />
            {errors.next_plan && (
              <div className="error-state-message">{errors.next_plan}</div>
            )}
          </label>
        </div>
        <div className="signature">
          <label>
            20. I certify that all facts and information stated in this form are
            true and correct.
          </label>
          <div className="flex justify-end mt-10">
            <div className="flex flex-col gap-8">
              <div>
                <label>________________________________________</label>
                <label className="justify-center">21. Signature </label>
              </div>
            </div>
          </div>

          <label>
            22. Date Filed:{" "}
            <input
              type="date"
              value={new Date(submission.submitted_on).toLocaleDateString(
                "en-CA"
              )}
              readOnly
            />
          </label>
        </div>
        <div className="font-bold mb-5">Privacy Statement: </div>
        <div className="font-bold  mt-5 text-justify text-xs">
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

          <span className="text-xs text-justify -ml-45 mt-4">
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
            <input
              type="text"
              value={`${profileData.first_name} ${profileData.last_name}`}
              readOnly
            />
          </label>
          <label>
            Signature of Student: <input type="text" />
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

      {showSubmitConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "1000px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                marginBottom: "16px",
                fontSize: "1.3rem",
                fontWeight: "700",
                textAlign: "center",
                color: "#7b1113",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Confirm Changes
            </h2>
            <hr></hr>

            <p style={{ marginBottom: "12px", marginTop: "12px" }}>
              The following fields have been modified:
            </p>

            <div
              style={{
                backgroundColor: "#f7f3f2",
                padding: "15px",
                borderRadius: "6px",
                border: "1px solid #e2d5d3",
                maxHeight: "300px",
                overflowY: "auto",
                marginBottom: "20px",
              }}
            >
              {getChangedFields().map((change, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "12px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <strong>{change.field}</strong>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    From:{" "}
                    <span style={{ fontFamily: "monospace" }}>
                      {change.original}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    To:{" "}
                    <span style={{ fontFamily: "monospace", color: "#0066cc" }}>
                      {change.updated}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowSubmitConfirm(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="bg-upmaroon"
                style={{
                  padding: "10px 20px",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
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

export default BISProfileView;
