import { useApiRequest } from "../../context/ApiRequestContext";

const BASE_URL = "http://localhost:8000/api/forms/student/counseling-referral-slip";

export const useFormApi = () => {
  const { request } = useApiRequest();

  // Create a new referral
  const submitReferral = async (formData) => {
    console.log("Submitting referral:", formData);
    try {
      const response = await request(`${BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, status: response.status, data };
      }

      return { success: true, status: response.status, data };
    } catch (error) {
      return { success: false, status: 0, data: { error: "Network error" } };
    }
  };

  // Get a specific referral by ID
  const getReferral = async (referralId) => {
    try {
      const response = await request(`${BASE_URL}/${referralId}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 404) return null;

      const data = await response.json();
      if (!response.ok) {
        return { success: false, status: response.status, data };
      }

      return { success: true, status: response.status, data };
    } catch (error) {
      return { success: false, status: 0, data: { error: "Network error" } };
    }
  };

    const finalizeGuestSubmission = async (formData) => {
    try {
      const response = await request(
        `http://localhost:8000/api/forms/guest/create-referral-submission/`,
        {
          method: "POST",
          skipAuth: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }

      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          data,
        };
      }

      return {
        success: true,
        status: response.status,
        data,
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        data: { error: "Network error or unexpected issue occurred." },
      };
    }
  };

  return {
    submitReferral,
    getReferral,
    finalizeGuestSubmission
  };
};
