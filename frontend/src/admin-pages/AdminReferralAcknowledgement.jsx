import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiRequest } from "../context/ApiRequestContext";
import DefaultLayout from "../components/DefaultLayout";
import Button from "../components/UIButton";
import FormField from "../components/FormField";
import Loader from "../components/Loader";
import { formatDate } from "../utils/helperFunctions";
import ConfirmDialog from "../components/ConfirmDialog";
import ToastMessage from "../components/ToastMessage";

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
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { submission_id } = useParams();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    referredStudentName: "",
    referrerName: "",
    referringDepartment: "",
    referralDate: "",
    dateOfVisitation: "",
    attendingGSS: "",
    status: "",
    followUpCount: "",
    referredToName: "",
  });

  // Load Acknowledgement + Prefill data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await request(
          `/api/forms/referrals/${submission_id}/acknowledgement/`,
          { method: "GET" }
        );
        const data = await response.json();

        setFormData({
          referredStudentName: data.referred_person_name || "",
          referrerName: data.referring_person_name || "",
          referringDepartment: data.referring_department || "",
          referralDate: formatDate(data.referral_date) || "",
          referralDateRaw: data.referral_date || "",
          dateOfVisitation: data.date_of_visitation || "",
          attendingGSS: data.counselor_name || "",
          status: data.status || "",
          followUpCount: data.follow_up || "",
          referredToName: data.referred_to || "",
          counselor_name: data.counselor_name || "",
        });
      } catch (err) {
        alert("Failed to load acknowledgement information.");
      } finally {
        setLoading(false);
      }
    };

    if (submission_id) fetchData();
  }, [submission_id, request]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Status enum handler
  const handleStatusChange = (e) => {
    const selected = e.target.value;

    setFormData((prev) => ({
      ...prev,
      status: selected,
      followUpCount: selected === "no_show" ? prev.followUpCount : "",
      referredToName: selected === "referred_to" ? prev.referredToName : "",
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.dateOfVisitation) {
      newErrors.dateOfVisitation = "Date of visitation is required";
    }

    if (formData.dateOfVisitation) {
      const visit = new Date(formData.dateOfVisitation);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      // Check if the visit date is in the future
      if (visit > today) {
        newErrors.dateOfVisitation =
          "Date of visitation cannot be in the future.";
      }

      if (formData.referralDateRaw) {
        const referral = new Date(formData.referralDateRaw);
        if (visit < referral) {
          newErrors.dateOfVisitation =
            "Date of visitation cannot be earlier than the referral date.";
        }
      }
    }

    if (!formData.status) {
      newErrors.status = "Please select a case status";
    }

    if (formData.status === "no_show" && !formData.followUpCount) {
      newErrors.followUpCount = "Follow-up count is required";
    }

    if (formData.status === "referred_to" && !formData.referredToName.trim()) {
      newErrors.referredToName =
        "Please specify who the student was referred to";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleConfirmAction = () => {
    setShowConfirmDialog(false);
    handleSubmit();
  };
  // Submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    const payload = {
      date_of_visitation: formData.dateOfVisitation,
      status: formData.status,
      follow_up:
        formData.status === "no_show" ? parseInt(formData.followUpCount) : null,
      referred_to:
        formData.status === "referred_to" ? formData.referredToName : null,
    };
    try {
      await request(`/api/forms/referrals/${submission_id}/acknowledgement/`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setShowSuccessToast(true);
      setTimeout(() => {
        navigate(`/admin/counseling-referral-slip/${submission_id}`, { state: { showSuccess: true } });
      }, 2000);
    } catch (err) {
      alert("Failed to save acknowledgement receipt.");
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

            {/* Read-only fields */}
            <FormField
              label="Referred Student Name"
              value={formData.referredStudentName}
              disabled
            />
            <FormField
              label="Referred By"
              value={formData.referrerName}
              disabled
            />
            <FormField
              label="Department / Unit"
              value={formData.referringDepartment}
              disabled
            />
            <FormField
              label="Referral Date"
              value={formData.referralDate}
              disabled
            />

            {/* Visitation + Counselor */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <FormField
                label="Date of Visitation"
                name="dateOfVisitation"
                type="date"
                value={formData.dateOfVisitation}
                onChange={handleChange}
                error={errors.dateOfVisitation}
                required
              />

              <FormField
                label="Attending GSS (Counselor Name)"  
                value={formData.attendingGSS}
                disabled
              />
            </div>

            {/* STATUS OPTIONS */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Status of the case: <span className="text-red-500">*</span>
              </h3>

              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status}</p>
              )}

              <div className="space-y-2">
                <RadioOption
                  label="Closed at Intake Interview"
                  value="closed_intake"
                  selectedValue={formData.status}
                  name="status"
                  onChange={handleStatusChange}
                />
                <RadioOption
                  label="For Counseling"
                  value="for_counseling"
                  selectedValue={formData.status}
                  name="status"
                  onChange={handleStatusChange}
                />
                <RadioOption
                  label="For Psychological Testing"
                  value="for_psych_test"
                  selectedValue={formData.status}
                  name="status"
                  onChange={handleStatusChange}
                />
                <RadioOption
                  label="Counseling Sessions are on-going"
                  value="counseling_ongoing"
                  selectedValue={formData.status}
                  name="status"
                  onChange={handleStatusChange}
                />
                <RadioOption
                  label="Sessions Completed / Case Terminated"
                  value="counseling_completed"
                  selectedValue={formData.status}
                  name="status"
                  onChange={handleStatusChange}
                />
                <RadioOption
                  label="Student did not show up"
                  value="no_show"
                  selectedValue={formData.status}
                  name="status"
                  onChange={handleStatusChange}
                />
                <RadioOption
                  label="Referred to"
                  value="referred_to"
                  selectedValue={formData.status}
                  name="status"
                  onChange={handleStatusChange}
                />
              </div>
            </div>

            {/* Conditional Inputs */}
            {formData.status === "no_show" && (
              <div className="mt-3 ml-4">
                <label className="text-sm text-gray-700">
                  Number of follow-ups made:{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="followUpCount"
                  value={formData.followUpCount}
                  onChange={handleChange}
                  className={`w-32 px-3 py-1 border rounded-md ${
                    errors.followUpCount ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
            )}

            {formData.status === "referred_to" && (
              <div className="mt-3 ml-4">
                <input
                  type="text"
                  name="referredToName"
                  placeholder="Enter name of person/office referred to *"
                  value={formData.referredToName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.referredToName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end mt-8 pt-6 border-t space-x-3">
              <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                variant="primary"
                onClick={handleConfirmSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>
       {showConfirmDialog && (
        <ConfirmDialog
          title="Confirm Submission"
          message="You are about to submit the referral acknowledgement. Please ensure all information is correct before proceeding."
          onConfirm={handleConfirmAction}
          onCancel={handleConfirmCancel}
          confirmLabel = 'Submit'
          cancelLabel = 'Cancel'
        />
      )}
      {showSuccessToast && (
        <ToastMessage
          message="Referral acknowledgement submitted successfully."
          onClose={() => setShowSuccessToast(false)}
          duration={5000}
        />
      )}
    </DefaultLayout>
  );
};

export default AdminReferralAcknowledgement;
