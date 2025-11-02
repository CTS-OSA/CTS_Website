import React from "react";
import FormField from "../../components/FormField";

const SCIFScholarships = ({ data, updateData, readOnly = false }) => {
  const handleRawChange = (newValue) => {
    if (readOnly) return;
    updateData({ scholarships_and_assistance: newValue });
  };

  const scholarshipsRawText =
    typeof data.scholarships_and_assistance === "string"
      ? data.scholarships_and_assistance
      : data.scholarships_and_assistance?.join("\n") || "";

  const scholarshipsArray = scholarshipsRawText
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item);

  return (
    <div className="form-section ">
      <fieldset className="" disabled={readOnly}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          List of Scholarships & Financial Assistance While in College
        </h2>

        {readOnly && scholarshipsArray.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666" }}>None</p>
        ) : (
          <FormField
            label="List your Scholarship/s and Financial Assistance here:"
            type="textarea"
            value={scholarshipsRawText}
            onChange={(e) => handleRawChange(e.target.value)}
            required={false}
            helpertext="Please include any scholarships, financial aid, or other assistance you are receiving. Please skip if none."
          />
        )}
      </fieldset>
    </div>
  );
};

export default SCIFScholarships;
