import React from "react";
import DisplayField from "../../components/DisplayField";
import { X } from "react-feather";
import ReactDOM from "react-dom";

const CounselorPreviewModal = ({ data, onClose, photoPreview }) => {
  if (!data) return null;

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>COUNSELOR PROFILE PREVIEW</h2>

        <div className="counselor_preview_wrapper">
          {/* PHOTO */}
          {photoPreview && (
            <div className="photo-preview-section border-b pb-4 mb-4 flex items-center space-x-6">
              <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-200">
                <img
                  src={photoPreview}
                  alt="Counselor Photo Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-gray-500 text-sm text-left">PHOTO</p>
              </div>
            </div>
          )}

          <div className="info-group">
            <p>
              <strong>PERSONAL INFORMATION</strong>
            </p>
            <DisplayField label="First Name" value={data.first_name} />
            <DisplayField label="Last Name" value={data.last_name} />
            <DisplayField label="Suffix" value={data.suffix} />
            <DisplayField label="Middle Name" value={data.middle_name} />
            <DisplayField label="Nickname" value={data.nickname} />
            <DisplayField label="Sex" value={data.sex} />
            <DisplayField label="Birthdate" value={data.birthdate} />
            <DisplayField label="Contact Number" value={data.contact_number} />
          </div>

          {/* POST NOMINAL */}
          <div className="info-group">
            <p>
              <strong>POST NOMINAL</strong>
            </p>
            {data.post_nominal?.length > 0 ? (
              data.post_nominal.map((item, index) => (
                <DisplayField
                  key={index}
                  label={`Post Nominal ${index + 1}`}
                  value={item || "N/A"}
                />
              ))
            ) : (
              <DisplayField label="Post Nominal" value="N/A" />
            )}
          </div>

          {/* POSITION */}
          <div className="info-group">
            <p>
              <strong>POSITION</strong>
            </p>
            {data.position?.length > 0 ? (
              data.position.map((item, index) => (
                <DisplayField
                  key={index}
                  label={`Position ${index + 1}`}
                  value={item || "N/A"}
                />
              ))
            ) : (
              <DisplayField label="Position" value="N/A" />
            )}
          </div>

          {/* LICENSES */}
          <div className="info-group">
            <p>
              <strong>LICENSES</strong>
            </p>
            {data.licenses?.length > 0 ? (
              data.licenses.map((license, index) => (
                <div key={index} className="grid lg:grid-cols-2 gap-4 pb-2">
                  <DisplayField
                    label="License Name"
                    value={license.name || "N/A"}
                  />
                  <DisplayField
                    label="License Number"
                    value={license.number || "N/A"}
                  />
                </div>
              ))
            ) : (
              <DisplayField label="Licenses" value="N/A" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CounselorPreviewModal;
