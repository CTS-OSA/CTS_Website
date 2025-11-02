import React from "react";
import ReactDOM from "react-dom";
import "./../SetupProfile/css/multistep.css";
import "./../../components/css/Modal.css";
import BISSocioeconomic from "./BISSocioeconomic";
import BISCertify from "./BISCertify";
import BISPresentScholastic from "./BISPresentScholastic";
import BISPreferences from "./BISPreferences";
import { X } from "react-feather";

const BISPreview = ({ profileData, formData, onClose }) => {
  const { scholastic_status, preferences, certify } = formData;

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="form-container">
          <h1 className="step-title" style={{ marginBottom: "10px", textAlign: "center" }}>
            Basic Information Sheet
          </h1>
          <p className="step-info">(Preview)</p>

          {/* PERSONAL DATA */}
          <div className="p-4">
            <h2 className="text-upmaroon text-2xl font-bold mb-2">PERSONAL DATA</h2>
            <p className="text-sm text-gray-600 mb-5">
              If you wish to update information in this section, please go to
              your profile and update it.
            </p>
            
            {/* Grid Layout matching other sections */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Surname */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Surname
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
                  />
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
                  />
                </div>

                {/* Middle Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={profileData.middle_name || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
                  />
                </div>

                {/* Nickname */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={profileData.nickname || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
                  />
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <input
                    type="text"
                    value={profileData.current_year_level || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
                  />
                </div>

                {/* Program/Course */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Program/Course
                  </label>
                  <input
                    type="text"
                    value={profileData.degree_program || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SOCIO-ECONOMIC STATUS */}
          <BISSocioeconomic
            data={{
              socio_economic_status: formData.socio_economic_status,
              student_support: formData.student_support,
            }}
            readOnly={true}
          />

          {/* SCHOOL PREFERENCES */}
          <BISPreferences data={formData.preferences} readOnly={true} />

          {/* SCHOLASTIC STATUS */}
          <BISPresentScholastic
            data={formData.scholastic_status}
            readOnly={true}
          />

          {/* PRIVACY CERTIFICATION */}
          <BISCertify data={formData} readOnly={true} />
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

export default BISPreview;