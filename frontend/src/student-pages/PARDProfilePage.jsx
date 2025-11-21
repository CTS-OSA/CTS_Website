import React, { useEffect, useState, useContext } from 'react';
import PARDViewPage from './PARDViewPage';
import { useFormApi } from '../forms/PARD/PARDApi';
import { AuthContext } from '../context/AuthContext';
import DefaultLayout from '../components/DefaultLayout';
import Loader from '../components/Loader';

const PARDProfilePage = () => {
  const { getFormBundle } = useFormApi(); 
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
        console.log("data", data);
        if (!data) {
          setError('Failed to load form data.');
          setLoading(false);
          return;
        }

        const transformedData = {
          pard_data: data.pard_data,
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
      <PARDViewPage profileData={profileData} formData={formData} />
    </DefaultLayout>
  );
};

export default PARDProfilePage;
