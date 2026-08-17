import Amenity from "../models/Amenity.js";
import AmenityBooking from "../models/AmenityBooking.js";
import User from "../models/User.js";

export const getAmenities = async (req, res, next) => {
  try {
    const amenities = await Amenity.find({ availability: true });

    res.status(200).json({
      success: true,
      count: amenities.length,
      data: amenities,
    });
  } catch (error) {
    next(error);
  }
};

export const getAmenityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
};

export const bookAmenity = async (req, res, next) => {
  try {
    const {
      amenity_id,
      booking_date,
      time_from,
      time_to,
      number_of_guests,
      special_requirements,
    } = req.body;

    if (
      !amenity_id ||
      !booking_date ||
      !time_from ||
      !time_to ||
      !number_of_guests
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: amenity_id, booking_date, time_from, time_to, number_of_guests",
      });
    }

    const amenity = await Amenity.findById(amenity_id);
    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found.",
      });
    }

    if (number_of_guests > amenity.capacity) {
      return res.status(400).json({
        success: false,
        message: `Number of guests exceeds amenity capacity of ${amenity.capacity}`,
      });
    }

    let flatId = req.user.flat_id;
    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const booking = await AmenityBooking.create({
      amenity_id,
      resident_id: req.user.id,
      flat_id: flatId,
      booking_date,
      time_from,
      time_to,
      number_of_guests,
      special_requirements: special_requirements || "",
      booking_status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Amenity booking created successfully.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    let flatId = req.user.flat_id;

    if (!flatId) {
      const user = await User.findById(req.user.id);
      flatId = user?.flat_id;
    }

    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const bookings = await AmenityBooking.find({ resident_id: req.user.id }).populate("amenity_id");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await AmenityBooking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (String(booking.resident_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking.",
      });
    }

    if (
      booking.booking_status === "Completed" ||
      booking.booking_status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status: ${booking.booking_status}`,
      });
    }

    booking.booking_status = "Cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const createAmenity = async (req, res, next) => {
  try {
    const { name, description, capacity, location } = req.body;

    if (!name || !description || !capacity || !location) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, description, capacity, location",
      });
    }

    const amenity = await Amenity.create({
      name,
      description,
      capacity,
      location,
      availability: true,
    });

    res.status(201).json({
      success: true,
      message: "Amenity created successfully.",
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
};

export const approveBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await AmenityBooking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    booking.booking_status = "Confirmed";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await AmenityBooking.find()
      .populate("amenity_id")
      .populate("resident_id", "username name email phone_number")
      .populate("flat_id");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
