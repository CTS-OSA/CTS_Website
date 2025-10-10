import React from "react";
import "./css/pdfStyle.css";
import "../forms/SetupProfile/css/multistep.css";
import FormHeader from "./FormHeader";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useContext } from "react";
import AutoResizeTextarea from "../components/AutoResizeTextarea";
import html2pdf from "html2pdf.js";
import Button from "../components/UIButton";
import ToastMessage from "../components/ToastMessage";
import ConfirmDialog from "../components/ConfirmDialog";
import { AuthContext } from "../context/AuthContext";
import BackToTopButton from "../components/BackToTop";
import Loader from "../components/Loader";

const BISProfileView = ({ profileData, formData, isAdmin = false }) => {
  const pdfRef = useRef();
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);

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

  const handleDownload = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: "BIS_Profile.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleReturn = () => {
    if (role === "admin" && profileData.student_number) {
      navigate(`/admin/students/${profileData.student_number}`);
    } else {
      navigate("/myprofile");
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
        <Button variant="primary" onClick={handleDownloadClick} className="pdf-button">
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
              value={`${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}`}
              readOnly
            />
          </label>
          <label>
            2. Nickname:{" "}
            <input type="text" value={profileData.nickname} readOnly />
          </label>
          <label>
            3. Year & Course:{" "}
            <input
              type="text"
              value={`${profileData.current_year_level} - ${profileData.degree_program}`}
              readOnly
            />
          </label>
        </div>

        <div className="section-title">II. SOCIO-ECONOMIC STATUS</div>
        <div className="indented-section">
          <label>
            4. What is your means of support for your college education?
          </label>
          <ul className="checkbox-list indented-section">
            {supportOptions.map(({ key, label }) => {
              const isChecked =
                Array.isArray(student_support?.support) &&
                student_support.support.includes(key);
              return (
                <li key={key}>
                  <label>
                    <input type="checkbox" checked={isChecked} readOnly />
                    {label}
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
              value={socio_economic_status.scholarships || "None"}
              readOnly
            />
          </label>
          <label>
            6. What are your privileges that you specified in no. (5):{" "}
            <input
              type="text"
              value={socio_economic_status.scholarship_privileges || "Not Applicable"}
              readOnly
            />
          </label>
          <label>
            7. How much is your montly allowance to be provided by your family
            when you reach college?{" "}
            <input
              type="text"
              value={`₱${socio_economic_status.monthly_allowance}`}
              readOnly
            />
          </label>
          <label>
            8. What do you spend much on?{" "}
            <AutoResizeTextarea value={socio_economic_status.spending_habit || ""} />
          </label>
        </div>
        <div className="section-title">III. SCHOOL PREFERENCES</div>
        <div className="indented-section">
          <label>
            9. Who influenced you to study in UP Mindanao?{" "}
            <input type="text" value={preferences.influence} readOnly />
          </label>
          <label>
            10. Indicate the reason/s for enrolling in UP Mindanao:{" "}
            <AutoResizeTextarea value={preferences.reason_for_enrolling || ""} />
          </label>
          <label>
            11. Do you have plans of transferring to another UP Campus by 2nd
            year?{" "}
            <input
              type="text"
              value={preferences.transfer_plans ? "Yes" : "No"}
              readOnly
            />
          </label>
          <label>
            12. Why or why not?{" "}
            <AutoResizeTextarea value={preferences.transfer_reason || ""} />
          </label>
          <label>
            13. Do you have plans of shifting to another degree program by 2nd
            year?{" "}
            <input
              type="text"
              value={preferences.shift_plans ? "Yes" : "No"}
              readOnly
            />
          </label>
          <label>
            14. If yes, what degree program?{" "}
            <input
              type="text"
              value={preferences.planned_shift_degree || "N/A"}
              readOnly
            />
          </label>
          <label>
            15. Why?{" "}
            <AutoResizeTextarea
              value={preferences.reason_for_shifting || "N/A"}
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
              value={scholastic_status.intended_course}
              readOnly
            />
          </label>
          <label>
            17. What course did you indicate as 1st choice in the UPCAT
            application form?{" "}
            <input
              type="text"
              value={scholastic_status.first_choice_course}
              readOnly
            />
          </label>
          <label>
            18. What course were you admitted?{" "}
            <input
              type="text"
              value={scholastic_status.admitted_course}
              readOnly
            />
          </label>
          <label>
            19. If (17) is different (18), what would be your next plan?{" "}
            <AutoResizeTextarea value={scholastic_status.next_plan || "Not Applicable"} />{" "}
          </label>
        </div>
        <div className="signature">
          <label>
            20. I certify that all facts and information stated in this form are
            true and correct.
          </label>
          <div className="sign" style={{ textAlign: "right" }}>
            <label style={{ textAlign: "right" }}>
              ____________________________
            </label>
            <label style={{ textAlign: "right", paddingRight: "50px" }}>
              21. Signature:{" "}
            </label>
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
        <label className="privacy-description indented-section">
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
        </label>

        <div className="certify-agreement">
          <label className="form-label">
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
          </label>
        </div>

        <div className="flex-row">
          <label>
            Name of Student:{" "}
            <input
              type="text"
              value={`${profileData.first_name} ${profileData.last_name}`}
              readOnly
            />
          </label>
          <label>
            Signature of Student:
            <input type="text" />
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
