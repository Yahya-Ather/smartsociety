import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Sitemap from "./pages/Sitemap.jsx";
import NotFound from "./pages/NotFound.jsx";

import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";

import ResidentDashboard from "./components/resident/Dashboard.jsx";
import VisitorPass from "./components/resident/VisitorPass.jsx";
import MaintenanceBills from "./components/resident/MaintenanceBills.jsx";
import Complaints from "./components/resident/Complaints.jsx";
import AmenityBooking from "./components/resident/AmenityBooking.jsx";
import Notices from "./components/resident/Notices.jsx";

import AdminDashboard from "./components/admin/Dashboard.jsx";
import ResidentManagement from "./components/admin/ResidentManagement.jsx";
import StaffManagement from "./components/admin/StaffManagement.jsx";
import BillingEngine from "./components/admin/BillingEngine.jsx";
import ComplaintRouting from "./components/admin/ComplaintRouting.jsx";
import SecurityLogs from "./components/admin/SecurityLogs.jsx";
import AmenitiesManagement from "./components/admin/AmenitiesManagement.jsx";
import AuditLog from "./components/admin/AuditLog.jsx";

import GuardDashboard from "./components/guard/Dashboard.jsx";
import VisitorEntry from "./components/guard/VisitorEntry.jsx";
import PassVerification from "./components/guard/PassVerification.jsx";

import EmergencyDirectory from "./components/common/EmergencyDirectory.jsx";
import Guidelines from "./components/common/Guidelines.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/sitemap" element={<Sitemap />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Resident */}
      <Route
        path="/resident"
        element={
          <ProtectedRoute allowedRoles={["resident"]}>
            <ResidentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/visitor-pass"
        element={
          <ProtectedRoute allowedRoles={["resident"]}>
            <VisitorPass />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/bills"
        element={
          <ProtectedRoute allowedRoles={["resident"]}>
            <MaintenanceBills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/complaints"
        element={
          <ProtectedRoute allowedRoles={["resident"]}>
            <Complaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/amenities"
        element={
          <ProtectedRoute allowedRoles={["resident"]}>
            <AmenityBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resident/notices"
        element={
          <ProtectedRoute allowedRoles={["resident"]}>
            <Notices />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/residents"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ResidentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <StaffManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <BillingEngine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ComplaintRouting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/security-logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SecurityLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/amenities"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AmenitiesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-log"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AuditLog />
          </ProtectedRoute>
        }
      />

      {/* Guard */}
      <Route
        path="/guard"
        element={
          <ProtectedRoute allowedRoles={["guard"]}>
            <GuardDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guard/visitor-entry"
        element={
          <ProtectedRoute allowedRoles={["guard"]}>
            <VisitorEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guard/verify-pass"
        element={
          <ProtectedRoute allowedRoles={["guard"]}>
            <PassVerification />
          </ProtectedRoute>
        }
      />

      {/* Shared — any authenticated role */}
      <Route
        path="/emergency-directory"
        element={
          <ProtectedRoute>
            <EmergencyDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guidelines"
        element={
          <ProtectedRoute>
            <Guidelines />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
