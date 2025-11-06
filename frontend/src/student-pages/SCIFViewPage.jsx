import React, { useContext, useRef, useState, useEffect } from "react";
import "./css/pdfStyle.css";
import "./css/SCIFpdf.css";
import "../forms/SetupProfile/css/multistep.css";
import FormHeader from "./FormHeader";
import AutoResizeTextarea from "../components/AutoResizeTextarea";
import html2pdf from "html2pdf.js";
import { calculateAge } from "../utils/helperFunctions";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import ToastMessage from "../components/ToastMessage";
import Button from "../components/UIButton";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import BackToTopButton from "../components/BackToTop";

const SCIFProfileView = ({ profileData, formData, isAdmin }) => {
  const pdfRef = useRef();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const { request } = useApiRequest();
  const [errors, setErrors] = useState({});
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    last_name: "",
    first_name: "",
    middle_name: "",
    nickname: "",
    sex: "",
    age: "",
    religion: "",
    birth_rank: "",
    birthdate: "",
    birthplace: "",
    permanent_address: "",
    landline_number: "",
    email: "",
    contact_number: "",
    student_number: "",
    degree_program: "",
    date_initial_entry: "",
    father_name: "",
    father_age: "",
    father_job_occupation: "",
    father_company_agency: "",
    father_company_address: "",
    father_highest_educational_attainment: "",
    father_contact_number: "",
    mother_name: "",
    mother_age: "",
    mother_job_occupation: "",
    mother_company_agency: "",
    mother_company_address: "",
    mother_highest_educational_attainment: "",
    mother_contact_number: "",
    guardian_name: "",
    guardian_contact_number: "",
    guardian_address: "",
    guardian_relationship_to_guardian: "",
    guardian_language_dialect: "",
    scholarships_and_assistance: "",
    health_condition: "",
    height: "",
    weight: "",
    eyesight: "",
    hearing: "",
    physical_disabilities: "",
    common_ailments: "",
    last_hospitalization: "",
    reason_of_hospitalization: "",
    senior_high_gpa: "",
    enrollment_reason: "",
    program_match_goal: "",
    aspiration_explanation: "",
    special_talents: "",
    musical_instruments: "",
    hobbies: "",
    likes_in_people: "",
    dislikes_in_people: "",
    closest_to: "",
    personal_characteristics: "",
    problem_confidant: "",
    confidant_reason: "",
    potential_problems: "",
    previous_counseling: "",
    counseling_location: "",
    counseling_counselor: "",
    counseling_reason: "",
    guidance_notes: "",
  });

  useEffect(() => {
    if (formData && profileData) {
      const {
        family_data,
        personality_traits,
        health_data,
        previous_school_record,
        family_relationship,
        counseling_info,
        guidance_notes,
      } = formData;
      const father = family_data?.father;
      const mother = family_data?.mother;
      const guardian = family_data?.guardian;
      const seniorHighRecord = Array.isArray(previous_school_record)
        ? previous_school_record.find(
            (r) => r.education_level === "Senior High"
          )
        : null;

      setFormState({
        name: `${profileData.last_name}, ${profileData.first_name} ${profileData.middle_name}`,
        last_name: profileData.last_name || "",
        first_name: profileData.first_name || "",
        middle_name: profileData.middle_name || "",
        nickname: profileData.nickname || "",
        sex: profileData.sex || "",
        age: calculateAge(profileData.birthdate) || "",
        religion: profileData.religion || "",
        birth_rank: profileData.birth_rank || "",
        birthdate: profileData.birthdate || "",
        birthplace: profileData.birthplace || "",
        permanent_address:
          [
            profileData.permanent_address?.address_line_1,
            profileData.permanent_address?.barangay,
            profileData.permanent_address?.city_municipality,
            profileData.permanent_address?.province,
          ]
            .filter(Boolean)
            .join(", ") || "",
        landline_number: profileData.landline_number || "",
        email: profileData.email || "",
        contact_number: profileData.contact_number || "",
        student_number: profileData.student_number || "",
        degree_program: profileData.degree_program || "",
        date_initial_entry:
          `${profileData.date_initial_entry_sem} - AY ${profileData.date_initial_entry}` ||
          "",
        father_name: `${father?.first_name || ""} ${father?.last_name || ""}`,
        father_age: father?.age || "",
        father_job_occupation: father?.job_occupation || "",
        father_company_agency: father?.company_agency || "",
        father_company_address: father?.company_address || "",
        father_highest_educational_attainment:
          father?.highest_educational_attainment || "",
        father_contact_number: father?.contact_number || "",
        mother_name: `${mother?.first_name || ""} ${mother?.last_name || ""}`,
        mother_age: mother?.age || "",
        mother_job_occupation: mother?.job_occupation || "",
        mother_company_agency: mother?.company_agency || "",
        mother_company_address: mother?.company_address || "",
        mother_highest_educational_attainment:
          mother?.highest_educational_attainment || "",
        mother_contact_number: mother?.contact_number || "",
        guardian_name: `${guardian?.first_name || ""} ${
          guardian?.last_name || ""
        }`,
        guardian_contact_number: guardian?.contact_number || "",
        guardian_address: guardian?.address || "",
        guardian_relationship_to_guardian:
          guardian?.relationship_to_guardian || "",
        guardian_language_dialect: guardian?.language_dialect || "",
        scholarships_and_assistance:
          scholarship?.scholarships_and_assistance || [],
        health_condition: health_data?.health_condition || "",
        height: health_data?.height || "",
        weight: health_data?.weight || "",
        eyesight: health_data?.eye_sight || "",
        hearing: health_data?.hearing || "",
        physical_disabilities:
          health_data?.physical_disabilities?.join(", ") || "",
        common_ailments: health_data?.common_ailments?.join(", ") || "",
        last_hospitalization: health_data?.last_hospitalization || "",
        reason_of_hospitalization: health_data?.reason_of_hospitalization || "",
        senior_high_gpa: seniorHighRecord?.senior_high_gpa || "",
        enrollment_reason: personality_traits?.enrollment_reason || "",
        program_match_goal: personality_traits?.degree_program_aspiration
          ? "Yes"
          : "No",
        aspiration_explanation:
          personality_traits?.aspiration_explanation || "",
        special_talents: personality_traits?.special_talents || "",
        musical_instruments: personality_traits?.musical_instruments || "",
        hobbies: personality_traits?.hobbies || "",
        likes_in_people: personality_traits?.likes_in_people || "",
        dislikes_in_people: personality_traits?.dislikes_in_people || "",
        closest_to: family_relationship?.closest_to || "",

        personal_characteristics:
          counseling_info?.personal_characteristics || "",
        problem_confidant: counseling_info?.problem_confidant || "",
        confidant_reason: counseling_info?.confidant_reason || "",
        potential_problems: counseling_info?.anticipated_problems || "",
        previous_counseling: counseling_info?.previous_counseling
          ? "Yes"
          : "No",
        counseling_location: counseling_info?.counseling_location || "",
        counseling_counselor: counseling_info?.counseling_counselor || "",
        counseling_reason: counseling_info?.counseling_reason || "",
        guidance_notes: guidance_notes?.notes || "",
      });
    }
  }, [formData, profileData]);

  const handleDownloadClick = () => {
    setShowDownloadConfirm(true);
  };

  const handleConfirmDownload = () => {
    setShowDownloadConfirm(false);
    handleDownload();
    setDownloadToast("Download started!");
  };

  const handleCancelDownload = () => {
    setShowDownloadConfirm(false);
    setDownloadToast("Download cancelled.");
  };

  const handleReturn = () => {
    if (role === "admin" && profileData.student_number) {
      navigate(`/admin/students/${profileData.student_number}`);
    } else {
      navigate("/myprofile");
    }
  };

  const handleFieldChange = (field, value) => {
    if (role === "admin") {
      setFormState((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleConditionChange = (key) => {
    console.log("Role:", role, "Key:", key);
    setFormState((prev) => ({
      ...prev,
      health_condition: key,
    }));
  };

  const handleClosestOptionChange = (key) => {
    if (role === "admin") {
      setFormState((prev) => ({
        ...prev,
        closest_to: key,
      }));
    }
  };

  const handleScholarshipChange = (idx, e) => {
    const updated = [...formState.scholarships_and_assistance];
    updated[idx] = e.target.value;
    setFormState((prev) => ({
      ...prev,
      scholarships_and_assistance: updated,
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Validate required fields
    if (
      !formState.first_name ||
      formState.first_name.trim() === "" ||
      !formState.last_name ||
      formState.last_name.trim() === "" ||
      !formState.middle_name ||
      formState.middle_name.trim() === ""
    ) {
      newErrors.first_name = "Name cannot be empty.";
    }

    if (!formState.sex || formState.sex.trim() === "") {
      newErrors.sex = "Sex cannot be empty.";
    }

    if (!formState.religion || formState.religion.trim() === "") {
      newErrors.religion = "Religion cannot be empty.";
    }

    if (
      !formState.health_condition ||
      formState.health_condition.trim() === ""
    ) {
      newErrors.health_condition = "Health condition must be selected.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const response = await request(
        `/api/forms/edit/scif/${profileData.student_number}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formState),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDownloadToast(data.message);
      }
    } catch (error) {
      setDownloadToast("Failed to update form.");
    }
  };

  const handleDownload = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: "SCIF_Profile.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!profileData) return <div>Loading...</div>;

  const {
    family_data,
    personality_traits,
    health_data,
    previous_school_record,
    scholarship,
    siblings,
    family_relationship,
    counseling_info,
    submission,
    privacy_consent,
    organizations,
    awards,
  } = formData;

  const ConditionOptions = [
    { key: "Excellent", label: "Excellent" },
    { key: "Very Good", label: "Very Good" },
    { key: "Good", label: "Good" },
    { key: "Poor", label: "Poor" },
  ];

  const closestOptions = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Brother", label: "Brother(s)" },
    { value: "Sister", label: "Sister(s)" },
    { value: "Other", label: "Others (specify)" },
  ];

  const HealthConditionRadio = ({ selectedValue, onChange, role }) => {
    return (
      <div className="SCIF-inline health-condition-inline">
        <label>Health Condition:</label>
        <div className="radio-group-inline">
          {ConditionOptions.map((option) => (
            <label key={option.key} className="radio-option">
              <input
                type="radio"
                name="health_condition"
                value={option.key}
                checked={selectedValue === option.key}
                onChange={() => onChange(option.key)}
                disabled={role !== "admin"}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    );
  };

  const PreviousSchoolRecordsTable = ({ records }) => {
    if (!Array.isArray(records) || records.length === 0) {
      return <p>No school records available.</p>;
    }

    return (
      <table className="school-records-table">
        <thead>
          <tr>
            <th>Level</th>
            <th>Name of School</th>
            <th>Address</th>
            <th>Inclusive Years of Attendance</th>
            <th>Honor/s Received</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => {
            const address = [
              record.school.school_address.address_line_1,
              record.school.school_address.barangay,
              record.school.school_address.city_municipality,
              record.school.school_address.province,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <tr key={record.id || idx}>
                <td>{record.education_level}</td>
                <td>{record.school.name}</td>
                <td>{address}</td>
                <td>{`${record.start_year} - ${record.end_year}`}</td>
                <td>{record.honors_received}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const SiblingsTable = ({ siblings }) => {
    if (!Array.isArray(siblings) || siblings.length === 0) {
      return <p>No sibling data available.</p>;
    }

    return (
      <table className="siblings-table">
        <thead>
          <tr>
            <th>Brothers/Sisters</th>
            <th>Sex</th>
            <th>Age</th>
            <th>Job/Occupation</th>
            <th>Company/School</th>
            <th>Educational Attainment</th>
          </tr>
        </thead>
        <tbody>
          {siblings.map((sibling, index) => (
            <tr key={sibling.id || index}>
              <td>
                {sibling.first_name} {sibling.last_name}
              </td>
              <td>{sibling.sex}</td>
              <td>{sibling.age}</td>
              <td>{sibling.job_occupation}</td>
              <td>{sibling.company_school}</td>
              <td>{sibling.educational_attainment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  const seniorHighRecord = Array.isArray(previous_school_record)
    ? previous_school_record.find((r) => r.education_level === "Senior High")
    : null;

  const seniorHighGPA = seniorHighRecord?.senior_high_gpa || "";

  const ClosestToRadio = ({ selectedValue, specifyOther }) => {
    return (
      <div className="SCIF-inline closest-to-inline">
        <label>Closest to:</label>
        <div className="radio-group-inline">
          {closestOptions.map((option) => (
            <label key={option.value} className="radio-option">
              <input
                type="radio"
                name="closest_to"
                value={option.value}
                checked={selectedValue === option.value}
                onChange={handleClosestOptionChange}
                readOnly={role !== "admin"}
              />
              {option.label}
            </label>
          ))}
          {selectedValue === "Other" && (
            <input
              type="text"
              value={specifyOther || ""}
              readOnly
              placeholder="Specify other"
              className="input-other"
              style={{ marginLeft: "1rem" }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="pdf-buttons">
        <Button
          variant="secondary"
          onClick={handleReturn}
          style={{ marginLeft: "10px" }}
          className="pdf-button"
        >
          Return to Profile
        </Button>
        {role === "admin" && (
          <Button
            variant="secondary"
            onClick={handleSubmit}
            className="pdf-button"
          >
            Save Changes
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleDownloadClick}
          className="pdf-button"
        >
          Download as PDF
        </Button>
      </div>

      <div className="pdf" ref={pdfRef}>
        <FormHeader />

        <div className="sub-info">
          <div className="right">
            <p>
              <strong>OSA-CTS Form 01</strong>
            </p>
            <p>
              <strong>Revised 2022</strong>
            </p>
          </div>
          <div className="left">
            <p>
              <strong>CONFIDENTIAL FILE</strong>
            </p>
          </div>
        </div>

        <h3>STUDENT CUMULATIVE INFORMATION FILE (SCIF)</h3>
        <div className="SCIF-section-1 SCIF-section">
          <div className="SCIF-left">
            <div className="section-title">PERSONAL DATA:</div>
            <div className="SCIF-Name">
              <div className="SCIF-name-value">
                <input
                  type="text"
                  value={formState.last_name}
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
                <input
                  type="text"
                  value={formState.first_name}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
                <input
                  type="text"
                  value={formState.middle_name}
                  onChange={(e) =>
                    handleFieldChange("middle_name", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </div>
              <div className="SCIF-name-label">
                <label>FAMILY NAME</label>
                <label>FIRST NAME</label>
                <label>MIDDLE NAME</label>
              </div>
              {errors.first_name && (
                <div className="error-state-message text-center">
                  {errors.first_name}
                </div>
              )}
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                NICKNAME:{" "}
                <input
                  type="text"
                  value={formState.nickname}
                  onChange={(e) =>
                    handleFieldChange("nickname", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
              <div>
                <label>
                  SEX:
                  <select
                    value={formState.sex}
                    onChange={(e) => handleFieldChange("sex", e.target.value)}
                    disabled={role !== "admin"}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </label>
                {errors.sex && (
                  <div className="error-state-message">{errors.sex}</div>
                )}
              </div>
              <label>
                AGE:{" "}
                <input
                  type="text"
                  value={
                    isNaN(calculateAge(formState.birthdate))
                      ? ""
                      : calculateAge(formState.birthdate).toString()
                  }
                  onChange={(e) => handleFieldChange("age", e.target.value)}
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <div>
                <label>
                  RELIGION:{" "}
                  <input
                    type="text"
                    value={formState.religion}
                    onChange={(e) =>
                      handleFieldChange("religion", e.target.value)
                    }
                    readOnly={role !== "admin"}
                  />
                </label>
                {errors.religion && (
                  <div className="error-state-message">{errors.religion}</div>
                )}
              </div>
              <label>
                BIRTH RANK:{" "}
                <input
                  type="text"
                  value={formState.birth_rank}
                  onChange={(e) =>
                    handleFieldChange("birth_rank", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                BIRTH DATE
                <input
                  type="text"
                  value={formState.birthdate}
                  onChange={(e) =>
                    handleFieldChange("birthdate", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
              <label>
                BIRTH PLACE
                <input
                  type="text"
                  value={formState.birthplace}
                  onChange={(e) =>
                    handleFieldChange("birthplace", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                HOME/PERMANENT ADDRESS:
                <input
                  type="text"
                  readOnly={role !== "admin"}
                  value={formState.permanent_address}
                  onChange={(e) =>
                    handleFieldChange("permanent_address", e.target.value)
                  }
                />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                LANDLINE/CONTACT NO.:{" "}
                <input
                  type="text"
                  value={formState.landline_number || "None"}
                  onChange={(e) =>
                    handleFieldChange("landline_number", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                EMAIL:
                <input
                  type="text"
                  value={formState.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                CELLPHONE/MOBILE NO.:{" "}
                <input
                  type="text"
                  value={formState.contact_number}
                  onChange={(e) =>
                    handleFieldChange("contact_number", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
          </div>
          <div className="SCIF-right">
            <div
              className="bigger_avatar"
              style={{ borderRadius: "0", width: "200px", height: "200px" }}
            >
              {`${formState.first_name?.[0] || ""}${
                formState.last_name?.[0] || ""
              }`}
            </div>
            <input
              type="text"
              value={formState.student_number}
              onChange={(e) =>
                handleFieldChange("student_number", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            <label>STUDENT NUMBER</label>
            <input
              type="text"
              value={formState.degree_program}
              onChange={(e) =>
                handleFieldChange("degree_program", e.target.value)
              }
              readOnly={role !== "admin"}
            />
            <label>DEGREE PROGRAM</label>
            <input
              type="text"
              readOnly={role !== "admin"}
              value={formState.date_initial_entry}
              onChange={(e) =>
                handleFieldChange("date_initial_entry", e.target.value)
              }
            />
            <label>DATE OF INITIAL ENTRY</label>
          </div>
        </div>

        <div className="SCIF-section-2 SCIF-section">
          <div className="SCIF-left">
            <div className="section-title">FAMILY DATA</div>
            <div className="SCIF-inline">
              <div className="flex-row SCIF-inline">
                <label className="span-2">
                  Father’s Name:{" "}
                  <input
                    type="text"
                    value={formState.father_name}
                    readOnly={role !== "admin"}
                    onChange={(e) =>
                      handleFieldChange("father_name", e.target.value)
                    }
                  />
                </label>
                <label>
                  Age:
                  <input
                    type="text"
                    value={formState.father_age}
                    onChange={(e) =>
                      handleFieldChange("father_age", e.target.value)
                    }
                    readOnly={role !== "admin"}
                  />
                </label>
              </div>
              <label>
                Occupation:{" "}
                <input
                  type="text"
                  value={formState.father_job_occupation}
                  onChange={(e) =>
                    handleFieldChange("father_job_occupation", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
              <label>
                Company:{" "}
                <input
                  type="text"
                  value={formState.father_company_agency}
                  onChange={(e) =>
                    handleFieldChange("father_company_agency", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
              <label>
                <span className="label" style={{ width: "30%" }}>
                  Company Address:{" "}
                </span>
                <input
                  type="text"
                  value={formState.father_company_address}
                  onChange={(e) =>
                    handleFieldChange("father_company_address", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
              <label>
                <span className="label" style={{ width: "35%" }}>
                  Educational Attainment:{" "}
                </span>
                <input
                  type="text"
                  value={formState.father_highest_educational_attainment}
                  onChange={(e) =>
                    handleFieldChange(
                      "father_highest_educational_attainment",
                      e.target.value
                    )
                  }
                  readOnly={role !== "admin"}
                />
              </label>
              <label>
                <span className="label" style={{ width: "15%" }}>
                  Contact No.:{" "}
                </span>
                <input
                  type="text"
                  value={formState.father_contact_number}
                  onChange={(e) =>
                    handleFieldChange("father_contact_number", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
          </div>
          <div className="SCIF-right graduation">
            <label style={{ textAlign: "left", textDecoration: "underline" }}>
              Do not fill-out this portion
            </label>
            <input type="text" readOnly value=" Sem. AY 20    -20     " />
            <input type="text" readOnly value=""></input>
            <label>DATE OF GRADUATION</label>
            <input type="text" readOnly value=""></input>
            <label>DEGREE PROGRAM</label>
            <input type="text" readOnly value=""></input>
            <label>HONORS RECEIVED</label>
          </div>
        </div>

        <div className="SCIF-section">
          <div className="SCIF-inline">
            <div className="flex-row SCIF-inline">
              <label className="span-2">
                Mother’s Name:{" "}
                <input
                  type="text"
                  value={formState.mother_name}
                  readOnly={role !== "admin"}
                  onChange={(e) =>
                    handleFieldChange("mother_name", e.target.value)
                  }
                />
              </label>

              <label>
                Age:
                <input
                  type="text"
                  value={formState.mother_age}
                  onChange={(e) =>
                    handleFieldChange("mother_age", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                Occupation:{" "}
                <input
                  type="text"
                  value={formState.mother_job_occupation}
                  onChange={(e) =>
                    handleFieldChange("mother_job_occupation", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
              <label>
                Company:{" "}
                <input
                  type="text"
                  value={formState.mother_company_agency}
                  onChange={(e) =>
                    handleFieldChange("mother_company_agency", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                <span className="label" style={{ width: "19%" }}>
                  Company Address:{" "}
                </span>
                <input
                  type="text"
                  value={formState.mother_company_address}
                  onChange={(e) =>
                    handleFieldChange("mother_company_address", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                <span className="label" style={{ width: "35%" }}>
                  Educational Attainment:{" "}
                </span>{" "}
                <input
                  type="text"
                  value={formState.mother_highest_educational_attainment}
                  onChange={(e) =>
                    handleFieldChange(
                      "mother_educational_attainment",
                      e.target.value
                    )
                  }
                  readOnly={role !== "admin"}
                />
              </label>
              <label>
                <span className="label" style={{ width: "20%" }}>
                  Contact No.:{" "}
                </span>
                <input
                  type="text"
                  value={formState.mother_contact_number}
                  onChange={(e) =>
                    handleFieldChange("mother_contact_number", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="SCIF-section">
          <SiblingsTable siblings={siblings} />
        </div>
        <div className="SCIF-section SCIF-inline">
          <div className="section-title">GUARDIAN</div>
          <div className="flex-row SCIF-inline">
            <label>
              Guardian while in UP:{" "}
              <input
                type="text"
                value={formState.guardian_name || "N/A"}
                onChange={(e) =>
                  handleFieldChange("guardian_name", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              Contact No.:{" "}
              <input
                type="text"
                value={formState.guardian_contact_number || "N/A"}
                onChange={(e) =>
                  handleFieldChange("guardian_contact_number", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline flex-row">
            <label>
              Address:{" "}
              <input
                type="text"
                value={formState.guardian_address || "N/A"}
                onChange={(e) =>
                  handleFieldChange("guardian_address", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              Relationship: to guardian{" "}
              <input
                type="text"
                value={formState.guardian_relationship_to_guardian || "N/A"}
                onChange={(e) =>
                  handleFieldChange(
                    "guardian_relationship_to_guardian",
                    e.target.value
                  )
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>

          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "38%" }}>
                Languages/Dialects Spoken at Home:{" "}
              </span>
              <input
                type="text"
                value={formState.guardian_language_dialect || "N/A"}
                onChange={(e) =>
                  handleFieldChange("guardian_language_dialect", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
        </div>

        <div className="SCIF-section SCIF-inline">
          <div className="section-title">HEALTH DATA</div>
          <HealthConditionRadio
            selectedValue={formState.health_condition}
            onChange={handleConditionChange}
            role={role}
          />

          <div className="SCIF-inline flex-row">
            <label>
              Height (m):{" "}
              <input
                type="text"
                value={formState.height}
                onChange={(e) => handleFieldChange("height", e.target.value)}
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              Weight (kg):{" "}
              <input
                type="text"
                value={formState.weight}
                onChange={(e) => handleFieldChange("weight", e.target.value)}
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              Eyesight [Good, Medium, Poor]:{" "}
              <input
                type="text"
                value={formState.eyesight}
                readOnly={role !== "admin"}
                onChange={(e) => handleFieldChange("eyesight", e.target.value)}
              />
            </label>
          </div>

          <div className="SCIF-inline flex-row">
            <label>
              Hearing [Good, Medium, Poor]:{" "}
              <input
                type="text"
                value={formState.hearing}
                onChange={(e) => handleFieldChange("hearing", e.target.value)}
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              Any Physical Disabilities:{" "}
              <input
                type="text"
                value={
                  Array.isArray(formState.physical_disabilities)
                    ? formState.physical_disabilities.join(", ")
                    : formState.physical_disabilities || "None"
                }
                onChange={(e) =>
                  handleFieldChange("physical_disabilities", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>

          <div className="SCIF-inline flex-row">
            <label>
              Frequent Ailments:{" "}
              <input
                type="text"
                value={formState.common_ailments || "None"}
                onChange={(e) =>
                  handleFieldChange("common_ailments", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              Last Hospitalization:{" "}
              <input
                type="text"
                value={formState.last_hospitalization || "Not Applicable"}
                onChange={(e) =>
                  handleFieldChange("last_hospitalization", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>

          <div className="SCIF-inline">
            <label>
              Reason:{" "}
              <AutoResizeTextarea
                value={formState.reason_of_hospitalization || "Not Applicable"}
                onChange={(e) =>
                  handleFieldChange("reason_of_hospitalization", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
        </div>

        <div className="SCIF-section school">
          <div className="section-title">PREVIOUS SCHOOL RECORD</div>
          <PreviousSchoolRecordsTable records={previous_school_record} />
          <div className="SCIF-inline">
            <label>
              <span
                className="label"
                style={{ width: "80%", textAlign: "right" }}
              >
                SR. HIGH GEN. AVE:{" "}
              </span>{" "}
              <span style={{ width: "20%" }}>
                {" "}
                <input
                  type="text"
                  value={formState.senior_high_gpa}
                  onChange={(e) =>
                    handleFieldChange("senior_high_gpa", e.target.value)
                  }
                  readOnly={role !== "admin"}
                />{" "}
              </span>
            </label>
          </div>
        </div>

        <div className="SCIF-section">
          <div className="section-title">
            LIST OF SCHOLARSHIPS & FINANCIAL ASSISTANCE WHILE IN COLLEGE :
          </div>
          {Array.isArray(formState.scholarships_and_assistance) &&
          formState.scholarships_and_assistance.length > 0 ? (
            formState.scholarships_and_assistance.map((item, idx) => (
              <div key={idx} className="SCIF-inline">
                <input
                  type="text"
                  value={formState.scholarships_and_assistance[idx]}
                  onChange={(e) => handleScholarshipChange(idx, e)}
                  style={{ width: "90%" }}
                  readOnly={role !== "admin"}
                />
              </div>
            ))
          ) : (
            <label>No scholarships listed.</label>
          )}
        </div>

        <div className="SCIF-section">
          <div className="section-title">
            MEMBERSHIP TO ORGANIZATION IN COLLEGE (Do not fill out this yet)
          </div>

          {organizations && organizations.length > 0 ? (
            <table className="scif-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Name of Organization</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, idx) => (
                  <tr key={idx}>
                    <td>{org.year}</td>
                    <td>{org.name}</td>
                    <td>{org.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No organization data available.</p>
          )}
        </div>

        <div className="SCIF-section">
          <div className="section-title">
            AWARDS RECEIVED WHILE IN COLLEGE (leave this portion blank)
          </div>

          {awards && awards.length > 0 ? (
            <table className="scif-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Award</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {awards.map((award, idx) => (
                  <tr key={idx}>
                    <td>{award.year}</td>
                    <td>{award.name}</td>
                    <td>{award.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No awards data available.</p>
          )}
        </div>

        <div className="SCIF-section SCIF-inline">
          <div className="section-title">OTHER PERSONAL INFORMATION</div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "38%" }}>
                Why did you enroll in UP Mindanao?{" "}
              </span>
              <AutoResizeTextarea
                value={formState.enrollment_reason || ""}
                onChange={(e) =>
                  handleFieldChange("enrollment_reason", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="flex-row SCIF-inline">
            <label>
              <span className="label" style={{ width: "55%" }}>
                Does your program match your goal?
              </span>{" "}
              <input
                type="text"
                value={formState.degree_program_aspiration ? "Yes" : "No"}
                onChange={(e) =>
                  handleFieldChange("degree_program_aspiration", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              <span className="label" style={{ width: "20%" }}>
                If not, why?
              </span>{" "}
              <AutoResizeTextarea
                value={formState.aspiration_explanation || ""}
                onChange={(e) =>
                  handleFieldChange("aspiration_explanation", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "15%" }}>
                Special Talents:
              </span>{" "}
              <AutoResizeTextarea
                value={formState.special_talents || ""}
                onChange={(e) =>
                  handleFieldChange("special_talents", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "20%" }}>
                Musical Instruments:{" "}
              </span>
              <AutoResizeTextarea
                value={formState.musical_instruments || ""}
                onChange={(e) =>
                  handleFieldChange("musical_instruments", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              Hobbies:{" "}
              <AutoResizeTextarea
                value={formState.hobbies || ""}
                onChange={(e) => handleFieldChange("hobbies", e.target.value)}
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "15%" }}>
                Likes in People:{" "}
              </span>
              <AutoResizeTextarea
                value={formState.likes_in_people || ""}
                onChange={(e) =>
                  handleFieldChange("likes_in_people", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              {" "}
              <span className="label" style={{ width: "18%" }}>
                Dislikes in People:{" "}
              </span>
              <AutoResizeTextarea
                value={formState.dislikes_in_people || ""}
                onChange={(e) =>
                  handleFieldChange("dislikes_in_people", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <ClosestToRadio
              selectedValue={family_relationship.closest_to}
              specifyOther={family_relationship.specify_other}
            />
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "30%" }}>
                {" "}
                Personal Characteristics:{" "}
              </span>{" "}
              <AutoResizeTextarea
                value={formState.personal_characteristics || ""}
                onChange={(e) =>
                  handleFieldChange("personal_characteristics", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline flex-row">
            <label>
              <span className="label" style={{ width: "40%" }}>
                Who do you open up to?{" "}
              </span>
              <input
                type="text"
                value={formState.problem_confidant}
                onChange={(e) =>
                  handleFieldChange("problem_confidant", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              Why?{" "}
              <AutoResizeTextarea
                value={formState.confidant_reason || ""}
                onChange={(e) =>
                  handleFieldChange("confidant_reason", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "18%" }}>
                Potential Problems:
              </span>{" "}
              <AutoResizeTextarea
                value={formState.anticipated_problems || ""}
                onChange={(e) =>
                  handleFieldChange("anticipated_problems", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline flex-row">
            <label>
              <span className="label" style={{ width: "40%" }}>
                Any previous counseling?
              </span>{" "}
              <input
                type="text"
                value={formState.previous_counseling ? "Yes" : "None"}
                onChange={(e) =>
                  handleFieldChange("previous_counseling", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              If yes, where:{" "}
              <input
                type="text"
                value={formState.counseling_location || "N/A"}
                onChange={(e) =>
                  handleFieldChange("counseling_location", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
          <div className="SCIF-inline flex-row">
            <label>
              To whom?{" "}
              <input
                type="text"
                value={formState.counseling_counselor || "N/A"}
                onChange={(e) =>
                  handleFieldChange("counseling_counselor", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
            <label>
              Why?{" "}
              <AutoResizeTextarea
                value={formState.counseling_reason || "N/A"}
                onChange={(e) =>
                  handleFieldChange("counseling_reason", e.target.value)
                }
                readOnly={role !== "admin"}
              />
            </label>
          </div>
        </div>

        <div className="signature">
          <div className="sign" style={{ textAlign: "right" }}>
            <label style={{ textAlign: "right", paddingTop: "50px" }}>
              ________________________________________
            </label>
            <label style={{ textAlign: "right", paddingRight: "30px" }}>
              SIGNATURE OVER PRINTED NAME:{" "}
            </label>
          </div>
          <div className="sign" style={{ textAlign: "right" }}>
            <label style={{ textAlign: "right", paddingTop: "50px" }}>
              ________________________________________
            </label>
            <label style={{ textAlign: "right", paddingRight: "88px" }}>
              DATE SIGNED{" "}
            </label>
          </div>
        </div>

        <div className="SCIF-section">
          <div className="section-title">
            PSYCHOMETRIC DATA (Leave it blank)
          </div>
          <table className="psychometric-table">
            <thead>
              <tr>
                <th>Date of Testing</th>
                <th>Name of Test</th>
                <th>Raw Score</th>
                <th>Percentile/IQ</th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {/* Example hardcoded rows */}
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="SCIF-section">
          <div className="section-title">
            GUIDANCE SERVICES SPECIALIST’ NOTES: (Leave it blank)
          </div>
          <textarea
            className="guidance-notes"
            rows={5}
            readOnly={role !== "admin"}
            placeholder="____________________________________________________________________________________________&#10;____________________________________________________________________________________________&#10;____________________________________________________________________________________________"
            value={formState.guidance_notes || ""}
            onChange={(e) =>
              handleFieldChange("guidance_notes", e.target.value)
            }
          />
        </div>

        <h5>Privacy Statement: </h5>
        <label className="privacy-description indented-section">
          The University of the Philippines takes your privacy seriously and we
          are committed to protecting your personal information. For the UP
          Privacy Policy, please visit{" "}
          <a
            href="https://privacy.up.edu.ph"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://privacy.up.edu.ph
          </a>
        </label>

        <div className="certify-agreement">
          <label className="form-label">
            <input
              type="checkbox"
              name="has_consented"
              checked={privacy_consent.has_consented === true}
              readOnly
              className="certify-checkbox"
            />
            <span className="certify-text">
              I have read the University of the Philippines’ Privacy Notice for
              Students. I understand that for the UP System to carry out its
              mandate under the 1987 Constitution, the UP Charter, and other
              laws, the University must necessarily process my personal and
              sensitive personal information. Therefore, I recognize the
              authority of the University of the Philippines to process my
              personal and sensitive personal information, pursuant to the UP
              Privacy Notice and applicable laws.
            </span>
          </label>
        </div>

        <div className="flex-row">
          <label>
            Name of Student:{" "}
            <input type="text" value={formState.name} readOnly />
          </label>
          <label>
            Signature of Student:{" "}
            <input type="text" readOnly={role !== "admin"} />
          </label>
          <label>
            Date Signed:{" "}
            <input
              type="date"
              value={new Date(submission.submitted_on).toLocaleDateString(
                "en-CA"
              )}
              readOnly
            />
          </label>
        </div>
      </div>
      <BackToTopButton />
      {showDownloadConfirm && (
        <ConfirmDialog
          title="Confirm Download"
          message="Are you sure you want to download this file?"
          onConfirm={handleConfirmDownload}
          onCancel={handleCancelDownload}
          confirmLabel="Download"
          cancelLabel="Cancel"
        />
      )}

      {downloadToast && (
        <ToastMessage
          message={downloadToast}
          onClose={() => setDownloadToast(null)}
        />
      )}
    </>
  );
};

export default SCIFProfileView;
