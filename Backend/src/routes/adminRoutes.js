import express from "express";
import {
  createFlat,
  getFlats,
  getStaff,
  onboardResident,
  generateBills,
  broadcastNotice,
  getResidents,
  verifyResident,
  offboardResident,
  getComplaints,
  assignComplaint,
  updateComplaintStatus,
  getBillingReport,
  markBillPaid,
  applyPenalty,
  getDashboard,
  getAuditLogs,
  createStaff,
  deactivateStaff,
  reactivateStaff,
  getServiceStaff,
  createServiceStaff,
  deactivateServiceStaff,
  reactivateServiceStaff,
  updateResidentUsername,
  resetResidentPassword,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["Admin"]));

router.get("/dashboard", getDashboard);

router.post("/flat", createFlat);
router.get("/flats", getFlats);

router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.patch("/staff/:id/deactivate", deactivateStaff);
router.patch("/staff/:id/reactivate", reactivateStaff);

router.get("/service-staff", getServiceStaff);
router.post("/service-staff", createServiceStaff);
router.patch("/service-staff/:id/deactivate", deactivateServiceStaff);
router.patch("/service-staff/:id/reactivate", reactivateServiceStaff);

router.get("/residents", getResidents);
router.post("/resident", onboardResident);
router.patch("/residents/:id/verify", verifyResident);
router.patch("/residents/:id/offboard", offboardResident);
router.patch("/residents/:id/username", updateResidentUsername);
router.patch("/residents/:id/reset-password", resetResidentPassword);

router.get("/billing", getBillingReport);
router.post("/bills", generateBills);
router.patch("/billing/:billId/paid", markBillPaid);
router.patch("/billing/:billId/penalty", applyPenalty);

router.get("/helpdesk", getComplaints);
router.patch("/helpdesk/:complaintId/assign", assignComplaint);
router.patch("/helpdesk/:complaintId/status", updateComplaintStatus);

router.post("/notice", broadcastNotice);

router.get("/audit-logs", getAuditLogs);

export default router;
