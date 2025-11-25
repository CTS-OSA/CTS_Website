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

      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="flex flex-col items-center gap-2 mt-5">
          <div
            className="bigger_avatar shadow-md"
            style={{
              borderRadius: "1rem",
              width: "220px",
              height: "220px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${data.first_name || ""} ${data.last_name || ""} ID`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 600,
                  color: "#6b7280",
                }}
              >
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
