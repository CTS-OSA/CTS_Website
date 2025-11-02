import React from "react";
import ReactDOM from "react-dom";
import SCIFCredentials from "./SCIFCredentials";
import SCIFPersonalData from "./SCIFPersonalData";
import SCIFFamilyData from "./SCIFFamilyData";
import SCIFHealthData from "./SCIFHealthData";
import SCIFPreviousSchoolRecord from "./SCIFPreviousSchoolRecord";
import SCIFScholarships from "./SCIFScholarships";
import SCIFOtherPersonalData from "./SCIFOtherPersonalData";
import SCIFCertify from "./SCIFCertify";
import { X } from "react-feather";

const SCIFPreview = ({ profileData, formData, onClose }) => {
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-11/12 max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-y-auto p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-2 right-2 float-right bg-white rounded-full p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition z-50"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h1 className="text-2xl font-semibold text-center text-gray-800 mt-2">
          Student Cumulative Information File
        </h1>
        <p className="text-center text-gray-500 mb-6">(Preview)</p>

        {/* Content (locked for editing) */}
        <div className="space-y-8 pointer-events-none select-none">
          <SCIFCredentials data={profileData} readOnly={true} />
          <SCIFPersonalData data={profileData} readOnly={true} />
          <SCIFFamilyData
            data={{
              family_data: formData.family_data,
              siblings: formData.siblings,
            }}
            readOnly={true}
          />
          <SCIFHealthData data={formData.health_data} readOnly={true} />
          <SCIFPreviousSchoolRecord
            data={formData.previous_school_record}
            readOnly={true}
          />
          <SCIFScholarships data={formData.scholarship} readOnly={true} />
          <SCIFOtherPersonalData
            data={{
              personality_traits: formData.personality_traits,
              family_relationship: formData.family_relationship,
              counseling_info: formData.counseling_info,
            }}
            readOnly={true}
          />
          <SCIFCertify data={formData} readOnly={true} style={{ padding: 0 }} />
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default SCIFPreview;
