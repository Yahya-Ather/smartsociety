import express from "express";
import {
  getAmenities,
  getAmenityById,
  bookAmenity,
  getMyBookings,
  cancelBooking,
  createAmenity,
  approveBooking,
  getAllBookings,
} from "../controllers/amenityController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/list", getAmenities);

router.post("/book", roleMiddleware(["Resident"]), bookAmenity);
router.get("/my-bookings", roleMiddleware(["Resident"]), getMyBookings);
router.patch("/booking/:id/cancel", roleMiddleware(["Resident"]), cancelBooking);

router.post("/admin/create", roleMiddleware(["Admin"]), createAmenity);
router.patch(
  "/admin/booking/:id/approve",
  roleMiddleware(["Admin"]),
  approveBooking,
);
router.get("/admin/all-bookings", roleMiddleware(["Admin"]), getAllBookings);

router.get("/:id", getAmenityById);

export default router;
