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

const BISProfileView = ({ profileData, formData, isAdmin = false }) => {
  const pdfRef = useRef();
  const { role } = useContext(AuthContext);
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);
  const [errors, setErrors] = useState({});
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
      setFormState({
        name: `${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}`,
        nickname: profileData.nickname || "",
        year_course: `${profileData.current_year_level} - ${profileData.degree_program}`,
        support: student_support?.support || [],
        scholarship_notes: student_support?.other_scholarship || "",
        combination_notes: student_support?.combination_notes || "",
        others_notes: student_support?.other_notes || "",
        scholarships: socio_economic_status?.scholarships || "",
        scholarship_privileges:
          socio_economic_status?.scholarship_privileges || "",
        monthly_allowance: socio_economic_status?.monthly_allowance || "",
        spending_habit: socio_economic_status?.spending_habit || "",
        transfer_plans: preferences?.transfer_plans || "",
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

      if (type === "checkbox") {
        const isPrivacyConsent =
          cloneEl.name === "has_consented" ||
          cloneEl.closest(".privacy-consent");

        const indicator = document.createElement("span");
        indicator.className = "pdf-checkbox-indicator";
        if (isPrivacyConsent) {
          indicator.classList.add("pdf-checkbox-indicator--privacy");
        }
        indicator.textContent = originalEl.checked ? "☑" : "☐";
        indicator.style.fontSize = computed.fontSize;
        indicator.style.lineHeight = "1";
        indicator.style.marginRight = "0.35rem";

        const parentLabel = cloneEl.closest("label");
        if (parentLabel) {
          parentLabel.style.display = "flex";
          parentLabel.style.alignItems = "flex-start";
          parentLabel.style.gap = "0.5rem";
          parentLabel.insertBefore(indicator, cloneEl);
          parentLabel.removeChild(cloneEl);
        } else {
          cloneEl.replaceWith(indicator);
        }
        return;
      }

      let value = originalEl.value || "";
      if (cloneEl.tagName === "SELECT") {
        const selected = originalEl.options[originalEl.selectedIndex];
        value = selected ? selected.text : value;
      }

      if (type === "date" && value) {
        value = new Date(value).toLocaleDateString("en-CA");
      }

      const textDiv = document.createElement("div");
      textDiv.className = "pdf-field-value";
      if (cloneEl.tagName === "TEXTAREA") {
        textDiv.classList.add("multiline");
      }
      textDiv.textContent = value || "\u00a0";
      textDiv.style.fontSize = computed.fontSize;
      textDiv.style.fontFamily = computed.fontFamily;
      textDiv.style.fontWeight = computed.fontWeight;
      textDiv.style.lineHeight = computed.lineHeight;
      textDiv.style.color = computed.color || "#000";
      textDiv.style.margin = computed.margin;
      textDiv.style.padding = computed.padding;
      textDiv.style.boxSizing = "border-box";
      textDiv.style.whiteSpace = "pre-wrap";
      textDiv.style.wordBreak = "break-word";
      textDiv.style.borderBottom = `${getBorderWidth(
        computed
      )} solid ${getBorderColor(computed)}`;

      const width = rect.width || originalEl.offsetWidth;
      if (width) {
        textDiv.style.width = width + "px";
        textDiv.style.maxWidth = width + "px";
      } else if (computed.width && computed.width !== "auto") {
        textDiv.style.width = computed.width;
        textDiv.style.maxWidth = computed.width;
      }

      const height = rect.height || originalEl.offsetHeight;
      if (height && height > 0) {
        textDiv.style.minHeight = height + "px";
      }

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
      setFormState((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    }
  };

  const handleSupportChange = (key, checked) => {
    if (role === "admin") {
      setFormState((prev) => ({
        ...prev,
        support: checked
          ? [...prev.support, key]
          : prev.support.filter((item) => item !== key),
      }));
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    const newErrors = {};

    // Validate required fields
    if (!formState.name || formState.name.trim() === "") {
      newErrors.name = "Name field cannot be empty.";
    }

    if (!formState.nickname || formState.nickname.trim() === "") {
      newErrors.nickname = "Nickname field cannot be empty.";
    }

    if (!formState.year_course || formState.year_course.trim() === "") {
      newErrors.year_course = "Year & course field cannot be empty.";
    }

    // Set all errors at once
    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const response = await request(
        `/api/forms/edit/bis/${profileData.student_number}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formState),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDownloadToast(data.message);
      }
    } catch (error) {
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
      label: `Scholarship (${
        student_support.other_scholarship || "Unspecified"
      })`,
    },
    {
      key: "combination",
      label: `Combination (${
        student_support.combination_notes || "Unspecified"
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
            onClick={handleSubmit}
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
              const inputValue =
                key === "scholarship"
                  ? student_support?.other_scholarship
                  : key === "combination"
                  ? student_support?.combination_notes
                  : key === "others"
                  ? student_support?.other_notes
                  : "";
              const isChecked =
                (Array.isArray(formState.support) &&
                  formState.support.includes(key)) ||
                (hasInput && inputValue);

              return (
                <li key={key}>
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
                    {hasInput && inputValue && (
                      <input
                        type="text"
                        value={formState[`${key}_notes`] || inputValue}
                        onChange={(e) =>
                          handleFieldChange(`${key}_notes`, e.target.value)
                        }
                        readOnly={role !== "admin"}
                        style={{ marginLeft: "10px", width: "200px" }}
                        placeholder={`Specify ${key}...`}
                      />
                    )}
                  </label>
                </li>
              );
            })}
          </ul>

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
          </label>
          <label>
            7. How much is your monthly allowance to be provided by your family
            when you reach college?{" "}
            <input
              type="text"
              value={formState.monthly_allowance}
              onChange={(e) =>
                handleFieldChange("monthly_allowance", e.target.value)
              }
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            8. What do you spend much on?{" "}
            <AutoResizeTextarea
              value={formState.spending_habit}
              onChange={(e) =>
                handleFieldChange("spending_habit", e.target.value)
              }
              readOnly={role !== "admin"}
            />
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
          </label>
          <label>
            10. Indicate the reason/s for enrolling in UP Mindanao:{" "}
            <AutoResizeTextarea
              value={formState.reason_for_enrolling}
              onChange={(e) =>
                handleFieldChange("reason_for_enrolling", e.target.value)
              }
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            11. Do you have plans of transferring to another UP Campus by 2nd
            year?{" "}
            <input
              type="text"
              value={formState.transfer_plans}
              onChange={(e) =>
                handleFieldChange("transfer_plans", e.target.value)
              }
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            12. Why or why not?{" "}
            <AutoResizeTextarea
              value={formState.transfer_reason}
              onChange={(e) =>
                handleFieldChange("transfer_reason", e.target.value)
              }
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            13. Do you have plans of shifting to another degree program by 2nd
            year?{" "}
            <input
              type="text"
              value={formState.shift_plans}
              onChange={(e) => handleFieldChange("shift_plans", e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            14. If yes, what degree program?{" "}
            <input
              type="text"
              value={formState.planned_shift_degree}
              onChange={(e) =>
                handleFieldChange("planned_shift_degree", e.target.value)
              }
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            15. Why?{" "}
            <AutoResizeTextarea
              value={formState.reason_for_shifting}
              onChange={(e) =>
                handleFieldChange("reason_for_shifting", e.target.value)
              }
              readOnly={role !== "admin"}
            />
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
          </label>
          <label>
            19. If (17) is different (18), what would be your next plan?{" "}
            <AutoResizeTextarea
              value={formState.next_plan || "Not Applicable"}
              onChange={(e) => handleFieldChange("next_plan", e.target.value)}
              readOnly={role !== "admin"}
            />{" "}
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
        <h5>Privacy Statement: </h5>
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
        <div className="flex -ml-25">
          <label className="privacy-consent">
            <input
              type="checkbox"
              name="has_consented"
              checked={privacy_consent.has_consented === true}
              readOnly
              disabled
            />
          </label>
          <span className="text-justify -ml-25 mt-4">
            I have read the University of the Philippines' Privacy Notice for
            Students. I understand that for the UP System to carry out its
            mandate under the 1987 Constitution, the UP Charter, and other laws,
            the University must necessarily process my personal and sensitive
            personal information. Therefore, I recognize the authority of the
            University of the Philippines to process my personal and sensitive
            personal information, pursuant to the UP Privacy Notice and
            applicable laws.
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
