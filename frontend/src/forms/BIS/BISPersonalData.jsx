import React from 'react';
import DisplayField from '../../components/DisplayField';

const BISPersonalData = ({ profileData }) => {
  if (!profileData) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-upmaroon text-2xl font-bold mb-2">PERSONAL DATA</h2>
      
      {/* Grid Layout for Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Surname */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Surname
          </label>
          <input
            type="text"
            value={profileData.last_name || ''}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
          />
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            value={profileData.first_name || ''}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
          />
        </div>

        {/* Middle Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Middle Name
          </label>
          <input
            type="text"
            value={profileData.middle_name || ''}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
          />
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nickname
          </label>
          <input
            type="text"
            value={profileData.nickname || ''}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600"
          />
        </div>

        {/* Year */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            value={profileData.current_year_level || ''}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600 appearance-none"
          >
            <option value="">{profileData.current_year_level || 'Select year'}</option>
          </select>
        </div>

        {/* Program/Course */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Program/Course
          </label>
          <select
            value={profileData.degree_program || ''}
            disabled
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-upmaroon/20 text-gray-600 appearance-none"
          >
            <option value="">{profileData.degree_program || 'Select course'}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BISPersonalData;