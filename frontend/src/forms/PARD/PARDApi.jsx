import { useApiRequest } from "../../context/ApiRequestContext";
const BASE_URL = "http://localhost:8000/api/forms/pard";

export const useFormApi = () => {
  const { request } = useApiRequest();

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

  const submitForm = async (submissionId, studentNumber, formData) => {
    try {
      const response = await request(
        `${BASE_URL}/submit/${submissionId}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response", response);
      return { success: true, data: response };
    } catch (error) {
      console.error("Error finalizing submission:", error);
      return {
        success: false,
        status: error.status || 500,
        data: error.data || { error: "Submission failed" }
      };
    }
  };

  return {
    getFormBundle,
    getStudentData,
    submitForm,
  };
};