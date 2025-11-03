import React from "react";
import "../SetupProfile/css/multistep.css";
import { clearError } from "../../utils/helperFunctions";
import FormField from "../../components/FormField";

const ALPHA_REGEX = /^[A-Za-z\s]*$/;
const ALPHA_SPACE_REGEX = /[^A-Za-z\s]/g;
const ALPHA_NUM_COMMA_DASH_REGEX = /[^A-Za-z0-9\s,-]/g;

const RSRefferal = ({
  data,
  updateData,
  readOnly = false,
  errors,
  setErrors,
}) => {
  const handleChange = (e, section) => {
    if (readOnly) return;

    // const { name, value } = e.target; {
    //   updateData({
    //     ...data,
    //     [section]: { ...data[section], [name]: value },
    //   });
    // }
  };

  return (
    <div>
      <fieldset disabled={readOnly}>
        <h2 className="text-upmaroon text-2xl font-bold">REFERRAL DETAILS</h2>

        <div className="form-row full-width">
          <label className="form-label">
            Reason for Referral
          </label>
          <FormField
            // className={`form-input ${
            //   errors?.["socio_economic_status.scholarships"] ? "error" : ""
            // }`}
            type="textarea"
            name="scholarships"
            // value={data.socio_economic_status?.scholarships || ""}
            // onChange={(e) => handleChange(e, "socio_economic_status")}
            // onFocus={() => {
            //   clearError("socio_economic_status.scholarships");
            //   setErrors((prev) => ({
            //     ...prev,
            //     ["socio_economic_status.scholarships"]: undefined,
            //   }));
          // {errors?.["socio_economic_status.scholarships"] && (
          //   <small className="error-message">
          //     {errors["socio_economic_status.scholarships"]}
          //   </small>
          />
        </div>

        <div className="form-row full-width">
          <label className="form-label">
            Initial Actions Taken
          </label>
          <FormField
            // className={`form-input ${
            //   errors?.["socio_economic_status.scholarship_privileges"]
            //     ? "error"
            //     : ""
            // }`}
            type="textarea"
            name="scholarship_privileges"
            // value={data.socio_economic_status?.scholarship_privileges || ""}
            // onChange={(e) => handleChange(e, "socio_economic_status")}
          //   onFocus={() => {
          //     clearError("socio_economic_status.scholarship_privileges");
          //     setErrors((prev) => ({
          //       ...prev,
          //       ["socio_economic_status.scholarship_privileges"]: undefined,
          //     }));
          //   }}
          // // {errors?.["socio_economic_status.scholarship_privileges"] && (
          //   <small className="error-message">
          //     {errors["socio_economic_status.scholarship_privileges"]}
          //   </small>
          // )}
          />
        </div>
      </fieldset>
    </div>
  );
};

export default RSRefferal;