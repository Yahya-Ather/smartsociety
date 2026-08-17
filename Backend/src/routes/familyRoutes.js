import express from "express";
import { getFamilyMembers, addFamilyMember, removeFamilyMember } from "../controllers/familyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["Resident"]));

router.get("/", getFamilyMembers);
router.post("/add", addFamilyMember);
router.delete("/:id", removeFamilyMember);

export default router;
