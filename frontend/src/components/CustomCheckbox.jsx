import React from "react";

const CustomCheckbox = ({
  name,
  value,
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  const labelClassName = [
    "custom-checkbox",
    disabled && "custom-checkbox--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const indicatorClassName = [
    "custom-checkbox__indicator",
    checked && "custom-checkbox__indicator--checked",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={labelClassName}>
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="custom-checkbox__input"
      />
      <span className={indicatorClassName} aria-hidden="true">
        <span className="custom-checkbox__indicator-mark">✓</span>
      </span>
      <span className="custom-checkbox__label">{label}</span>
    </label>
  );
};

export default CustomCheckbox;
