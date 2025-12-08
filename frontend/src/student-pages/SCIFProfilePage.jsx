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
      if (profileData === null) {
        return;
      }
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

        const sections = data.sections || {};
        const siblings = Array.isArray(sections.siblings)
          ? sections.siblings
          : Array.isArray(data.siblings)
            ? data.siblings
            : [];
        const previousSchoolRecords =
          sections.previous_school_record?.records ??
          (Array.isArray(data.previous_school_record)
            ? data.previous_school_record
            : Array.isArray(data.previous_school_record?.records)
              ? data.previous_school_record.records
              : []);

        const psychometricRaw =
          sections.psychometric_data ??
          data.psychometric_data ??
          null;
        const transformedData = {
          submission: data.submission,
          family_data: sections.family_data || data.family_data || {},
          siblings,
          previous_school_record: Array.isArray(previousSchoolRecords)
            ? previousSchoolRecords
            : [],
          health_data: sections.health_data || data.health_data || {},
          scholarship: sections.scholarship || data.scholarship || {},
          personality_traits:
            sections.personality_traits || data.personality_traits || {},
          family_relationship:
            sections.family_relationship || data.family_relationship || {},
          counseling_info:
            sections.counseling_info || data.counseling_info || {},
          privacy_consent:
            sections.privacy_consent || data.privacy_consent || {},
          psychometric_data: psychometricRaw,
          guidance_notes: data.guidance_notes || null,
          college_awards: data.college_awards ?? sections.college_awards ?? [],
          memberships: data.memberships ?? sections.memberships ?? [],
        };

        if (!transformedData.submission) {
          setError('No SCIF submission found.');
          setLoading(false);
          return;
        }

        setFormData(transformedData);
        setError('');
      } catch (err) {
        setError('An error occurred while loading the form.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getFormBundle, profileData?.student_number]);

  if (loading) return <Loader />;
  if (error) return <div className="error">{error}</div>;

  return (
    <DefaultLayout variant="student">
      <SCIFProfileView profileData={profileData} formData={formData} />
    </DefaultLayout>
  );
};

export default SCIFProfilePage;
