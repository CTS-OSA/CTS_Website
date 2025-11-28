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
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [status, setStatus] = useState("");
  const [statusChoices, setStatusChoices] = useState([]);
  const [formState, setFormState] = useState({
    name: profileData ? `${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}` : "",
    year_course: profileData ? `${profileData.current_year_level} - ${profileData.degree_program}` : "",
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

  const handleDownload = async () => {
      const element = pdfRef.current;
      element.classList.add("pdf-mode");
  
      // Fill input and select values as text content for PDF
      const inputs = element.querySelectorAll('input, select');
      inputs.forEach(input => {
        if (input.value) {
          input.setAttribute('data-value', input.value);
        }
      });
  
      // wait for fonts (modern browsers)
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (e) {
          /* ignore */
        }
      }
  
      // wait for images inside the element
      const imgs = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.onload = img.onerror = res;
          });
        })
      );
  
      const opt = {
        filename: "Referral_Slip.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          scrollY: 0,
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };
  
      await html2pdf().set(opt).from(element).save();
      element.classList.remove("pdf-mode");
    };

  const handleSave = async () => {
    try {
      const changes = {};
      
      if (appointmentDate !== (formData.pard_data?.preferred_date || "")) {
        changes.preferred_date = appointmentDate;
      }
      if (appointmentTime !== (formData.pard_data?.preferred_time || "")) {
        changes.preferred_time = appointmentTime;
      }
      if (status !== (formData.pard_data?.status || "")) {
        changes.status = status;
      }

      if (Object.keys(changes).length === 0) {
        setDownloadToast("No changes to save.");
        return;
      }

      const response = await request(
        `http://localhost:8000/api/forms/admin/psychosocial-assistance-and-referral-desk/edit/${formData.submission.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        }
      );

      if (response.ok) {
        setDownloadToast("Updated successfully!");
      } else {
        setDownloadToast("Failed to update.");
      }
    } catch (error) {
      setDownloadToast("Error updating.");
    }
  };

  const handleReturn = () => {
    if (role === "admin" && profileData.student_number) {
      navigate(`/admin/students/${profileData.student_number}`);
    } else {
      navigate("/myprofile");
    }
  };


  useEffect(() => {
    if (formData?.pard_data) {
      setAppointmentDate(formData.pard_data.preferred_date || "");
      setAppointmentTime(formData.pard_data.preferred_time || "");
      setStatus(formData.pard_data.status || "");
    }
  }, [formData]);

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const response = await request('http://localhost:8000/api/forms/psychosocial-assistance-and-referral-desk/status-choices/');
        if (response.ok) {
          const data = await response.json();
          setStatusChoices(data.status_choices || []);
        }
      } catch (error) {
        console.error('Error fetching enums:', error);
      }
    };
    fetchEnums();
  }, []);

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
        {role === "admin" && (
          <Button
            variant="success"
            onClick={handleSave}
            className="pdf-button"
          >
            Save
          </Button>
        )}
      </div>

      <div className="pdf p-10" ref={pdfRef}>
        <h3>PSYCHOSOCIAL ASSISTANCE AND REFERRAL DESK (PARD)</h3>
        <h3>ONLINE APPOINMENT SCHEDULE</h3>
        <div className="font-semibold uppercase">
          STATUS: {" "}
          {role === "admin" ? (
            <>
              <span className="pdf-text border-b border-black flex-1 pb-0.5">
                {statusChoices.find(([value]) => value === status)?.[1] || status}
              </span>
              <span className="border-b border-black flex-1 pb-0.5 pdf-input">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="pdf-input"
                >
                  {statusChoices.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </span>
            </>
          ) : (
            <span className="border-b border-black flex-1 pb-0.5">
              {statusChoices.find(([value]) => value === status)?.[1] || status}
            </span>
          )}
        </div>
        <div className="section-title">I. DEMOGRAPHIC PROFILE</div>
        <div className="flex indented-section gap-3">
          <label>
            Name:{" "}
            <span className="border-b border-black flex-1 pb-0.5">
              {profileData?.first_name || ""} {profileData?.middle_name || ""} {profileData?.last_name}
            </span>
          </label>
          <label>
            Year Level:{" "}
            <span className="border-b border-black flex-1 pb-0.5">{profileData?.current_year_level || ""}</span>
          </label>
          <label>
            Degree Program:{" "}
            <span className="border-b border-black flex-1 pb-0.5">{profileData?.degree_program || ""}</span>
          </label>
        </div>
        <div className="section-title mt-3">II. CONTACT INFORMATION</div>
        <div className="indented-section flex gap-5">
          <label>
            Contact Number:{" "}
            <span className="border-b border-black flex-1 pb-0.5">{profileData?.contact_number || ""}</span>
          </label>
          <label>
            Appointment Date:{" "}
            <span className="border-b border-black flex-1 pb-0.5"
              readOnly = {role !== 'admin'}
              onChange={(e) => setAppointmentDate(e.target.value)}
              >{appointmentDate || ""}
            </span>
          </label>
          <label>
            Appointment Time:{" "}
            <span className="border-b border-black flex-1 pb-0.5"
              readOnly = {role !== 'admin'}
              onChange={(e) => setAppointmentTime(e.target.value)}
              >{appointmentTime || ""}
            </span>
          </label>
        </div>

        <div className="section-title">III. PSYCHOSOCIAL ASSESSMENT</div>
        <div className="indented-section grid grid-cols-2 grid-rows-2 gap-2">
          <label>
            Date Started:{" "}
            <span className="border-b border-black flex-1 pb-0.5">
              {pard_data?.date_started || ""}
            </span>
          </label>
          <label>
            Currently on Medication:{" "}
            <span className="border-b border-black flex-1 pb-0.5">
              {pard_data?.is_currently_on_medication ? "Yes" : "No"}
            </span>
          </label>
          <label className="col-span-2">
            Symptoms Observed:
            <AutoResizeTextarea
              value={pard_data?.symptoms_observed || ""}
            />
          </label>
          <label>
            Date Diagnosed:{" "}
            <span className="border-b border-black flex-1 pb-0.5">
              {pard_data?.date_diagnosed || ""}
            </span>
          </label>
          <label>
            Diagnosed By:{" "}
            <span className="border-b border-black flex-1 pb-0.5">
              {pard_data?.diagnosed_by || ""}
            </span>
          </label>
          <label>
            Communication Platform:{" "}
            <span className="border-b border-black flex-1 pb-0.5">
              {
                pard_data?.communication_platform
                  ? pard_data.communication_platform
                      .split("_")
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")
                  : ""
              }

            </span>
          </label>
        </div>

        <div className="signature">
          <label>
            Date Filed:{" "}
            <span>
              {submission?.submitted_on
                  ? new Date(submission.submitted_on).toLocaleDateString(
                      "en-CA"
                    )
                  : ""}
            </span>
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
