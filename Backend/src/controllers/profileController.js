import User from "../models/User.js";
import Flat from "../models/Flat.js";

// Works for any authenticated role (Resident/Admin/Guard) — unlike
// residentController's getProfile/updateProfile, which are Resident-only.
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -mfaSecret");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let flat = null;
    if (user.flat_id) {
      flat = await Flat.findById(user.flat_id);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        gate: user.gate,
        flat: flat
          ? { block_name: flat.block_name, flat_number: flat.flat_number, occupancy_type: flat.occupancy_type }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, phone_number } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use.",
        });
      }
      user.email = email.toLowerCase();
    }
    if (name) user.name = name.trim();
    if (phone_number !== undefined) user.phone_number = phone_number.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
      },
    });
  } catch (error) {
    next(error);
  }
};
