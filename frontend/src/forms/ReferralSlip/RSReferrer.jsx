import React from "react";
import FormField from "../../components/FormField";
import { clearError } from "../../utils/helperFunctions";

const RSReferrer = ({ profileData }) => {
    if (!profileData) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="form-container">
      <h2 className="text-upmaroon text-2xl font-bold pb-4">
        REFERRER DETAILS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Referrer's Last Name"
          value={profileData.last_name || ""}
          readOnly
        />
        <FormField
          label="Referrer's First Name"
          value={profileData.first_name || ""}
          readOnly  
        />
      </div>

      <div className="grid gap-4 pb-4">
        <FormField
          label="Unit/Department"
          value={profileData.degree_program || ""}
          readOnly
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        <FormField
          label="Email Address"
          type="email"
          name="referrer_email"
          value={profileData.email || ""}
          readOnly
        />
        <FormField
          label="Contact Number"
          name="referrer_contact_number"
          value={profileData.contact_number || ""}
          readOnly
        />
      </div>
    </div>
  );
};

export default RSReferrer;
