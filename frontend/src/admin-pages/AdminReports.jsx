import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";

import DefaultLayout from "../components/DefaultLayout";
import StatCard from "../components/StatCard1";
import PieChartCard from "../components/PieChartCard";
import GroupedBarChart from "../components/GroupedBarChart";
import { apiRequest } from "../utils/apiUtils";
import Loader from "../components/Loader";
import { shortenRegionName } from "../utils/helperFunctions";

export const AdminReports = () => {
  const { user, loading } = useContext(AuthContext);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await apiRequest(
          "http://localhost:8000/api/dashboard/admin-reports/"
        );
        if (!res.ok) throw new Error("Failed to fetch report data");
        const data = await res.json();
        setReportData(data);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading || isLoading) return <Loader />;
  if (!user) return <Navigate to="/" replace />;
  if (!reportData) return <Typography>Error loading reports.</Typography>;

  const {
    summaryData = [],
    genderData = [],
    yearLevelData = [],
    regionData = [],
    ageData = [],
  } = reportData;
  const totalNumberofStudents = summaryData.find(
    (d) => d.title === "Total Number of Students"
  )?.value;
  const top3ProgramsCard = summaryData.find((item) =>
    item.title.includes("Top 3 Programs")
  );

  return (
    <DefaultLayout variant="admin">
      <div className="min-h-screen w-full px-4 sm:px-8 py-6 bg-gray-50">
        <h5 className="text-2xl font-bold mb-3">Administrative Reports</h5>
        <h2 className="text-sm text-gray-700/50">
          Enrollment and demographics report as of{" "}
          {new Date().toLocaleDateString()}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 pt-4">
          {summaryData.slice(0, 4).map((item, idx) => (
            <div key={idx}>
              <StatCard {...item} />
            </div>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {/* Left Column */}
          <div className="flex flex-col gap-6 lg:w-1/3 flex-1">
            <div className="flex-1 flex flex-col">
              <StatCard {...top3ProgramsCard} />
            </div>
            <div className="flex-1 flex flex-col">
              <PieChartCard
                title="Gender Distribution"
                data={genderData}
                totalLabel={
                  summaryData.find(
                    (d) => d.title === "Total Number of Students"
                  )?.value
                }
                subtitle={top3ProgramsCard?.interval}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col flex-1 lg:w-2/3">
            <GroupedBarChart
              title="Population by Year Level"
              data={yearLevelData}
              keys={["First Year", "Second Year", "Third Year", "Fourth Year", "Fifth Year"]}
              totalValue={totalNumberofStudents}
              xKey="name"
              subtitle={top3ProgramsCard?.interval}
              className="h-full"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 pt-6">
          {/* Region Chart */}
          <div className="w-full lg:w-1/2">
            <GroupedBarChart
              title="Students by Region"
              data={regionData.map((r) => ({
                ...r,
                shortName: shortenRegionName(r.name),
              }))}
              keys={["Students"]}
              totalValue={totalNumberofStudents}
              xKey="shortName"
              subtitle={`Enrollment per region as of ${new Date().toLocaleDateString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}`}
            />
          </div>
          {/* Age Chart */}
          <div className="w-full lg:w-1/2">
            <GroupedBarChart
              title="Students by Age Group"
              data={ageData}
              keys={["Students"]}
              xKey="name"
              totalValue={totalNumberofStudents}
              subtitle={top3ProgramsCard?.interval}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdminReports;
