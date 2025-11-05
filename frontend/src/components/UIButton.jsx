import React from "react";
import "./css/ui.css";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className,
  ...props
}) => {
  const variantClass =
    {
      primary: "btn-primary",
      secondary: "btn-secondary",
      tertiary: "btn-tertiary",
      danger: "btn-danger",
      green: "btn-green",
    }[variant] || "btn-primary";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
