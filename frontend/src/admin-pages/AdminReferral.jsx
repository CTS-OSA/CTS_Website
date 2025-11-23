import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiRequest } from "../context/ApiRequestContext";
import { useAuth } from "../context/AuthContext";
import DefaultLayout from "../components/DefaultLayout";
import Button from "../components/UIButton";
import { Box, Typography } from "@mui/material";
import StudentFilterBar from "../components/StudentFilterBar";
import PaginationControls from "../components/PaginationControls";
import SortableTableHeader from "../components/SortableTableHeader";
import Loader from "../components/Loader";
import { formatDate } from "../utils/helperFunctions";
import "./css/studentList.css";

export const AdminReferral = () => {
  const navigate = useNavigate();
  const { request } = useApiRequest();
  const { role, loading } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Filter state
  const [filterText, setFilterText] = useState("");
  const [years, setYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Apply filters
  useEffect(() => {
    const temp = submissions.filter(({ referred_person, referral_date }) => {
      const searchText = filterText.toLowerCase();

      if (filterText) {
        const fullName = `${referred_person?.name || ""}`.toLowerCase();
        if (!fullName.includes(searchText) && !(referred_person?.id || "").toString().includes(searchText)) {
          return false;
        }
      }

      if (years.length > 0 && !years.includes(referred_person?.year_level)) return false;
      if (programs.length > 0 && !programs.includes(referred_person?.degree_program)) return false;

      if (selectedDate) {
        const dateStr = new Date(referral_date).toISOString().split("T")[0];
        if (dateStr !== selectedDate) return false;
      }

      return true;
    });

    setFiltered(temp);
    setCurrentPage(1);
  }, [filterText, years, programs, selectedDate, submissions]);

  const handleResetFilters = () => {
    setFilterText("");
    setYears([]);
    setPrograms([]);
    setSelectedDate("");
  };

  const yearOptions = Array.from(
    new Set(submissions.map((s) => s.referred_person?.year_level).filter(Boolean))
  );
  const programOptions = Array.from(
    new Set(submissions.map((s) => s.referred_person?.degree_program).filter(Boolean))
  );

  const handleSort = (key, direction = null) => {
    setSortConfig((prev) => {
      if (direction) return { key, direction };
      if (prev.key === key) return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      return { key, direction: "asc" };
    });
  };

  const handleClearSort = (key) => {
    if (sortConfig.key === key) setSortConfig({ key: null, direction: "asc" });
  };

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal, bVal;

    switch (sortConfig.key) {
      case "name":
        aVal = `${a.referred_person?.first_name || ""} ${a.referred_person?.last_name || ""}`.toLowerCase();
        bVal = `${b.referred_person?.first_name || ""} ${b.referred_person?.last_name || ""}`.toLowerCase();
        break;
      case "date":
        aVal = new Date(a.referral_date);
        bVal = new Date(b.referral_date);
        break;
      case "yearProgram":
        aVal = a.referred_person
          ? `${a.referred_person.year_level}-${a.referred_person.degree_program}`.toLowerCase()
          : "";
        bVal = b.referred_person
          ? `${b.referred_person.year_level}-${b.referred_person.degree_program}`.toLowerCase()
          : "";
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sorted.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (_, value) => setCurrentPage(value);

  // Fetch referrals
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await request("/api/forms/admin/counseling-referral-slip-submissions/");
        if (!res.ok) throw new Error("Failed to fetch referral submissions");
        const data = await res.json();
        data.sort((a, b) => new Date(b.referral_date) - new Date(a.referral_date));
        setSubmissions(data);
        setFiltered(data);
      } catch (err) {
        setError("Error fetching data. Please try again.");
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading && role === "admin") fetchData();
  }, [loading, role, request]);

  if (loading || loadingData) return <Loader />;
  if (role !== "admin") return <div>Access denied. Admins only.</div>;
  if (error) return <div>{error}</div>;

  const handleViewReferral = (referralId) => navigate(`/admin/counseling-referral-slip/${referralId}/`);

  return (
    <DefaultLayout variant="admin">
      <Box className="admin-student-list" sx={{ p: 3 }} style={{ padding: 50 }}>
        <Typography variant="h4" gutterBottom>
          Referral Form Submissions
        </Typography>

        <StudentFilterBar
          filterText={filterText}
          setFilterText={setFilterText}
          years={years}
          setYears={setYears}
          yearOptions={yearOptions}
          programs={programs}
          setPrograms={setPrograms}
          programOptions={programOptions}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onReset={handleResetFilters}
        />

        <table>
          <thead>
            <tr>
              <SortableTableHeader
                label="Name"
                sortKey="name"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <SortableTableHeader
                label="Referral Date"
                sortKey="date"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <SortableTableHeader
                label="Year – Degree Program"
                sortKey="yearProgram"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <SortableTableHeader
                label="Referred By"
                sortKey="name"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <SortableTableHeader
                label="Status"
                sortKey="name"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(({ id, referral_date, referral_status, referred_person, referrer }) => (
                <tr key={id}>
                  <td>{`${referred_person?.name || ""}`}</td>
                  <td>{formatDate(referral_date)}</td>
                  <td>{referred_person ? `${referred_person.year_level} – ${referred_person.degree_program}` : "-"}</td>
                  <td>{referrer?.name || "-"}</td>
                  <td>{referral_status}</td>
                  <td>
                    <Button variant="secondary" onClick={() => handleViewReferral(id)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No submissions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <PaginationControls count={totalPages} page={currentPage} onChange={handlePageChange} />
        )}
      </Box>
    </DefaultLayout>
  );
};
