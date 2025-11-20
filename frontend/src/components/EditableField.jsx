import React from "react";

const EditableField = ({
  label,
  value,
  onChange,
  readOnly = false,
  type = "text",
  options = [],
}) => {
  const selectedOptionLabel = options.find(opt => opt.value === value)?.label || "";

  return (
    <div className="font-normal p-0 bg-transparent text-center mt-6" style={{ textAlign: "center" }}>
      {type === "select" ? (
        readOnly ? (
          <div
            style={{
              fontSize: "1rem",
              borderBottom: "1px solid black",
              background: "transparent",
              outline: "none",
              width: "100%",
              marginBottom: "4px",
              paddingBottom: "10px",
              cursor: "default",
              textAlign: "center",
              color: "black",  
              userSelect: "text", 
            }}
          >
            {selectedOptionLabel || `Select ${label}`}
          </div>
        ) : (
          <select
            value={value}
            onChange={onChange}
            disabled={readOnly}
            style={{
              fontSize: "1rem",
              border: "none",
              borderBottom: "1px solid black",
              background: "transparent",
              outline: "none",
              width: "100%",
              marginBottom: "4px",
              paddingBottom: "10px",
              cursor: readOnly ? "default" : "pointer",
              textAlign: "center",
              color: "black",
            }}
          >
            <option value="">Select {label}</option>
            {options.map(({ value: optValue, label: optLabel }) => (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            ))}
          </select>
        )
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className="font-normal p-0 bg-transparent text-center"
          style={{
            fontSize: "1rem",
            border: "none",
            borderBottom: "1px solid black",
            background: "transparent",
            outline: "none",
            width: "100%",
            marginBottom: "4px",
            paddingBottom: "10px",
            cursor: readOnly ? "default" : "text",
            textAlign: "center",
            color: "black",
          }}
        />
      )}

        <p className="text-sm text-upmaroon">{label}:</p>

    </div>
  );
};
const ReadonlyField = ({ label, value }) => {
  return (
    <div className="mt-6">
      <input
        type="text"
        value={value}
        readOnly
        className="font-normal p-0 bg-transparent text-center"
        style={{
          fontSize: "1rem",
          border: "none",
          borderBottom: "1px solid black",
          background: "transparent",
          outline: "none",
          width: "100%",
          marginBottom: "4px",
          textAlign: "center",
          paddingBottom: "10px",
          cursor: "default",
          color: "inherit",
        }}
      />
      <p className="text-sm text-upmaroon">{label}:</p>
    </div>
  );
};

export { EditableField, ReadonlyField };
