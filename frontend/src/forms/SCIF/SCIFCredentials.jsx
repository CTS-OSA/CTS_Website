import React from "react";
import "../SetupProfile/css/multistep.css";
import DisplayField from "../../components/DisplayField"; // Reusable field for read-only display

const SCIFCredentials = ({ data }) => {
  if (!data) return <div>Loading...</div>;

  return (
    <div className="form-section">
      <h2 className="step-title mb-4">STUDENT CREDENTIALS</h2>

      {/* Read-Only Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DisplayField label="Student Number" value={data.student_number} />
        <DisplayField label="Degree Program" value={data.degree_program} />
      </div>

      {/* Date of Initial Entry Section */}
      <p className="step-info mb-2">Date of Initial Entry</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DisplayField label="Semester" value={data.date_initial_entry_sem} />
        <DisplayField label="Academic Year" value={data.date_initial_entry} />
      </div>
    </div>
  );
};

export default SCIFCredentials;
