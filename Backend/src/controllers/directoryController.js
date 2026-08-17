import User from "../models/User.js";
import ServiceStaff from "../models/ServiceStaff.js";

// Read-only, any authenticated role — feeds the Emergency Contact Directory
// page. Distinct from adminController's staff endpoints (Admin-only, used for
// management) even though the underlying data overlaps.
export const getEmergencyDirectory = async (req, res, next) => {
  try {
    const guards = await User.find({ role: "Guard", is_active: true }).select("_id name phone_number gate");

    const admins = await User.find({ role: "Admin", is_active: true }).select("_id name phone_number email");

    const serviceStaff = await ServiceStaff.find({ is_active: true })
      .select("_id name phone_number service_type")
      .sort({ service_type: 1 });

    res.status(200).json({
      success: true,
      data: { guards, admins, service_staff: serviceStaff },
    });
  } catch (error) {
    next(error);
  }
};
