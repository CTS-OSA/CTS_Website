export const normalizeNumber = (formData) => {
  const normalizedData = JSON.parse(JSON.stringify(formData)); 

  if (normalizedData.family_data?.mother?.age !== "" && normalizedData.family_data?.mother?.age != null) {
    normalizedData.family_data.mother.age = 
      Number(normalizedData.family_data.mother.age);
  }

  if (normalizedData.family_data?.father?.age !== "" && normalizedData.family_data?.father?.age != null) {
    normalizedData.family_data.father.age = 
      Number(normalizedData.family_data.father.age);
  }

  if (Array.isArray(normalizedData.siblings)) {
    normalizedData.siblings = normalizedData.siblings.map(sibling => {
      let age = sibling.age;
      if (age !== "" && age !== null) {
        age = Number(age);
      }
      return { ...sibling, age: age };
    });
  }

  if (normalizedData.health_data?.height !== "") {
    normalizedData.health_data.height = 
      Number(normalizedData.health_data.height);
  }

  if (normalizedData.health_data?.weight !== "") {
    normalizedData.health_data.weight = 
      Number(normalizedData.health_data.weight);
  }

  if (normalizedData.health_data?.weight !== "") {
    normalizedData.health_data.weight = 
      Number(normalizedData.health_data.weight);
  }

  if (Array.isArray(normalizedData.previous_school_record)) {
    normalizedData.previous_school_record = normalizedData.previous_school_record.map(previous_school_record => {
      let start_year = previous_school_record.start_year;
      let end_year = previous_school_record.end_year;
      let senior_high_gpa = previous_school_record.senior_high_gpa;
      if (start_year !== "" && start_year !== null) {
        start_year = Number(start_year);
      }
      if (end_year !== "" && end_year !== null) {
        end_year = Number(end_year);
      }
      if (senior_high_gpa !== "" && senior_high_gpa !== null) {
        senior_high_gpa = Number(senior_high_gpa);
      }
      return { ...previous_school_record, start_year: start_year, end_year: end_year, senior_high_gpa: senior_high_gpa };
    });
  }
  return normalizedData;
};

export const normalizeList = (formData) => {
    const normalizedData = JSON.parse(JSON.stringify(formData));

    const parseListByComma = (value) => {
        if (!value || typeof value !== 'string') {
            return [];
        }
        return value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    };

    const parseListByNewline = (value) => {
      if (!value || typeof value !== 'string') return [];
      return value
          .split('\n') 
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
  };

    if (normalizedData.health_data?.physical_disabilities !== undefined) {
        normalizedData.health_data.physical_disabilities = 
            parseListByComma(normalizedData.health_data.physical_disabilities);
    }

    if (normalizedData.health_data?.common_ailments !== undefined) {
        normalizedData.health_data.common_ailments = 
            parseListByComma(normalizedData.health_data.common_ailments);
    }

    if (normalizedData.scholarship?.scholarships_and_assistance !== undefined) {
      normalizedData.scholarship.scholarships_and_assistance =  parseListByNewline(normalizedData.scholarship.scholarships_and_assistance)
    }
    
    return normalizedData;
};