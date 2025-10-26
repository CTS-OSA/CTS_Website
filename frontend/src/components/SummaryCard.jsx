import React from "react";

const SummaryCard = ({ title, value, subtitle, color }) => {
  return (
    <div
      className="p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center"
      style={{ backgroundColor: color }}
    >
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-3xl font-bold mt-2 text-white">{value}</p>
      <p className="text-sm mt-1 text-white italic">{subtitle}</p>
    </div>
  );
};

export default SummaryCard;
