import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiRequest } from "../context/ApiRequestContext";
import { useAuth } from "../context/AuthContext";
import DefaultLayout from "../components/DefaultLayout";
import Button from "../components/UIButton";
import StudentFilterBar1 from "../components/StudentFilterBar1";
import SortableTableHeader from "../components/SortableTableHeader";
import PaginationButtons from "../components/PaginationControls";
import Loader from "../components/Loader";
import "./css/studentList.css";
import { Typography } from "@mui/material";

export const AdminStudentList = () => {
  const navigate = useNavigate();
  const { request } = useApiRequest();
  const { role, loading } = useAuth();

  // raw + filtered students
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // filtering state
  const [filterText, setFilterText] = useState("");
  const [years, setYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [email, setEmail] = useState([]);

  // sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // loading / error
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // 1) FILTER
  useEffect(() => {
    const searchText = filterText.toLowerCase();
    const temp = students.filter((stu) => {
      const fullName = `${stu.first_name} ${stu.last_name}`.toLowerCase();
      const studentId = stu.student_number.toLowerCase();
      const email = stu.email.toLowerCase();

      if (
          filterText &&
          !(fullName.includes(searchText) || studentId.includes(searchText) || email.includes(searchText))
        )
        return false;
      if (years.length > 0 && !years.includes(stu.current_year_level))
        return false;
      if (programs.length > 0 && !programs.includes(stu.degree_program))
        return false;

      return true;
    });
    setFiltered(temp);
    setCurrentPage(1);
  }, [filterText, years, programs, students, email]);

  const handleResetFilters = () => {
    setFilterText("");
    setYears([]);
    setPrograms([]);
    setEmail([]);
  };

  // dropdown options
  const yearOptions = Array.from(new Set(students.map((s) => s.current_year_level)));
  const programOptions = Array.from(new Set(students.map((s) => s.degree_program)));

  // 2) SORT
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
      case "id":
        aVal = a.student_number.toLowerCase();
        bVal = b.student_number.toLowerCase();
        break;
      case "name":
        aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
        bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
        break;
      case "yearProgram":
        aVal = `${a.current_year_level}-${a.degree_program}`.toLowerCase();
        bVal = `${b.current_year_level}-${b.degree_program}`.toLowerCase();
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // 3) PAGINATION
  const itemsPerPage = 10;
  const handlePageChange = (_, value) => setCurrentPage(value);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = sorted.slice(startIdx, startIdx + itemsPerPage);

  // 4) FETCH
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await request("/api/forms/admin/students/");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        data.sort((a, b) => a.last_name.localeCompare(b.last_name));
        setStudents(data);
        setFiltered(data);
      } catch {
        setError("Error fetching student data. Please try again.");
      } finally {
        setLoadingData(false);
      }
    };
    if (!loading && role === "admin") fetchStudents();
  }, [loading, role, request]);

  // guards
  if (loading || loadingData) return <Loader />;
  if (role !== "admin") return <div>Access denied. Admins only.</div>;
  if (error) return <div>{error}</div>;

  // render
  const handleViewStudent = (stu) =>
    navigate(`/admin/students/${stu.student_number}`);

  return (
    <DefaultLayout variant="admin">
      <div className="admin-student-list" style={{ padding: 50 }}>
        <Typography variant="h4" gutterBottom>
          Student List
        </Typography>

        {/* Filter Bar */}
        <StudentFilterBar1
          filterText={filterText}
          setFilterText={setFilterText}
          years={years}
          setYears={setYears}
          yearOptions={yearOptions}
          programs={programs}
          setPrograms={setPrograms}
          programOptions={programOptions}
          onReset={handleResetFilters}
          setEmail={setEmail}
        />

        {/* Table */}
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
                label="Year – Degree Program"
                sortKey="yearProgram"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
              />
              <th>UP Mail</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((stu) => (
                <tr key={stu.student_number}>
                  <td data-label="Student ID">{stu.student_number}</td>
                  <td data-label="Student Name">
                    {stu.first_name} {stu.last_name}
                  </td>
                  <td data-label="Year – Degree Program">
                    {stu.current_year_level} – {stu.degree_program}
                  </td>
                  <td data-label="UP Mail">{stu.email}</td>
                  <td data-label="Actions">
                    <Button
                      variant="secondary"
                      onClick={() => handleViewStudent(stu)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No students match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationButtons
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
          />
        )}
      </div>
    </DefaultLayout>
  );
};
