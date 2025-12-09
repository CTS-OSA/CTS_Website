import React from "react";
import { Trash2, Download } from "lucide-react";

const ConfirmDialog = ({
  title = "Are you sure?",
  message = "Please confirm your action.",
  onConfirm,
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
}) => {

  const lowerLabel = confirmLabel.toLowerCase();

  const renderIcon = () => {
    if (lowerLabel.includes("delete")) {
      return <Trash2 size={32} strokeWidth={1.8} />;
    }
    if (lowerLabel.includes("download")) {
      return <Download size={32} strokeWidth={1.8} />;
    }
    return null;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-roboto">
        <div
          className="
            bg-white 
            rounded-2xl 
            shadow-xl 
            w-full max-w-md 
            overflow-hidden
            animate-in fade-in zoom-in-95 duration-200
          "
        >
          {/* Header */}
          <div className="p-5 bg-upmaroon text-white flex flex-col items-center justify-center gap-2">
            {renderIcon()}
            {title && <h2 className="text-xl font-semibold text-center">{title}</h2>}
          </div>

          {/* Message */}
          <div className="p-6 text-center">
            <p className="text-gray-700 text-base leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-200">
            <button
              onClick={onCancel}
              className="
                w-full sm:w-auto px-5 py-2.5 
                rounded-lg font-medium 
                bg-white border border-gray-300 text-gray-700 
                hover:bg-gray-100 transition
              "
            >
              {cancelLabel}
            </button>

            <button
              onClick={onConfirm}
              className="
                w-full sm:w-auto px-5 py-2.5 
                rounded-lg font-medium 
                text-white bg-upmaroon hover:bg-red-700 
                transition flex items-center justify-center
              "
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
