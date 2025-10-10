import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, Typography, Divider, Grid } from "@mui/material";
import DefaultLayout from "../components/DefaultLayout";
import StatCard from "../components/StatCard";
import GroupedBarChart from "../components/GroupedBarChart";
import GridTable from "../components/GridTable";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import Loader from "../components/Loader";
import { formatDate } from "../utils/helperFunctions";

export const AdminDashboard = () => {
  const { user, role, loading } = useContext(AuthContext);
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const [barData, setBarData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedFilters, setSelectedFilters] = useState({
    degree_program: [],
    year_level: [],
    form_type: [],
  });

  const handleRowClick = (params) => {
    const { id, form_type, student_number } = params.row;

    const slug = form_type.toLowerCase().replace(/\s+/g, "-");
    navigate(`/admin/student-forms/${student_number}/${slug}/`);
  };

  const filteredSortedRows = recentSubmissions
    .filter((row) => {
      const matchesText = Object.values(row).some((val) =>
        String(val).toLowerCase().includes(filterText.toLowerCase())
      );

      const matchesFilters = Object.entries(selectedFilters).every(
        ([key, values]) => {
          if (values.length === 0) return true;
          return values
            .map((v) => String(v).toLowerCase())
            .includes(String(row[key]).toLowerCase());
        }
      );

      return matchesText && matchesFilters;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDirection === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });

  useEffect(() => {
    if (!role) return; // don't run until role is ready
    if (role !== "admin") {
      setLoadingData(false);
    }

    (async () => {
      try {
        const [barRes, summaryRes, recentRes] = await Promise.all([
          request("/api/dashboard/bar-data/"),
          request("/api/dashboard/summary/"),
          request("/api/dashboard/recent-submissions/"),
        ]);

        // Process bar chart data
        if (barRes.ok) {
          const json = await barRes.json();
          setBarData(json.barData || []);
          setTotalStudents(json.totalStudents || 0);
        } else {
        }

        // Process summary data
        if (summaryRes.ok) {
          const json = await summaryRes.json();
          setSummaryData(json.summary || []);
        } else {
        }

        // Process recent submissions
        if (recentRes.ok) {
          const json = await recentRes.json();
          setRecentSubmissions(json || []);
        } else {
        }
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoadingData(false);
      }
    })();
  }, [role, request]);

  if (loading || loadingData) return <Loader />;
  if (!user || role !== "admin") return <Navigate to="/" replace />;

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "student_name", headerName: "Submitted By", flex: 1 },
    { field: "student_number", headerName: "Student Number", flex: 1 },
    { field: "submitted_on", headerName: "Date", flex: 1 },
     {
      field: "form_type",
      headerName: "Form Type",
      flex: 1,
      renderCell: (params) => {
        const formSlug = params.value.toLowerCase().replace(/\s+/g, "-");
        const studentNum = params.row.student_number;
        return (
          <span
            onClick={() =>
              navigate(`/admin/student-forms/${studentNum}/${formSlug}/`)
            }
            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
          >
            {params.value}
          </span>
        );
      },
    },
  ];

  return (
    <DefaultLayout variant="admin">
      <Box sx={{ p: { xs: 2, sm: 4 }, width: "100%", minHeight: "100vh" }}>
        <Stack spacing={4}>
          <Typography variant="h5" fontWeight="bold">
            Welcome, {user.email}
          </Typography>
          {error && <Typography color="error">{error}</Typography>}

          {/* Summary Cards */}
          <Grid
            container
            sx={{
              display: 'grid',
              gap: '40px 30px',
              justifyContent: 'center',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            }}
          >
            {summaryData.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'center' }}>
                <StatCard {...item} />
              </Box>
            ))}
          </Grid>

          {/* Bar Chart */}
          <GroupedBarChart
            data={barData}
            keys={["Female", "Male"]}
            xKey="name"
            title="Students per Degree Program"
            totalValue={totalStudents}
            subtitle="Enrollment per program as of May 2025"
          />

          {/* Recent Submissions Table */}
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Submissions
            </Typography>
            <Divider sx={{ my: 2 }} />
            <GridTable
              rows={filteredSortedRows.slice(0, 10)}
              columns={columns}
              pageSize={10}
              pagination={false}
              hidePaginationControls={true}
              showAllRows={true}
              onRowClick={handleRowClick}
            />
          </Box>
        </Stack>
      </Box>
    </DefaultLayout>
  );
};
