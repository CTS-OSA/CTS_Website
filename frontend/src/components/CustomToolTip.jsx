export default function CustomToolTip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-300 p-2 rounded shadow">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mt-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm text-gray-700">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
