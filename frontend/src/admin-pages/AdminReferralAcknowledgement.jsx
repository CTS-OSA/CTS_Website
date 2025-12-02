import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiRequest } from "../context/ApiRequestContext";
import { AuthContext } from "../context/AuthContext";
import DefaultLayout from "../components/DefaultLayout";
import Button from "../components/UIButton";
import FormField from "../components/FormField";
import Loader from "../components/Loader";

const RadioOption = ({ label, name, value, selectedValue, onChange }) => (
  <label className="flex items-start space-x-2 cursor-pointer group">
    <input
      type="radio"
      name={name}
      value={value}
      checked={selectedValue === value}
      onChange={onChange}
      className="mt-1 h-4 w-4 text-upmaroon cursor-pointer"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

export const AdminReferralAcknowledgement = () => {
  const { request } = useApiRequest();
  const { profileData } = useContext(AuthContext);
  const navigate = useNavigate();
  const { referralId } = useParams(); // This should now match submission_id

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [referralData, setReferralData] = useState(null);

  const [formData, setFormData] = useState({
    referredStudentName: "",
    referrerName: "",
    toOffice: "",
    dateOfVisitation: "",
    attendingGSS: "",
    status: "",
    followUpCount: "",
    referredToName: ""
  });

  useEffect(() => {
    const loadReferral = async () => {
      try {
        const response = await request(`/api/forms/referral-slip/${referralId}/`, {
          method: "GET",
        });

        if (response?.referral) {
          const r = response.referral;
          setReferralData(r);

          const referredName = `${r.referred_person?.first_name || ""} ${r.referred_person?.last_name || ""}`.trim();
          const referrerName = `${r.referrer?.first_name || ""} ${r.referrer?.last_name || ""}`.trim();

          setFormData(prev => ({
            ...prev,
            referredStudentName: referredName,
            referrerName: referrerName,
          }));
        }
      } catch (err) {
        console.error("Failed to load referral data:", err);
        alert("Failed to load referral information.");
      } finally {
        setLoading(false);
      }
    };

    loadReferral();
  }, [referralId, request]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleStatusChange = (e) => {
    const selected = e.target.value;

    setFormData(prev => ({
      ...prev,
      status: selected,
      followUpCount: selected === "no_show" ? prev.followUpCount : "",
      referredToName: selected === "referred" ? prev.referredToName : ""
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.toOffice.trim()) {
      newErrors.toOffice = "To: (Office/Department/College) is required";
    }
    if (!formData.dateOfVisitation) {
      newErrors.dateOfVisitation = "Date of visitation is required";
    }
    if (!formData.attendingGSS.trim()) {
      newErrors.attendingGSS = "Attending GSS is required";
    }
    if (!formData.status) {
      newErrors.status = "Please select a case status";
    }

    if (formData.status === "no_show" && !formData.followUpCount) {
      newErrors.followUpCount = "Follow-up count is required";
    }

    if (formData.status === "referred" && !formData.referredToName.trim()) {
      newErrors.referredToName = "Please specify who the student was referred to";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigate(`/admin/counseling-referral-slip/${referralId}`);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        referral_id: parseInt(referralId),
        referred_to_office: formData.toOffice,
        date_of_visitation: formData.dateOfVisitation,
        counselor_name: formData.attendingGSS,
        status: formData.status,
        follow_up: formData.status === "no_show" ? parseInt(formData.followUpCount) : null,
        referred_to: formData.status === "referred" ? formData.referredToName : null
      };

      await request(`/api/forms/referral-slip/${referralId}/acknowledgement/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Acknowledgement submitted successfully!");
      navigate(`/admin/counseling-referral-slip/${referralId}`);
    } catch (err) {
      console.error("Failed to submit acknowledgement:", err);
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout variant="admin">
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout variant="admin">
      <div className="absolute w-full h-[26em] left-0 top-0 bg-upmaroon -z-1"></div>

      <div className="relative flex flex-col min-h-screen">
        <div className="mt-[30px] mx-auto w-3/4 flex flex-col items-center">
          <h1 className="text-center font-bold text-[2rem] text-white">
            Referral Acknowledgement Receipt
          </h1>

          <div className="bg-white rounded-[15px] p-8 w-full mx-auto mb-[70px] shadow-md">

            <div className="border-upmaroon px-4 py-3 mb-6">
              <h2 className="text-upmaroon text-xl font-bold">
                REFERRED STUDENT COUNSELING DETAILS
              </h2>
            </div>

            {/* Referred Student Name (Read-only) */}
            <div className="mb-6">
              <FormField
                label="Referred Student Name"
                name="referredStudentName"
                value={formData.referredStudentName}
                disabled
                required
              />
            </div>

            {/* Referrer Name (Read-only) */}
            <div className="mb-6">
              <FormField
                label="Referrer Name"
                name="referrerName"
                value={formData.referrerName}
                disabled
                required
              />
            </div>

            {/* To: Office/Department/College */}
            <div className="mb-6">
              <FormField
                label="To: (Office / Department / College)"
                name="toOffice"
                value={formData.toOffice}
                onChange={handleChange}
                error={errors?.toOffice}
                placeholder="Enter office, department, or college"
                required
              />
            </div>

            {/* Date + Counselor */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <FormField
                label="Date of Visitation"
                name="dateOfVisitation"
                type="date"
                value={formData.dateOfVisitation}
                onChange={handleChange}
                error={errors?.dateOfVisitation}
                required
              />

              <FormField
                label="Attending GSS (Counselor Name)"
                name="attendingGSS"
                value={formData.attendingGSS}
                onChange={handleChange}
                error={errors?.attendingGSS}
                required
              />
            </div>

            {/* Status */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Status of the case at hand: <span className="text-red-500">*</span>
              </h3>

              {errors?.status && (
                <p className="text-red-500 text-sm mb-2">{errors.status}</p>
              )}

              <div className="space-y-2">
                <RadioOption label="Closed at Intake Interview" name="status" value="closed" selectedValue={formData.status} onChange={handleStatusChange} />
                <RadioOption label="For Counseling" name="status" value="for_counseling" selectedValue={formData.status} onChange={handleStatusChange} />
                <RadioOption label="For Psychological Testing" name="status" value="for_psych_test" selectedValue={formData.status} onChange={handleStatusChange} />
                <RadioOption label="Counseling Sessions are on-going" name="status" value="ongoing" selectedValue={formData.status} onChange={handleStatusChange} />
                <RadioOption label="Sessions Completed / Case Terminated" name="status" value="completed" selectedValue={formData.status} onChange={handleStatusChange} />
                <RadioOption label="Student did not show up" name="status" value="no_show" selectedValue={formData.status} onChange={handleStatusChange} />
                <RadioOption label="Referred to" name="status" value="referred" selectedValue={formData.status} onChange={handleStatusChange} />
              </div>
            </div>

            {/* Follow-Up Input */}
            {formData.status === "no_show" && (
              <div className="mt-3 ml-4">
                <label className="text-sm text-gray-700">
                  Number of follow-ups made: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="followUpCount"
                  value={formData.followUpCount}
                  onChange={handleChange}
                  className={`w-32 px-3 py-1 border rounded-md ${
                    errors?.followUpCount ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors?.followUpCount && (
                  <p className="text-red-500 text-sm">{errors.followUpCount}</p>
                )}
              </div>
            )}

            {/* Referred To */}
            {formData.status === "referred" && (
              <div className="mt-3 ml-4">
                <input
                  type="text"
                  name="referredToName"
                  value={formData.referredToName}
                  onChange={handleChange}
                  placeholder="Enter name of person/office referred to *"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors?.referredToName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors?.referredToName && (
                  <p className="text-red-500 text-sm mt-1">{errors.referredToName}</p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end mt-8 pt-6 border-t space-x-3">
              <Button variant="secondary" onClick={handleBack} disabled={submitting}>
                Back
              </Button>

              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Save"}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdminReferralAcknowledgement;