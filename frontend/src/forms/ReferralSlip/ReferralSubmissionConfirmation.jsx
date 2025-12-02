import React from "react";

const ReferralSubmissionConfirmation = ({ isLoggedIn }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[500px] py-16 px-4">
      {/* ICON SECTION */}
      {isLoggedIn ? (
        // Logged-in icon (your original maroon circle with checkmark)
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
      ) : (
        // Guest icon (📖)
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-lg"
          style={{
            backgroundColor: "#7B1113",
            color: "white",
            fontSize: "50px",
            fontWeight: "bold",
            lineHeight: "60px",
            textAlign: "center",
          }}
        >
          &#128386;
        </div>
      )}

      {/* TITLE */}
      <h3 className="text-upmaroon font-bold text-4xl mb-4 text-center">
        {isLoggedIn ? "Submitted!" : "Almost Complete!"}
      </h3>

      {/* MESSAGE SECTION */}
      {isLoggedIn ? (
        <p className="text-center text-gray-700 text-base max-w-md">
          Thank you! Your form has been successfully submitted.
        </p>
      ) : (
        <p className="text-center text-gray-700 text-base max-w-md">
          Your referral is almost complete. To complete the process, please
          check your email and verify the submission.
        </p>
      )}
    </div>
  );
};

export default ReferralSubmissionConfirmation;
