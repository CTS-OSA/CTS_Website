import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApiRequest } from "../context/ApiRequestContext";
import DefaultLayout from "../components/DefaultLayout";
import BISProfileView from "../student-pages/BISViewPage";
import SCIFProfileView from "../student-pages/SCIFViewPage";
import Loader from "../components/Loader";

export const AdminSCIFView = () => {
  const { studentId } = useParams();
  const { request } = useApiRequest();

  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await request(`http://localhost:8000/api/forms/admin/students/${studentId}/`);
        if (!profileRes.ok) throw new Error("Failed to fetch student profile");
        const profile = await profileRes.json();
        setProfileData(profile);

        const formRes = await request(`http://localhost:8000/api/forms/admin/student-forms/${studentId}/student-cumulative-information-file/`);
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
      <SCIFProfileView profileData={profileData} formData={formData} isAdmin={true} />
    </DefaultLayout>
  );
};