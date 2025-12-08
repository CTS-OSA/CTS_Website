import React from "react";
import "../components/css/DashboardTable.css";
import Button from "./UIButton";
import { formatDate } from "../utils/helperFunctions";
import { Eye, Trash2 } from "lucide-react";

const TableSection = ({ title, headers, rows, onView, onDelete }) => {
  const validRows = Array.isArray(rows) ? rows : [];

  const getStatusBadgeClasses = (status) => {
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "submitted":
        return "bg-upgreen text-white";
      case "draft":
        return "bg-upyellow text-black";
    }
  };

  return (
    <div className="table-section w-full mb-10">
      <h2 className="text-xl font-semibold text-center mb-4">{title}</h2>
      {validRows.length === 0 ? (
        <p className="text-center text-gray-500 text-sm flex items-center justify-center h-24">
          No {title.toLowerCase()} yet.
        </p>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="dashboard-table w-full text-sm text-left text-gray-700 border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {headers.map((header, index) => {
                  let width = "30%";
                  if (index === 2) width = "20%";
                  return (
                    <th
                      key={index}
                      className="px-4 py-2 text-center"
                      style={{ width }}
                    >
                      {header}
                    </th>
                  );
                })}
                <th className="px-4 py-2 text-center" style={{ width: "20%" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {validRows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td
                    className="px-4 py-2 text-center break-words"
                    style={{ width: "30%" }}
                  >
                    {row.form_type}
                  </td>
                  <td
                    className="px-4 py-2 text-center break-words"
                    style={{ width: "30%" }}
                  >
                    <span>
                      {formatDate(row.date_submitted || row.saved_on)}
                    </span>
                  </td>
                  <td
                    className="px-4 py-2 text-center"
                    style={{ width: "20%" }}
                  >
                    <span
                      className={`status-badge ${getStatusBadgeClasses(
                        row.status
                      )} px-2 py-1 rounded-full`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td
                    className="px-4 py-2 text-center"
                    style={{ width: "20%" }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {onView && (
                        <>
                          {/* Mobile Icon */}
                          <button
                            onClick={() => onView(row)}
                            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-upgreen hover:bg-green-700 text-white transition-colors"
                            title="View"
                            aria-label="View"
                          >
                            <Eye size={16} />
                          </button>
                          {/* Text button for desktop */}
                          <div className="hidden md:block">
                            <Button variant="green" onClick={() => onView(row)}>
                              View
                            </Button>
                          </div>
                        </>
                      )}
                      {onDelete && (
                        <>
                          {/* Icon button for mobile */}
                          <button
                            onClick={() => onDelete(row)}
                            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                            title="Delete"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                          {/* Text button for desktop */}
                          <div className="hidden md:block">
                            <Button
                              variant="danger"
                              onClick={() => onDelete(row)}
                            >
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const DashboardTable = ({
  submittedForms,
  pendingActions,
  onView,
  onDelete,
}) => {
  const submittedHeaders = ["Form Type", "Date Submitted", "Status"];
  const pendingHeaders = ["Form Type", "Last Date Updated", "Status"];

  return (
    <div className="relative w-full min-h-screen bg-[#F2F2F2] flex flex-col items-center animate-fadeIn duration-500 ease-in-out">
      {/* Header */}
      <div className="bg-upmaroon w-full h-32 md:h-42 flex items-center justify-center text-center">
        <h1 className="text-[1.5rem] md:text-[2.5rem] font-bold text-white tracking-wide mb-15">
          STUDENT DASHBOARD
        </h1>
      </div>

      {/* Main Content */}
      <div className="bg-white -mt-16 mb-10 w-[95%] md:w-[90%] rounded-3xl p-6 md:p-10 shadow-md flex flex-col items-center">
        <TableSection
          title="SUBMITTED FORMS"
          headers={submittedHeaders}
          rows={submittedForms}
          onView={onView}
        />
        <hr className="h-[1.5px] bg-gray-300 border-none rounded my-4 w-full" />
        <TableSection
          title="PENDING ACTIONS"
          headers={pendingHeaders}
          rows={pendingActions}
          onView={onView}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default DashboardTable;
