import React from "react";
import "./../SetupProfile/css/multistep.css";
import "./../../components/css/modal.css";
import DisplayField from "../../components/DisplayField";

const RSPreview = ({ formData, profileData, onClose }) => {
  const { referral } = formData;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          onClick={onClose}
          className="sticky top-2 right-2 float-right bg-white rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition z-50 text-3xl leading-none"
        >
          ×
        </button>

        <div className="form-container">
          <h1 className="text-upmaroon font-bold text-2xl mb-5 pb-1">
            Referral Slip (Preview)
          </h1>

          {/* STUDENT TO BE REFERRED DETAILS */}
          <div className="form-section">
            <h2>Student to be referred details</h2>
            <div className="grid lg:grid-cols-2 gap-4">
              <DisplayField
                label="First Name"
                value={referral.referred_person.first_name}
              />
              <DisplayField
                label="Last Name"
                value={referral.referred_person.last_name}
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <DisplayField
                label="Year"
                value={referral.referred_person.year_level}
              />
              <DisplayField
                label="Program/Course"
                value={referral.referred_person.degree_program}
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <DisplayField
                label="Gender"
                value={referral.referred_person.gender}
              />
              <DisplayField
                label="Contact Number"
                value={referral.referred_person.contact_number}
              />
            </div>
          </div>

          {/* REFERRAL DETAILS */}
          <div className="form-section">
            <h2 className="step-title">Referral Details</h2>
            <DisplayField
              label="Reason for Referral"
              value={referral.reason_for_referral}
            />
            <DisplayField
              label="Initial Actions Taken"
              value={referral.initial_actions_taken}
            />
          </div>

          {/* REFERRER DETAILS */}
          <div className="form-section">
            <h2 className="step-title">Referrer Details</h2>
            <div className="grid lg:grid-cols-2 gap-4">
              <DisplayField
                label="Referrer's First Name"
                value={
                  profileData?.first_name || referral?.referrer?.first_name
                }
              />{" "}
              <DisplayField
                label="Referrer's Last Name"
                value={
                  profileData?.last_name || referral?.referrer?.last_name || ""
                }
              />
            </div>
            <div className="grid gap-4">
              <DisplayField
                label="Referrer's Department"
                value={
                  profileData?.degree_program ||
                  referral?.referrer?.department_unit ||
                  ""
                }
              />
            </div>
            <div className="grid gap-3">
              <DisplayField
                label="Referrer's Email"
                value={profileData?.email || referral?.referrer?.email || ""}
              />
            </div>
            <div className="grid gap-4">
              <DisplayField
                label="Referrer's Contact Number"
                value={
                  profileData?.contact_number ||
                  referral?.referrer?.contact_number ||
                  ""
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSPreview;
