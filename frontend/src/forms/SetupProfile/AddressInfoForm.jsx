import React from "react";
import FormField from "../../components/FormField";
import "./css/multistep.css";
import { useEnumChoices } from "../../utils/enumChoices";
import { clearError } from "../../utils/helperFunctions";

const AddressInfoForm = ({
  formData,
  setFormData,
  step,
  disabled,
  addressLabel,
  checkboxLabel,
  sameAsPermanent,
  handleSameAsPermanentToggle,
  prefix,
  errors,
  setErrors,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getField = (name) => `${prefix}_${name}`;

  const { enums, loading, error } = useEnumChoices();

  return (
    <div className="form-container">
      <h2 className="text-[#7b1113] text-2xl font-bold pb-4">{addressLabel}</h2>

      {checkboxLabel && (
        <label className="step-info">
          <input
            type="checkbox"
            checked={sameAsPermanent}
            onChange={handleSameAsPermanentToggle}
          />
          &nbsp;{checkboxLabel}
        </label>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
        <div className="form-group">
          <FormField
            label="Address Line 1 "
            name={getField("address_line_1")}
            value={formData[getField("address_line_1")]}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, `${prefix}.address_line_1`)
            }
            required
            disabled={disabled}
            error={errors?.[`${prefix}.address_line_1`]}
          />
        </div>
        <div className="form-group">
          <FormField
            label="Address Line 2 "
            name={getField("address_line_2")}
            value={formData[getField("address_line_2")]}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
        <div className="form-group">
          <FormField
            label="Barangay "
            name={getField("barangay")}
            value={formData[getField("barangay")]}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, `${prefix}.barangay`)}
            required
            disabled={disabled}
            error={errors?.[`${prefix}.barangay`]}
          />
        </div>
        <div className="form-group">
          <FormField
            label="City/Municipality "
            name={getField("city_municipality")}
            value={formData[getField("city_municipality")]}
            onChange={handleChange}
            onFocus={() =>
              clearError(errors, setErrors, `${prefix}.city_municipality`)
            }
            required
            disabled={disabled}
            error={errors?.[`${prefix}.city_municipality`]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="form-group">
          <FormField
            label="Region"
            type="select"
            name={getField("region")}
            value={formData[getField("region")]}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, `${prefix}.region`)}
            required
            disabled={disabled || loading}
            error={errors?.[`${prefix}.region`]}
            options={
              loading
                ? [{ value: "", label: "Loading regions..." }]
                : error
                ? [{ value: "", label: "Error loading regions" }]
                : enums?.region || []
            }
          />
        </div>
        <div className="form-group">
          <FormField
            label="Province "
            name={getField("province")}
            value={formData[getField("province")]}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, `${prefix}.province`)}
            required
            disabled={disabled}
            error={errors?.[`${prefix}.province`]}
          />
        </div>
        <div className="form-group">
          <FormField
            label="Zip code "
            name={getField("zip_code")}
            value={formData[getField("zip_code")]}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, `${prefix}.zip_code`)}
            required
            disabled={disabled}
            error={errors?.[`${prefix}.zip_code`]}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressInfoForm;
