import React from 'react';
import './../SetupProfile/css/multistep.css';
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
    <div className="form-section">
      <fieldset className="form-section" disabled={readOnly}>
        <h2 className="step-title">School Preferences</h2>

        <FormField
          label="Who influenced you to study in UP Mindanao?"
          name="influence"
          value={data.influence || ''}
          onFocus={() => clearError(errors, setErrors, 'preferences.influence')}
          onChange={handleChange}
          error={errors?.['preferences.influence']}
        />

        <FormField
          label="Indicate the reason/s of enrolling in this campus (UP Mindanao):"
          name="reason_for_enrolling"
          value={data.reason_for_enrolling || ''}
          onFocus={() => clearError(errors, setErrors, 'preferences.reason_for_enrolling')}
          onChange={handleChange}
          error={errors?.['preferences.reason_for_enrolling']}
        />

        <div className="radio-question-group">
          <label className="form-label">
            Do you have plans of transferring to another UP Campus by 2nd year?
          </label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="transfer_plans"
                value="true"
                checked={data.transfer_plans === true}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.transfer_plans')}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="transfer_plans"
                value="false"
                checked={data.transfer_plans === false}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.transfer_plans')}
              />
              No
            </label>
          </div>
          {errors?.['preferences.transfer_plans'] && (
            <small className="error-message">{errors['preferences.transfer_plans']}</small>
          )}
        </div>

        <FormField
          label="Why and why not?"
          name="transfer_reason"
          value={data.transfer_reason || ''}
          onFocus={() => clearError(errors, setErrors, 'preferences.transfer_reason')}
          onChange={handleChange}
          error={errors?.['preferences.transfer_reason']}
        />

        <div className="radio-question-group">
          <label className="form-label">
            Do you have plans of shifting to another degree program by 2nd year?
          </label>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="shift_plans"
                value="true"
                checked={data.shift_plans === true}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.shift_plans')}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="shift_plans"
                value="false"
                checked={data.shift_plans === false}
                onChange={handleChange}
                onFocus={() => clearError(errors, setErrors, 'preferences.shift_plans')}
              />
              No
            </label>
          </div>
          {errors?.['preferences.shift_plans'] && (
            <small className="error-message">{errors['preferences.shift_plans']}</small>
          )}
        </div>

        {data.shift_plans === true && (
          <div className="form-grid">
            <FormField
              label="If yes, what degree program?"
              name="planned_shift_degree"
              value={data.planned_shift_degree || ''}
              onFocus={() => clearError(errors, setErrors, 'preferences.planned_shift_degree')}
              onChange={handleChange}
              error={errors?.['preferences.planned_shift_degree']}
            />

            <FormField
              label="Why?"
              name="reason_for_shifting"
              value={data.reason_for_shifting || ''}
              onFocus={() => clearError(errors, setErrors, 'preferences.reason_for_shifting')}
              onChange={handleChange}
              error={errors?.['preferences.reason_for_shifting']}
            />
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default BISPreferences;
