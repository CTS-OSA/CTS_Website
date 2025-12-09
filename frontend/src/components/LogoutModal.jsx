import React from "react";
import { LogOut } from "lucide-react";

export default function LogoutModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Wrapper */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
        <div
          className="
            w-full max-w-lg bg-white rounded-2xl shadow-xl
            overflow-hidden transform transition-all duration-200
            animate-scaleIn
          "
        >

          {/* Header */}
          <div className="w-full bg-[#7B1113] py-5 flex flex-col items-center justify-center gap-2">
            <LogOut size={40} strokeWidth={1.7} className="text-white" />
          </div>

          {/* Body */}
          <div className="px-8 py-6 text-center text-gray-800 font-sans">
            <p className="text-gray-700 leading-relaxed text-base">
              Are you sure you want to log out? You will need to sign in again
              to access your profile and forms.
            </p>
          </div>

          {/* Actions */}
          <div className="px-8 pb-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onClose}
              className="
                w-full sm:w-auto px-7 py-2.5 rounded-lg font-medium
                bg-white border border-gray-300 text-gray-700
                hover:bg-gray-100 transition duration-200
              "
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="
                w-full sm:w-auto px-7 py-2.5 rounded-lg font-semibold text-white
                bg-[#7B1113] hover:bg-[#5e0d0f] transition duration-200
                flex items-center justify-center gap-2
              "
            >
              Log Out
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
