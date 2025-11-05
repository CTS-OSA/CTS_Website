import React from "react";
import { LogOut } from "react-feather";

const LogoutModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-roboto">
        <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className=" p-6 flex items-center justify-center border-b border-gray-200">
            <h2 className="text-xl font-bold text-upmaroon text-center w-full">
              LOG OUT
            </h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 text-base leading-relaxed">
              Are you sure you want to log out? You'll need to sign in again to
              access your profile and forms.
            </p>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-upmaroon hover:bg-red-700 transition duration-200 flex items-center gap-2"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;
