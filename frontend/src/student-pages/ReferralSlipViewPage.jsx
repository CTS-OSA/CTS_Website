import React, { useEffect, useRef, useState, useContext } from "react";
import "./css/pdfStyle.css";
import "../forms/SetupProfile/css/multistep.css";
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
import { formatDateOnly } from "../utils/helperFunctions";
import upLogo from "../assets/UPMin_logo.png";
import up28thLogo from "../assets/UP-28th-logo.png";

const ReferralSlipProfileView = ({
  profileData,
  formData,
  isAdmin = false,
}) => {
  const pdfRef = useRef();
  const { role } = useContext(AuthContext);
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);
  const [errors, setErrors] = useState({});
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
    if (formData && profileData) {
      setFormState({
        referrer_last_name: profileData.last_name || "",
        referrer_first_name: profileData.first_name || "",
        referrer_department: profileData.degree_program || "",
        referrer_email: profileData.email || "",
        referrer_contact_number: profileData.contact_number || "",
        referred_person_first_name:
          formData.referral.referred_person.first_name || "",
        referred_person_last_name:
          formData.referral.referred_person.last_name || "",
        referred_person_contact_number:
          formData.referral.referred_person.contact_number || "",
        referred_person_degree_program:
          formData.referral.referred_person.degree_program || "",
        referred_person_year_level:
          formData.referral.referred_person.year_level || "",
        referred_person_gender: formData.referral.referred_person.gender || "",
        reason_for_referral: formData.referral.reason_for_referral || "",
        initial_actions_taken: formData.referral.initial_actions_taken || "",
        referral_date: formatDateOnly(formData.referral.referral_date) || "",
      });
    }
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

  // const handleDownload = () => {
  //   const element = pdfRef.current;
  //   const opt = {
  //     margin: 0.5,
  //     filename: "Referral_Slip.pdf",
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: { scale: 1 },
  //     jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  //   };

  //   html2pdf().set(opt).from(element).save();
  // };

  const handleDownload = async () => {
    const element = pdfRef.current;
    element.classList.add("pdf-mode");

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
  const { referral } = formData;

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
      {/* HEADER */}
      <div className="flex justify-center w-full">
        <div
          ref={pdfRef}
          className="w-[8.5in] bg-white p-8 leading-tight"
          style={{ fontSize: "11px", width: "816px", height: "1056px" }}
        >
          {/* ==== HEADER SECTION ==== */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center mb-4">
            {/* LEFT LOGO + FORM CODE */}
            <div className="flex flex-col gap-2 items-center">
              <img
                src={upLogo}
                alt="UP Logo"
                className="w-[1.27in] h-[auto] object-contain"
              />
              <p className="text-[8px]">
                OSA-CTS Form No. 03D
                <br />
                (Revised Nov. 2019)
              </p>
            </div>

            {/* CENTER TEXT */}
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
                Administration Building, Mintal, Davao City 8022, Philippines{" "}
                <br />
                T: +6382 293 08 63 loc. 9050 E:cts_osa.upmindanao@up.edu.ph
              </p>
            </div>

            {/* RIGHT LOGO */}
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

          {/* ==== FORM BODY ==== */}
          <div className="space-y-4  mt-5">
            {/* STUDENT NAME */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Name of Student:</span>
              <span className="border-b border-black flex-1 pb-0.5">
                {formState.referred_person_first_name}{" "}
                {formState.referred_person_last_name}
              </span>
            </div>

            {/* YEAR/COURSE / GENDER / REFERRAL DATE */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-grow">
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

            {/* REASON FOR REFERRAL */}
            <div className="pb-0.5">
              <span className="font-semibold">Reason(s) for Referral:</span>
            </div>
            <div>
              <p className="border border-black min-h-[80px] p-2 whitespace-pre-wrap">
                {formState.reason_for_referral}
              </p>
            </div>

            {/* INITIAL ACTIONS */}
            <div className="pb-0.5">
              <span className="font-semibold">Initial Actions Taken:</span>
            </div>
            <div>
              <p className="border border-black min-h-[80px] p-2 whitespace-pre-wrap">
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

            {/* REFERRER INFO */}
            <div className="flex flex-col gap-4 mt-2">
              <div className=" grid grid-cols-2">
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
          </div>
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

export default ReferralSlipProfileView;
