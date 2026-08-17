import express from "express";
import {
  getPolls,
  getPollById,
  votePoll,
  getPollResults,
  createPoll,
  closePoll,
  getAllPolls,
} from "../controllers/pollController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPolls);
router.get("/:id", getPollById);
router.post("/:pollId/vote", roleMiddleware(["Resident"]), votePoll);
router.get("/:id/results", getPollResults);

router.post("/create", roleMiddleware(["Admin"]), createPoll);
router.patch("/:id/close", roleMiddleware(["Admin"]), closePoll);
router.get("/admin/all-polls", roleMiddleware(["Admin"]), getAllPolls);

export default router;
