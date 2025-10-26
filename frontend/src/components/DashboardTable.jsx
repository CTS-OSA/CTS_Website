import React from "react";
import "../components/css/DashboardTable.css";
import Button from "./UIButton";
import { formatDate } from "../utils/helperFunctions";

const TableSection = ({ title, headers, rows, onView, onDelete }) => {
  const validRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="table-section">
      <h2>{title}</h2>
      {validRows.length === 0 ? (
        <p className="text-center text-sm h-30 flex items-center justify-center">No {title.toLowerCase()} yet.</p>
      ) : (
        <table className="dashboard-table ml-10">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {validRows.map((row) => (
              <tr key={row.id}>
                <td>{row.form_type}</td>
                <td><span>{formatDate(row.date_submitted || row.saved_on)}</span></td>
                <td>
                  <span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span>
                </td>
                <td>
                  {onView && (
                    <Button variant="primary" onClick={() => onView(row)}>View</Button>
                  )}
                  {onDelete && (
                    <Button variant="danger" onClick={() => onDelete(row)} style={{ marginLeft: '8px' }}>
                      Delete
                  </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};


const DashboardTable = ({ submittedForms, pendingActions, onView, onDelete }) => {
  const submittedHeaders = ["Form Type", "Date Submitted", "Status"];
  const pendingHeaders = ["Form Type", "Last Date Updated", "Status"];

  return (
    <div className="relative max-w-full overflow-x-auto h-full bg-[#F2F2F2] flex flex-col items-start animate-fadeIn duration-500 ease-in-out">
      <div className="bg-upmaroon w-full h-40 ">
        <h1 className="text-[2rem] font-bold mb-[30px] text-white ml-10 mt-20">Dashboard</h1>
      </div>
      <div className="bg-white -mt-5 mb-10 mx-auto w-[94%] rounded-xl p-5 min-h-screen">
        <TableSection
          title="SUBMITTED FORMS"
          headers={submittedHeaders}
          rows={submittedForms}
          onView={onView}
        />
        <hr className="h-[1.5px] bg-gray-300 border-none rounded mx-auto my-4" />
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
