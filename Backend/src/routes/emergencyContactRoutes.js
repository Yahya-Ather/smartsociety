import express from "express";
import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setPrimaryContact,
} from "../controllers/emergencyContactController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["Resident"]));

router.get("/", getEmergencyContacts);
router.post("/add", addEmergencyContact);
router.put("/:id", updateEmergencyContact);
router.delete("/:id", deleteEmergencyContact);
router.patch("/:id/set-primary", setPrimaryContact);

export default router;
