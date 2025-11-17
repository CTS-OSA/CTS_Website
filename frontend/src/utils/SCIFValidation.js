export const validateParent = (formData) => {
  const errors = {};

  const mother = formData.family_data.mother || {};
  const father = formData.family_data.father || {};

  // --- MOTHER VALIDATION ---
  // If "None" is checked, skip all validation
  if (!mother.is_none) {
    // First name and last name are always required (even if deceased)
    if (!mother.first_name)
      errors["mother.first_name"] = "Mother's first name is required.";
    if (!mother.last_name)
      errors["mother.last_name"] = "Mother's last name is required.";

    // Age and contact number only required if NOT deceased
    if (!mother.is_deceased) {
      if (
        mother.age === undefined ||
        mother.age === null ||
        mother.age === ""
      ) {
        errors["mother.age"] = "Mother's age is required.";
      } else if (Number(mother.age) < 0) {
        errors["mother.age"] = "Mother's age must be 0 or greater.";
      }

      if (!mother.contact_number) {
        errors["mother.contact_number"] =
          "Mother's contact number is required.";
      } else if (!/^\+?\d{11}$/.test(mother.contact_number)) {
        errors["mother.contact_number"] =
          "Mother's contact must be a valid phone number.";
      }
    }
  }

  // --- FATHER VALIDATION ---
  // If "None" is checked, skip all validation
  if (!father.is_none) {
    // First name and last name are always required (even if deceased)
    if (!father.first_name)
      errors["father.first_name"] = "Father's first name is required.";
    if (!father.last_name)
      errors["father.last_name"] = "Father's last name is required.";

    // Age and contact number only required if NOT deceased
    if (!father.is_deceased) {
      if (
        father.age === undefined ||
        father.age === null ||
        father.age === ""
      ) {
        errors["father.age"] = "Father's age is required.";
      } else if (Number(father.age) < 0) {
        errors["father.age"] = "Father's age must be 0 or greater.";
      }

      if (!father.contact_number) {
        errors["father.contact_number"] =
          "Father's contact number is required.";
      } else if (!/^\+?\d{11}$/.test(father.contact_number)) {
        errors["father.contact_number"] =
          "Father's contact number must be a valid phone number.";
      }
    }
  }

  return errors;
};

export const validateGuardian = (formData) => {
  const errors = {};

  const guardian = formData.family_data.guardian || {};

  const hasAnyInputGuardian = Object.entries(guardian).some(
    ([key, value]) =>
      key !== "language_dialect" &&
      value !== null &&
      typeof value === "string" &&
      value.trim() !== ""
  );

  if (hasAnyInputGuardian) {
    if (!guardian.first_name)
      errors["guardian.first_name"] = "Guardian's first name is required.";
    if (!guardian.last_name)
      errors["guardian.last_name"] = "Guardian's last name is required.";
    if (!guardian.contact_number) {
      errors["guardian.contact_number"] =
        "Guardian's contact number is required.";
    } else if (!/^\+?\d{11}$/.test(guardian.contact_number)) {
      errors["guardian.contact_number"] =
        "Guardian's contact number must be a valid phone number.";
    }
    if (!guardian.address)
      errors["guardian.address"] = "Guardian's address is required.";
    if (!guardian.relationship_to_guardian) {
      errors["guardian.relationship_to_guardian"] =
        "Relationship to guardian is required.";
    }
    if (
      !Array.isArray(guardian.language_dialect) ||
      guardian.language_dialect.length === 0
    ) {
      errors["guardian.language_dialect"] =
        "Indicate at least one language or dialect.";
    }
  }
  return errors;
};

export const validateSibling = (formData) => {
  const errors = {};

  formData.siblings.forEach((sibling, index) => {
    const hasAnyInput = Object.entries(sibling).some(
      ([, value]) => value !== null && value !== ""
    );

    if (hasAnyInput) {
      const prefix = `siblings[${index}]`;

      if (!sibling.first_name)
        errors[`${prefix}.first_name`] = `Sibling #${
          index + 1
        }'s first name is required.`;
      if (!sibling.last_name)
        errors[`${prefix}.last_name`] = `Sibling #${
          index + 1
        }'s last name is required.`;
      if (!sibling.sex)
        errors[`${prefix}.sex`] = `Sibling #${index + 1}'s sex is required.`;
      if (!sibling.age) {
        errors[`${prefix}.age`] = `Sibling #${index + 1}'s age is required.`;
      } else if (Number(sibling.age) < 0) {
        errors[`${prefix}.age`] = `Sibling #${
          index + 1
        }'s age must be 0 or greater.`;
      }
      if (!sibling.educational_attainment) {
        errors[`${prefix}.educational_attainment`] = `Sibling #${
          index + 1
        }'s educational attainment is required.`;
      }
    }
  });

  return errors;
};

export const validateHealthData = (formData) => {
  const errors = {};
  const healthData = formData.health_data || {};

  const requiredFields = [
    "health_condition",
    "height",
    "weight",
    "eye_sight",
    "hearing",
  ];

  requiredFields.forEach((field) => {
    if (
      healthData[field] === undefined ||
      healthData[field] === null ||
      healthData[field] === ""
    ) {
      const label = field
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      errors[`health_data.${field}`] = `${label} is required.`;
    }
  });

  if (
    healthData.last_hospitalization &&
    (!healthData.reason_of_hospitalization ||
      healthData.reason_of_hospitalization.trim() === "")
  ) {
    errors["health_data.reason_of_hospitalization"] =
      "Reason for hospitalization is required if last hospitalization is specified.";
  }

  return errors;
};

export const validatePreviousSchool = (records) => {
  const errors = {};

  if (!Array.isArray(records)) {
    errors["previous_school"] = "Previous school records must be an array.";
    return errors;
  }

  const requiredLevels = {
    Primary: false,
    "Junior High": false,
    "Senior High": false,
  };

  records.forEach((record, index) => {
    const prefix = `previous_school[${index}]`;

    const requiredFields = ["education_level", "start_year", "end_year"];
    requiredFields.forEach((field) => {
      if (
        record[field] === undefined ||
        record[field] === null ||
        record[field] === ""
      ) {
        const label = field
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        errors[`${prefix}.${field}`] = `${label} is required.`;
      }
    });

    if (!record.school?.name) {
      errors[`${prefix}.school.name`] = "School name is required.";
    }

    const address = record.school?.school_address;
    const addressFields = [
      "address_line_1",
      "barangay",
      "city_municipality",
      "province",
      "region",
      "zip_code",
    ];

    if (!address) {
      errors[`${prefix}.school.school_address`] = "School address is required.";
    } else {
      addressFields.forEach((field) => {
        if (!address[field]) {
          const label = field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          errors[
            `${prefix}.school.school_address.${field}`
          ] = `${label} is required.`;
        }
      });
    }

    const yearRegex = /^\d{4}$/;

    if (!yearRegex.test(record.start_year)) {
      errors[`${prefix}.start_year`] =
        "Start year must be a 4-digit year (e.g., 2024).";
    }
    if (!yearRegex.test(record.end_year)) {
      errors[`${prefix}.end_year`] =
        "End year must be a 4-digit year (e.g., 2024).";
    }

    const start = Number(record.start_year);
    const end = Number(record.end_year);
    const MIN_YEAR = 1970;
    const currentYear = new Date().getFullYear();

    if (!yearRegex.test(record.start_year)) {
      errors[`${prefix}.start_year`] =
        "Start year must be a 4-digit year (e.g., 2024).";
    }
    if (!yearRegex.test(record.end_year)) {
      errors[`${prefix}.end_year`] =
        "End year must be a 4-digit year (e.g., 2024).";
    }

    if (!isNaN(start) && !isNaN(end)) {
      // --- MIN/MAX YEAR VALIDATION ---
      if (start < MIN_YEAR) {
        errors[
          `${prefix}.start_year`
        ] = `Start year cannot be earlier than ${MIN_YEAR}.`;
      }
      if (end < MIN_YEAR) {
        errors[
          `${prefix}.end_year`
        ] = `End year cannot be earlier than ${MIN_YEAR}.`;
      }
      if (start > currentYear) {
        errors[`${prefix}.start_year`] = "Start year cannot be in the future.";
      }
      if (end > currentYear) {
        errors[`${prefix}.end_year`] = "End year cannot be in the future.";
      }
      if (end < start) {
        errors[`${prefix}.end_year`] =
          "End year cannot be earlier than start year.";
      }
    }

    if (record.education_level === "Senior High") {
      if (
        record.senior_high_gpa === undefined ||
        record.senior_high_gpa === null ||
        record.senior_high_gpa === ""
      ) {
        errors[`${prefix}.senior_high_gpa`] = "Senior High GPA is required.";
      }
    } else {
      if (record.senior_high_gpa) {
        errors[`${prefix}.senior_high_gpa`] =
          "GPA must not be provided for non-Senior High education levels.";
      }
    }

    if (record.education_level in requiredLevels) {
      requiredLevels[record.education_level] = true;
    }
  });

  Object.entries(requiredLevels).forEach(([level, found]) => {
    if (!found) {
      errors[
        `previous_school_missing_${level.replace(/\s/g, "_").toLowerCase()}`
      ] = `At least one record for ${level} is required.`;
    }
  });

  return errors;
};

export const validatePersonalityTraits = (formData) => {
  const errors = {};

  const requiredFields = [
    "enrollment_reason",
    "degree_program_aspiration",
    "special_talents",
    "musical_instruments",
    "hobbies",
    "likes_in_people",
    "dislikes_in_people",
  ];

  requiredFields.forEach((field) => {
    const value = formData[field];
    if (value === undefined || value === null || value === "") {
      const label = field.replace(/_/g, " ");
      errors[`personality_traits.${field}`] = `${
        label.charAt(0).toUpperCase() + label.slice(1)
      } is required.`;
    }
  });

  if (
    formData.degree_program_aspiration === false &&
    (!formData.aspiration_explanation ||
      formData.aspiration_explanation.trim() === "")
  ) {
    errors["personality_traits.aspiration_explanation"] =
      "Aspiration explanation is required if degree program aspiration is false.";
  }

  return errors;
};

export const validateFamilyRelationship = (formData) => {
  const errors = {};

  if (!formData.closest_to) {
    errors["family_relationship.closest_to"] = "Closest to is required.";
  }

  if (
    formData.closest_to === "Other" &&
    (!formData.specify_other || formData.specify_other.trim() === "")
  ) {
    errors["family_relationship.specify_other"] =
      "Please specify the relationship when 'Other' is selected.";
  }

  return errors;
};

export const validateCounselingInfo = (formData) => {
  const errors = {};

  const requiredFields = [
    "personal_characteristics",
    "problem_confidant",
    "confidant_reason",
    "anticipated_problems",
  ];

  requiredFields.forEach((field) => {
    if (!formData[field]) {
      const label = field.replace(/_/g, " ");
      errors[`counseling_info.${field}`] = `${
        label.charAt(0).toUpperCase() + label.slice(1)
      } is required.`;
    }
  });

  if (formData.previous_counseling) {
    if (!formData.counseling_location) {
      errors["counseling_info.counseling_location"] =
        "Counseling location is required.";
    }
    if (!formData.counseling_reason) {
      errors["counseling_info.counseling_reason"] =
        "Counseling reason is required.";
    }
    if (!formData.counseling_counselor) {
      errors["counseling_info.counseling_counselor"] =
        "Counseling reason is required.";
    }
  }

  return errors;
};
