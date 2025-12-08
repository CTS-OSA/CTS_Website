import React, { useMemo } from "react";
import BaseFormField from "../../components/FormField";
import { clearError } from "../../utils/helperFunctions";
import {
  filterGeneralText,
  filterDecimalNumbers,
} from "../../utils/inputFilters";

const SCIFHealthData = ({
  data,
  updateData,
  readOnly = false,
  errors,
  setErrors,
}) => {
  const FormField = useMemo(
    () =>
      function FormFieldComponent(props) {
        return (
          <BaseFormField
            {...props}
            disabled={props.disabled ?? readOnly}
          />
        );
      },
    [readOnly]
  );

  const clearFieldError = (key) => clearError(errors, setErrors, key);

  const normalizeText = (value) => {
    if (readOnly) return;
    return value === "" ? null : value;
  };

  const handleHealthConditionChange = (condition) => {
    if (readOnly) return;
    updateData({
      ...data,
      health_condition: normalizeText(condition),
    });
    if (errors?.["health_data.health_condition"]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors["health_data.health_condition"];
        return newErrors;
      });
    }
  };

  const handleTextFieldChange = (
    field,
    value,
    filterFn = filterGeneralText
  ) => {
    if (readOnly) return;

    const filteredValue = filterFn(value);
    updateData({
      ...data,
      [field]: filteredValue,
    });
  };

  const handleLastHospitalizationChange = (value) => {
    if (readOnly) return;

    const today = new Date().toISOString().split("T")[0];

    if (value && value > today) {
      setErrors((prev) => ({
        ...prev,
        "health_data.last_hospitalization":
          "Last hospitalization date cannot be in the future.",
      }));
      return;
    }

    clearFieldError("health_data.last_hospitalization");
    updateData({
      ...data,
      last_hospitalization: value || "",
    });
  };

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">Health Data</h2>

      <section className="p-6 border border-gray-200 rounded-xl bg-gray-50 space-y-6">
        {/* Health Condition (Radio Buttons) */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Health Condition:
          </label>
          <div className="flex flex-wrap gap-4">
            {["Excellent", "Very Good", "Good", "Poor"].map((condition) => (
              <label key={condition} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="health_condition"
                  value={condition}
                  checked={data.health_condition === condition}
                  onChange={() => handleHealthConditionChange(condition)}
                  disabled={readOnly}
                  className="accent-blue-600"
                />
                <span className="text-gray-700">{condition}</span>
              </label>
            ))}
          </div>
          {errors?.["health_data.health_condition"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["health_data.health_condition"]}
            </p>
          )}
        </div>

        {/* Height and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Height (m)"
            type="text"
            value={data.height ?? ""}
            onFocus={() => clearFieldError("health_data.height")}
            onChange={(e) =>
              handleTextFieldChange(
                "height",
                e.target.value,
                filterDecimalNumbers
              )
            }
            error={errors?.["health_data.height"]}
            required
          />

          <FormField
            label="Weight (kg)"
            type="text"
            value={data.weight ?? ""}
            onFocus={() => clearFieldError("health_data.weight")}
            onChange={(e) =>
              handleTextFieldChange(
                "weight",
                e.target.value,
                filterDecimalNumbers
              )
            }
            error={errors?.["health_data.weight"]}
            required
          />
        </div>

        {/* Eye Sight and Hearing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Eye Sight"
            type="select"
            value={data.eye_sight || ""}
            onFocus={() => clearFieldError("health_data.eye_sight")}
            onChange={(e) =>
              updateData({ ...data, eye_sight: normalizeText(e.target.value) })
            }
            options={[
              { value: "", label: "Select" },
              { value: "Good", label: "Good" },
              { value: "Medium", label: "Medium" },
              { value: "Poor", label: "Poor" },
            ]}
            error={errors?.["health_data.eye_sight"]}
            required
          />

          <FormField
            label="Hearing"
            type="select"
            value={data.hearing || ""}
            onFocus={() => clearFieldError("health_data.hearing")}
            onChange={(e) =>
              updateData({ ...data, hearing: normalizeText(e.target.value) })
            }
            options={[
              { value: "", label: "Select" },
              { value: "Good", label: "Good" },
              { value: "Medium", label: "Medium" },
              { value: "Poor", label: "Poor" },
            ]}
            error={errors?.["health_data.hearing"]}
            required
          />
        </div>

        {/* Disabilities and Ailments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Any Physical Disability"
            type="text"
            value={data.physical_disabilities || ""}
            onFocus={() =>
              clearFieldError("health_data.physical_disabilities")
            }
            onChange={(e) =>
              updateData({
                ...data,
                physical_disabilities: e.target.value,
              })
            }
            error={errors?.["health_data.physical_disabilities"]}
            helpertext="Enter multiple items separated by commas (e.g., Paralysis, Deafness, Asthma)"
          />

          <FormField
            label="Common/Frequent Ailment"
            type="text"
            value={data.common_ailments || ""}
            onFocus={() => clearFieldError("health_data.common_ailments")}
            onChange={(e) =>
              updateData({
                ...data,
                common_ailments: e.target.value,
              })
            }
            error={errors?.["health_data.common_ailments"]}
            helpertext="Enter multiple items separated by commas (e.g., Colds, Flu, Cough)"
          />
        </div>

        {/* Hospitalization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Last Hospitalization"
            type="date"
            placeholder=""
            value={data.last_hospitalization || ""}
            onFocus={() => clearFieldError("health_data.last_hospitalization")}
            onChange={(e) => handleLastHospitalizationChange(e.target.value)}
            error={errors?.["health_data.last_hospitalization"]}
          />

          <FormField
            label="Reason for Hospitalization"
            type="textarea"
            value={data.reason_of_hospitalization || ""}
            onFocus={() =>
              clearFieldError("health_data.reason_of_hospitalization")
            }
            onChange={(e) =>
              updateData({
                ...data,
                reason_of_hospitalization: e.target.value,
              })
            }
            error={errors?.["health_data.reason_of_hospitalization"]}
          />
        </div>
      </section>
    </div>
  );
};

export default SCIFHealthData;
