import { BrowserRouter, Router, Routes, Route, Link } from "react-router-dom";
import {
  HomePage,
  SignUp,
  VerifiedPage,
  FormPublicPage,
  FAQPublicPage,
  ChangePassword,
  Help,
} from "./pages";
import {
  AdminDashboardNew,
  AdminReferral,
  AdminStudentList,
  AdminSystemSettings, // Note: You'll need to update this to AdminSystemSetting if that's the correct file name based on your index.js, but I'll keep the current usage for now.
  AdminReports,
  AdminSCIFList,
  AdminSCIFView, // Note: This isn't in your index.js, but assuming it exists as a named export from a separate file.
  AdminBISList,
  AdminBISView,
  AdminAuditLog,
  AdminProfile,
  AdminReferralView,
  AdminPardView,
  AdminPARDList,
  SiteContentDashboard, // <--- NOW IMPORTED HERE
  AdminReferralAcknowledgement, // <--- NOW IMPORTED HERE
} from "./admin-pages";
import {
  UserDashboard,
  UserPrivacySetting,
  UserSubmittedForms,
  UserProfile,
} from "./student-pages";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Unauthorized from "./pages/Unauthorized";
import { MoreVertical } from "react-feather";
import { ResetPassword } from "./pages/ResetPassword";
import { ForgotPassword } from "./pages/ForgotPassword";
import LoginPage from "./pages/LoginPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MultiStepForm from "./forms/SetupProfile/SetupProfile";
import AdminSetupProfile from "./forms/AdminSetupProfile/AdminSetupProfile";
import BISForm from "./forms/BIS/BIS";
import SCIF from "./forms/SCIF/SCIF";
import ReferralSlip from "./forms/ReferralSlip/ReferralSlip";
import GuestReferralSlip from "./forms/ReferralSlip/GuestReferralSlip";
import PARD from "./forms/PARD/PARD";
import { AdminStudentView } from "./admin-pages/AdminStudentView";
import BISProfilePage from "./student-pages/BISProfilePage";
import SCIFProfilePage from "./student-pages/SCIFProfilePage";
import PARDProfilePage from "./student-pages/PARDProfilePage";
import ReferralSlipProfilePage from "./student-pages/ReferralSlipProfilePage";
import VerifyReferralPage from "./forms/ReferralSlip/VerifyGuestReferral";
// Removed: import AdminReferralAcknowledgement from "./admin-pages/AdminReferralAcknowledgement"; // Now imported from the barrel file
import NotFound from "./pages/NotFound";


function App() {
  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        {/* HomePage restricted for logged-in users */}
        <Route path="/" element={<HomePage />} />


        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />


        {/* Signup should only be accessible if NOT logged in */}
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignUp />
            </PublicOnlyRoute>
          }
        />


        <Route path="/verify/:uid/:token" element={<VerifiedPage />} />


        {/* User dashboard, block access for admins */}
        <Route
          path="/help"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={false}>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myprofile"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup-profile"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <MultiStepForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms/basic-information-sheet"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <BISForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submitted-forms/basic-information-sheet/:submission_id"
          element={
            <ProtectedRoute requireAdmin={false}>
              <BISProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms/student-cumulative-information-file"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <SCIF />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submitted-forms/student-cumulative-information-file/:submission_id"
          element={
            <ProtectedRoute requireAdmin={false}>
              <SCIFProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submitted-forms/psychosocial-assistance-and-referral-desk/:submission_id"
          element={
            <ProtectedRoute requireAdmin={false}>
              <PARDProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submitted-forms/counseling-referral-slip/:submission_id"
          element={
            <ProtectedRoute requireAdmin={false}>
              <ReferralSlipProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submitted-forms"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <UserSubmittedForms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy-setting"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <UserPrivacySetting />
            </ProtectedRoute>
          }
        />


        <Route
          path="/user-privacy-setting"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <UserPrivacySetting />
            </ProtectedRoute>
          }
        />


        {/* Admin dashboard only accessible by superusers */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminDashboardNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-student-list"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminStudentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:studentId"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminStudentView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student-forms/:studentId/student-cumulative-information-file"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminSCIFView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/counseling-referral-slip/:submission_id"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminReferralView />
            </ProtectedRoute>
          }
        />
        {/* NEW ROUTE: Admin Referral Acknowledgement */}
        <Route
          path="/admin/referral-acknowledgement/:submission_id"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminReferralAcknowledgement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-bis-list"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminBISList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student-forms/:studentId/basic-information-sheet"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminBISView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/psychosocial-assistance-and-referral-desk/:submission_id"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminPardView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-scif-list"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminSCIFList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-referral-list"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminReferral />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-pard-list"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminPARDList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-audit-log"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminAuditLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-reports"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-system-settings"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminSystemSettings />
            </ProtectedRoute>
          }
        />
        {/* NEW ROUTE: Site Content Dashboard */}
        <Route
          path="/site-content-dashboard"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <SiteContentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/myprofile"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/setup-profile"
          element={
            <ProtectedRoute requireAdmin={true} requireUser={false}>
              <AdminSetupProfile />
            </ProtectedRoute>
          }
        />


        {/* Fallback for unauthorized access */}
        <Route
          path="/forms/counseling-referral-slip"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <ReferralSlip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms/pard"
          element={
            <ProtectedRoute requireAdmin={false} requireUser={true}>
              <PARD />
            </ProtectedRoute>
          }
        />
        <Route path="/forms/guest/counseling-referral-slip" element={<GuestReferralSlip />} />
        <Route path="/verify" element={<VerifyReferralPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/public-forms" element={<FormPublicPage />} />
        <Route path="/faq" element={<FAQPublicPage />} />
        <Route
          path="/password/reset/confirm/:uid/:token"
          element={<ResetPassword />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}


export default App;