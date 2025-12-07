import React from "react";
import "../SetupProfile/css/multistep.css";
import DisplayField from "../../components/DisplayField";

const getPhotoUrl = (data) => data?.photo?.image || data?.photo?.url || "";
const getInitials = (first = "", last = "") => {
  const initials = `${first?.charAt(0) ?? ""}${last?.charAt(0) ?? ""}`.trim();
  return initials.toUpperCase() || "ID";
};

const SCIFCredentials = ({ data }) => {
  if (!data) return <div>Loading...</div>;

  const photoUrl = getPhotoUrl(data);
  const initials = getInitials(data.first_name, data.last_name);

  return (
    <div className="form-section">
      <h2 className="text-upmaroon text-2xl font-bold mb-2">
        STUDENT CREDENTIALS
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-6 mb-6 mt-4">
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          <div
            className="bigger_avatar shadow-md overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-300"
            style={{
              borderRadius: "1rem",
              width: "min(220px, 65vw)",
              height: "min(220px, 65vw)",
              maxWidth: "220px",
              maxHeight: "220px",
              minWidth: "140px",
              minHeight: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${data.first_name || ""} ${data.last_name || ""} ID`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl sm:text-4xl font-semibold text-gray-500">
                {initials}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <DisplayField label="Student Number" value={data.student_number} />
        <DisplayField label="Degree Program" value={data.degree_program} />
      </div>
      <p className="step-info mb-2">Date of Initial Entry</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DisplayField label="Semester" value={data.date_initial_entry_sem} />
        <DisplayField label="Academic Year" value={data.date_initial_entry} />
      </div>
    </div>
  );
};

export default SCIFCredentials;
