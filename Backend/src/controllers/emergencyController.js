import EmergencyAlert from "../models/EmergencyAlert.js";
import User from "../models/User.js";
import Flat from "../models/Flat.js";
import { getIO } from "../realtime/io.js";

function toClientAlert(alert, flat) {
  return {
    id: alert._id,
    triggeredByName: alert.triggered_by_name,
    triggeredByRole: alert.triggered_by_role,
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, "")}-${flat.flat_number}` : null,
    locationLabel: alert.location_label,
    status: alert.status,
    triggeredAt: alert.triggered_at,
    resolvedAt: alert.resolved_at,
    resolvedByName: alert.resolved_by_name,
  };
}

// Any authenticated role — a resident, guard, or admin can pull the alarm.
export const triggerEmergency = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("flat_id");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const locationLabel = user.role === "Guard" ? user.gate || "Gate" : null;

    const alert = await EmergencyAlert.create({
      triggered_by: user._id,
      triggered_by_name: user.name,
      triggered_by_role: user.role,
      flat_id: user.flat_id?._id || null,
      location_label: locationLabel,
      status: "Active",
      triggered_at: new Date(),
    });

    const payload = toClientAlert(alert, user.flat_id);

    getIO()?.emit("emergency:triggered", payload);

    res.status(201).json({ success: true, message: "Emergency siren activated.", data: payload });
  } catch (error) {
    next(error);
  }
};

// Any authenticated role — lets a client that (re)loads the app after a
// trigger still see the ongoing alert, since the socket push only reaches
// clients that were already connected at the moment it fired.
export const getActiveEmergencies = async (req, res, next) => {
  try {
    const alerts = await EmergencyAlert.find({ status: "Active" })
      .populate("flat_id")
      .sort({ triggered_at: -1 });

    res.status(200).json({
      success: true,
      data: alerts.map((a) => toClientAlert(a, a.flat_id)),
    });
  } catch (error) {
    next(error);
  }
};

// Admin/Guard only — residents can raise the alarm but not stand it down.
export const resolveEmergency = async (req, res, next) => {
  try {
    const { id } = req.params;

    const alert = await EmergencyAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: "Alert not found." });
    }
    if (alert.status === "Resolved") {
      return res.status(400).json({ success: false, message: "Alert has already been resolved." });
    }

    alert.status = "Resolved";
    alert.resolved_at = new Date();
    alert.resolved_by = req.user.id;
    alert.resolved_by_name = req.user.username;
    await alert.save();

    const flat = alert.flat_id ? await Flat.findById(alert.flat_id) : null;
    const payload = toClientAlert(alert, flat);

    getIO()?.emit("emergency:resolved", payload);

    res.status(200).json({ success: true, message: "Emergency alert resolved.", data: payload });
  } catch (error) {
    next(error);
  }
};
