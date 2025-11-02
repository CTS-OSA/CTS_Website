import React from "react";

const FormField = ({
  id,
  label,
  type = "input",
  options = [],
  value,
  onChange,
  disabled = false,
  readOnly = false,
  error = "",
  helperText = "",
  required = false,
  className = "",
  ...props
}) => {
  const isFilled = value && value.toString().trim().length > 0;
  const isError = Boolean(error);

  // Read-only display mode
  if (readOnly) {
    const displayValue =
      type === "select"
        ? options?.find((opt) => opt.value === value)?.label || "N/A"
        : value || "N/A";

    return (
      <div className="relative w-full">
        <label
          htmlFor={id}
          className={`absolute pointer-events-none text-sm duration-300 transform left-2
            ${
              isFilled || isError
                ? "-translate-y-4 scale-75 top-2"
                : "scale-100 -translate-y-1/2 top-1/2"
            }
            z-2 origin-left bg-[#f9fafb] px-2
            ${
              disabled
                ? "text-gray-400"
                : isError
                ? "text-red-600"
                : "text-gray-500"
            }`}
        >
          {label} {required && "*"}
        </label>
        <div
          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm rounded-lg border
            ${isError ? "border-red-600" : "border-gray-300"}
            bg-gray-100 text-gray-700 cursor-not-allowed`}
        >
          {displayValue}
        </div>
      </div>
    );
  }

  // Editable mode
  const baseClasses = `block px-2.5 pb-2.5 pt-4 w-full text-sm rounded-lg appearance-none
    border ${
      disabled
        ? "text-gray-400 border-gray-300 cursor-not-allowed"
        : "text-gray-900 border-gray-300 focus:border-upmaroon"
    }
    ${isError ? "border-red-600 focus:border-red-600" : ""}
    focus:outline-none focus:ring-0 peer ${className}`;

  return (
    <div className="relative w-full">
      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder=" "
          disabled={disabled}
          required={required}
          className={baseClasses}
          rows={4}
          {...props}
        />
      ) : type === "select" ? (
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={baseClasses}
            {...props}
          >
            <option value="" disabled hidden></option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      ) : type === "date" ? (
        <input
          id={id}
          type="date"
          value={value}
          onChange={onChange}
          placeholder=" "
          disabled={disabled}
          required={required}
          className={baseClasses}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          disabled={disabled}
          required={required}
          className={baseClasses}
          {...props}
        />
      )}

      <label
        htmlFor={id}
        className={`absolute pointer-events-none text-sm duration-300 transform
          ${
            isFilled || isError || type === "date"
              ? "-translate-y-4 scale-75 top-2"
              : "scale-100 -translate-y-1/2 top-1/2"
          }
          z-2 origin-left bg-[#f9fafb] px-2
          ${
            disabled
              ? "text-gray-400"
              : isError
              ? "text-red-600"
              : "text-gray-500"
          }
          peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1`}
      >
        {label} {required && "*"}
      </label>

      {helperText && !isError && (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      )}
      {isError && (
        <p className="mt-2 text-xs text-red-600" id={`${id}_help`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
