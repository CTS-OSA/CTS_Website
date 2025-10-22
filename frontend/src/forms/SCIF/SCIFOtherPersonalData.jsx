import React from "react";
import FormField from "../../components/FormField";
import "../SetupProfile/css/multistep.css";
import { clearError } from "../../utils/helperFunctions";
import { filterGeneralText } from "../../utils/inputFilters";
const SCIFOtherPersonalData = ({
  data,
  updateData,
  readOnly = false,
  errors,
  setErrors,
}) => {
  const { personality_traits, family_relationship, counseling_info } = data;

const handleFieldChange = (section, field, rawValue, filterFn) => {
  if (readOnly) return;
  const filteredValue = filterFn ? filterFn(rawValue) : rawValue;
  updateData(section, { [field]: filteredValue });
};

  const previousCounselingOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const closestOptions = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Brother", label: "Brother(s)" },
    { value: "Sister", label: "Sister(s)" },
    { value: "Other", label: "Others (specify)" },
  ];

  return (
    <div className="form-section">
      <fieldset className="form-section" disabled={readOnly}>
        <h2 className="step-title">Other Personal Data</h2>

        {/* Personality Traits Fields */}
        <div className="field-spacing">
          <FormField
            label="Why did you enroll in UP Mindanao?"
            type="textarea"
            value={personality_traits.enrollment_reason}
            onChange={(e) =>
              handleFieldChange(
                "personality_traits",
                "enrollment_reason",
                e.target.value,
                filterGeneralText
              )
            }
            onFocus={() =>
              clearError(
                errors,
                setErrors,
                "personality_traits.enrollment_reason"
              )
            }
            error={errors?.["personality_traits.enrollment_reason"]}
            helpertext="Please explain the reason why you chose to enroll at UP Mindanao."
            required
          />
        </div>
        <div className="field-spacing">
        <label>
          Does your degree program lead to what you aspire in the future?
        </label>
        <small
          className="helper-text"
          style={{ marginTop: "20px", display: "block" }}
        >
          Select "Yes" if your current degree program aligns with your future
          goals.
        </small>

        <div className="radio-group" style={{ marginBottom: "20px" }}>
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map((option) => (
            <label key={option.label} className="radio-label">
              <input
                type="radio"
                name="degree_program_aspiration"
                value={option.value.toString()}
                checked={
                  personality_traits.degree_program_aspiration === option.value
                }
                onFocus={() =>
                  clearError(
                    errors,
                    setErrors,
                    "personality_traits.degree_program_aspiration"
                  )
                }
                onChange={() => {
                  handleFieldChange(
                    "personality_traits",
                    "degree_program_aspiration",
                    option.value
                  );
                  if (option.value === true) {
                    updateData("personality_traits", { aspiration_explanation: "" });
                    clearError(errors, setErrors, "personality_traits.aspiration_explanation");
                  }
                }
                }
              />
              {option.label}
            </label>
          ))}
        </div>

        {errors?.["personality_traits.degree_program_aspiration"] && (
          <div className="error-message">
            {errors["personality_traits.degree_program_aspiration"]}
          </div>
        )}
        {personality_traits.degree_program_aspiration === false && (
          <FormField
            label="If not, why?"
            type="textarea"
            value={personality_traits.aspiration_explanation}
            onFocus={() =>
              clearError(
                errors,
                setErrors,
                "personality_traits.aspiration_explanation"
              )
            }
            onChange={(e) =>
              handleFieldChange(
                "personality_traits",
                "aspiration_explanation",
                e.target.value,
                filterGeneralText
              )
            }
            error={errors?.["personality_traits.aspiration_explanation"]}
            helperText="Please provide the reason if your degree program does not align with your future goals."
            required
          />
        )}
        </div>

        <div className="field-spacing">
        <FormField
          label="What are your special talents and abilities?"
          type="textarea"
          value={personality_traits.special_talents}
          onFocus={() =>
            clearError(errors, setErrors, "personality_traits.special_talents")
          }
          onChange={(e) =>
            handleFieldChange(
              "personality_traits",
              "special_talents",
              e.target.value,
              filterGeneralText
            )
          }
          error={errors?.["personality_traits.special_talents"]}
          helpertext="Describe any special talents or abilities you possess."
          required
        />
        </div>
        
        <div className="field-spacing">
        <FormField
          label="Specify the musical instruments you play:"
          type="textarea"
          value={personality_traits.musical_instruments}
          onFocus={() =>
            clearError(
              errors,
              setErrors,
              "personality_traits.musical_instruments"
            )
          }
          onChange={(e) =>
            handleFieldChange(
              "personality_traits",
              "musical_instruments",
              e.target.value,
              filterGeneralText
            )
          }
          error={errors?.["personality_traits.musical_instruments"]}
          helpertext="List any musical instruments you can play and provide any relevant experience."
          required
        />
        </div>

        <div className="field-spacing">
        <FormField
          label="What are your hobbies?"
          type="textarea"
          value={personality_traits.hobbies}
          onFocus={() =>
            clearError(errors, setErrors, "personality_traits.hobbies")
          }
          onChange={(e) =>
            handleFieldChange("personality_traits", "hobbies", e.target.value, filterGeneralText)
          }
          error={errors?.["personality_traits.hobbies"]}
          helpertext="Share what activities or hobbies you enjoy in your free time."
          required
        />
        </div>

        <div className="field-spacing">
        <FormField
          label="What do you like in people?"
          type="textarea"
          value={personality_traits.likes_in_people}
          onFocus={() =>
            clearError(errors, setErrors, "personality_traits.likes_in_people")
          }
          onChange={(e) =>
            handleFieldChange(
              "personality_traits",
              "likes_in_people",
              e.target.value,
              filterGeneralText
            )
          }
          error={errors?.["personality_traits.likes_in_people"]}
          helpertext="Describe the positive traits or qualities you appreciate in others."
          required
        />
        </div>

        <div className="field-spacing">
        <FormField
          label="What do you dislike in people?"
          type="textarea"
          value={personality_traits.dislikes_in_people}
          onFocus={() =>
            clearError(
              errors,
              setErrors,
              "personality_traits.dislikes_in_people"
            )
          }
          onChange={(e) =>
            handleFieldChange(
              "personality_traits",
              "dislikes_in_people",
              e.target.value,
              filterGeneralText
            )
          }
          error={errors?.["personality_traits.dislikes_in_people"]}
          helpertext="Describe the negative traits or qualities you dislike in others."
          required
        />
        </div>
        <div className="field-spacing">
        <label>With whom are you closest to?</label>
        <small className="helper-text" style={{ display: "block" }}>
          Select the person you are closest to in your family or personal
          circle.
        </small>
        <div className="radio-group" style={{ marginBottom: "20px" }}>
          {closestOptions.map((relation) => (
            <label key={relation.value} className="radio-label">
              <input
                type="radio"
                name="closest_to"
                value={relation.value}
                checked={family_relationship.closest_to === relation.value}
                onChange={() => {
                  handleFieldChange(
                    "family_relationship",
                    "closest_to",
                    relation.value
                  );
                  if (errors?.["family_relationship.closest_to"]) {
                    setErrors((prev) => {
                      const { ["family_relationship.closest_to"]: _, ...rest } =
                        prev;
                      return rest;
                    });
                  }
                }}
              />
              {relation.label}
            </label>
          ))}
        </div>
        {errors?.["family_relationship.closest_to"] && (
          <div className="error-message">
            {errors["family_relationship.closest_to"]}
          </div>
        )}

        {family_relationship.closest_to === "Other" && (
          <FormField
            label="Others (specify)"
            type="textarea"
            value={family_relationship.specify_other || ""}
            onChange={(e) =>
              handleFieldChange(
                "family_relationship",
                "specify_other",
                e.target.value,
                filterGeneralText
              )
            }
            onFocus={() =>
              clearError(errors, setErrors, "family_relationship.specify_other")
            }
            helpertext="If 'Other' is selected, please specify."
            error={errors?.["family_relationship.specify_other"]}
            required
          />
        )}
        </div>

        {/* Counseling Information Fields */}
        <div className="field-spacing">
        <FormField
          label="Personal characteristics as a person:"
          type="textarea"
          value={counseling_info.personal_characteristics}
          onChange={(e) =>
            handleFieldChange(
              "counseling_info",
              "personal_characteristics",
              e.target.value,
              filterGeneralText
            )
          }
          onFocus={() =>
            clearError(
              errors,
              setErrors,
              "counseling_info.personal_characteristics"
            )
          }
          helpertext="Describe your personal characteristics or traits that define who you are."
          error={errors?.["counseling_info.personal_characteristics"]}
          required
        />
        </div>

        <div className="field-spacing">
        <FormField
          label="To whom do you open up your problems?"
          type="textarea"
          value={counseling_info.problem_confidant}
          onChange={(e) =>
            handleFieldChange(
              "counseling_info",
              "problem_confidant",
              e.target.value,
              filterGeneralText
            )
          }
          onFocus={() =>
            clearError(errors, setErrors, "counseling_info.problem_confidant")
          }
          helpertext="Mention the person or people you trust and open up to with your problems."
          error={errors?.["counseling_info.problem_confidant"]}
          required
        />
        </div>
        <div className="field-spacing">
        <FormField
          label="Why?"
          type="textarea"
          value={counseling_info.confidant_reason}
          onChange={(e) =>
            handleFieldChange(
              "counseling_info",
              "confidant_reason",
              e.target.value,
              filterGeneralText
            )
          }
          onFocus={() =>
            clearError(errors, setErrors, "counseling_info.confidant_reason")
          }
          helpertext="Explain why you open up to that person."
          error={errors?.["counseling_info.confidant_reason"]}
          required
        />
        </div>

        <div className="field-spacing">
        <FormField
          label="Any problem that you might encounter later while in UP?"
          type="textarea"
          value={counseling_info.anticipated_problems}
          onChange={(e) =>
            handleFieldChange(
              "counseling_info",
              "anticipated_problems",
              e.target.value,
              filterGeneralText
            )
          }
          onFocus={() =>
            clearError(
              errors,
              setErrors,
              "counseling_info.anticipated_problems"
            )
          }
          helpertext="Are there any problems or challenges you foresee while studying at UP?"
          error={errors?.["counseling_info.anticipated_problems"]}
          required
        />
        </div>

        <div className="field-spacing">
        <label>Any previous counseling?</label>
        <small className="helper-text" style={{ display: "block" }}>
          Indicate if you have had any previous counseling sessions.
        </small>
        <div className="radio-group">
          {previousCounselingOptions.map((option) => (
            <label key={option.value.toString()} className="radio-label">
              <input
                type="radio"
                name="previous_counseling"
                value={option.value}
                checked={counseling_info.previous_counseling === option.value}
                onChange={() => {
                  handleFieldChange(
                    "counseling_info",
                    "previous_counseling",
                    option.value
                  );
                  if (option.value === false) {
                    updateData("counseling_info", { counseling_location: "" });
                    updateData("counseling_info", { counseling_counselor: "" });
                    updateData("counseling_info", { counseling_reason: "" });
                    // Also clear any related errors, if necessary
                    clearError(errors, setErrors, "counseling_info.counseling_location");
                    clearError(errors, setErrors, "counseling_info.counseling_counselor");
                    clearError(errors, setErrors, "counseling_info.counseling_reason");
                  }
                }
                }
                onFocus={() =>
                  clearError(
                    errors,
                    setErrors,
                    "counseling_info.previous_counseling"
                  )
                }
              />
              {option.label}
            </label>
          ))}
        </div>
        </div>

        {counseling_info.previous_counseling === true && (
          <>
            <FormField
              label="If yes, where?"
              type="text"
              value={counseling_info.counseling_location || ""}
              onFocus={() =>
                clearError(
                  errors,
                  setErrors,
                  "counseling_info.counseling_location"
                )
              }
              onChange={(e) => 
                handleFieldChange(
                  "counseling_info",
                  "counseling_location",
                  e.target.value,
                  filterGeneralText
                )
              }
              helpertext="If you have had previous counseling, please mention where."
              error={errors?.["counseling_info.counseling_location"]}
              required
            />

            <FormField
              label="To whom?"
              type="text"
              value={counseling_info.counseling_counselor || ""}
              onFocus={() =>
                clearError(
                  errors,
                  setErrors,
                  "counseling_info.counseling_counselor"
                )
              }
              onChange={(e) =>
                handleFieldChange(
                  "counseling_info",
                  "counseling_counselor",
                  e.target.value,
                  filterGeneralText
                )
              }
              error={errors?.["counseling_info.counseling_counselor"]}
              helpertext="Mention who the counselors were in your previous counseling."
              required
            />

            <FormField
              label="Why?"
              type="textarea"
              value={counseling_info.counseling_reason || ""}
              onFocus={() =>
                clearError(
                  errors,
                  setErrors,
                  "counseling_info.counseling_reason"
                )
              }
              onChange={(e) =>
                handleFieldChange(
                  "counseling_info",
                  "counseling_reason",
                  e.target.value,
                  filterGeneralText
                )
              }
              helpertext="Mention the reason for the previous counseling."
              error={errors?.["counseling_info.counseling_reason"]}
              required
            />
          </>
        )}
      </fieldset>
    </div>
  );
};

export default SCIFOtherPersonalData;
