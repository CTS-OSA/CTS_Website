import React, { useContext, useRef, useState } from "react";
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
import BackToTopButton from "../components/BackToTop";

const SCIFProfileView = ({ profileData, formData, isAdmin }) => {
  const pdfRef = useRef();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);

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

  const father = family_data.father;
  const mother = family_data.mother;
  const guardian = family_data.guardian;

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

  const HealthConditionRadio = ({ selectedValue }) => {
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
                readOnly
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
                readOnly
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
        <Button variant="primary" onClick={handleDownloadClick} className="pdf-button"> 
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
                  value={`${profileData.last_name}`}
                  readOnly
                />
                <input
                  type="text"
                  value={`${profileData.first_name}`}
                  readOnly
                />
                <input
                  type="text"
                  value={`${profileData.middle_name}`}
                  readOnly
                />
              </div>
              <div className="SCIF-name-label">
                <label>FAMILY NAME</label>
                <label>FIRST NAME</label>
                <label>MIDDLE NAME</label>
              </div>
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                NICKNAME:{" "}
                <input type="text" value={profileData.nickname} readOnly />
              </label>
              <label>
                SEX: <input type="text" value={profileData.sex} readOnly />
              </label>
              <label>
                AGE:{" "}
                <input
                  type="text"
                  value={calculateAge(profileData.birthdate)}
                  readOnly
                />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                RELIGION:{" "}
                <input type="text" value={profileData.religion} readOnly />
              </label>
              <label>
                BIRTH RANK:{" "}
                <input type="text" value={profileData.birth_rank} readOnly />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                BIRTH DATE
                <input type="text" value={profileData.birthdate} readOnly />
              </label>
              <label>
                BIRTH PLACE
                <input type="text" value={profileData.birthplace} readOnly />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                HOME/PERMANENT ADDRESS:
                <input
                  type="text"
                  readOnly
                  value={[
                    profileData.permanent_address?.address_line_1,
                    profileData.permanent_address?.address_line_2,
                    profileData.permanent_address?.barangay,
                    profileData.permanent_address?.city_municipality,
                    profileData.permanent_address?.province,
                    profileData.permanent_address?.region,
                    profileData.permanent_address?.zip_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                LANDLINE/CONTACT NO.:{" "}
                <input
                  type="text"
                  value={profileData.landline_number || "None"}
                  readOnly
                />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                EMAIL: <input type="text" value={profileData.email} readOnly/>
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                CELLPHONE/MOBILE NO.:{" "}
                <input type="text" value={profileData.contact_number} readOnly/>
              </label>
            </div>
          </div>
          <div className="SCIF-right">
            <div
              className="bigger_avatar"
              style={{ borderRadius: "0", width: "200px", height: "200px" }}
            >
              {`${profileData.first_name?.[0] || ""}${
                profileData.last_name?.[0] || ""
              }`}
            </div>
            <input type="text" value={profileData.student_number} readOnly />
            <label>STUDENT NUMBER</label>
            <input type="text" value={profileData.degree_program} readOnly />
            <label>DEGREE PROGRAM</label>
            <input
              type="text"
              readOnly
              value={`${profileData.date_initial_entry_sem} - AY ${profileData.date_initial_entry}`}
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
                    value={`${father.first_name} ${father.last_name}`}
                    readOnly
                  />
                </label>
                <label>
                  Age: <input type="text" value={father.age} readOnly />
                </label>
              </div>
              <label>
                Occupation:{" "}
                <input type="text" value={father.job_occupation} readOnly />
              </label>
              <label>
                Company:{" "}
                <input type="text" value={father.company_agency} readOnly />
              </label>
              <label>
                <span className="label" style={{ width: "30%" }}>
                  Company Address:{" "}
                </span>
                <input type="text" value={father.company_address} readOnly />
              </label>
              <label>
                <span className="label" style={{ width: "35%" }}>
                  Educational Attainment:{" "}
                </span>
                <input
                  type="text"
                  value={father.highest_educational_attainment}
                  readOnly
                />
              </label>
              <label>
                <span className="label" style={{ width: "15%" }}>
                  Contact No.:{" "}
                </span>
                <input type="text" value={father.contact_number} readOnly />
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
                  value={`${mother.first_name} ${mother.last_name}`}
                  readOnly
                />
              </label>

              <label>
                Age: <input type="text" value={mother.age} readOnly />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                Occupation:{" "}
                <input type="text" value={mother.job_occupation} readOnly />
              </label>
              <label>
                Company:{" "}
                <input type="text" value={mother.company_agency} readOnly />
              </label>
            </div>
            <div className="SCIF-inline">
              <label>
                <span className="label" style={{ width: "19%" }}>
                  Company Address:{" "}
                </span>
                <input type="text" value={mother.company_address} readOnly />
              </label>
            </div>
            <div className="SCIF-inline flex-row">
              <label>
                <span className="label" style={{ width: "35%" }}>
                  Educational Attainment:{" "}
                </span>{" "}
                <input
                  type="text"
                  value={mother.highest_educational_attainment}
                  readOnly
                />
              </label>
              <label>
                <span className="label" style={{ width: "20%" }}>
                  Contact No.:{" "}
                </span>
                <input type="text" value={mother.contact_number} readOnly />
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
                value={`${guardian?.first_name || "N/A"} ${
                  guardian?.last_name || ""
                }`}
                readOnly
              />
            </label>
            <label>
              Contact No.:{" "}
              <input
                type="text"
                value={guardian?.contact_number || "N/A"}
                readOnly
              />
            </label>
          </div>
          <div className="SCIF-inline flex-row">
            <label>
              Address:{" "}
              <input type="text" value={guardian?.address || "N/A"} readOnly />
            </label>
            <label>
              Relationship: to guardian{" "}
              <input
                type="text"
                value={guardian?.relationship_to_guardian || "N/A"}
                readOnly
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
                value={guardian?.language_dialect?.join(", ") || "N/A"}
                readOnly
              />
            </label>
          </div>
        </div>

        <div className="SCIF-section SCIF-inline">
          <div className="section-title">HEALTH DATA</div>
          <HealthConditionRadio selectedValue={health_data.health_condition} />

          <div className="SCIF-inline flex-row">
            <label>
              Height (m):{" "}
              <input type="text" value={health_data.height} readOnly />
            </label>
            <label>
              Weight (kg):{" "}
              <input type="text" value={health_data.weight} readOnly />
            </label>
            <label>
              Eyesight [Good, Medium, Poor]:{" "}
              <input type="text" value={health_data.eye_sight} readOnly />
            </label>
          </div>

          <div className="SCIF-inline flex-row">
            <label>
              Hearing [Good, Medium, Poor]:{" "}
              <input type="text" value={health_data.hearing} readOnly />
            </label>
            <label>
              Any Physical Disabilities:{" "}
              <input
                type="text"
                value={(health_data.physical_disabilities || []).join(", ") || "None"}
                readOnly
              />
            </label>
          </div>

          <div className="SCIF-inline flex-row">
            <label>
              Frequent Ailments:{" "}
              <input
                type="text"
                value={(health_data.common_ailments || []).join(", ") || "None"}
                readOnly
              />
            </label>
            <label>
              Last Hospitalization:{" "}
              <input
                type="text"
                value={health_data.last_hospitalization || "Not Applicable"}
                readOnly
              />
            </label>
          </div>

          <div className="SCIF-inline">
            <label>
              Reason:{" "}
              <AutoResizeTextarea
                value={health_data.reason_of_hospitalization || "Not Applicable"}
                readOnly
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
                <input type="text" value={seniorHighGPA} readOnly />{" "}
              </span>
            </label>
          </div>
        </div>

        <div className="SCIF-section">
          <div className="section-title">
            LIST OF SCHOLARSHIPS & FINANCIAL ASSISTANCE WHILE IN COLLEGE :
          </div>
          {Array.isArray(scholarship?.scholarships_and_assistance) &&
          scholarship.scholarships_and_assistance.length > 0 ? (
            scholarship.scholarships_and_assistance.map((item, idx) => (
              <label key={idx}>
                <input type="text" value={item} readOnly />
              </label>
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
                value={personality_traits.enrollment_reason || ""}
                readOnly
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
                value={
                  personality_traits.degree_program_aspiration ? "Yes" : "No"
                }
                readOnly
              />
            </label>
            <label>
              <span className="label" style={{ width: "20%" }}>
                If not, why?
              </span>{" "}
              <AutoResizeTextarea
                value={personality_traits.aspiration_explanation || ""}
                readOnly
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "15%" }}>
                Special Talents:
              </span>{" "}
              <AutoResizeTextarea
                value={personality_traits.special_talents || ""}
                readOnly
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "20%" }}>
                Musical Instruments:{" "}
              </span>
              <AutoResizeTextarea
                value={personality_traits.musical_instruments || ""}
                readOnly
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              Hobbies:{" "}
              <AutoResizeTextarea
                value={personality_traits.hobbies || ""}
                readOnly
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "15%" }}>
                Likes in People:{" "}
              </span>
              <AutoResizeTextarea
                value={personality_traits.likes_in_people || ""}
                readOnly
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
                value={personality_traits.dislikes_in_people || ""}
                readOnly
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
                value={counseling_info.personal_characteristics || ""}
                readOnly
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
                value={counseling_info.problem_confidant}
                readOnly
              />
            </label>
            <label>
              Why?{" "}
              <AutoResizeTextarea
                value={counseling_info.confidant_reason || ""}
                readOnly
              />
            </label>
          </div>
          <div className="SCIF-inline">
            <label>
              <span className="label" style={{ width: "18%" }}>
                Potential Problems:
              </span>{" "}
              <AutoResizeTextarea
                value={counseling_info.anticipated_problems || ""}
                readOnly
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
                value={counseling_info.previous_counseling ? "Yes" : "None"}
                readOnly
              />
            </label>
            <label>
              If yes, where:{" "}
              <input
                type="text"
                value={counseling_info.counseling_location || "N/A"}
                readOnly
              />
            </label>
          </div>
          <div className="SCIF-inline flex-row">
            <label>
              To whom?{" "}
              <input
                type="text"
                value={counseling_info.counseling_counselor || "N/A"}
                readOnly
              />
            </label>
            <label>
              Why?{" "}
              <AutoResizeTextarea
                value={counseling_info.counseling_reason || "N/A"}
                readOnly
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
            readOnly
            placeholder="____________________________________________________________________________________________&#10;____________________________________________________________________________________________&#10;____________________________________________________________________________________________"
            value = ""
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
            <input
              type="text"
              value={`${profileData.first_name} ${profileData.last_name}`}
              readOnly
            />
          </label>
          <label>
            Signature of Student: <input type="text" readOnly />
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
