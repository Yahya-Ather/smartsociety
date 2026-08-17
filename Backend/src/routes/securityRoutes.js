import express from "express";
import {
  verifyPass,
  logWalkInVisitor,
  getActiveVisitors,
  exitVisitor,
  getAllVisitors,
} from "../controllers/securityController.js";
import {
  logVisitorEntry,
  logVisitorExit,
  getGateLogs,
  getTodayLogs,
  getSecurityAlerts,
  acknowledgeAlert,
  resolveAlert,
} from "../controllers/gateLogController.js";
import { getFlats } from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["Guard", "Admin"]));

router.get("/flats", getFlats);

router.post("/verify-pass", verifyPass);

router.post("/walk-in", upload.single("photo"), logWalkInVisitor);
router.get("/visitors", getAllVisitors);
router.patch("/visitor/:id/exit", exitVisitor);

router.post("/visitor/entry", logVisitorEntry);
router.patch("/visitor/:logId/exit", logVisitorExit);

router.get("/active-visitors", getActiveVisitors);

router.get("/logs", getGateLogs);
router.get("/today-logs", getTodayLogs);

router.get("/alerts", getSecurityAlerts);
router.patch("/alert/:id/acknowledge", acknowledgeAlert);
router.patch("/alert/:id/resolve", resolveAlert);

export default router;
