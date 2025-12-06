import React, { useEffect, useState, useContext } from 'react';
import SCIFProfileView from './SCIFViewPage';
import { useFormApi } from '../forms/SCIF/SCIFApi';
import { AuthContext } from '../context/AuthContext';
import DefaultLayout from '../components/DefaultLayout';
import Loader from '../components/Loader';
import { useParams } from 'react-router-dom';

const SCIFProfilePage = () => {
  const { getFormBundle } = useFormApi(); 
  const { submissionId } = useParams();
  const { profileData } = useContext(AuthContext); 
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!profileData?.student_number) {
        setError('Student number is not available.');
        setLoading(false);
        return;
      }

      try {
        const data = await getFormBundle(profileData.student_number);
        if (!data) {
          setError('Failed to load form data.');
          setLoading(false);
          return;
        }

        const transformedData = {
          siblings: data.siblings,
          family_data: data.family_data,
          health_data: data.health_data,
          previous_school_record: data.previous_school_record,
          scholarship: data.scholarship,
          personality_traits: data.personality_traits,
          family_relationship: data.family_relationship,
          counseling_info: data.counseling_info,
          guidance_notes: data.guidance_notes,
          privacy_consent: data.privacy_consent,
          submission: data.submission,
        };

        setFormData(transformedData);
      } catch (err) {
        setError('An error occurred while loading the form.');
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [profileData?.student_number]); 

  if (loading) return <Loader />;
  if (error) return <div className="error">{error}</div>;

  return (
    <DefaultLayout variant="student">
      <SCIFProfileView profileData={profileData} formData={formData} />
    </DefaultLayout>
  );
};

export default SCIFProfilePage;
