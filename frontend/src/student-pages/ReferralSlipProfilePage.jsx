import React, { useEffect, useState, useContext } from 'react';
import ReferralSlipProfileView from './ReferralSlipViewPage';
import { useFormApi } from '../forms/ReferralSlip/RSApi';
import { AuthContext } from '../context/AuthContext';
import DefaultLayout from '../components/DefaultLayout';
import Loader from '../components/Loader';
import NotFound from '../pages/NotFound';
import { useParams } from 'react-router-dom';

const ReferralSlipProfilePage = () => {
  const { submission_id } = useParams();
  const { getReferral } = useFormApi(); 
  const { profileData } = useContext(AuthContext); 

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  // This will hold one of:
  // - null
  // - "404"
  // - message string
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!profileData?.student_number) {
        setError("Student number is not available.");
        setLoading(false);
        return;
      }

      try {
        const res = await getReferral(submission_id);

        if (res.status === 404) {
          setError("404");
          setLoading(false);
          return;
        }

        if (!res.success) {
          setError("Failed to load form data.");
          setLoading(false);
          return;
        }

        setFormData({ referral: res.data.referral });
      } catch (err) {
        setError("An error occurred while loading the form.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profileData?.student_number]);

  if (loading) return <Loader />;
  if (error === "404") return <NotFound />; 
  if (error) return <div className="error">{error}</div>;
  // ------------------------------------------------------------

  return (
    <DefaultLayout variant="student">
      <ReferralSlipProfileView 
        profileData={profileData} 
        formData={formData} 
      />
    </DefaultLayout>
  );
};

export default ReferralSlipProfilePage;
