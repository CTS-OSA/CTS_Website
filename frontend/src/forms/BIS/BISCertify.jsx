import React from "react";

const BISCertify = ({ data, updateData, readOnly = false, setError }) => {
  return (
    <div className="p-4">
      <h3 className="text-upmaroon font-bold text-2xl mb-5">
        PRIVACY STATEMENT
      </h3>

      <div className="space-y-4 text-sm leading-7 text-gray-700">
        <p>
          The University of the Philippines takes your privacy seriously and we are committed to protecting your personal information.
        </p>
        
        <p>
          By submitting this form, you acknowledge that you have read and understood the UP Privacy Notice and consent to the collection, 
          use, and processing of your personal information as described therein.
        </p>

        <p>
          Read our full privacy policy at{" "}
          <a 
            href="https://privacy.up.edu.ph" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-upmaroon hover:underline font-medium"
          >
            https://privacy.up.edu.ph
          </a>
        </p>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 my-6">
          <h4 className="font-semibold text-gray-800 mb-3">Data Collection and Use</h4>
          <p className="text-sm text-gray-600">
            The information provided in this Basic Information Sheet will be used for student records, 
            academic planning, and institutional research purposes. Your data will be kept confidential 
            and will only be accessed by authorized university personnel.
          </p>
        </div>
      </div>

      {/* Checkbox Section */}
      <div className="mt-8 p-4 bg-upmaroon/5 rounded-lg border-2 border-upmaroon/20">
        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            required
            checked={data.privacy_consent?.has_consented || false}
            onChange={(e) => {
              updateData(e.target.checked);
              if (e.target.checked) {
                setError(null);
              }
            }}
            disabled={readOnly}
            className="w-5 h-5 mt-0.5 text-upmaroon focus:ring-upmaroon rounded cursor-pointer"
          />
          <label className="text-sm font-medium text-gray-700 cursor-pointer">
            I certify that I have read and understood the UP Privacy Notice, and I give my full consent 
            to the collection, use, and processing of my personal information as stated above.
          </label>
        </div>
      </div>

      {!data.privacy_consent?.has_consented && (
        <p className="text-xs text-gray-500 mt-3 italic">
          * You must agree to the Privacy Statement before you can submit this form.
        </p>
      )}
    </div>
  );
};

export default BISCertify;