import express from "express";
import {
  getBills,
  payBill,
  generateVisitorPass,
  raiseComplaint,
  getComplaints,
  updateComplaintStatus,
  getNotices,
  getVisitorPasses,
  getProfile,
  updateProfile,
  getDashboard,
} from "../controllers/residentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["Resident"]));

router.get("/dashboard", getDashboard);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

router.get("/bills", getBills);
router.post("/bills/:id/pay", payBill);

router.get("/visitor-passes", getVisitorPasses);
router.post("/visitor-pass", generateVisitorPass);

router.post("/complaints", upload.single("photo"), raiseComplaint);
router.get("/complaints", getComplaints);
router.patch("/complaints/:complaintId/status", updateComplaintStatus);

router.get("/notices", getNotices);

export default router;
