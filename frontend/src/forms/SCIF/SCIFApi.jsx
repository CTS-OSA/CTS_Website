import { useApiRequest } from "../../context/ApiRequestContext";

const BASE_URL =
  "http://localhost:8000/api/forms/student-cumulative-information-file";

const sectionKeys = [
  "family_data",
  "siblings",
  "previous_school_record",
  "health_data",
  "scholarship",
  "personality_traits",
  "family_relationship",
  "counseling_info",
  "privacy_consent",
];

export const useFormApi = () => {
  const { request } = useApiRequest();
  const arraySections = ["siblings"];

  const createDraftSubmission = async (studentNumber) => {
    const response = await request(`${BASE_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_number: studentNumber }),
    });

    if (response?.ok) {
      const data = await response.json();
      return data?.submission_id ?? null;
    }

    return null; 
  };

  const getFormBundle = async (studentNumber) => {
    const response = await request(
      `${BASE_URL}/?student_number=${studentNumber}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response?.ok) return null;

    const data = await response.json();

    if (data.exists === false) {
      return {
        exists: false,
        submission: null,
        sections: {},
      };
    }

    return data;
  };

  const saveDraft = async (submissionId, studentNumber, formData) => {
    const payload = {};
    sectionKeys.forEach((key) => {
      const value = formData[key];
      if (!value) return;

      if (key === "previous_school_record") {
        const records = Array.isArray(value.records) ? value.records : [];
        payload[key] = records.map((record) => ({
          ...record,
          submission: submissionId,
        }));
        return;
      }

      if (arraySections.includes(key) && Array.isArray(value)) {
        payload[key] = value.map((item) => ({
          ...item,
          submission: submissionId,
          students: item.students?.length ? item.students : [studentNumber],
        }));
      } else {
        payload[key] = {
          ...value,
          submission: submissionId,
          student_number: studentNumber,
        };
      }
    });
    const response = await request(`${BASE_URL}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // const responseData = await response.json();
    return response;
  };

  const finalizeSubmission = async (submissionId, studentNumber, formData) => {
    try {
      const draftResponse = await saveDraft(
        submissionId,
        studentNumber,
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
        data: { error: { error } },
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
