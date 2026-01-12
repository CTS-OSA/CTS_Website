import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApiRequest } from "../context/ApiRequestContext";
import DefaultLayout from "../components/DefaultLayout";
import BISProfileView from "../student-pages/BISViewPage";
import Loader from "../components/Loader";
import { BACKEND_URL_DEV } from "../config/env";

export const AdminBISView = () => {
  const { studentId } = useParams();
  const { request } = useApiRequest();

  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await request(`/api/forms/admin/students/${studentId}/`);
        if (!profileRes.ok) throw new Error("Failed to fetch student profile");
        const profile = await profileRes.json();
        setProfileData(profile);

        const formRes = await request(`/api/forms/admin/student-forms/${studentId}/basic-information-sheet/`);
        if (!formRes.ok) throw new Error("Failed to fetch form data");
        const form = await formRes.json();
        setFormData(form);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, request]);

    if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <DefaultLayout variant="admin">
      <BISProfileView profileData={profileData} formData={formData} />
    </DefaultLayout>
  );
};