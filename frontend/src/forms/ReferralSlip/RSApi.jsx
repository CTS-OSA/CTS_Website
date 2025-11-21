import { useApiRequest } from "../../context/ApiRequestContext";

const BASE_URL = "http://localhost:8000/api/forms/counseling-referral-slip";

const sectionKeys = [
  "referral",
];

export const useFormApi = () => {
  const { request } = useApiRequest();
  const arraySections = [];

  const createDraftSubmission = async (studentNumber) => {
    const response = await request(`${BASE_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_number: studentNumber }),
    });

    return response?.ok ? await response.json() : null;
  };

  const getFormBundle = async (studentNumber) => {
    const response = await request(
      `${BASE_URL}/?student_number=${studentNumber}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response?.status === 404) return null;
    return response?.ok ? await response.json() : null;
  };

  const saveDraft = async (submissionId, formData) => {
    const payload = {};

    sectionKeys.forEach((key) => {
      if (formData[key]) {
        if (arraySections.includes(key) && Array.isArray(formData[key])) {
          payload[key] = formData[key].map((item) => ({
            ...item,
            submission: submissionId,
          }));
        } else {
          payload[key] = {
            ...formData[key],
            submission: submissionId,
          };
        }
      }
    });
    console.log("Payload:", payload);
    const response = await request(`${BASE_URL}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    return response;
  };

  const finalizeSubmission = async (submissionId, formData) => {
    try {
      const draftResponse = await saveDraft(
        submissionId,
        formData
      );

      if (!draftResponse.ok) {
        const draftError = await draftResponse.json();
        return {
          success: false,
          status: draftResponse.status,
          data: draftError,
          message: "Failed to save draft before finalizing.",
        };
      }

      const response = await request(
        `http://localhost:8000/api/forms/finalize/${submissionId}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
    createDraftSubmission,
    getFormBundle,
    saveDraft,
    finalizeSubmission,
  };
};
