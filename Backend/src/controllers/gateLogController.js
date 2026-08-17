import GateLog from "../models/GateLog.js";
import SecurityAlert from "../models/SecurityAlert.js";
import Flat from "../models/Flat.js";
import { recordAudit } from "../utils/auditLog.js";

export const logVisitorEntry = async (req, res, next) => {
  try {
    const {
      visitor_name,
      visitor_type,
      vehicle_number,
      flat_id,
      phone_number,
      entry_pass_code,
      notes,
    } = req.body;

    if (!visitor_name || !flat_id || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: visitor_name, flat_id, phone_number",
      });
    }

    const flat = await Flat.findById(flat_id);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found.",
      });
    }

    const gateLog = await GateLog.create({
      visitor_name,
      visitor_type: visitor_type || "Guest",
      vehicle_number: vehicle_number || "",
      flat_id,
      flat_number: flat.flat_number,
      phone_number,
      entry_time: new Date(),
      entry_pass_code: entry_pass_code || null,
      logged_by: req.user.id,
      notes: notes || "",
    });

    await recordAudit({
      entityType: "GateEntry",
      entityId: gateLog._id,
      action: "gate_log_entry",
      actor: req.user,
      before: null,
      after: { entry_time: gateLog.entry_time },
      description: `${gateLog.visitor_name} (${gateLog.visitor_type}) entered at flat ${flat.flat_number}`,
    });

    res.status(201).json({
      success: true,
      message: "Visitor entry logged successfully.",
      data: gateLog,
    });
  } catch (error) {
    next(error);
  }
};

export const logVisitorExit = async (req, res, next) => {
  try {
    const { logId } = req.params;

    const gateLog = await GateLog.findById(logId);
    if (!gateLog) {
      return res.status(404).json({
        success: false,
        message: "Gate log entry not found.",
      });
    }

    if (gateLog.exit_time) {
      return res.status(400).json({
        success: false,
        message: "Exit already logged for this entry.",
      });
    }

    gateLog.exit_time = new Date();
    await gateLog.save();

    const stayDuration = (gateLog.exit_time - gateLog.entry_time) / (1000 * 60 * 60);

    if (stayDuration > 8) {
      await SecurityAlert.create({
        visitor_id: gateLog.visitor_id || null,
        alert_type: "Overstay",
        description: `Visitor ${gateLog.visitor_name} stayed for ${stayDuration.toFixed(2)} hours at flat ${gateLog.flat_number}`,
        alert_status: "Active",
        flat_id: gateLog.flat_id,
        gate_id: gateLog.gate_id,
      });
    }

    await recordAudit({
      entityType: "GateEntry",
      entityId: gateLog._id,
      action: "gate_log_exit",
      actor: req.user,
      before: { exit_time: null },
      after: { exit_time: gateLog.exit_time },
      description: `${gateLog.visitor_name} exited at flat ${gateLog.flat_number} after ${stayDuration.toFixed(2)}h`,
    });

    res.status(200).json({
      success: true,
      message: "Visitor exit logged successfully.",
      data: gateLog,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveVisitors = async (req, res, next) => {
  try {
    const activeVisitors = await GateLog.find({ exit_time: null })
      .populate("flat_id", "block_name flat_number")
      .sort({ entry_time: -1 });

    res.status(200).json({
      success: true,
      count: activeVisitors.length,
      data: activeVisitors,
    });
  } catch (error) {
    next(error);
  }
};

export const getGateLogs = async (req, res, next) => {
  try {
    const { flat_id, from_date, to_date, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (flat_id) filter.flat_id = flat_id;

    if (from_date || to_date) {
      filter.entry_time = {};
      if (from_date) filter.entry_time.$gte = new Date(from_date);
      if (to_date) filter.entry_time.$lte = new Date(to_date);
    }

    const skip = (page - 1) * limit;

    const logs = await GateLog.find(filter)
      .populate("flat_id", "block_name flat_number")
      .populate("logged_by", "username")
      .sort({ entry_time: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GateLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayLogs = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await GateLog.find({ entry_time: { $gte: today, $lt: tomorrow } })
      .populate("flat_id", "block_name flat_number")
      .sort({ entry_time: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getSecurityAlerts = async (req, res, next) => {
  try {
    const { status = "Active" } = req.query;

    const alerts = await SecurityAlert.find({ alert_status: status })
      .populate("flat_id", "block_name flat_number")
      .populate("visitor_id", "visitor_name visitor_type phone")
      .sort({ trigger_time: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

export const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;

    const alert = await SecurityAlert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    alert.alert_status = "Acknowledged";
    await alert.save();

    res.status(200).json({
      success: true,
      message: "Alert acknowledged successfully.",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution_notes } = req.body;

    const alert = await SecurityAlert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    alert.alert_status = "Resolved";
    alert.resolved_time = new Date();
    alert.resolution_notes = resolution_notes || "";
    await alert.save();

    res.status(200).json({
      success: true,
      message: "Alert resolved successfully.",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGateLogs = async (req, res, next) => {
  try {
    const { from_date, to_date, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (from_date || to_date) {
      filter.entry_time = {};
      if (from_date) filter.entry_time.$gte = new Date(from_date);
      if (to_date) filter.entry_time.$lte = new Date(to_date);
    }

    const skip = (page - 1) * limit;

    const logs = await GateLog.find(filter)
      .populate("flat_id", "block_name flat_number")
      .populate("logged_by", "username")
      .sort({ entry_time: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GateLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
