import React from "react";
import DisplayField from "../../components/DisplayField";
import "../SetupProfile/css/multistep.css";
import { calculateAge } from "../../utils/helperFunctions";
import Loader from "../../components/Loader";

const SCIFPersonalData = ({ data }) => {
  if (!data) {
    return <Loader />;
  }

  return (
    <div className="student_personal_info_wrapper">
      <div className="student_personal_info">
        {/* PERSONAL INFO SECTION */}
        <h2 className="text-2xl font-bold text-gray-800">
          Personal Information
        </h2>
        <small>
          To update this information, please visit your{" "}
          <a
            href="/myprofile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-upmaroon underline"
          >
            Profile
          </a>{" "}
          page.
        </small>

        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
          <DisplayField label="First Name" value={data.first_name} />
          <DisplayField label="Last Name" value={data.last_name} />
          <DisplayField label="Middle Name" value={data.middle_name} />
        </div>

        {/* Basic details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <DisplayField label="Nickname" value={data.nickname} />
          <DisplayField label="Sex" value={data.sex} />
          <DisplayField label="Age" value={calculateAge(data.birthdate)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DisplayField label="Religion" value={data.religion} />
          <DisplayField label="Birth Rank" value={data.birth_rank} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DisplayField label="Birthdate" value={data.birthdate} />
          <DisplayField label="Birth Place" value={data.birthplace} />
        </div>

        {/* PERMANENT ADDRESS SECTION */}
        <p className="step-info subsection-form font-semibold mt-8">
          PERMANENT ADDRESS
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          <DisplayField
            label="Address Line 1"
            value={data.permanent_address.address_line_1}
          />
          <DisplayField
            label="Address Line 2"
            value={data.permanent_address.address_line_2 || " "}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DisplayField
            label="Barangay"
            value={data.permanent_address.barangay}
          />
          <DisplayField
            label="City/Municipality"
            value={data.permanent_address.city_municipality}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <DisplayField
            label="Province"
            value={data.permanent_address.province}
          />
          <DisplayField label="Region" value={data.permanent_address.region} />
          <DisplayField
            label="ZIP Code"
            value={data.permanent_address.zip_code}
          />
        </div>

        {/* CONTACT INFO SECTION */}
        <p className="step-info subsection-form font-semibold mt-8">
          CONTACT INFORMATION
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
          <DisplayField
            label="Landline/Contact Number"
            value={data.landline || "None"}
          />
          <DisplayField
            label="Cellphone/Mobile Number"
            value={data.contact_number}
          />
          <DisplayField label="Email Address" value={data.email} />
        </div>
      </div>
    </div>
  );
};

export default SCIFPersonalData;
