import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import PARDViewPage from './PARDViewPage';
import { useFormApi } from '../forms/PARD/PARDApi';
import { AuthContext } from '../context/AuthContext';
import DefaultLayout from '../components/DefaultLayout';
import Loader from '../components/Loader';

const PARDProfilePage = () => {
  const { getFormData } = useFormApi(); 
  const { profileData } = useContext(AuthContext);
  const { submission_id } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!submission_id) {
        setError('Submission ID is not available.');
        setLoading(false);
        return;
      }

      try {
        const data = await getFormData(submission_id);
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

  }, [submission_id]); 

  if (loading) return <Loader />;
  if (error) return <div className="error">{error}</div>;

  return (
    <DefaultLayout variant="student">
      <PARDViewPage profileData={profileData} formData={formData} />
    </DefaultLayout>
  );
};

export default PARDProfilePage;
