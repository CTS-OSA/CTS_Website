import React, { useEffect } from "react";
import "../components/css/Modal.css";

const Modal = ({ children }) => {
  useEffect(() => {
    // Disable background scrolling
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      // Restore scroll when modal unmounts
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className="modal-overlay fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
};

export default Modal;
