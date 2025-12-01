import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import Button from "../components/UIButton";
import DefaultLayout from "../components/DefaultLayout";
import "./css/studentList.css";
import { formatDate } from "../utils/helperFunctions";
import { Box, Typography } from "@mui/material";
import StudentFilterBar from "../components/StudentFilterBar";
import PaginationButtons from "../components/PaginationControls";
import SortableTableHeader from "../components/SortableTableHeader";
import Loader from "../components/Loader";
import ConfirmDialog from "../components/ConfirmDialog";

const STATUS_ORDER = ["read", "unread", "deleted", "completed", "pending"];

export const AdminPARDList = () => {
  const navigate = useNavigate();
  const { role, loading } = useAuth();
  const { request } = useApiRequest();

  // raw and filtered submissions
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loadingData, setLoadingData] = useState(true);

  // Filter state
  const [filterText, setFilterText] = useState("");
  const [years, setYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch PARD submissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await request(
          "/api/forms/admin/psychosocial-assistance-and-referral-desk"
        );

        if (!res.ok) throw new Error("Failed to fetch PARD submissions");

        const data = await res.json();
        data.sort(
          (a, b) => new Date(b.submitted_on) - new Date(a.submitted_on)
        );

        setSubmissions(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    if (!loading && role === "admin") fetchData();
  }, [loading, role, request]);

  // Apply filters: Search for full name, student id
  useEffect(() => {
    let temp = submissions.filter(({ student, submitted_on, pard_status }) => {
      const fullName =
        `${student.first_name} ${student.last_name}`.toLowerCase();
      const studentId = student.student_number.toLowerCase();
      const searchText = filterText.toLowerCase();
      const normalizedStatus = (pard_status || "").toLowerCase();

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
      if (statusFilter && normalizedStatus !== statusFilter) return false;
      return true;
    });
    setFiltered(temp);
    setCurrentPage(1);
  }, [filterText, years, programs, selectedDate, statusFilter, submissions]);

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

  const getStatusRank = (status) => {
    const normalized = (status || "").toLowerCase();
    const idx = STATUS_ORDER.indexOf(normalized);
    return idx === -1 ? STATUS_ORDER.length : idx;
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
      case "status":
        aVal = getStatusRank(a.pard_status);
        bVal = getStatusRank(b.pard_status);
        if (aVal === bVal) {
          const aStatus = (a.pard_status || "").toLowerCase();
          const bStatus = (b.pard_status || "").toLowerCase();
          if (aStatus < bStatus) return sortConfig.direction === "asc" ? -1 : 1;
          if (aStatus > bStatus) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
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

  if (loading || loadingData) return <Loader />;
  if (role !== "admin") return <div>Access denied. Admins only.</div>;

  const handleViewStudent = (submission_id) => {
    navigate(
      `/admin/psychosocial-assistance-and-referral-desk/${submission_id}`
    );
  };

  const deleteSubmission = async (submission_id) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await request(
        `/api/forms/admin/psychosocial-assistance-and-referral-desk/edit/${submission_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "deleted" }),
        }
      );

      if (!res || !res.ok) {
        throw new Error("Failed to delete submission");
      }

      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === submission_id
            ? { ...submission, pard_status: "deleted" }
            : submission
        )
      );
      setFiltered((prev) =>
        prev.map((submission) =>
          submission.id === submission_id
            ? { ...submission, pard_status: "deleted" }
            : submission
        )
      );
    } catch (error) {
      console.error("Error deleting submission:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSubmission = (submission) => {
    setDeleteTarget(submission);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteSubmission(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const statusMenuItems = [
    ...STATUS_ORDER.map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      onClick: () => setStatusFilter((prev) => (prev === status ? "" : status)),
    })),
    {
      label: "Clear Filter",
      onClick: () => {
        setStatusFilter("");
        if (sortConfig.key === "status") {
          handleClearSort("status");
        }
      },
      disabled: sortConfig.key !== "status" && !statusFilter,
    },
  ];

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

        <table className="pard-table">
          <colgroup>
            <col className="col-student-id" />
            <col className="col-student-name" />
            <col className="col-year-program" />
            <col className="col-date" />
            <col className="col-status" />
            <col className="col-actions" />
          </colgroup>
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
                label="Year & Degree Program"
                sortKey="yearProgram"
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
                label="Status"
                sortKey="status"
                currentSort={sortConfig}
                onSort={handleSort}
                onClearSort={handleClearSort}
                align="center"
                className="status-header"
                menuItems={statusMenuItems}
              />
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.student.student_number}</td>

                  <td>
                    {submission.student.first_name}{" "}
                    {submission.student.last_name}
                  </td>

                  <td>
                    {submission.student.current_year_level} &{" "}
                    {submission.student.degree_program}
                  </td>

                  <td>{formatDate(submission.submitted_on)}</td>

                  <td className="status-column uppercase">
                    <p
                      className={` text-center rounded-lg mr-15 px-4 py-1
                      ${
                        submission.pard_status === "completed"
                          ? "bg-upgreen text-white"
                          : submission.pard_status === "unread"
                          ? "bg-blue-800 text-white"
                          : submission.pard_status === "read"
                          ? "bg-orange-400"
                          : submission.pard_status === "pending"
                          ? "bg-upyellow"
                          : submission.pard_status === "deleted"
                          ? "bg-gray-500 text-white"
                          : ""
                      } `}
                    >
                      {submission.pard_status || "N/A"}
                    </p>
                  </td>
                  <td className="actions-column flex gap-2 justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => handleViewStudent(submission.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDeleteSubmission(submission)}
                    >
                      Delete
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

        {deleteTarget && (
          <ConfirmDialog
            title="Delete submission"
            message={`Mark ${deleteTarget.student.first_name} ${deleteTarget.student.last_name}'s submission as deleted?`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmLabel={isDeleting ? "Deleting..." : "Delete"}
          />
        )}

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
