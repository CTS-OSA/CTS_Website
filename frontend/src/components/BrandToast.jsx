import React, { useEffect } from "react";

const BrandToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-[100px] left-1/2 -translate-x-1/2 z-[9999] animate-toast-in">
      <div className="px-5 py-3 rounded-xl shadow-lg text-white font-medium bg-upmaroon">
        {message}
      </div>

      <style>{`
        @keyframes toast-in {
          0% {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-toast-in {
          animation: toast-in 0.35s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BrandToast;
