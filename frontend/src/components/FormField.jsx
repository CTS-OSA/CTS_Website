import React from 'react';
import './css/formfield.css';
import './css/displayfield.css';

const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  name,
  required,
  error,
  options,
  disabled,
  readOnly = false,
  helpertext,
  ...rest
}) => {
  const isFilled = value && value.toString().trim().length > 0;

  if (readOnly) {
    const displayValue =
      type === "select"
        ? options?.find((opt) => opt.value === value)?.label || "N/A"
        : value || "N/A";

    return (
      <div className={`display-group ${isFilled ? 'filled' : ''}`}>
        <label className="display-label">{label}</label>
        <div className="display-value" style={{ color: 'black' }}>
          {displayValue}
        </div>
      </div>
    );
  }

  return (
    <div className={`form-group ${error ? 'error' : ''}`}>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`form-input ${isFilled ? 'filled' : ''}`}
          {...rest}
        >
          <option value=""></option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? ( 
        <textarea
          value={value}
          onChange={onChange}
          name={name}
          required={required}
          className={`form-input ${isFilled ? 'filled' : ''}`}
          disabled={disabled}
          rows={4} 
          {...rest}
        /> 
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          name={name}
          required={required}
          className={`form-input ${isFilled ? 'filled' : ''}`}
          disabled={disabled}
          {...rest}
        />
      )}
      <label className={isFilled ? 'active' : ''}>
        {label} {required && '*'}
      </label>
      {!error && helpertext && (
        <div className="helpertext">{helpertext}</div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FormField;
