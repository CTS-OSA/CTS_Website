import React from "react";
import "./../SetupProfile/css/multistep.css";
import "./../../components/css/modal.css"; 
import DisplayField from "../../components/DisplayField";

const RSPreview = ({formData, onClose }) => {
  const { refer_student_details, referral_details, referrer_details } =
    formData;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="form-container">
          <h1 className="text-upmaroon font-bold text-2xl mb-5 pb-1">Referral Slip (Preview)</h1>

          {/* STUDENT TO BE REFERRED DETAILS */}
          <div className="form-section">
            <h2>Student to be referred details</h2>
            <div className="grid lg:grid-cols-2 gap-4">
              <DisplayField
                label="First Name"
                value={refer_student_details.refer_student_last_name}
              />
              <DisplayField
                label="Last Name"
                value={refer_student_details.refer_student_first_name}
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <DisplayField
                label="Year"
                value={refer_student_details.refer_student_year}
              />
              <DisplayField
                label="Program/Course"
                value={refer_student_details.refer_student_degree_program}
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <DisplayField
                label="Gender"
                value={refer_student_details.refer_student_gender}
              />
              <DisplayField
                label="Contact Number"
                value={refer_student_details.refer_student_contact_number}
              />
            </div>
          </div>

          {/* REFERRAL DETAILS */}
          <div className="form-section">
            <h2 className="step-title">Referral Details</h2>
            <DisplayField
              label="Reason for Referral"
              value={referral_details.reason_for_referral}
            />
            <DisplayField
              label="Initial Actions Taken"
              value={referral_details.initial_actions_taken}
            />
          </div>

          {/* REFERRER DETAILS */}
          <div className="form-section">
            <h2 className="step-title">Referrer Details</h2>
            <div className="grid lg:grid-cols-2 gap-4">
              <DisplayField
                label="Referrer's First Name"
                value={referrer_details.referrer_last_name}
              />
              <DisplayField
                label="Referrer's Last Name"
                value={referrer_details.referrer_first_name}
              />
            </div>
            <div className="grid gap-4">
              <DisplayField
                label="Referrer's Department"
                value={referrer_details.referrer_department}
              />
            </div>
            <div className="grid gap-3">
                <DisplayField
                label="Referrer's Email"
                value={referrer_details.referrer_email}
              />
            </div>
            <div className="grid gap-4">
              <DisplayField
                label="Referrer's Contact Number"
                value={referrer_details.referrer_contact_number}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSPreview;
