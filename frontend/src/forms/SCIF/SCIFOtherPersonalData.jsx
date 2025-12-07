import React from "react";
import { clearError } from "../../utils/helperFunctions";
import { filterGeneralText } from "../../utils/inputFilters";

const QuestionField = ({
  label,
  type = "text",
  value = "",
  onChange,
  onFocus,
  disabled = false,
  required = false,
  helpertext,
  error,
  rows = 2,
}) => {
  const baseClasses = `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${error ? "border-red-500" : "border-gray-300"
    } ${disabled
      ? "bg-gray-50 text-gray-600 cursor-not-allowed"
      : "bg-white text-gray-900"
    }`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && (
          <span
            className={disabled ? "text-gray-800 ml-1" : "text-red-500 ml-1"}
          >
            *
          </span>
        )}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value || ""}
          onChange={onChange}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          rows={rows}
          className={`${baseClasses} min-h-[120px]`}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          className={baseClasses}
        />
      )}
      {helpertext && (
        <p className="text-xs text-gray-500">{helpertext}</p>
      )}
      {error && (
        <p className="text-[#D32F2F] text-xs italic">{error}</p>
      )}
    </div>
  );
};

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
        <QuestionField
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
          disabled={readOnly}
          helpertext="Please explain the reason why you chose to enroll at UP Mindanao."
          error={errors?.["personality_traits.enrollment_reason"]}
          required
        />

        {/* DEGREE PROGRAM ASPIRATION */}
        <div>
          <label className="font-medium text-gray-800">
            Does your degree program lead to what you aspire in the future?
          </label>
          <div className="flex flex-wrap gap-6 mt-2">
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
                  disabled={readOnly}
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

        {personality_traits.degree_program_aspiration === false && (
          <QuestionField
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
            disabled={readOnly}
            error={errors?.["personality_traits.aspiration_explanation"]}
            required
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
          ].map((item) => (
            <QuestionField
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
              disabled={readOnly}
              error={errors?.[`${item.section}.${item.key}`]}
              required
            />
          ))}
        </div>

        {/* CLOSEST TO */}
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
                  disabled={readOnly}
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
            <QuestionField
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
              disabled={readOnly}
              error={errors?.["family_relationship.specify_other"]}
              required
            />
          )}
        </div>

        {/* COUNSELING INFO */}
        <QuestionField
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
          disabled={readOnly}
          error={errors?.["counseling_info.personal_characteristics"]}
          required
        />

        <QuestionField
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
          disabled={readOnly}
          error={errors?.["counseling_info.problem_confidant"]}
          required
        />

        <QuestionField
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
          disabled={readOnly}
          error={errors?.["counseling_info.confidant_reason"]}
          required
        />

        <QuestionField
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
          disabled={readOnly}
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
                  checked={counseling_info.previous_counseling === option.value}
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
                  disabled={readOnly}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {counseling_info.previous_counseling === true && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuestionField
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
              disabled={readOnly}
              error={errors?.["counseling_info.counseling_location"]}
              required
            />
            <QuestionField
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
              disabled={readOnly}
              error={errors?.["counseling_info.counseling_counselor"]}
              required
            />
            <QuestionField
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
              disabled={readOnly}
              error={errors?.["counseling_info.counseling_reason"]}
              required
            />
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default SCIFOtherPersonalData;
