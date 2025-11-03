import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApiRequest } from '../context/ApiRequestContext';
import StudentSideInfo from '../student-pages/IndividualStudent';
import DefaultLayout from '../components/DefaultLayout';
import Loader from '../components/Loader';

export const AdminStudentView = () => {
  const { studentId } = useParams();
  const { request } = useApiRequest(); 
  const [student, setStudent] = useState(null);
  const [submittedForms, setSubmittedForms] = useState({}); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await request(`http://localhost:8000/api/forms/admin/students/${studentId}/`);

        if (res.ok) {
          const data = await res.json();
          setStudent(data);

          const formRes = await request(`http://localhost:8000/api/forms/admin/student-forms/${studentId}/`);
          if (formRes.ok) {
            const forms = await formRes.json();
            setSubmittedForms(forms); 
          } else {
            setError('Failed to fetch form submissions.');
          }
        } else {
          setError('Failed to fetch student data.');
        }
      } catch (err) {
        setError('Error fetching student data. Please try again.');
      } finally {
        setLoading(false); 
      }
    };

    fetchStudent();
  }, [studentId, request]);

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  // const handleUpdateProfile = async (updatedData) => {
  // try {
  //   const res = await request(
  //     `http://localhost:8000/api/forms/admin/students/${studentId}/update/`,
  //     {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(updatedData),
  //     }
  //   );

  //   if (!res.ok) {
  //     return;
  //   }

  //   const updatedProfile = await res.json();
  //     setProfile(updatedProfile);
  //   } catch (error) {
      
  //   }
  // };

    const handleUpdateProfile = async (updatedData) => {
    try {
      const formData = new FormData();
      for (const key in updatedData) {
        if (key === "photoFile") continue;

        const value = updatedData[key];

        if (typeof value === "object" && value !== null) {
          for (const subKey in value) {
            formData.append(`${key}.${subKey}`, value[subKey]);
          }
        } else {
          formData.append(key, value);
        }
      }

      if (updatedData.photoFile) {
        formData.append("photo", updatedData.photoFile);
      }

      const res = await request(
        `http://localhost:8000/api/forms/admin/students/${studentId}/update/`,
        {
          method: "PATCH",
          body: formData,
          headers: {},
        }
      );

      if (!res.ok) {
        console.error("Failed to update profile");
        return;
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  return (
    <div className="bg-gray-100 min-h-screen">
      <DefaultLayout variant="admin">
        <div>
            <div className="bg-upmaroon w-full h-60 ">
              <h1 className="text-[2rem] font-bold mb-[30px] text-white ml-15 pt-10">
                STUDENT PROFILE
              </h1>
            </div>
            <div className="bg-white -mt-30 mb-10 mx-auto w-[80%] lg:w-[94%] rounded-3xl p-10 min-h-screen shadow-md">
            <StudentSideInfo profileData={student} submittedForms={submittedForms} isAdmin={true} onUpdate={handleUpdateProfile} />
            </div>
          </div>
      </DefaultLayout>
    </div>
  );
};
