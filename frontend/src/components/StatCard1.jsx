import React from "react";
import PropTypes from "prop-types";

function StatCard({ title, value, interval }) {
  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 bg-white border-gray-300 rounded-lg shadow-sm">
      <div className="flex flex-col justify-center ">
        <h2 className="text-sm font-bold text-gray-700 mb-2">{title}</h2>

        <div className="flex flex-col space-y-2 justify-center h-full">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          </div>
          <span className="text-sm text-black-500 mt-1">{interval}</span>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  interval: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default StatCard;
