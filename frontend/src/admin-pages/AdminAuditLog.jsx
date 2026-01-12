import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import DefaultLayout from "../components/DefaultLayout";
import Loader from "../components/Loader";
import PaginationControls from "../components/PaginationControls";
import SortableTableHeader from "../components/SortableTableHeader";
import { formatDate } from "../utils/helperFunctions";
import { useApiRequest } from "../context/ApiRequestContext";

const renderDetails = (details) => {
  if (!details) return "No details provided.";

  if (details.startsWith("Student ID")) {
    const changedMatch = details.match(/Changed fields: ({.*})$/);
    const baseInfo = details.split("Changed fields:")[0];

    let changes = {};
    try {
      if (changedMatch) {
        let jsonLike = changedMatch[1]
          .replace(/datetime\.date\((\d+), (\d+), (\d+)\)/g, '"$1-$2-$3"')
          .replace(/'/g, '"'); 

        changes = JSON.parse(jsonLike);
      }
    } catch (err) {
      console.warn("Failed to parse changes:", err);
    }
    
    return (
      <span>
        {baseInfo}
        {Object.keys(changes).length > 0 && (
          <ul>
            {Object.entries(changes).map(([field, { old, new: newVal }]) => (
              <li key={field}>
                <strong>{field}:</strong> {old} → {newVal}
              </li>
            ))}
          </ul>
        )}
      </span>
    );
  }

  return details;
};

export const AdminAuditLog = () => {
  const { request } = useApiRequest();

  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [logTypeFilter, setLogTypeFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "timestamp",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await request(
          "/api/users/records/auditlog/"
        );
        if (!res.ok) throw new Error("Failed to fetch logs.");
        const data = await res.json();
        setLogs(data);
        setFiltered(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingData(false);
      }
    };
    fetchLogs();
  }, [request]);

  // Filtering
  useEffect(() => {
    let temp = logs;

    if (logTypeFilter) {
      temp = temp.filter((log) => log.log_type === logTypeFilter);
    }

    if (userFilter) {
      temp = temp.filter((log) => log.user?.toString() === userFilter);
    }

    setFiltered(temp);
    setCurrentPage(1);
  }, [logTypeFilter, userFilter, logs]);

  const sortedLogs = [...filtered].sort((a, b) => {

    if (sortConfig.key === "timestamp") {
      const aDate = new Date(a.timestamp);
      const bDate = new Date(b.timestamp);
      if (aDate < bDate) return sortConfig.direction === "asc" ? -1 : 1;
      if (aDate > bDate) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentSlice = sortedLogs.slice(startIdx, startIdx + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (loadingData) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <DefaultLayout variant="admin">
      <Box className="admin-student-list" sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          System Logs
        </Typography>

        {/* Filter controls */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            className="mui-style-select"
            value={logTypeFilter}
            onChange={(e) => setLogTypeFilter(e.target.value)}
          >
            <option value="">All Log Types</option>
            <option value="auth">Auth</option>
            <option value="profile">Profile</option>
            <option value="submission">Submission</option>
          </select>
        </Box>

        {/* Log Table */}
        <table>
          <thead>
            <tr>
              <SortableTableHeader
                label="Timestamp"
                sortKey="timestamp"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <th>Log Type</th>
              <th>Action</th>
              <th>User Email</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentSlice.length ? (
              currentSlice.map((log) => (
                <tr key={log.id}>
                  <td data-label="Timestamp">{formatDate(log.timestamp)}</td>
                  <td data-label="Log Type">
                    {log.log_type.charAt(0).toUpperCase() +
                      log.log_type.slice(1)}
                  </td>
                  <td data-label="Log Action">{log.action}</td>
                  <td data-label="User Email">{log.user_email ?? "N/A"}</td>
                  <td data-label="Log Details">{renderDetails(log.details)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationControls
            count={totalPages}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
          />
        )}
      </Box>
    </DefaultLayout>
  );
};
