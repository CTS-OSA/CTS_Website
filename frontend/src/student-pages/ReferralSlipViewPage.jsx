import React, { useEffect, useRef, useState, useContext } from "react";
import "./css/pdfStyle.css";
import "../forms/SetupProfile/css/multistep.css";
import { useNavigate, useParams } from "react-router-dom";
import html2pdf from "html2pdf.js";
import Button from "../components/UIButton";
import ToastMessage from "../components/ToastMessage";
import ConfirmDialog from "../components/ConfirmDialog";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import BackToTopButton from "../components/BackToTop";
import Loader from "../components/Loader";
import { formatDate, formatDateOnly } from "../utils/helperFunctions";
import upLogo from "../assets/UPMin_logo.png";
import up28thLogo from "../assets/UP-28th-logo.png";

const statusLabels = {
  closed_intake: "Closed at Intake Interview",
  for_counseling: "For Counseling",
  for_psych_test: "For Psychological Testing",
  counseling_ongoing: "Counseling Sessions are on-going",
  counseling_completed: "Sessions Completed / Case Terminated",
  no_show: "Student did not show up",
  referred_to: "Referred To",
};

const ReferralSlipProfileView = ({
  profileData,
  formData,
  isAdmin = false,
}) => {
  const pdfRef = useRef();
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const { submission_id } = useParams();

  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);
  const [acknowledgementData, setAcknowledgementData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formState, setFormState] = useState({
    referrer_last_name: "",
    referrer_first_name: "",
    referrer_department: "",
    referrer_email: "",
    referrer_contact_number: "",
    referred_person_first_name: "",
    referred_person_last_name: "",
    referred_person_contact_number: "",
    referred_person_degree_program: "",
    referred_person_year_level: "",
    referred_person_gender: "",
    reason_for_referral: "",
    initial_actions_taken: "",
    referral_date: "",
  });

  useEffect(() => {
    if (formData) {
      setFormState({
        referrer_last_name:
          profileData?.last_name ||
          formData?.referral?.referrer?.last_name ||
          "",
        referrer_first_name:
          profileData?.first_name ||
          formData?.referral?.referrer?.first_name ||
          "",
        referrer_department:
          profileData?.degree_program ||
          formData?.referral?.referrer?.department_unit ||
          "",
        referrer_email:
          profileData?.email || formData?.referral?.guest_email || "",
        referrer_contact_number:
          profileData?.contact_number ||
          formData?.referral?.referrer?.contact_number ||
          "",
        referred_person_first_name:
          formData?.referral?.referred_person?.first_name || "",
        referred_person_last_name:
          formData?.referral?.referred_person?.last_name || "",
        referred_person_contact_number:
          formData?.referral?.referred_person?.contact_number || "",
        referred_person_degree_program:
          formData?.referral?.referred_person?.degree_program || "",
        referred_person_year_level:
          formData?.referral?.referred_person?.year_level || "",
        referred_person_gender:
          formData?.referral?.referred_person?.gender || "",
        reason_for_referral: formData?.referral?.reason_for_referral || "",
        initial_actions_taken: formData?.referral?.initial_actions_taken || "",
        referral_date: formData?.referral?.referral_date
          ? formatDateOnly(formData.referral.referral_date)
          : "",
      });
    }
  }, [formData, profileData]);

  // Fetch acknowledgement data if it exists
  useEffect(() => {
    if (formData?.referral?.referral_status === "acknowledged") {
      const fetchAck = async () => {
        try {
          const response = await request(
            `/api/forms/referrals/${submission_id}/acknowledgement/`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch acknowledgement data");
          }

          const data = await response.json();
          setAcknowledgementData(data);
        } catch (err) {
          // console.error("ERROR loading acknowledgement:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAck();
    } else {
      setAcknowledgementData(null);
      setLoading(false);
    }
  }, [submission_id, formData]);

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
    
    // Create a scoped style tag that only applies to this element
    const styleTag = document.createElement("style");
    styleTag.id = "pdf-render-styles";
    styleTag.innerHTML = `
      #referral-pdf-container.pdf-mode .inlineBlockBorder {
        vertical-align: bottom;
        padding-bottom: 8px;
      }

      #referral-pdf-container.pdf-mode .inlineBlockBorderEmpty:empty {
        padding-top: 10px;
        padding-bottom: 8px;
      }

      #referral-pdf-container.pdf-mode .reason-initial {
        margin-top: 10px;
      }

      #referral-pdf-container.pdf-mode .page-break {
        page-break-before: always; 
        break-before: page;    
      }

      #referral-pdf-container.pdf-mode .avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    `;
    
    // Inject the style tag
    document.head.appendChild(styleTag);
    
    // Add the pdf-mode class
    element.classList.add("pdf-mode");

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        // silent
      }
    }

    const imgs = Array.from(element.querySelectorAll("img"));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((res) => (img.onload = img.onerror = res));
      })
    );

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5], 
      filename: "Referral_Slip_Complete.pdf",
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
    
    // Clean up
    element.classList.remove("pdf-mode");
    document.head.removeChild(styleTag);
  };

  const handleProceedToAcknowledgement = () => {
    // Use submission_id directly from params
    navigate(`/admin/referral-acknowledgement/${submission_id}`);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      closed_intake: "Closed at Intake Interview",
      for_counseling: "For Counseling",
      for_psych_test: "For Psychological Testing",
      counseling_ongoing: "Counseling Sessions are on-going",
      counseling_completed: "Sessions Completed / Case Terminated",
      no_show: "Student did not show up",
      referred_to: "Referred to",
    };
    return statusMap[status] || status;
  };

  if (!formData) return <Loader />;

  return (
    <>
      <div
        className="pdf-buttons"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
          gap: "0.5rem",
        }}
      >
        <Button
          variant="primary"
          onClick={handleDownloadClick}
          className="pdf-button"
        >
          Download as PDF
        </Button>
      </div>

      {/* MAIN PDF VIEW */}
      <div className="flex justify-center w-full">
        <div
          id="referral-pdf-container"
          ref={pdfRef}
          className="w-[8.5in] bg-white p-8 leading-tight"
          style={{ fontSize: "11px", width: "720px", minHeight: "1056px" }}
        >
          {/* ==== HEADER SECTION ==== */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center mb-4">
            <div className="flex flex-col gap-2 items-center">
              <img
                src={upLogo}
                alt="UP Logo"
                className="w-[1.27in] h-auto object-contain"
              />
              <p className="text-[8px]">
                OSA-CTS Form No. 03D
                <br />
                (Revised Nov. 2019)
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-left ml-2 mr-2">
              <h2 className="font-tnr leading-tight w-full pb-0.5">
                <span className="text-[14px] italic">
                  OFFICE OF STUDENT AFFAIRS
                </span>
                <br />
                <span className="text-[14px] italic">
                  Counseling and Testing Section
                </span>
                <br />
                <span className="text-[16px]">
                  UNIVERSITY OF THE PHILIPPINES MINDANAO
                </span>
              </h2>
              <div className="my-1 w-full border-t border-black"></div>
              <p className="text-[9px] mt-2 leading-tight text-right w-full italic">
                Administration Building, Mintal, Davao City 8022, Philippines
                <br />
                T: +6382 293 08 63 loc. 9050 E: cts_osa.upmindanao@up.edu.ph
              </p>
            </div>

            <div className="flex justify-end">
              <img
                src={up28thLogo}
                alt="UP 28th Anniversary"
                className="w-[1.27in] h-[1.27in] object-contain"
              />
            </div>
          </div>

          <h3 className="font-bold text-[13px] mt-3 text-center">
            COUNSELING REFERRAL SLIP
          </h3>

          {/* ==== BODY ==== */}
          <div className="space-y-4 mt-5">
            {/* NAME */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Name of Student:</span>
              <span className="border-b border-black flex-1 pb-0.5">
                {formState.referred_person_first_name}{" "}
                {formState.referred_person_last_name}
              </span>
            </div>

            {/* YEAR / COURSE / GENDER / REFERRAL DATE */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 grow">
                <span className="font-semibold">Year/Course:</span>
                <span className="border-b border-black flex-1 pb-0.5">
                  {formState.referred_person_year_level} /{" "}
                  {formState.referred_person_degree_program}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Gender:</span>
                <span className="border-b border-black w-28 pb-0.5">
                  {formState.referred_person_gender}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Referral Date:</span>
                <span className="border-b border-black w-40 pb-0.5">
                  {formState.referral_date}
                </span>
              </div>
            </div>

            {/* REASONS */}
            <div>
              <span className="font-semibold">Reason(s) for Referral:</span>
              <p className="border border-black min-h-20 p-2 whitespace-pre-wrap align-top reason-initial">
                {formState.reason_for_referral}
              </p>
            </div>

            {/* INITIAL ACTIONS */}
            <div>
              <span className="font-semibold">Initial Actions Taken:</span>
              <p className="border border-black min-h-20 p-2 whitespace-pre-wrap align-top reason-initial">
                {formState.initial_actions_taken}
              </p>
            </div>

            {/* CONTACT NUMBER */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                Contact Number of Student (if available):
              </span>
              <span className="border-b border-black flex-1 pb-0.5">
                {formState.referred_person_contact_number}
              </span>
            </div>

            {/* REFERRER INFORMATION */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Referred by:</span>
                  <span className="border-b border-black flex-1 pb-0.5">
                    {formState.referrer_first_name}{" "}
                    {formState.referrer_last_name}
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-5">
                  <span className="font-semibold">Signature:</span>
                  <span className="border-b border-black flex-1 pb-3"></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Department/Unit:</span>
                <span className="border-b border-black flex-1 pb-0.5">
                  {formState.referrer_department}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Contact Number / E-mail Address:
                </span>
                <span className="border-b border-black flex-1 pb-0.5">
                  {formState.referrer_contact_number} /{" "}
                  {formState.referrer_email}
                </span>
              </div>
            </div>

            {/* ==== ACKNOWLEDGEMENT SECTION (if exists) ==== */}

            <div className="border-t-2 border-black my-3"></div>
            <h3 className="font-bold text-[13px] text-center mb-4">
              REFERRAL ACKNOWLEDGEMENT SLIP
            </h3>

            <div className="space-y-1">
              {/* To: Field */}
              <div className="flex items-center gap-2 avoid-break">
                <span className="font-semibold">To:</span>
                <span
                  className={`border-b border-black px-2 min-w-[300px] inline-block align-bottom inlineBlockBorderEmpty inlineBlockBorder ${
                    acknowledgementData?.referring_person_name
                      ? "pb-1"
                      : "pt-[10px] pb-1"
                  }`}
                >
                  {acknowledgementData?.referring_person_name || ""}
                </span>
                <span className="text-[9px]">(Referring Person / Unit)</span>
              </div>

              <div className="flex items-center gap-2 avoid-break">
                <span
                  className={`border-b border-black px-2 min-w-[300px] inline-block inlineBlockBorderEmpty inlineBlockBorder ml-[21px] ${
                    acknowledgementData?.referring_department ? "" : "pt-[10px]"
                  }`}
                >
                  {acknowledgementData?.referring_department || ""}
                </span>
                <span className="text-[9px]">
                  (Office / Department / College)
                </span>
              </div>

              {/* Confirmation text */}
              <div className="mt-3 leading-relaxed avoid-break">
                <p className="text-[11px]">
                  This is to confirm that{" "}
                  <span className="border-b border-black px-2 min-w-[200px] inline-block inlineBlockBorderEmpty inlineBlockBorder">
                    {acknowledgementData?.referred_person_name}
                  </span>{" "}
                  whom you referred to us on{" "}
                  <span className="border-b border-black px-2 min-w-[200px] inline-block inlineBlockBorderEmpty inlineBlockBorder"> 
                    {acknowledgementData?.referral_date
                      ? formatDate(acknowledgementData.referral_date)
                      : ""}
                  </span>{" "}
                  has visited CTS-OSA on{" "}
                  <span className="border-b border-black px-2 min-w-[200px] inline-block inlineBlockBorderEmpty inlineBlockBorder">
                    {acknowledgementData?.referral_date
                      ? formatDateOnly(acknowledgementData.date_of_visitation)
                      : ""}
                  </span>{" "}
                  and is being attended to by{" "}
                  <span className="border-b border-black px-2 min-w-[160px] inline-block inlineBlockBorderEmpty inlineBlockBorder">
                    {acknowledgementData?.counselor_name}
                  </span>
                  .
                </p>
              </div>

              {/* Status Checklist */}
              <div className="mt-4 avoid-break">
                <p className="font-semibold mb-2">
                  Kindly refer to the checklist below on the status of the case
                  at hand.
                </p>

                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-2 avoid-break">
                    <span
                      className={
                        acknowledgementData?.status === "closed_intake" ? "☑" : "☐"
                      }
                    >
                      {acknowledgementData?.status === "closed_intake" ? "☑" : "☐"}
                    </span>
                    <span>Closed at Intake Interview</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>
                      {acknowledgementData?.status === "for_counseling"
                        ? "☑"
                        : "☐"}
                    </span>
                    <span>For Counseling</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>
                      {acknowledgementData?.status === "for_psych_test"
                        ? "☑"
                        : "☐"}
                    </span>
                    <span>For Psychological testing</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>
                      {acknowledgementData?.status === "counseling_ongoing" ? "☑" : "☐"}
                    </span>
                    <span>Counseling Sessions are on-going</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>
                      {acknowledgementData?.status === "counseling_completed" ? "☑" : "☐"}
                    </span>
                    <span>Sessions Completed / Case Terminated</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>
                      {acknowledgementData?.status === "no_show" ? "☑" : "☐"}
                    </span>
                    <span>
                      Student did not show up ----- Number of follow-ups made by
                      the Counselor:{" "}
                      <span className="border-b border-black px-2 min-w-[150px] inline-block inlineBlockBorderEmpty inlineBlockBorder">
                        {acknowledgementData?.follow_up || ""}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>
                      {acknowledgementData?.status === "referred_to" ? "☑" : "☐"}
                    </span>
                    <span>
                      Referred to{" "}
                      <span className="border-b border-black px-2 min-w-[150px] inline-block inlineBlockBorderEmpty inlineBlockBorder">
                        {acknowledgementData?.referred_to || ""}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Thank you */}
              <p className="mt-4 text-[11px] avoid-break">Thank you.</p>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-6 avoid-break">
                {/* Attending GSS */}
                <div className="text-center">
                  <div className="border-b border-black pb-1 w-full"></div>
                  <p className="font-semibold text-[10px]">Attending GSS</p>
                </div>

                {/* Noted by */}
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    <p className="whitespace-nowrap">Noted by:</p>
                    <div className="border-b border-black flex-grow pb-1"></div>
                  </div>
                  <p className="font-semibold text-[10px]">OSA Director</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 mt-4 avoid-break">
                <span className="font-semibold">Date:</span>
                <span className="border-b border-black w-60 pb-0.5">
                  {acknowledgementData?.date_of_receipt
                    ? formatDateOnly(acknowledgementData?.date_of_receipt)
                    : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN-ONLY NAVIGATION BUTTON */}
      {isAdmin && formData.referral.referral_status != 'acknowledged' && (
        <div className="flex justify-center mt-6 mb-8">
          <Button
            variant="primary"
            onClick={handleProceedToAcknowledgement}
            className="px-8 py-3"
          >
            Proceed to Acknowledgement Receipt
          </Button>
        </div>
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

export default ReferralSlipProfileView;
