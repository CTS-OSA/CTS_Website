import { useApiRequest } from '../../context/ApiRequestContext';

const BASE_URL = 'http://localhost:8000/api/forms/student-cumulative-information-file';

const sectionKeys = [
  'family_data',
  'siblings',
  'previous_school_record',
  'health_data',
  'scholarship',
  'personality_traits',
  'family_relationship',
  'counseling_info',
  'privacy_consent'
];

export const useFormApi = () => {
  const { request } = useApiRequest();
  const arraySections = ['siblings', 'previous_school_record'];

    const createDraftSubmission = async (studentNumber) => {
      const response = await request(`${BASE_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_number: studentNumber }),
      });

      if (response?.ok) {
        const responseData = await response.json();
        
        // Assuming the response contains the submission object with an id
        const submissionId = responseData?.submission?.id;
        
        if (submissionId) {
          return submissionId;  // Return the submissionId to use later
        }
      }
      
      return null;  // Return null if something goes wrong
    };


  const getFormBundle = async (studentNumber) => {
    const response = await request(`${BASE_URL}/?student_number=${studentNumber}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response?.status === 404) return null;
    return response?.ok ? await response.json() : null;
  };

  const saveDraft = async (submissionId, studentNumber, formData) => {
    const payload = {};
    sectionKeys.forEach((key) => {
    if (formData[key]) {
      if (arraySections.includes(key) && Array.isArray(formData[key])) {
        payload[key] = formData[key].map((item) => ({
          ...item,
          submission: submissionId,
          students: item.students?.length ? item.students : [studentNumber], // Fallback if empty
        }));
      } else {
        payload[key] = {
          ...formData[key],
          submission: submissionId,
          student_number: studentNumber,
        };
      }
    }
  });
    const response = await request(`${BASE_URL}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // const responseData = await response.json();
    return response;
  };

const finalizeSubmission = async (submissionId, studentNumber, formData) => {
  try {
    const draftResponse = await saveDraft(submissionId, studentNumber, formData);

    if (!draftResponse.ok) {
      const draftError = await draftResponse.json();
      return {
        success: false,
        status: draftResponse.status,
        data: draftError,
        message: 'Failed to save draft before finalizing.',
      };
    }

    const response = await request(
      `http://localhost:8000/api/forms/finalize/${submissionId}/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      data: { error: {error} },
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