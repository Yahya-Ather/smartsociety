import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/profileController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getMyProfile);
router.put("/", updateMyProfile);

export default router;
