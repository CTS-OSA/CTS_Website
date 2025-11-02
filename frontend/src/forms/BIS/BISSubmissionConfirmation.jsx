import React from "react";

const BISSubmissionConfirmation = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[500px] py-16 px-4">
      {/* Success Icon - Maroon circle with white checkmark */}
      <div className="w-24 h-24 bg-upmaroon rounded-full flex items-center justify-center mb-8 shadow-lg">
        <svg 
          className="w-14 h-14 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={3}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-upmaroon font-bold text-4xl mb-4 text-center">
        Submitted!
      </h3>

      {/* Message */}
      <p className="text-center text-gray-700 text-base max-w-md">
        Thank you! Your form has been successfully submitted.
      </p>
    </div>
  );
};

export default BISSubmissionConfirmation;