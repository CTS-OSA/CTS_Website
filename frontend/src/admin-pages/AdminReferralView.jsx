import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApiRequest } from "../context/ApiRequestContext";
import DefaultLayout from "../components/DefaultLayout";
import Loader from "../components/Loader";
import ReferralSlipProfileView from "../student-pages/ReferralSlipViewPage";

export const AdminReferralView = () => {
  const { submission_id } = useParams();
  const { request } = useApiRequest();
  const [referralData, setReferralData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!submission_id) {
        setError("Missing referral ID.");
        setLoading(false);
        return;
      }

      try {
        // Fetch referral
        const resReferral = await request(`/api/forms/admin/referrals/${submission_id}/`);
        if (!resReferral.ok) throw new Error("Failed to fetch referral.");
        const referral = await resReferral.json();
        setReferralData(referral);

        // Fetch referrer profile using student number
        const studentNumber = referral.referral?.referrer?.student;
        if (studentNumber) {
          const resProfile = await request(`/api/forms/admin/students/${studentNumber}/`);
          if (!resProfile.ok) throw new Error("Failed to fetch student profile.");
          const profile = await resProfile.json();
          setProfileData(profile);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submission_id, request]);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  return (
    <DefaultLayout variant="admin">
      <ReferralSlipProfileView
        formData={referralData}
        profileData={profileData}
        isAdmin={true}
      />
    </DefaultLayout>
  );
};

export default AdminReferralView;
