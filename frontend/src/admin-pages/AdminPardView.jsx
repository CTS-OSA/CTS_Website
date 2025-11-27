import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApiRequest } from "../context/ApiRequestContext";
import DefaultLayout from "../components/DefaultLayout";
import PardProfileView from "../student-pages/PARDViewPage";
import Loader from "../components/Loader";

export const AdminPardView = () => {
  const { submission_id } = useParams();
  const { request } = useApiRequest();

  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formRes = await request(
          `http://localhost:8000/api/forms/admin/psychosocial-assistance-and-referral-desk/${submission_id}/`
        );
        if (!formRes.ok) throw new Error("Failed to fetch form data");
        const form = await formRes.json();
        setFormData({
          pard_data: form.pard_data,
          submission: form.submission
        });
        setProfileData(form.student_data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submission_id, request]);

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <DefaultLayout variant="admin">
      <PardProfileView profileData={profileData} formData={formData} />
    </DefaultLayout>
  );
};
