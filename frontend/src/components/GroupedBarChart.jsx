import React, { useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import CustomTooltip from "../components/CustomToolTip";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GroupedBarChart({
  data,
  keys,
  xKey,
  title,
  totalValue,
  subtitle,
  height = 300,
  barGroupWidth = 80,
  minVisibleBars = 6,
}) {
  const colorPalette = ["#5F61C1", "#EC5F1A", "#93c5fd", "#fcbd47"];
  const scrollRef = useRef(null);
  const [scrollPos, setScrollPos] = useState(0);

  const totalBars = data?.length || 0;
  const chartWidth = Math.max(
    totalBars * barGroupWidth,
    minVisibleBars * barGroupWidth
  );

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    setScrollPos((prev) => Math.max(prev - 200, 0));
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    setScrollPos((prev) => prev + 200);
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow p-8 relative flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <p className="text-3xl font-bold text-gray-700">{totalValue}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      {/* Chart Container with horizontal scroll */}
      <div
        className="relative overflow-y-hidden scrollbar-hide border-b border-gray-300"
        ref={scrollRef}
      >
        <div style={{ width: `${chartWidth}px`, height: `${height}px` }}>
          <BarChart
            width={chartWidth}
            height={height}
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                fill={colorPalette[index % colorPalette.length]}
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            ))}
          </BarChart>
        </div>
      </div>
      <div className="mt-4 flex gap-4 flex-wrap">
        {keys.map((key, index) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: colorPalette[index % colorPalette.length],
              }}
            ></div>
            <span className="text-sm text-gray-600">{key}</span>
          </div>
        ))}
      </div>

      {/* Scroll Buttons */}
      {totalBars > minVisibleBars && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={scrollLeft}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={scrollRight}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
