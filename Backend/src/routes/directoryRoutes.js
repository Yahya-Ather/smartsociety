import express from "express";
import { getEmergencyDirectory } from "../controllers/directoryController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/emergency", getEmergencyDirectory);

export default router;
