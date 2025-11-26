import React from "react";
import { getToken } from "../../utils/cookieUtils";

const RSSubmit = () => {
  const isLoggedIn = Boolean(getToken());

  return (
    <div className="form_container p-6 bg-white rounded shadow-md">
      <h2 className="text-upmaroon text-2xl font-bold pb-4">Submit Your Form</h2>

      {isLoggedIn ? (
        <>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Review all your information carefully.</li>
            <li>
              Click <strong>Preview</strong> to ensure everything looks correct.
            </li>
            <li>
              Click <strong>Submit</strong> to finalize your form.
            </li>
          </ol>
        </>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 space-y-3">
          <p className="font-medium text-yellow-800">Guest Submission Instructions:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Preview your submission to ensure all content is correct.</li>
            <li>
              Click <strong>Submit</strong>. An email will be sent to the address you provided.
            </li>
            <li>
              Verify your submission via the email link. <strong>Link expires in 24 hours.</strong>
            </li>
          </ol>
          <p className="text-red-700 font-semibold">
            Kindly note that unverified submissions cannot be processed.
          </p>
        </div>
      )}
    </div>
  );
};

export default RSSubmit;
