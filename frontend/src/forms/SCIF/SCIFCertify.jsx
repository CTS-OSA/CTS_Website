import React from "react";
import "../SetupProfile/css/multistep.css";

const SCIFCertify = ({ data, updateData, showError, readOnly = false }) => {
  const hasConsented = data?.privacy_consent?.has_consented || false;

  const handleConsentChange = (e) => {
    if (readOnly) return;
    updateData({
      ...data,
      privacy_consent: {
        ...data.privacy_consent,
        has_consented: e.target.checked,
      },
    });
  };

  return (
    <div className="form-section w-full">
      <fieldset className="space-y-4 w-full" disabled={readOnly}>
        <h2 className="text-upmaroon text-2xl font-semibold">Privacy Statement</h2>

        <p className="privacy-description mb-4 text-sm sm:text-base leading-relaxed text-gray-700 text-justify">
          The University of the Philippines takes your privacy seriously and we
          are committed to protecting your personal information. For the UP
          Privacy Policy, please visit{" "}
          <a
            href="https://privacy.up.edu.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-upmaroon underline hover:text-updlightmaroon"
          >
            https://privacy.up.edu.ph
          </a>
          .
        </p>

        <div className="certify-agreement flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <label className="form-label flex flex-col sm:flex-row sm:items-start gap-3 text-gray-800">
            <input
              type="checkbox"
              name="has_consented"
              checked={hasConsented}
              onChange={handleConsentChange}
              className="h-5 w-5 border-gray-300 rounded text-upmaroon accent-upmaroon sm:mt-1"
              disabled={readOnly}
            />
            <span className="text-xs sm:text-sm lg:text-base leading-relaxed flex-1">
              I have read the University of the Philippines’ Privacy Notice for
              Students. I understand that for the UP System to carry out its
              mandate under the 1987 Constitution, the UP Charter, and other
              laws, the University must necessarily process my personal and
              sensitive personal information. Therefore, I recognize the
              authority of the University of the Philippines to process my
              personal and sensitive personal information, pursuant to the UP
              Privacy Notice and applicable laws.
            </span>
          </label>

          {showError && !hasConsented && (
            <div className="text-upmaroon text-sm mt-1">
              Please agree to the privacy notice to proceed.
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default SCIFCertify;
