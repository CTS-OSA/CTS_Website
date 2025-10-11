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
  const [formState, setFormState] = useState({
    name: `${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}`,
    nickname: profileData.nickname || '',
    year_course: `${profileData.current_year_level} - ${profileData.degree_program}`,
    support: [],
    scholarship_notes: '',
    combination_notes: '',
    others_notes: '',
    scholarships: '',
    scholarship_privileges: '',
    monthly_allowance: '',
    spending_habit: '',
    influence: '',
    reason_for_enrolling: '',
    transfer_plans: 'No',
    transfer_reason: '',
    shift_plans: 'No',
    planned_shift_degree: '',
    reason_for_shifting: '',
    intended_course: '',
    first_choice_course: '',
    admitted_course: '',
    next_plan: ''
  });
  
  useEffect(() => {
    if (formData) {
      setFormState({
        name: `${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}`,
        nickname: profileData.nickname || '',
        year_course: `${profileData.current_year_level} - ${profileData.degree_program}`,
        support: student_support?.support || [],
        scholarship_notes: student_support?.other_scholarship || '',
        combination_notes: student_support?.combination_notes || '',
        others_notes: student_support?.other_notes || '',
        scholarships: socio_economic_status?.scholarships || '',
        scholarship_privileges: socio_economic_status?.scholarship_privileges || '',
        monthly_allowance: socio_economic_status?.monthly_allowance || '',
        spending_habit: socio_economic_status?.spending_habit || '',
        transfer_plans: preferences?.transfer_plans || '', 
        influence: preferences?.influence || '',
        reason_for_enrolling: preferences?.reason_for_enrolling || '',
        transfer_plans: preferences?.transfer_plans ? 'Yes' : 'No',
        transfer_reason: preferences?.transfer_reason || '',
        shift_plans: preferences?.shift_plans ? 'Yes' : 'No',
        planned_shift_degree: preferences?.planned_shift_degree || '',
        reason_for_shifting: preferences?.reason_for_shifting || '',
        intended_course: scholastic_status?.intended_course || '',
        first_choice_course: scholastic_status?.first_choice_course || '',
        admitted_course: scholastic_status?.admitted_course || '',
        next_plan: scholastic_status?.next_plan || '',
        first_choice_course: scholastic_status?.first_choice_course || '',
        admitted_course: scholastic_status?.admitted_course || '',
        next_plan: scholastic_status?.next_plan || '',
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

  const handleFieldChange = (field, value) => {
    if (role === "admin") {
      setFormState(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSupportChange = (key, checked) => {
    if (role === "admin") {
      setFormState(prev => ({
        ...prev,
        support: checked 
          ? [...prev.support, key]
          : prev.support.filter(item => item !== key)
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await request(`/api/forms/edit/bis/${profileData.student_number}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (response.ok) {
        setDownloadToast('Form updated successfully!');
      }
    } catch (error) {
      setDownloadToast('Failed to update form.');
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
          <Button variant="secondary" onClick={handleSubmit} className="pdf-button">
            Save Changes
          </Button>
        )}
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
              value={formState.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            2. Nickname:{" "}
            <input
              type="text"
              value={formState.nickname}
              onChange={(e) => handleFieldChange('nickname', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            3. Year & Course:{" "}
            <input
              type="text"
              value={formState.year_course}
              onChange={(e) => handleFieldChange('year_course', e.target.value)}
              readOnly={role !== "admin"}
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
              const hasInput = ['scholarship', 'combination', 'others'].includes(key);
              const inputValue = key === 'scholarship' ? student_support?.other_scholarship :
                               key === 'combination' ? student_support?.combination_notes :
                               key === 'others' ? student_support?.other_notes : '';
              const isChecked = Array.isArray(formState.support) && formState.support.includes(key) || (hasInput && inputValue);
              
              return (
                <li key={key}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={(e) => handleSupportChange(key, e.target.checked)}
                      disabled={role !== "admin"}
                    />
                    {hasInput ? key.charAt(0).toUpperCase() + key.slice(1) : label}
                    {hasInput && inputValue && (
                      <input
                        type="text"
                        value={formState[`${key}_notes`] || inputValue}
                        onChange={(e) => handleFieldChange(`${key}_notes`, e.target.value)}
                        readOnly={role !== "admin"}
                        style={{ marginLeft: '10px', width: '200px' }}
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
              onChange={(e) => handleFieldChange('scholarships', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            6. What are your privileges that you specified in no. (5):{" "}
            <input
              type="text"
              value={formState.scholarship_privileges}
              onChange={(e) => handleFieldChange('scholarship_privileges', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            7. How much is your monthly allowance to be provided by your family
            when you reach college?{" "}
            <input
              type="text"
              value={formState.monthly_allowance}
              onChange={(e) => handleFieldChange('monthly_allowance', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            8. What do you spend much on?{" "}
            <AutoResizeTextarea
              value={formState.spending_habit}
              onChange={(e) => handleFieldChange('spending_habit', e.target.value)}
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
              onChange={(e) => handleFieldChange('influence', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            10. Indicate the reason/s for enrolling in UP Mindanao:{" "}
            <AutoResizeTextarea
              value={formState.reason_for_enrolling}
              onChange={(e) => handleFieldChange('reason_for_enrolling', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            11. Do you have plans of transferring to another UP Campus by 2nd
            year?{" "}
            <input
              type="text"
              value={formState.transfer_plans}
              onChange={(e) => handleFieldChange('transfer_plans', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            12. Why or why not?{" "}
            <AutoResizeTextarea
              value={formState.transfer_reason}
              onChange={(e) => handleFieldChange('transfer_reason', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            13. Do you have plans of shifting to another degree program by 2nd
            year?{" "}
            <input
              type="text"
              value={formState.shift_plans}
              onChange={(e) => handleFieldChange('shift_plans', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            14. If yes, what degree program?{" "}
            <input
              type="text"
              value={formState.planned_shift_degree}
              onChange={(e) => handleFieldChange('planned_shift_degree', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            15. Why?{" "}
            <AutoResizeTextarea
              value={formState.reason_for_shifting}
              onChange={(e) => handleFieldChange('reason_for_shifting', e.target.value)}
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
              onChange={(e) => handleFieldChange('intended_course', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            17. What course did you indicate as 1st choice in the UPCAT
            application form?{" "}
            <input
              type="text"
              value={formState.first_choice_course}
              onChange={(e) => handleFieldChange('first_choice_course', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            18. What course were you admitted?{" "}
            <input
              type="text"
              value={formState.admitted_course}
              onChange={(e) => handleFieldChange('admitted_course', e.target.value)}
              readOnly={role !== "admin"}
            />
          </label>
          <label>
            19. If (17) is different (18), what would be your next plan?{" "}
            <AutoResizeTextarea value={formState.next_plan || "Not Applicable"} 
              onChange={(e) => handleFieldChange('next_plan', e.target.value)}
              readOnly={role !== "admin"}
            />{" "}
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
