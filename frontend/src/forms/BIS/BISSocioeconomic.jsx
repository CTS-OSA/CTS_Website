import React from "react";
import "../SetupProfile/css/multistep.css";
import { clearError } from "../../utils/helperFunctions";

const SupportChoices = {
  SELF: "self",
  BOTH_PARENTS: "both_parents",
  FATHER_ONLY: "father_only",
  MOTHER_ONLY: "mother_only",
  SCHOLARSHIP: "scholarship",
  COMBINATION: "combination",
  OTHERS: "others",
  GOV_FUNDED: "gov_funded",
};

const ALPHA_REGEX = /^[A-Za-z\s]*$/;
const ALPHA_SPACE_REGEX = /[^A-Za-z\s]/g;
const ALPHA_NUM_COMMA_DASH_REGEX = /[^A-Za-z0-9\s,-]/g;

const BISSocioeconomic = ({
  data,
  updateData,
  readOnly = false,
  errors,
  setErrors,
}) => {
  const handleChange = (e, section) => {
    if (readOnly) return;

    const { name, type, value, checked } = e.target;
    let parsedValue =
      type === "radio" && (value === "true" || value === "false")
        ? value === "true"
        : value;

    if (
      ["spending_habit"].includes(name) &&
      typeof parsedValue === "string"
    ) {
      parsedValue = parsedValue.replace(ALPHA_SPACE_REGEX, "");
    }

    if (
      ["other_notes", "other_scholarship", "combination_notes", "scholarships", "scholarship_privileges"].includes(
        name
      ) &&
      typeof parsedValue === "string"
    ) {
      parsedValue = parsedValue.replace(ALPHA_NUM_COMMA_DASH_REGEX, "");
    }

    if (type === "checkbox" && section === "student_support") {
      const updatedSupport = new Set(data[section].support || []);
      if (checked) updatedSupport.add(name);
      else updatedSupport.delete(name);

      updateData({
        ...data,
        [section]: { ...data[section], support: Array.from(updatedSupport) },
      });
    } else {
      updateData({
        ...data,
        [section]: { ...data[section], [name]: parsedValue },
      });
    }
  };

  const support = data.student_support?.support || [];

  return (
    <div className="form-section">
      <fieldset className="form-section" disabled={readOnly}>
        <h2 className="step-title">Socio-Economic Status</h2>

        <div className="full-width">
          <label className="form-label">
            What is your means of support for your college education?
          </label>
          <div className="checkbox-grid">
            {[{ name: SupportChoices.SELF, label: "Self-supporting" },
              { name: SupportChoices.BOTH_PARENTS, label: "Both parents" },
              { name: SupportChoices.FATHER_ONLY, label: "Father only" },
              { name: SupportChoices.MOTHER_ONLY, label: "Mother only" },
              { name: SupportChoices.GOV_FUNDED, label: "Government Funded" }].map(
              ({ name, label }) => (
                <label key={name} className="inline-checkbox">
                  <input
                    type="checkbox"
                    name={name}
                    checked={support.includes(name)}
                    onChange={(e) => handleChange(e, "student_support")}
                    onFocus={() => {
                      clearError("student_support.support");
                      setErrors((prev) => ({
                        ...prev,
                        ["student_support.support"]: undefined,
                      }));
                    }}
                  />
                  {label}
                </label>
              )
            )}

            {/* Scholarship */}
            <label className="inline-checkbox">
              <input
                type="checkbox"
                name={SupportChoices.SCHOLARSHIP}
                checked={support.includes(SupportChoices.SCHOLARSHIP)}
                onChange={(e) => handleChange(e, "student_support")}
                onFocus={() => {
                  clearError("student_support.support");
                  setErrors((prev) => ({
                    ...prev,
                    ["student_support.support"]: undefined,
                  }));
                }}
              />
              Scholarship
              {support.includes(SupportChoices.SCHOLARSHIP) && (
                <>
                  <input
                    type="text"
                    name="other_scholarship"
                    placeholder="What Scholarship?"
                    value={data.student_support.other_scholarship || ""}
                    onChange={(e) => handleChange(e, "student_support")}
                    onFocus={() => {
                      clearError("student_support.other_scholarship");
                      setErrors((prev) => ({
                        ...prev,
                        ["student_support.other_scholarship"]: undefined,
                      }));
                    }}
                    className={`form-input ${
                      errors?.["student_support.other_scholarship"] ? "error" : ""
                    }`}
                  />
                  {errors?.["student_support.other_scholarship"] && (
                    <small className="error-message">
                      {errors["student_support.other_scholarship"]}
                    </small>
                  )}
                </>
              )}
            </label>

            <label className="inline-checkbox">
              <input
                type="checkbox"
                name={SupportChoices.COMBINATION}
                checked={support.includes(SupportChoices.COMBINATION)}
                onChange={(e) => handleChange(e, "student_support")}
                onFocus={() => {
                  clearError("student_support.support");
                  setErrors((prev) => ({
                    ...prev,
                    ["student_support.support"]: undefined,
                  }));
                }}
              />
              Combination of
              {support.includes(SupportChoices.COMBINATION) && (
                <>
                  <input
                    type="text"
                    name="combination_notes"
                    placeholder="Combination of..."
                    value={data.student_support.combination_notes || ""}
                    onChange={(e) => handleChange(e, "student_support")}
                    onFocus={() => {
                      clearError("student_support.combination_notes");
                      setErrors((prev) => ({
                        ...prev,
                        ["student_support.combination_notes"]: undefined,
                      }));
                    }}
                    className={`form-input ${
                      errors?.["student_support.combination_notes"] ? "error" : ""
                    }`}
                  />
                  {errors?.["student_support.combination_notes"] && (
                    <small className="error-message">
                      {errors["student_support.combination_notes"]}
                    </small>
                  )}
                </>
              )}
            </label>

            <label className="inline-checkbox">
              <input
                type="checkbox"
                name={SupportChoices.OTHERS}
                checked={support.includes(SupportChoices.OTHERS)}
                onChange={(e) => handleChange(e, "student_support")}
                onFocus={() => {
                  clearError("student_support.support");
                  setErrors((prev) => ({
                    ...prev,
                    ["student_support.support"]: undefined,
                  }));
                }}
              />
              Others{" "}
              <span style={{ fontSize: "0.85em" }}>
                (aunts, uncles, etc. – pls. specify)
              </span>
              {support.includes(SupportChoices.OTHERS) && (
                <>
                  <input
                    type="text"
                    name="other_notes"
                    placeholder="Specify..."
                    value={data.student_support.other_notes || ""}
                    onChange={(e) => handleChange(e, "student_support")}
                    onFocus={() => {
                      clearError("student_support.other_notes");
                      setErrors((prev) => ({
                        ...prev,
                        ["student_support.other_notes"]: undefined,
                      }));
                    }}
                    className={`form-input ${
                      errors?.["student_support.other_notes"] ? "error" : ""
                    }`}
                  />
                  {errors?.["student_support.other_notes"] && (
                    <small className="error-message">
                      {errors["student_support.other_notes"]}
                    </small>
                  )}
                </>
              )}
            </label>
          </div>

          {errors?.["student_support.support"] && (
            <small className="error-message">
              {errors["student_support.support"]}
            </small>
          )}
        </div>

        <div className="radio-question-group" style={{ marginTop: "20px" }}>
          <label className="form-label">
            Do you have other scholarships aside from UP Socialized Tuition
            System?
          </label>
          <div className="radio-options" style={{ marginBottom: "20px" }}>
            <label>
              <input
                type="radio"
                name="has_scholarship"
                value="true"
                checked={data.socio_economic_status?.has_scholarship === true}
                onChange={(e) => handleChange(e, "socio_economic_status")}
                onFocus={() =>
                  clearError("socio_economic_status.has_scholarship")
                }
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="has_scholarship"
                value="false"
                checked={data.socio_economic_status?.has_scholarship === false}
                onChange={(e) => handleChange(e, "socio_economic_status")}
                onFocus={() =>
                  clearError("socio_economic_status.has_scholarship")
                }
              />
              No
            </label>
          </div>
          {errors?.["socio_economic_status.has_scholarship"] && (
            <small className="error-message">
              {errors["socio_economic_status.has_scholarship"]}
            </small>
          )}
        </div>

        <div className="form-row full-width">
          <label className="form-label">
            What other scholarships do you have aside from UP Socialized Tuition
            System?
          </label>
          <textarea
            className={`form-input ${
              errors?.["socio_economic_status.scholarships"] ? "error" : ""
            }`}
            name="scholarships"
            value={data.socio_economic_status?.scholarships || ""}
            onChange={(e) => handleChange(e, "socio_economic_status")}
            onFocus={() => {
              clearError("socio_economic_status.scholarships");
              setErrors((prev) => ({
                ...prev,
                ["socio_economic_status.scholarships"]: undefined,
              }));
            }}
          />
          {errors?.["socio_economic_status.scholarships"] && (
            <small className="error-message">
              {errors["socio_economic_status.scholarships"]}
            </small>
          )}
        </div>

        <div className="form-row full-width">
          <label className="form-label">
            What are your privileges that you specified in the question above?
          </label>
          <textarea
            className={`form-input ${
              errors?.["socio_economic_status.scholarship_privileges"]
                ? "error"
                : ""
            }`}
            name="scholarship_privileges"
            value={data.socio_economic_status?.scholarship_privileges || ""}
            onChange={(e) => handleChange(e, "socio_economic_status")}
            onFocus={() => {
              clearError("socio_economic_status.scholarship_privileges");
              setErrors((prev) => ({
                ...prev,
                ["socio_economic_status.scholarship_privileges"]: undefined,
              }));
            }}
          />
          {errors?.["socio_economic_status.scholarship_privileges"] && (
            <small className="error-message">
              {errors["socio_economic_status.scholarship_privileges"]}
            </small>
          )}
        </div>

        <div className="form-row full-width">
          <label className="form-label">
            How much is your monthly allowance (in pesos) to be provided by your
            family when you reach college?
          </label>
          <input
            type="number"
            className={`form-input ${
              errors?.["socio_economic_status.monthly_allowance"] ? "error" : ""
            }`}
            name="monthly_allowance"
            value={data.socio_economic_status?.monthly_allowance || ""}
            onChange={(e) => handleChange(e, "socio_economic_status")}
            onFocus={() => {
              clearError("socio_economic_status.monthly_allowance");
              setErrors((prev) => ({
                ...prev,
                ["socio_economic_status.monthly_allowance"]: undefined,
              }));
            }}
          />
          {errors?.["socio_economic_status.monthly_allowance"] && (
            <small className="error-message">
              {errors["socio_economic_status.monthly_allowance"]}
            </small>
          )}
        </div>

        <div className="form-row full-width">
          <label className="form-label">What do you spend much?</label>
          <input
            type="text"
            className={`form-input ${
              errors?.["socio_economic_status.spending_habit"] ? "error" : ""
            }`}
            name="spending_habit"
            value={data.socio_economic_status?.spending_habit || ""}
            onChange={(e) => handleChange(e, "socio_economic_status")}
            onFocus={() => {
              clearError("socio_economic_status.spending_habit");
              setErrors((prev) => ({
                ...prev,
                ["socio_economic_status.spending_habit"]: undefined,
              }));
            }}
          />
          {errors?.["socio_economic_status.spending_habit"] && (
            <small className="error-message">
              {errors["socio_economic_status.spending_habit"]}
            </small>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default BISSocioeconomic;