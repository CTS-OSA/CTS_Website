import { useApiRequest } from "../../context/ApiRequestContext";

const BASE_URL = "http://localhost:8000/api/forms/student/counseling-referral-slip";

export const useFormApi = () => {
  const { request } = useApiRequest();

  // Create a new referral
  const submitReferral = async (formData) => {
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
  const getReferral = async (submission_id) => {
    try {
      const response = await request(`${BASE_URL}/${submission_id}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 404)
      return { success: false, status: 404, data: null };


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
