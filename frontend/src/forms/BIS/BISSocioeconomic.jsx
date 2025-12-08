import React from "react";
import { clearError } from "../../utils/helperFunctions";
import FormField from "../../components/FormField";

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

    // if (
    //   ["spending_habit"].includes(name) &&
    //   typeof parsedValue === "string"
    // ) {
    //   parsedValue = parsedValue.replace(ALPHA_SPACE_REGEX, "");
    // }

    if (
      ["other_notes", "other_scholarship", "combination_notes", "scholarships", "scholarship_privileges", "spending_habit"].includes(
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
    <div className="p-4">
      <fieldset disabled={readOnly} className="space-y-6">
        <h2 className="text-upmaroon text-2xl font-bold mb-5">SOCIO-ECONOMIC STATUS</h2>

        {/* Means of Support */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            What is your means of support for your college education?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: SupportChoices.SELF, label: "Self-supporting" },
              { name: SupportChoices.BOTH_PARENTS, label: "Both parents" },
              { name: SupportChoices.FATHER_ONLY, label: "Father only" },
              { name: SupportChoices.MOTHER_ONLY, label: "Mother only" },
              { name: SupportChoices.GOV_FUNDED, label: "Government Funded" }
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer">
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
                  disabled={readOnly}
                  className="w-4 h-4 text-upmaroon focus:ring-upmaroon rounded"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}

            {/* Scholarship with conditional input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
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
                  disabled={readOnly}
                  className="w-4 h-4 text-upmaroon focus:ring-upmaroon rounded"
                />
                <span className="text-sm">Scholarship</span>
              </label>
              {support.includes(SupportChoices.SCHOLARSHIP) && (
                <div className="ml-6">
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
                    disabled={readOnly}
                    className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
                      errors?.["student_support.other_scholarship"] ? "border-red-500" : "border-gray-300"
                    } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
                  />
                  {errors?.["student_support.other_scholarship"] && (
                    <small className="text-red-500 text-xs mt-1 block">
                      {errors["student_support.other_scholarship"]}
                    </small>
                  )}
                </div>
              )}
            </div>

            {/* Combination with conditional input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
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
                  disabled={readOnly}
                  className="w-4 h-4 text-upmaroon focus:ring-upmaroon rounded"
                />
                <span className="text-sm">Combination of</span>
              </label>
              {support.includes(SupportChoices.COMBINATION) && (
                <div className="ml-6">
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
                    disabled={readOnly}
                    className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
                      errors?.["student_support.combination_notes"] ? "border-red-500" : "border-gray-300"
                    } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
                  />
                  {errors?.["student_support.combination_notes"] && (
                    <small className="text-red-500 text-xs mt-1 block">
                      {errors["student_support.combination_notes"]}
                    </small>
                  )}
                </div>
              )}
            </div>

            {/* Others with conditional input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
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
                  disabled={readOnly}
                  className="w-4 h-4 text-upmaroon focus:ring-upmaroon rounded"
                />
                <span className="text-sm">
                  Others <span className="text-xs text-gray-500">(aunts, uncles, etc. – pls. specify)</span>
                </span>
              </label>
              {support.includes(SupportChoices.OTHERS) && (
                <div className="ml-6">
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
                    disabled={readOnly}
                    className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
                      errors?.["student_support.other_notes"] ? "border-red-500" : "border-gray-300"
                    } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
                  />
                  {errors?.["student_support.other_notes"] && (
                    <small className="text-red-500 text-xs mt-1 block">
                      {errors["student_support.other_notes"]}
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>

          {errors?.["student_support.support"] && (
            <small className="text-red-500 text-xs mt-2 block">
              {errors["student_support.support"]}
            </small>
          )}
        </div>

        {/* Has other scholarships - Radio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Do you have other scholarships aside from UP Socialized Tuition System?
          </label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_scholarship"
                value="true"
                checked={data.socio_economic_status?.has_scholarship === true}
                onChange={(e) => handleChange(e, "socio_economic_status")}
                onFocus={() => clearError("socio_economic_status.has_scholarship")}
                disabled={readOnly}
                className="w-4 h-4 text-upmaroon focus:ring-upmaroon"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_scholarship"
                value="false"
                checked={data.socio_economic_status?.has_scholarship === false}
                onChange={(e) => handleChange(e, "socio_economic_status")}
                onFocus={() => clearError("socio_economic_status.has_scholarship")}
                disabled={readOnly}
                className="w-4 h-4 text-upmaroon focus:ring-upmaroon"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
          {errors?.["socio_economic_status.has_scholarship"] && (
            <small className="text-red-500 text-xs">
              {errors["socio_economic_status.has_scholarship"]}
            </small>
          )}
        </div>

        {/* Other scholarships textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            What other scholarships do you have aside from UP Socialized Tuition System?
          </label>
          <textarea
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
            disabled={readOnly}
            rows={4}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 resize-none ${
              errors?.["socio_economic_status.scholarships"] ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
          />
          {errors?.["socio_economic_status.scholarships"] && (
            <small className="text-red-500 text-xs">
              {errors["socio_economic_status.scholarships"]}
            </small>
          )}
        </div>

        {/* Scholarship privileges */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            What are your privileges that you specified in the question above?
          </label>
          <textarea
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
            disabled={readOnly}
            rows={4}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 resize-none ${
              errors?.["socio_economic_status.scholarship_privileges"] ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
          />
          {errors?.["socio_economic_status.scholarship_privileges"] && (
            <small className="text-red-500 text-xs">
              {errors["socio_economic_status.scholarship_privileges"]}
            </small>
          )}
        </div>

        {/* Monthly allowance */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            How much is your monthly allowance (in pesos) to be provided by your family when you reach college?
          </label>
          <input
            type="number"
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
            disabled={readOnly}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
              errors?.["socio_economic_status.monthly_allowance"] ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
          />
          {errors?.["socio_economic_status.monthly_allowance"] && (
            <small className="text-red-500 text-xs">
              {errors["socio_economic_status.monthly_allowance"]}
            </small>
          )}
        </div>

        {/* Spending habit */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            What do you spend much?
          </label>
          <input
            type="text"
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
            disabled={readOnly}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
              errors?.["socio_economic_status.spending_habit"] ? "border-red-500" : "border-gray-300"
            } ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}`}
          />
          {errors?.["socio_economic_status.spending_habit"] && (
            <small className="text-red-500 text-xs">
              {errors["socio_economic_status.spending_habit"]}
            </small>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default BISSocioeconomic;