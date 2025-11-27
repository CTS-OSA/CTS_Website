import React from "react";

const CustomRadio = ({
  name,
  value,
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  const labelClassName = [
    "custom-radio",
    disabled && "custom-radio--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const indicatorClassName = [
    "custom-radio__indicator",
    checked && "custom-radio__indicator--checked",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={labelClassName}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="custom-radio__input"
      />
      <span className={indicatorClassName} aria-hidden="true">
        <span className="custom-radio__indicator-dot" />
      </span>
      <span className="custom-radio__label">{label}</span>
    </label>
  );
};

export default CustomRadio;
