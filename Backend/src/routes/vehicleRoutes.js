import express from "express";
import {
  getVehicles,
  registerVehicle,
  updateVehicle,
  deregisterVehicle,
  getAllVehicles,
} from "../controllers/vehicleController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/admin/all", roleMiddleware(["Admin"]), getAllVehicles);

router.get("/", roleMiddleware(["Resident"]), getVehicles);
router.post("/register", roleMiddleware(["Resident"]), registerVehicle);
router.put("/:id", roleMiddleware(["Resident"]), updateVehicle);
router.delete("/:id", roleMiddleware(["Resident"]), deregisterVehicle);

export default router;
