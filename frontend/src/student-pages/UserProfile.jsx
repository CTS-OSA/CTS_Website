import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import StudentSideInfo from "./IndividualStudent";
import "./css/userDashboard.css";
import DefaultLayout from "../components/DefaultLayout";

export const UserProfile = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { request } = useApiRequest();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [submittedForms, setSubmittedForms] = useState([]);

  // const handleUpdateProfile = async (updatedData) => {
  //   try {
  //     const res = await request(
  //       "http://localhost:8000/api/forms/student/profile/update/",
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(updatedData),
  //       }
  //     );

  //     if (!res.ok) {
  //       return;
  //     }

  //     const updatedProfile = await res.json();
  //     setProfile(updatedProfile);
  //   } catch (error) {}
  // };

  const handleUpdateProfile = async (changedFields) => {
    try {
      const formData = new FormData();

      Object.entries(changedFields).forEach(([key, value]) => {
        if (key === "photoFile") {
          formData.append("photo", value);
        } else if (typeof value === "object" && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      const res = await request(
        "http://localhost:8000/api/forms/student/profile/update/",
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated) return;

      try {
        const res = await request(
          "http://localhost:8000/api/forms/student/profile/"
        );
        if (!res.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await res.json();

        if (data.exists === false) {
          setProfile({});
          setLoading(false);
          return;
        }

        setProfile(data);

        const formRes = await request(
          "http://localhost:8000/api/forms/display/submissions/"
        );
        if (formRes.ok) {
          const allForms = await formRes.json();
          const submitted = allForms.filter((f) => f.status === "submitted");
          setSubmittedForms(submitted);
        }
      } catch (err) {
        setError("Error fetching profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated, request]);

  useEffect(() => {
    if (profile && profile.is_complete) {
      navigate("/myprofile");
    }
  }, [profile, navigate]);
  const handleCompleteProfile = () => {
    navigate("/setup-profile");
  };

  if (!isAuthenticated || loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="no-profile">
        <p>{error}</p>
        <button
          onClick={handleCompleteProfile}
          className="btn-complete-profile"
        >
          Complete Your Profile
        </button>
      </div>
    );
  }

  if (profile && Object.keys(profile).length === 0) {
    return (
      <div>
        <DefaultLayout variant="student">
          <div className="protected_pages">
            <div className="no-profile">
              <p>No profile data available.</p>
              <button
                onClick={handleCompleteProfile}
                className="btn-complete-profile"
              >
                Complete Your Profile
              </button>
            </div>
          </div>
        </DefaultLayout>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="protected_pages">
        <DefaultLayout variant="student">
          <div>
            <div className="bg-upmaroon w-full h-60 ">
              <h1 className="text-[2rem] font-bold mb-[30px] text-white pt-10 text-center">
                MY PROFILE
              </h1>
            </div>
            <div className="bg-white -mt-30 mb-10 mx-auto w-[80%] lg:w-[94%] rounded-3xl p-10 min-h-screen shadow-md">
              <StudentSideInfo
                profileData={profile}
                submittedForms={submittedForms}
                onUpdate={handleUpdateProfile}
              />
            </div>
          </div>
        </DefaultLayout>
      </div>
    </div>
  );
};
