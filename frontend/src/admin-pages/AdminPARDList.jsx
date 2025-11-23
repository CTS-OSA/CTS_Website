import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/UIButton";
import DefaultLayout from "../components/DefaultLayout";
import "./css/studentList.css";
import { formatDate } from "../utils/helperFunctions";
import { Box, Typography } from "@mui/material";
import StudentFilterBar from "../components/StudentFilterBar";
import PaginationButtons from "../components/PaginationControls";
import SortableTableHeader from "../components/SortableTableHeader";
import Loader from "../components/Loader";

const DUMMY_PARD_SUBMISSIONS = [
  {
    id: 301,
    form_type: "Psychosocial Assistance and Referral Desk",
    status: "submitted",
    saved_on: "2025-11-20T08:10:00Z",
    submitted_on: "2025-11-20T08:15:00Z",
    student: {
      student_number: "2023-14283",
      first_name: "Roslyn",
      last_name: "Guillermo",
      current_year_level: "3rd Year",
      degree_program: "BS Computer Science",
    },
    pard_data: {
      preferred_date: "2025-11-25",
      preferred_time: "09:00:00",
      date_started: "2025-10-01",
      is_currently_on_medication: false,
      symptoms_observed:
        "Difficulty focusing, heightened anxiety during exams.",
      date_diagnosed: "2024-08-15",
      communication_platform: "Google Meet",
      diagnosed_by: "Dr. Felicia Ramos",
      status: "pending",
    },
  },
  {
    id: 302,
    form_type: "Psychosocial Assistance and Referral Desk",
    status: "submitted",
    saved_on: "2025-11-21T04:45:00Z",
    submitted_on: "2025-11-21T04:55:00Z",
    student: {
      student_number: "2019-55678",
      first_name: "John Paul",
      last_name: "Garcia",
      current_year_level: "4th Year",
      degree_program: "BS Data Science",
    },
    pard_data: {
      preferred_date: "2025-11-28",
      preferred_time: "13:30:00",
      date_started: "2025-09-20",
      is_currently_on_medication: true,
      symptoms_observed: "Recurring panic attacks, trouble sleeping.",
      date_diagnosed: "2023-06-05",
      communication_platform: "Zoom",
      diagnosed_by: "Dr. Lim, Dr. Natividad",
      status: "read",
    },
  },
  {
    id: 303,
    form_type: "Psychosocial Assistance and Referral Desk",
    status: "submitted",
    saved_on: "2025-11-22T01:30:00Z",
    submitted_on: "2025-11-22T02:05:00Z",
    student: {
      student_number: "2021-77889",
      first_name: "Aisha",
      last_name: "Del Rosario",
      current_year_level: "2nd Year",
      degree_program: "BA Communication and Media Arts",
    },
    pard_data: {
      preferred_date: "2025-12-01",
      preferred_time: "10:15:00",
      date_started: "2025-07-18",
      is_currently_on_medication: false,
      symptoms_observed: "Mood swings, withdrawal from peers.",
      date_diagnosed: "2022-11-30",
      communication_platform: "Microsoft Teams",
      diagnosed_by: "Dr. Irene Tan",
      status: "unread",
    },
  },
];

export const AdminPARDList = () => {
  const navigate = useNavigate();
  const { role, loading } = useAuth();

  // raw and filtered submissions
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loadingData, setLoadingData] = useState(true);

  // Filter state
  const [filterText, setFilterText] = useState("");
  const [years, setYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Apply filters
  useEffect(() => {
    let temp = submissions.filter(({ student, submitted_on }) => {
      const fullName =
        `${student.first_name} ${student.last_name}`.toLowerCase();
      const studentId = student.student_number.toLowerCase();
      const searchText = filterText.toLowerCase();
      if (
        filterText &&
        !(fullName.includes(searchText) || studentId.includes(searchText))
      )
        return false;
      if (years.length > 0 && !years.includes(student.current_year_level))
        return false;
      if (programs.length > 0 && !programs.includes(student.degree_program))
        return false;
      if (selectedDate) {
        const submissionDate = new Date(submitted_on)
          .toISOString()
          .split("T")[0];
        if (submissionDate !== selectedDate) return false;
      }
      return true;
    });
    setFiltered(temp);
    setCurrentPage(1);
  }, [filterText, years, programs, selectedDate, submissions]);

  // Reset filters
  const handleResetFilters = () => {
    setFilterText("");
    setYears([]);
    setPrograms([]);
    setSelectedDate("");
  };

  // filter dropdown options
  const yearOptions = Array.from(
    new Set(submissions.map((s) => s.student.current_year_level))
  );
  const programOptions = Array.from(
    new Set(submissions.map((s) => s.student.degree_program))
  );

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const handleSort = (key, direction = null) => {
    setSortConfig((prev) => {
      if (direction) {
        return { key, direction };
      }
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleClearSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key: null, direction: "asc" });
    }
  };

  // Sort filtered items
  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal, bVal;
    switch (sortConfig.key) {
      case "name":
        aVal = `${a.student.first_name} ${a.student.last_name}`.toLowerCase();
        bVal = `${b.student.first_name} ${b.student.last_name}`.toLowerCase();
        break;
      case "date":
        aVal = new Date(a.submitted_on);
        bVal = new Date(b.submitted_on);
        break;
      case "yearProgram":
        aVal =
          `${a.student.current_year_level}-${a.student.degree_program}`.toLowerCase();
        bVal =
          `${b.student.current_year_level}-${b.student.degree_program}`.toLowerCase();
        break;
      case "id":
        aVal = a.student.student_number.toLowerCase();
        bVal = b.student.student_number.toLowerCase();
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const handlePageChange = (_, value) => setCurrentPage(value);

  // Calculate pagination values
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sorted.slice(indexOfFirstItem, indexOfLastItem);

  // Fetch placeholder PARD submissions (dummy data for now)
  useEffect(() => {
    if (!loading && role === "admin") {
      const sortedData = [...DUMMY_PARD_SUBMISSIONS].sort(
        (a, b) => new Date(b.submitted_on) - new Date(a.submitted_on)
      );
      setSubmissions(sortedData);
      setFiltered(sortedData);
      setLoadingData(false);
    }
  }, [loading, role]);

  if (loading || loadingData) return <Loader />;
  if (role !== "admin") return <div>Access denied. Admins only.</div>;

  const handleViewStudent = (student) => {
    navigate(
      `/admin/student-forms/${student.student_number}/psychosocial-assistance-and-referral-desk`
    );
  };

  return (
    <DefaultLayout variant="admin">
      <Box className="admin-student-list" sx={{ p: 3 }} style={{ padding: 50 }}>
        <Typography variant="h4" gutterBottom>
          Psychosocial Assistance and Referral Desk Submissions
        </Typography>

        {/* Filters Bar */}
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
                label="Student ID"
                sortKey="id"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <SortableTableHeader
                label="Student Name"
                sortKey="name"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <SortableTableHeader
                label="Date Submitted"
                sortKey="date"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <SortableTableHeader
                label="Year & Degree Program"
                sortKey="yearProgram"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(({ student, submitted_on }) => (
                <tr key={student.student_number}>
                  <td>{student.student_number}</td>
                  <td>
                    {student.first_name} {student.last_name}
                  </td>
                  <td>{formatDate(submitted_on)}</td>
                  <td>
                    {student.current_year_level} & {student.degree_program}
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      onClick={() => handleViewStudent(student)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No submissions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <PaginationButtons
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
          />
        )}
      </Box>
    </DefaultLayout>
  );
};
