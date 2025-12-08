import React from "react";
import DisplayField from "../../components/DisplayField";
import "./css/multistep.css";
import { X } from "react-feather";
import ReactDOM from "react-dom";

const PreviewModal = ({ data, onClose, photoPreview }) => {
  if (!data) return null;

  const birthdate = `${data.birthYear}-${String(data.birthMonth).padStart(
    2,
    "0"
  )}-${String(data.birthDay).padStart(2, "0")}`;

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>PROFILE PREVIEW</h2>

        <div className="student_preview_wrapper flex flex-col gap-6">
          {photoPreview && (
            <div className="photo-preview-section mb-4 flex flex-col items-center gap-4 border-b pb-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
              <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-200">
                <img
                  src={photoPreview}
                  alt="Student Photo Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-gray-500 text-sm text-left">STUDENT PHOTO</p>
                <p className="text-lg font-semibold text-left">
                  {data.first_name} {data.last_name}
                </p>
              </div>
            </div>
          )}

          {/* PERSONAL INFORMATION */}
          <div className="info-group flex flex-col gap-4">
            <p>
              <strong>PERSONAL INFORMATION</strong>
            </p>
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              <DisplayField label="Family Name" value={data.last_name} />
              <DisplayField label="First Name" value={data.first_name} />
              <DisplayField label="Middle Name" value={data.middle_name} />
            </div>
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              <DisplayField label="Nickname" value={data.nickname} />
              <DisplayField label="Sex" value={data.sex} />
              <DisplayField label="Religion" value={data.religion} />
            </div>
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              <DisplayField label="Birthdate" value={birthdate} />
              <DisplayField label="Birth Place" value={data.birth_place} />
              <DisplayField label="Birth Rank" value={data.birth_rank} />
            </div>
            <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
              <DisplayField
                label="Landline"
                value={data.landline_number || "None"}
              />
              <DisplayField label="Mobile" value={data.mobile_number} />
            </div>
          </div>

          {/* EDUCATION INFORMATION */}
          <div className="info-group flex flex-col gap-4">
            <p>
              <strong>EDUCATION INFORMATION</strong>
            </p>
            <DisplayField label="Student Number" value={data.student_number} />
            <DisplayField label="College" value={data.college} />
            <DisplayField label="Degree Program" value={data.degree_program} />
            <DisplayField label="Year Level" value={data.current_year_level} />
          </div>

          {/* PERMANENT ADDRESS */}
          <div className="info-group flex flex-col gap-4">
            <p>
              <strong>PERMANENT ADDRESS</strong>
            </p>
            <DisplayField
              label="Address Line 1"
              value={data.permanent_address_line_1}
            />
            {data.permanent_address_line_2 && (
              <DisplayField
                label="Address Line 2"
                value={data.permanent_address_line_2}
              />
            )}
            <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
              <DisplayField label="Barangay" value={data.permanent_barangay} />
              <DisplayField
                label="City/Municipality"
                value={data.permanent_city_municipality}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              <DisplayField label="Province" value={data.permanent_province} />
              <DisplayField label="Region" value={data.permanent_region} />
              <DisplayField label="ZIP Code" value={data.permanent_zip_code} />
            </div>
          </div>

          {/* ADDRESS WHILE IN UP */}
          <div className="info-group flex flex-col gap-4">
            <p>
              <strong>ADDRESS WHILE IN UP</strong>
            </p>
            <DisplayField
              label="Address Line 1"
              value={data.up_address_line_1}
            />
            {data.up_address_line_2 && (
              <DisplayField
                label="Address Line 2"
                value={data.up_address_line_2}
              />
            )}
            <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
              <DisplayField label="Barangay" value={data.up_barangay} />
              <DisplayField
                label="City/Municipality"
                value={data.up_city_municipality}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              <DisplayField label="Province" value={data.up_province} />
              <DisplayField label="Region" value={data.up_region} />
              <DisplayField label="ZIP Code" value={data.up_zip_code} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default PreviewModal;
