import React from "react";
import FormField from "../../components/FormField";
import DisplayField from "../../components/DisplayField";
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
  const getError = (key) => errors?.[key];

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
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-800 ">Other Personal Data</h2>

      <fieldset disabled={readOnly} className="space-y-6">
        {/* ENROLLMENT REASON */}
        {readOnly ? (
          <DisplayField
            label="Why did you enroll in UP Mindanao?"
            value={personality_traits.enrollment_reason}
          />
        ) : (
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
            helpertext="Please explain the reason why you chose to enroll at UP Mindanao."
            error={errors?.["personality_traits.enrollment_reason"]}
            required
          />
        )}

        {/* DEGREE PROGRAM ASPIRATION */}
        {readOnly ? (
          <DisplayField
            label="Does your degree program lead to your future aspiration?"
            value={personality_traits.degree_program_aspiration ? "Yes" : "No"}
          />
        ) : (
          <div>
            <label className="font-medium text-gray-800">
              Does your degree program lead to what you aspire in the future?
            </label>
            <div className="flex gap-6 mt-2">
              {previousCounselingOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="degree_program_aspiration"
                    value={option.value}
                    checked={
                      personality_traits.degree_program_aspiration ===
                      option.value
                    }
                    onChange={() => {
                      handleFieldChange(
                        "personality_traits",
                        "degree_program_aspiration",
                        option.value
                      );
                      clearError(
                        errors,
                        setErrors,
                        "personality_traits.degree_program_aspiration"
                      );
                      if (option.value === true) {
                        updateData("personality_traits", {
                          aspiration_explanation: "",
                        });
                        clearError(
                          errors,
                          setErrors,
                          "personality_traits.aspiration_explanation"
                        );
                      }
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {getError("personality_traits.degree_program_aspiration") && (
              <p className="mt-2 text-[#D32F2F] text-xs italic">
                {getError("personality_traits.degree_program_aspiration")}
              </p>
            )}
          </div>
        )}

        {personality_traits.degree_program_aspiration === false &&
          !readOnly && (
            <FormField
              label="If not, why?"
              type="textarea"
              value={personality_traits.aspiration_explanation}
              onChange={(e) =>
                handleFieldChange(
                  "personality_traits",
                  "aspiration_explanation",
                  e.target.value,
                  filterGeneralText
                )
              }
              onFocus={() =>
                clearError(
                  errors,
                  setErrors,
                  "personality_traits.aspiration_explanation"
                )
              }
              error={errors?.["personality_traits.aspiration_explanation"]}
              required
            />
          )}
        {readOnly &&
          personality_traits.degree_program_aspiration === false &&
          personality_traits.aspiration_explanation && (
            <DisplayField
              label="If not, why?"
              value={personality_traits.aspiration_explanation}
            />
          )}

        {/* TALENTS & HOBBIES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              label: "Special talents and abilities",
              key: "special_talents",
              section: "personality_traits",
            },
            {
              label: "Musical instruments played",
              key: "musical_instruments",
              section: "personality_traits",
            },
            {
              label: "Hobbies",
              key: "hobbies",
              section: "personality_traits",
            },
            {
              label: "What do you like in people?",
              key: "likes_in_people",
              section: "personality_traits",
            },
            {
              label: "What do you dislike in people?",
              key: "dislikes_in_people",
              section: "personality_traits",
            },
          ].map((item) =>
            readOnly ? (
              <DisplayField
                key={item.key}
                label={item.label}
                value={data[item.section][item.key]}
              />
            ) : (
              <FormField
                key={item.key}
                label={item.label}
                type="textarea"
                value={data[item.section][item.key]}
                onChange={(e) =>
                  handleFieldChange(
                    item.section,
                    item.key,
                    e.target.value,
                    filterGeneralText
                  )
                }
                onFocus={() =>
                  clearError(errors, setErrors, `${item.section}.${item.key}`)
                }
                error={errors?.[`${item.section}.${item.key}`]}
                required
              />
            )
          )}
        </div>

        {/* CLOSEST TO */}
        {readOnly ? (
          <DisplayField
            label="With whom are you closest?"
            value={
              family_relationship.closest_to === "Other"
                ? family_relationship.specify_other
                : family_relationship.closest_to
            }
          />
        ) : (
          <div>
            <label className="font-medium text-gray-800">
              With whom are you closest to?
            </label>
            <div className="flex flex-wrap gap-6 mt-2">
              {closestOptions.map((relation) => (
                <label key={relation.value} className="flex items-center gap-2">
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
                      clearError(
                        errors,
                        setErrors,
                        "family_relationship.closest_to"
                      );
                    }}
                  />
                  {relation.label}
                </label>
              ))}
            </div>
            {getError("family_relationship.closest_to") && (
              <p className="mt-2 text-[#D32F2F] text-xs italic">
                {getError("family_relationship.closest_to")}
              </p>
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
                  clearError(
                    errors,
                    setErrors,
                    "family_relationship.specify_other"
                  )
                }
                helpertext="If 'Other' is selected, please specify."
                error={errors?.["family_relationship.specify_other"]}
                required
              />
            )}
          </div>
        )}

        {/* COUNSELING INFO */}
        {readOnly ? (
          <>
            <DisplayField
              label="Personal characteristics as a person"
              value={counseling_info.personal_characteristics}
              onChange={(e) =>
                handleFieldChange(
                  "counseling_info.personal_characteristics",
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
            />
            <DisplayField
              label="To whom do you open up your problems?"
              value={counseling_info.problem_confidant}
            />
            <DisplayField
              label="Why?"
              value={counseling_info.confidant_reason}
            />
            <DisplayField
              label="Any anticipated problems while in UP?"
              value={counseling_info.anticipated_problems}
            />
            <DisplayField
              label="Any previous counseling?"
              value={counseling_info.previous_counseling ? "Yes" : "No"}
            />
            {counseling_info.previous_counseling && (
              <>
                <DisplayField
                  label="If yes, where?"
                  value={counseling_info.counseling_location}
                />
                <DisplayField
                  label="To whom?"
                  value={counseling_info.counseling_counselor}
                />
                <DisplayField
                  label="Why?"
                  value={counseling_info.counseling_reason}
                />
              </>
            )}
          </>
        ) : (
          <>
            <FormField
              label="Personal characteristics as a person"
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
              error={errors?.["counseling_info.personal_characteristics"]}
              required
            />

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
                clearError(
                  errors,
                  setErrors,
                  "counseling_info.problem_confidant"
                )
              }
              error={errors?.["counseling_info.problem_confidant"]}
              required
            />

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
                clearError(
                  errors,
                  setErrors,
                  "counseling_info.confidant_reason"
                )
              }
              error={errors?.["counseling_info.confidant_reason"]}
              required
            />

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
              error={errors?.["counseling_info.anticipated_problems"]}
              required
            />

            <div>
              <label className="font-medium text-gray-800">
                Any previous counseling?
              </label>
              <div className="flex gap-6 mt-2">
                {previousCounselingOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="previous_counseling"
                      value={option.value}
                      checked={
                        counseling_info.previous_counseling === option.value
                      }
                      onChange={() => {
                        handleFieldChange(
                          "counseling_info",
                          "previous_counseling",
                          option.value
                        );
                        if (option.value === false) {
                          updateData("counseling_info", {
                            counseling_location: "",
                            counseling_counselor: "",
                            counseling_reason: "",
                          });
                          [
                            "counseling_info.counseling_location",
                            "counseling_info.counseling_counselor",
                            "counseling_info.counseling_reason",
                          ].forEach((key) => clearError(errors, setErrors, key));
                        }
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {counseling_info.previous_counseling === true && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="If yes, where?"
                  type="text"
                  value={counseling_info.counseling_location || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "counseling_info",
                      "counseling_location",
                      e.target.value,
                      filterGeneralText
                    )
                  }
                  onFocus={() =>
                    clearError(
                      errors,
                      setErrors,
                      "counseling_info.counseling_location"
                    )
                  }
                  error={errors?.["counseling_info.counseling_location"]}
                  required
                />
                <FormField
                  label="To whom?"
                  type="text"
                  value={counseling_info.counseling_counselor || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "counseling_info",
                      "counseling_counselor",
                      e.target.value,
                      filterGeneralText
                    )
                  }
                  onFocus={() =>
                    clearError(
                      errors,
                      setErrors,
                      "counseling_info.counseling_counselor"
                    )
                  }
                  error={errors?.["counseling_info.counseling_counselor"]}
                  required
                />
                <FormField
                  label="Why?"
                  type="textarea"
                  value={counseling_info.counseling_reason || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "counseling_info",
                      "counseling_reason",
                      e.target.value,
                      filterGeneralText
                    )
                  }
                  onFocus={() =>
                    clearError(
                      errors,
                      setErrors,
                      "counseling_info.counseling_reason"
                    )
                  }
                  error={errors?.["counseling_info.counseling_reason"]}
                  required
                />
              </div>
            )}
          </>
        )}
      </fieldset>
    </div>
  );
};

export default SCIFOtherPersonalData;
