import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import DefaultLayout from "../components/DefaultLayout";
import CounselorSideInfo from "./AdminProfileInfo";

export const AdminProfile = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { request } = useApiRequest();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpdateProfile = async (updatedData) => {
    try {
      const formData = new FormData();

      for (const key in updatedData) {
        if (key === "photoFile") continue;

        const value = updatedData[key];

        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
          continue;
        }

        formData.append(key, value);
      }

      // 3ï¸âƒ£ Photo file
      if (updatedData.photoFile) {
        formData.append("photo", updatedData.photoFile);
      }

      const res = await request(
        "http://localhost:8000/api/forms/counselors/update/",
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
          "http://localhost:8000/api/forms/counselors/me/"
        );
        if (!res.ok) {
          if (res.status === 404) {
            setProfile({});
            setLoading(false);
            return;
          }
          throw new Error("Failed to fetch profile data");
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError("Error fetching profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated, request]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?role=student");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (profile && profile.is_complete) {
      navigate("/admin/myprofile");
    }
  }, [profile, navigate]);
  const handleCompleteProfile = () => {
    navigate("/admin/setup-profile");
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
              <h1 className="text-[2rem] font-bold mb-[30px] text-white ml-15 pt-10 text-center">
                MY PROFILE
              </h1>
            </div>
            <div className="bg-white -mt-30 mb-10 mx-auto w-[80%] lg:w-[94%] rounded-3xl p-10 min-h-screen shadow-md">
              <CounselorSideInfo
                profileData={profile}
                onUpdate={handleUpdateProfile}
              />
            </div>
          </div>
        </DefaultLayout>
      </div>
    </div>
  );
};



