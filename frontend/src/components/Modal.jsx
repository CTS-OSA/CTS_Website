import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function Modal({ children, type = "default", noHeader = false }) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original);
  }, []);

  const icon = {
    success: <CheckCircle size={42} strokeWidth={1.7} className="text-white" />,
    error: <XCircle size={42} strokeWidth={1.7} className="text-white" />,
    warning: (
      <AlertTriangle size={42} strokeWidth={1.7} className="text-white" />
    ),
    default: null,
    loading: null,
  }[type];

  const showHeader = !noHeader && type !== "loading" && icon !== null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] opacity-100 transition-opacity duration-200"></div>

      {/* Modal Wrapper */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
        <div
          className="
            w-full max-w-lg bg-white rounded-2xl shadow-xl
            overflow-hidden transform transition-all duration-200
            opacity-100 translate-y-0
          "
        >
          {/* Header (hidden for loading or default) */}
          {showHeader && (
            <div className="w-full bg-[#7B1113] py-4 flex justify-center items-center">
              {icon}
            </div>
          )}

          {/* Body */}
          <div className="px-8 py-6 text-center text-gray-800 font-sans">
            {children}
          </div>

          {/* Footer button (DON'T show in loading modals) */}
          {type !== "loading" && (
            <div className="px-8 pb-6 flex justify-center">
              <button
                className="
                  bg-[#7B1113] text-white font-semibold tracking-wide
                  px-7 py-2.5 rounded-lg shadow-md
                  transition-colors duration-200
                  hover:bg-[#5e0d0f] active:scale-95
                "
                onClick={() => {
                  const evt = new CustomEvent("modal-ok");
                  window.dispatchEvent(evt);
                }}
              >
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
