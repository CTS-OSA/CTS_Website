import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import GroupedBarChart from "../components/GroupedBarChart";
import SummaryCard from "../components/SummaryCard";
import { AuthContext } from "../context/AuthContext";
import { useApiRequest } from "../context/ApiRequestContext";
import Loader from "../components/Loader";
import DefaultLayout from "../components/DefaultLayout";
import { formatDate } from "../utils/helperFunctions.js";
import { MoveRight } from "lucide-react";

export const AdminDashboardNew = () => {
  const { user, role, loading } = useContext(AuthContext);
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const [barData, setBarData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [referralData, setReferralData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pardSubmissions, setPardSubmissions] = useState([]);
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
    if (slug === "psychosocial-assistance-and-referral-desk") {
      navigate(`/admin/psychosocial-assistance-and-referral-desk/${id}/`);
    } else if (slug === "counseling-referral-slip") {
      navigate(`/admin/counseling-referral-slip/${id}/`);
    } else {
      navigate(`/admin/student-forms/${student_number}/${slug}/`);
    }
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
    if (!role) return;
    if (role !== "admin") {
      setLoadingData(false);
    }

    const fetchReferrals = async () => {
      try {
        const res = await request(
          "/api/forms/admin/counseling-referral-slip-submissions/"
        );
        if (!res || !res.ok) throw new Error("Failed to fetch referrals");
        const data = await res.json();
        setReferralData(data);
      } catch (err) {
        console.error("Referral fetch failed:", err);
      }
    };

    const fetchPardForms = async () => {
      try {
        const res = await request(
          "/api/forms/admin/psychosocial-assistance-and-referral-desk"
        );
        if (!res || !res.ok) throw new Error("Failed to fetch PARD forms");
        const data = await res.json();
        data.sort(
          (a, b) => new Date(b.submitted_on) - new Date(a.submitted_on)
        );
        setPardSubmissions(data);
      } catch (err) {
        console.error("PARD fetch failed:", err);
      }
    };

    (async () => {
      try {
        const [barRes, summaryRes, recentRes] = await Promise.all([
          request("/api/dashboard/bar-data/"),
          request("/api/dashboard/summary/"),
          request("/api/dashboard/recent-submissions/"),
        ]);

        if (barRes.ok) {
          const json = await barRes.json();
          setBarData(json.barData || []);
          setTotalStudents(json.totalStudents || 0);
        }

        if (summaryRes.ok) {
          const json = await summaryRes.json();
          setSummaryData(json.summary || []);
        }

        if (recentRes.ok) {
          const json = await recentRes.json();
          setRecentSubmissions(json || []);
        }
        await Promise.all([fetchReferrals(), fetchPardForms()]);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoadingData(false);
      }
    })();
  }, [role, request]);

  if (loading || loadingData) return <Loader />;
  if (!user || role !== "admin") return <Navigate to="/" replace />;

  return (
    <DefaultLayout variant="admin">
      <div className="min-h-screen w-full px-4 sm:px-8 py-6 bg-gray-50">
        <div className="space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-6">
            {summaryData.map((item, index) => (
              <SummaryCard
                key={index}
                title={item.title}
                value={item.value}
                subtitle={item.subtitle}
                color={item.color}
              />
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-6 pt-4 pr-4 pl-4 pb-0">
            <div className="flex flex-col gap-6 w-full lg:w-1/2">
              {/* Referral Table */}
              <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Referral Forms</h2>
                  <button
                    onClick={() => navigate("/admin-referral-list")}
                    aria-label="Go to Referral list"
                    className="text-upmaroon hover:scale-110 transform transition-colors duration-200"
                  >
                    <MoveRight />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse ">
                    <thead className="bg-white-100 border-b border-t border-gray-300">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium">
                          Name of Student
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Date Referred
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Referred By
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralData.slice(0, 5).map((row) => (
                        <tr
                          key={row.submission_id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3">
                            {row.referred_person?.name || "-"}
                          </td>
                          <td className="py-2 px-3">
                            {formatDate(row.referral_date)}
                          </td>
                          <td className="py-2 px-3">
                            {row.referrer?.name || "-"}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/counseling-referral-slip/${row.submission_id}/`
                                )
                              }
                              className="text-upmaroon border border-upmaroon px-3 py-1 rounded-md hover:bg-upmaroon hover:text-white transition-colors duration-200"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* PARD Recent Submissions */}
              <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">PARD Forms</h2>
                  <button
                    onClick={() => navigate("/admin-pard-list")}
                    aria-label="Go to PARD list"
                    className="text-upmaroon hover:scale-110 transform transition-colors duration-200"
                  >
                    <MoveRight />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse ">
                    <thead className="bg-white-100 border-b border-t border-gray-300">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium">
                          Name of Student
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Date Submitted
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Status
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pardSubmissions.slice(0, 5).map((submission) => (
                        <tr
                          key={submission.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3">
                            {`${submission.student?.first_name || ""} ${
                              submission.student?.last_name || ""
                            }`.trim() || "-"}
                          </td>
                          <td className="py-2 px-3">
                            {formatDate(submission.submitted_on)}
                          </td>
                          <td className="py-2 px-3 capitalize">
                            {submission.pard_status || "N/A"}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/psychosocial-assistance-and-referral-desk/${submission.id}/`
                                )
                              }
                              className="text-upmaroon border border-upmaroon px-3 py-1 rounded-md hover:bg-upmaroon hover:text-white transition-colors duration-200"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Submissions Table */}
            <div className="bg-white p-6 rounded-lg shadow w-full lg:w-3/5 flex-1 flex flex-col">
              <h2 className="text-xl font-semibold mb-4 ">
                Recent Submissions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-white-100 border-b border-t border-gray-300">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">
                        Submitted by
                      </th>
                      <th className="text-left py-2 px-3 font-medium">Date</th>
                      <th className="text-left py-2 px-3 font-medium">Form</th>
                      <th className="text-left py-2 px-3 font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSortedRows.slice(0, 10).map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-2 px-3">{row.student_name}</td>
                        <td className="py-2 px-3">{row.submitted_on}</td>
                        <td className="py-2 px-3">{row.form_type}</td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => handleRowClick({ row })}
                            className="text-upmaroon border border-upmaroon px-3 py-1 rounded-md hover:bg-upmaroon hover:text-white transition-colors duration-200"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Bar Chart */}
          <div className="flex gap-6 p-3">
            <GroupedBarChart
              data={barData}
              keys={["Male", "Female"]}
              xKey="name"
              title="Students per Degree Program"
              totalValue={totalStudents}
              subtitle={`Enrollment per program as of ${new Date().toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}`}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};
