import express from "express";
import { triggerEmergency, getActiveEmergencies, resolveEmergency } from "../controllers/emergencyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/trigger", triggerEmergency);
router.get("/active", getActiveEmergencies);
router.patch("/:id/resolve", roleMiddleware(["Admin", "Guard"]), resolveEmergency);

export default router;
