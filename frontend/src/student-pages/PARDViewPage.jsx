import React, { useEffect, useRef, useState, useContext } from "react";
import "./css/pdfStyle.css";
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

const PARDProfileView = ({ profileData, formData }) => {
  const pdfRef = useRef();
  const { role } = useContext(AuthContext);
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [formState, setFormState] = useState({
    name: `${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}`,
    year_course: `${profileData.current_year_level} - ${profileData.degree_program}`,
  });

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
      filename: "PARD_appointment.pdf",
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

  const { pard_data, submission } = formData;

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

        <h3>PSYCHOSOCIAL ASSISTANCE AND REFERRAL DESK (PARD)</h3>
        <h3>ONLINE APPOINMENT SCHEDULE</h3>

        <div className="section-title">I. DEMOGRAPHIC PROFILE</div>
        <div className="flex indented-section gap-5">
          <label>
            Last Name:{" "}
            <input type="text" value={profileData?.last_name || ""} readOnly />
          </label>
          <label>
            First Name:{" "}
            <input type="text" value={profileData?.first_name || ""} readOnly />
          </label>
          <label>
            Middle Name:{" "}
            <input
              type="text"
              value={profileData?.middle_name || ""}
              readOnly
            />
          </label>
        </div>
        <div className="flex gap-5 indented-section">
          <label>
            Year Level:{" "}
            <input
              type="text"
              value={profileData?.current_year_level || ""}
              readOnly
            />
          </label>
          <label>
            Degree Program:{" "}
            <input
              type="text"
              value={profileData?.degree_program || ""}
              readOnly
            />
          </label>
        </div>

        <div className="section-title">II. CONTACT INFORMATION</div>
        <div className="indented-section flex gap-5">
          <label>
            Contact Number:{" "}
            <input
              type="text"
              value={profileData?.contact_number || ""}
              readOnly
            />
          </label>
          <label>
            Preferred Appointment Date:{" "}
            <input
              type="text"
              value={pard_data?.preferred_date || ""}
              readOnly
            />
          </label>
          <label>
            Preferred Appointment Time:{" "}
            <input
              type="text"
              value={pard_data?.preferred_time || ""}
              readOnly
            />
          </label>
        </div>

        <div className="section-title">III. PSYCHOSOCIAL ASSESSMENT</div>
        <div className="indented-section grid grid-cols-2 gap-5">
          <label>
            Date Started:{" "}
            <input type="date" value={pard_data?.date_started || ""} readOnly />
          </label>
          <label>
            Currently on Medication:{" "}
            <input
              type="text"
              value={pard_data?.is_currently_on_medication ? "Yes" : "No"}
              readOnly
            />
          </label>
          <label>
            Symptoms Observed:{" "}
            <AutoResizeTextarea
              value={pard_data?.symptoms_observed || ""}
              readOnly
            />
          </label>
          <label>
            Communication Platform:{" "}
            <input
              type="text"
              value={pard_data?.communication_platform || ""}
              readOnly
            />
          </label>
          <label>
            Date Diagnosed:{" "}
            <input
              type="date"
              value={pard_data?.date_diagnosed || ""}
              readOnly
            />
          </label>
          <label>
            Diagnosed By:{" "}
            <input type="text" value={pard_data?.diagnosed_by || ""} readOnly />
          </label>
        </div>

        <div className="signature">
          <label>
            Date Filed:{" "}
            <input
              type="date"
              value={
                submission?.submitted_on
                  ? new Date(submission.submitted_on).toLocaleDateString(
                      "en-CA"
                    )
                  : ""
              }
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

export default PARDProfileView;
