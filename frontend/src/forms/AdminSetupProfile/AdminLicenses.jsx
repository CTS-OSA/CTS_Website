import React from "react";
import FormField from "../../components/FormField";
import { clearError } from "../../utils/helperFunctions";

const AdminLicenses = ({ formData, setFormData, errors, setErrors }) => {

  // Generic handler for post_nominal and position arrays
  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleArrayAdd = (field, initialValue = "") => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], initialValue] }));
  };

  const handleArrayRemove = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  // License handlers (each license has name & number)
  const handleLicenseChange = (index, key, value) => {
    const updated = [...formData.licenses];
    updated[index] = { ...updated[index], [key]: value };
    setFormData(prev => ({ ...prev, licenses: updated }));
  };

  const handleLicenseAdd = () => {
    setFormData(prev => ({ ...prev, licenses: [...prev.licenses, { name: "", number: "" }] }));
  };

  const handleLicenseRemove = (index) => {
    const updated = [...formData.licenses];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, licenses: updated }));
  };

  return (
    <div className="form-container">
      <h2 className="text-[#7b1113] text-2xl font-bold pb-4">Extra Counselor Information</h2>

      {/* Post Nominal */}
      <div className="pb-4">
        <h3 className="font-semibold mb-2">Post Nominal</h3>
        {formData.post_nominal.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <FormField
              value={item}
              onChange={(e) => handleArrayChange("post_nominal", index, e.target.value)}
              onFocus={() => clearError(errors, setErrors, `post_nominal.${index}`)}
            />
            <button type="button" onClick={() => handleArrayRemove("post_nominal", index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => handleArrayAdd("post_nominal")}>Add Post Nominal</button>
      </div>

      {/* Position */}
      <div className="pb-4">
        <h3 className="font-semibold mb-2">Position</h3>
        {formData.position.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <FormField
              value={item}
              onChange={(e) => handleArrayChange("position", index, e.target.value)}
              onFocus={() => clearError(errors, setErrors, `position.${index}`)}
            />
            <button type="button" onClick={() => handleArrayRemove("position", index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => handleArrayAdd("position")}>Add Position</button>
      </div>

      {/* Licenses */}
      <div className="pb-4">
        <h3 className="font-semibold mb-2">Licenses</h3>
        {formData.licenses.map((license, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 mb-2">
            <FormField
              label="License Name"
              value={license.name}
              onChange={(e) => handleLicenseChange(index, "name", e.target.value)}
              onFocus={() => clearError(errors, setErrors, `licenses.${index}.name`)}
              required
            />
            <FormField
              label="License Number"
              value={license.number}
              onChange={(e) => handleLicenseChange(index, "number", e.target.value)}
              onFocus={() => clearError(errors, setErrors, `licenses.${index}.number`)}
              required
            />
            <button type="button" className="col-span-2" onClick={() => handleLicenseRemove(index)}>
              Remove License
            </button>
          </div>
        ))}
        <button type="button" onClick={handleLicenseAdd}>Add License</button>
      </div>
    </div>
  );
};

export default AdminLicenses;
