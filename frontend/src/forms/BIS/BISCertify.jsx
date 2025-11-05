import React from "react";
import "../SetupProfile/css/multistep.css";

const BISCertify = ({ data, updateData, readOnly = false, setError }) => {
  const hasConsented = data?.privacy_consent?.has_consented || false;

  const handleConsentChange = (e) => {
    if (readOnly) return;
    updateData(e.target.checked);
    if (e.target.checked) {
      setError(null);
    }
  };

  return (
    <div className="form-section">
      <fieldset className="form-section" disabled={readOnly}>
        <h2 className="step-title text-upmaroon">Privacy Statement</h2>

        <p className="privacy-description mb-4">
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

        <div className="flex flex-col gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">
              Data Collection and Use
            </h4>
            <p className="text-sm text-gray-600">
              The information provided in this Basic Information Sheet will be
              used for student records, academic planning, and institutional
              research purposes. Your data will be kept confidential and will
              only be accessed by authorized university personnel.
            </p>
          </div>

          <div className="text-sm leading-7 text-gray-700">
            <p>
              By submitting this form, you acknowledge that you have read and
              understood the UP Privacy Notice and consent to the collection,
              use, and processing of your personal information as described
              therein.
            </p>
          </div>
        </div>

        <div className="certify-agreement flex flex-col gap-2">
          <label className="form-label flex items-start gap-3">
            <input
              type="checkbox"
              name="has_consented"
              checked={hasConsented}
              onChange={handleConsentChange}
              className="mt-2 ml-2 h-5 w-5 border-gray-300 rounded"
              disabled={readOnly}
              required
            />
            <span className="text-sm leading-relaxed">
              I certify that I have read and understood the UP Privacy Notice,
              and I give my full consent to the collection, use, and processing
              of my personal information as stated above.
            </span>
          </label>

          {!hasConsented && (
            <div className="text-upmaroon text-sm mt-1">
              * You must agree to the Privacy Statement before you can submit
              this form.
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default BISCertify;