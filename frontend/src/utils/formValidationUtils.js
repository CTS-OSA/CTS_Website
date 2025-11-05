const phonePattern = /^(\+63|0)\d{9,10}$/;

export function validatePersonalInfo(data) {
  const errors = {};

  const requiredFields = [
    'last_name',
    'first_name',
    'nickname',
    'birth_rank',
    'birthMonth',
    'birthDay',
    'birthYear',
    'birth_place',
    'mobile_number',
    'sex',
  ];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors[`personal_info.${field}`] = `This field is required.`;
    }
  });

  if (data.mobile_number && !phonePattern.test(data.mobile_number)) {
    errors['personal_info.mobile_number'] = 'Mobile number is invalid.';
  }

  if (data.landline_number && !phonePattern.test(data.landline_number)) {
    errors['personal_info.landline_number'] = 'Landline number is invalid.';
  }

  if (data.birth_rank && parseInt(data.birth_rank) <= 0) {
    errors['personal_info.birth_rank'] = 'Birth rank must be greater than 0.';
  }

  return errors;
}

const studentNumberPattern = /^\d{4}-\d{5}$/;

async function checkStudentNumberExists(studentNumber, request) {
  const url = `http://localhost:8000/api/forms/check-student-number/?student_number=${encodeURIComponent(studentNumber)}`;
  try {
    const response = await request(url);
    if (!response?.ok) throw new Error('Request failed');
    const data = await response.json();
    return data.exists;
  } catch (err) {
    throw err;
  }
}

export async function validateEducation(data, request) {
  const errors = {};
  const academicYearPattern = /^20\d{2}-20\d{2}$/;

  if (!data.student_number) {
    errors['education.student_number'] = 'This field is required.';
  } else if (!studentNumberPattern.test(data.student_number)) {
    errors['education.student_number'] = 'Student number must be in YYYY-##### format.';
  } else {
    try {
      const exists = await checkStudentNumberExists(data.student_number, request);
      if (exists) {
        errors['education.student_number'] = 'Student number already exists.';
      }
    } catch (err) {
      errors['education.student_number'] = 'Error validating student number.';
    }
  }

  const requiredFields = ['college', 'degree_program', 'current_year_level', 'date_initial_entry', 'date_initial_entry_sem'];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors[`education.${field}`] = 'This field is required.';
    }
  });

  if (!data.date_initial_entry || !academicYearPattern.test(data.date_initial_entry)) {
    errors['education.date_initial_entry'] = 'Format must be YYYY-YYYY using years from 2000 onward (e.g., 2023-2024).';
  } else {
    const [startYear, endYear] = data.date_initial_entry.split('-').map(Number);
    if (endYear !== startYear + 1) {
      errors['education.date_initial_entry'] = 'Please enter consecutive academic years (e.g., 2023-2024).';
    }
  }

  return errors;
}

export function validateAddress(address, prefix) {
  const errors = {};
  if (!address.line1) errors[`${prefix}.address_line_1`] = 'This field is required.';
  if (!address.barangay) errors[`${prefix}.barangay`] = 'This field is required.';
  if (!address.city_municipality) errors[`${prefix}.city_municipality`] = 'This field is required.';
  if (!address.province) errors[`${prefix}.province`] = 'This field is required.';
  if (!address.region) errors[`${prefix}.region`] = 'This field is required.';
  if (!address.zip) errors[`${prefix}.zip_code`] = 'This field is required.';

  return errors;
}

export function formatAddress(data, type) {
  return {
    line1: data[`${type}_address_line_1`],
    barangay: data[`${type}_barangay`],
    city_municipality: data[`${type}_city_municipality`],
    province: data[`${type}_province`],
    region: data[`${type}_region`],
    zip: data[`${type}_zip_code`],
  };
}

export function mergeProfileAndFormData(profileData, formData) {
  const mergeDeep = (target, source) => {
    const output = { ...target };
    if (source) {
      Object.keys(source).forEach((key) => {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          output[key] = mergeDeep(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  };

  return mergeDeep(profileData, formData);
}


export function validateEditableProfile(data) {
  const errors = {};

  // --- Helper for required fields ---
  const checkRequired = (fields, prefix = "") => {
    fields.forEach((f) => {
      const value = prefix ? data[prefix]?.[f] : data[f];
      if (!value || value.toString().trim() === "")
        errors[prefix ? `${prefix}.${f}` : f] = "This field is required.";
    });
  };

  checkRequired([
    "first_name",
    "last_name",
    "nickname",
    "sex",
    "birthdate",
    "birthplace",
    "birth_rank",
    "contact_number",
  ]);

  if (data.birth_rank && parseInt(data.birth_rank) <= 0)
    errors.birth_rank = "Birth rank must be greater than 0.";
  if (data.contact_number && !phonePattern.test(data.contact_number))
    errors.contact_number = "Contact number is invalid.";

  checkRequired(["college", "degree_program", "current_year_level"]);

  const addressFields = [
    "address_line_1",
    "barangay",
    "city_municipality",
    "province",
    "region",
    "zip_code",
  ];
  checkRequired(addressFields, "permanent_address");
  checkRequired(addressFields, "address_while_in_up");

  return errors;
}
