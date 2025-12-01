import React from "react";

const EditableField = ({
  label,
  value,
  onChange,
  readOnly = false,
  type = "text",
  options = [],
  error = "",
}) => {
  const selectedOptionLabel =
    options.find((opt) => opt.value === value)?.label || "";
  const isError = !readOnly && Boolean(error);
  const baseInputStyle = {
    fontSize: "1rem",
    border: "none",
    borderBottom: `1px solid ${isError ? "#DC2626" : "black"}`,
    background: "transparent",
    outline: "none",
    width: "100%",
    marginBottom: "4px",
    paddingBottom: "10px",
    textAlign: "center",
    color: "black",
  };

  return (
    <div
      className="font-normal p-0 bg-transparent text-center mt-6"
      style={{ textAlign: "center" }}
    >
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
              ...baseInputStyle,
              cursor: readOnly ? "default" : "pointer",
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
            ...baseInputStyle,
            cursor: readOnly ? "default" : "text",
          }}
        />
      )}

      {!readOnly && error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
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
