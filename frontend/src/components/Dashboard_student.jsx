import React, { useEffect, useState, useContext } from "react";
import {} from "react-router-dom";
import SideNav_student from "./SideNav_student"; // Ensure this path and component are correct
import DashboardTable from "./DashboardTable"; // Import the DashboardTable component
import Loader from "../components/Loader"; // Assuming you have a Loader component for loading states
import { AuthContext } from "../context/AuthContext"; // Assuming AuthContext provides user data
import { apiRequest } from "../utils/apiUtils"; // Importing apiRequest for API calls
import "./css/Dashboard_student.css";

const Dashboard = () => {
  const [submittedForms, setSubmittedForms] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const { user, loading } = useContext(AuthContext); // Access the user from AuthContext
  const navigate = useNavigate(); // For navigation purposes

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchForms = async () => {
      try {
        const response = await apiRequest(
          "http://localhost:8000/api/submissions/"
        );

        if (response.ok) {
          const data = await response.json();

          const submitted = data.filter((form) => form.status === "submitted");
          const pending = data.filter((form) => form.status === "draft");

          setSubmittedForms(submitted);
          setPendingActions(pending);
        } else {
        }
      } catch (error) {}
    };

    fetchForms();
  }, [user]);

  const handleView = (form) => {
    navigate(`/forms/${form.id}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="dashboard-container">
      {/* <SideNav_student user={user} />  */}
      <div className="dashboard-content">
        <h1>Welcome, {user.name}</h1>

        <DashboardTable
          submittedForms={submittedForms}
          pendingActions={pendingActions}
          onView={handleView}
        />
      </div>
    </div>
  );
};

export default Dashboard;
