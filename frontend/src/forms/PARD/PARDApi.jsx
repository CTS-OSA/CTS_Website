import { useApiRequest } from "../../context/ApiRequestContext";
const BASE_URL = "http://localhost:8000/api/forms/pard";

export const useFormApi = () => {
  const { request } = useApiRequest();

  const createDraftSubmission = async (studentNumber) => {
    try {
      const response = await request("POST", "/pard/create-draft/", {
        student_number: studentNumber,
      });
      return response;
    } catch (error) {
      console.error("Error creating draft submission:", error);
      return null;
    }
  };

  const getFormBundle = async (studentNumber) => {
    try {
      const response = await request("GET", `/pard/bundle/${studentNumber}/`);
      return response;
    } catch (error) {
      console.error("Error fetching form bundle:", error);
      return null;
    }
  };

  const saveDraft = async (submissionId, studentNumber, formData) => {
    try {
      const response = await request("PUT", `/pard/draft/${submissionId}/`, {
        student_number: studentNumber,
        ...formData,
      });
      return response;
    } catch (error) {
      console.error("Error saving draft:", error);
      return null;
    }
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

  const finalizeSubmission = async (submissionId, studentNumber, formData) => {
    try {
      const response = await request("POST", `/pard/submit/${submissionId}/`, formData);
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
    createDraftSubmission,
    getFormBundle,
    saveDraft,
    getStudentData,
    finalizeSubmission,
  };
};