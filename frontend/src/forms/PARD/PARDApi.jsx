import { data } from "react-router-dom";
import { useApiRequest } from "../../context/ApiRequestContext";
const BASE_URL = "http://localhost:8000/api/forms/psychosocial-assistance-and-referral-desk";

export const useFormApi = () => {
  const { request } = useApiRequest();

  const getFormBundle = async (studentNumber) => {
    const response = await request(
      `${BASE_URL}/?student_number=${studentNumber}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    );


    if (response?.status === 404) return null;
    return response?.ok ? await response.json() : null;
  };

  const getStudentData = async (studentNumber) => {
    try {
      const response = await request(`${BASE_URL}/student-data/${studentNumber}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching student data:", error);
      return null;
    }
  };

  const submitForm = async (studentNumber, formData) => {
    try {
      
      const response = await request(
        `${BASE_URL}/submit/${studentNumber}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      await response.json();

      return {
        success: response.ok,
      };
    } catch (error) {
      return {
        success: false,
        status: error.status || 500,
        data: error.data || { error: "Submission failed" }
      };
    }
  };

  const getFormData = async(submission_id) => {
    const response = await request(
      `${BASE_URL}/${submission_id}/`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    );

    if (response?.status === 404) return null;
    return response?.ok ? await response.json() : null;
  }

  return {
    getFormBundle,
    getStudentData,
    submitForm,
    getFormData
  };
};