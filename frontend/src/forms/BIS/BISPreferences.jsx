import React from 'react';
import FormField from '../../components/FormField';
import { clearError } from '../../utils/helperFunctions';

const BISPreferences = ({ data, updateData, readOnly = false, errors, setErrors }) => {
  const sanitizeInput = (value) => {
    return value.replace(/[^a-zA-Z\s.,!?'"()\-\/]/g, '');
  };

  const handleChange = (e) => {
    if (readOnly) return;

    const { name, value, type } = e.target;
    const updatedValue = type === 'radio' ? value === 'true' : sanitizeInput(value);

    if (name === 'shift_plans' && updatedValue === false) {
      updateData({
        ...data,
        shift_plans: false,
        planned_shift_degree: '',
        reason_for_shifting: '',
      });
    } else {
      updateData({
        ...data,
        [name]: updatedValue,
      });
    }
  };

  return (
    <div className="p-4">
      <fieldset className="space-y-6" disabled={readOnly}>
        <h2 className="text-upmaroon text-2xl font-bold mb-5">SCHOOL PREFERENCES</h2>

        {/* Who influenced you */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Who influenced you to study in UP Mindanao?
          </label>
          <input
            type="text"
            name="influence"
            value={data.influence || ''}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, 'preferences.influence')}
            disabled={readOnly}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
              errors?.['preferences.influence'] ? 'border-red-500' : 'border-gray-300'
            } ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
          />
          {errors?.['preferences.influence'] && (
            <small className="text-red-500 text-xs">{errors['preferences.influence']}</small>
          )}
        </div>

        {/* Reason for enrolling */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Indicate the reason/s of enrolling in this campus (UP Mindanao):
          </label>
          <textarea
            name="reason_for_enrolling"
            value={data.reason_for_enrolling || ''}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, 'preferences.reason_for_enrolling')}
            disabled={readOnly}
            rows={4}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 resize-none ${
              errors?.['preferences.reason_for_enrolling'] ? 'border-red-500' : 'border-gray-300'
            } ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
          />
          {errors?.['preferences.reason_for_enrolling'] && (
            <small className="text-red-500 text-xs">{errors['preferences.reason_for_enrolling']}</small>
          )}
        </div>

        {/* Transfer plans radio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Do you have plans of transferring to another UP Campus by 2nd year?
          </label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transfer_plans"
                value="true"
                checked={data.transfer_plans === true}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.transfer_plans')}
                disabled={readOnly}
                className="w-4 h-4 text-upmaroon focus:ring-upmaroon"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transfer_plans"
                value="false"
                checked={data.transfer_plans === false}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.transfer_plans')}
                disabled={readOnly}
                className="w-4 h-4 text-upmaroon focus:ring-upmaroon"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
          {errors?.['preferences.transfer_plans'] && (
            <small className="text-red-500 text-xs">{errors['preferences.transfer_plans']}</small>
          )}
        </div>

        {/* Transfer reason */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Why and why not?
          </label>
          <textarea
            name="transfer_reason"
            value={data.transfer_reason || ''}
            onChange={handleChange}
            onFocus={() => clearError(errors, setErrors, 'preferences.transfer_reason')}
            disabled={readOnly}
            rows={4}
            className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 resize-none ${
              errors?.['preferences.transfer_reason'] ? 'border-red-500' : 'border-gray-300'
            } ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
          />
          {errors?.['preferences.transfer_reason'] && (
            <small className="text-red-500 text-xs">{errors['preferences.transfer_reason']}</small>
          )}
        </div>

        {/* Shift plans radio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Do you have plans of shifting to another degree program by 2nd year?
          </label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="shift_plans"
                value="true"
                checked={data.shift_plans === true}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.shift_plans')}
                disabled={readOnly}
                className="w-4 h-4 text-upmaroon focus:ring-upmaroon"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="shift_plans"
                value="false"
                checked={data.shift_plans === false}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.shift_plans')}
                disabled={readOnly}
                className="w-4 h-4 text-upmaroon focus:ring-upmaroon"
              />
              <span className="text-sm">No</span>
            </label>
          </div>
          {errors?.['preferences.shift_plans'] && (
            <small className="text-red-500 text-xs">{errors['preferences.shift_plans']}</small>
          )}
        </div>

        {/* Conditional fields if shift_plans is true */}
        {data.shift_plans === true && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-6 border-l-4 border-upmaroon/20">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                If yes, what degree program?
              </label>
              <input
                type="text"
                name="planned_shift_degree"
                value={data.planned_shift_degree || ''}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.planned_shift_degree')}
                disabled={readOnly}
                className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
                  errors?.['preferences.planned_shift_degree'] ? 'border-red-500' : 'border-gray-300'
                } ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
              />
              {errors?.['preferences.planned_shift_degree'] && (
                <small className="text-red-500 text-xs">{errors['preferences.planned_shift_degree']}</small>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Why?
              </label>
              <input
                type="text"
                name="reason_for_shifting"
                value={data.reason_for_shifting || ''}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.reason_for_shifting')}
                disabled={readOnly}
                className={`w-full px-4 py-2.5 border rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 ${
                  errors?.['preferences.reason_for_shifting'] ? 'border-red-500' : 'border-gray-300'
                } ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
              />
              {errors?.['preferences.reason_for_shifting'] && (
                <small className="text-red-500 text-xs">{errors['preferences.reason_for_shifting']}</small>
              )}
            </div>
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default BISPreferences;