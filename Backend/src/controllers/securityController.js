import Visitor from "../models/Visitor.js";
import Flat from "../models/Flat.js";
import { recordAudit } from "../utils/auditLog.js";

export const verifyPass = async (req, res, next) => {
  try {
    const { gate_pass_code } = req.body;

    if (!gate_pass_code) {
      return res.status(400).json({
        success: false,
        message: "gate_pass_code is required.",
      });
    }

    const visitor = await Visitor.findOne({ gate_pass_code });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Invalid gate pass code. Visitor not found.",
      });
    }

    if (visitor.status === "Entered") {
      return res.status(400).json({
        success: false,
        message: "Visitor pass has already been used and visitor is currently on premises.",
      });
    }

    if (visitor.status === "Exited") {
      return res.status(400).json({
        success: false,
        message: "Visitor pass has expired because visitor has already exited.",
      });
    }

    const previousStatus = visitor.status;
    visitor.status = "Entered";
    visitor.entry_timestamp = new Date();
    await visitor.save();
    await visitor.populate("flat_id");

    await recordAudit({
      entityType: "GateEntry",
      entityId: visitor._id,
      action: "pass_verified_entry",
      actor: req.user,
      before: { status: previousStatus },
      after: { status: "Entered", entry_timestamp: visitor.entry_timestamp },
      description: `${visitor.visitor_name} admitted via gate pass ${visitor.gate_pass_code} at ${visitor.flat_id ? `${visitor.flat_id.block_name}-${visitor.flat_id.flat_number}` : `flat #${visitor.flat_id}`}`,
    });

    res.status(200).json({
      success: true,
      message: "Gate pass verified. Visitor entry recorded successfully.",
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

export const logWalkInVisitor = async (req, res, next) => {
  try {
    const { visitor_name, phone, vehicle_number, visitor_type, flat_id } = req.body;

    if (!visitor_name || !phone || !flat_id) {
      return res.status(400).json({
        success: false,
        message: "visitor_name, phone, and flat_id are required for walk-in visitors.",
      });
    }

    const flat = await Flat.findById(flat_id);
    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Specified flat does not exist.",
      });
    }

    // Cloudinary storage puts a full CDN URL in req.file.path; local disk storage
    // puts an absolute filesystem path there instead, so build a servable URL for
    // that case from the generated filename (see config/cloudinary.js).
    const photoUrl = req.file
      ? req.file.path.startsWith("http")
        ? req.file.path
        : `/uploads/complaints/${req.file.filename}`
      : "";

    let visitor = await Visitor.create({
      visitor_name,
      phone,
      vehicle_number: vehicle_number || "",
      visitor_type: visitor_type || "Guest",
      flat_id,
      approved_by: req.user.id,
      status: "Entered",
      entry_timestamp: new Date(),
      valid_till: new Date(Date.now() + 24 * 60 * 60 * 1000),
      photo_url: photoUrl,
    });
    await visitor.populate("flat_id");

    await recordAudit({
      entityType: "GateEntry",
      entityId: visitor._id,
      action: "walk_in_entry",
      actor: req.user,
      before: null,
      after: { status: "Entered", entry_timestamp: visitor.entry_timestamp },
      description: `${visitor.visitor_name} (${visitor.visitor_type}) logged as walk-in at ${flat.block_name}-${flat.flat_number}`,
    });

    res.status(201).json({
      success: true,
      message: "Walk-in visitor entry logged successfully.",
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveVisitors = async (req, res, next) => {
  try {
    const activeVisitors = await Visitor.find({ status: "Entered" })
      .populate("flat_id")
      .sort({ entry_timestamp: -1 });

    res.status(200).json({
      success: true,
      count: activeVisitors.length,
      data: activeVisitors,
    });
  } catch (error) {
    next(error);
  }
};

export const exitVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found.",
      });
    }

    if (visitor.status !== "Entered") {
      return res.status(400).json({
        success: false,
        message: "Only visitors currently on premises can be marked exited.",
      });
    }

    visitor.status = "Exited";
    visitor.exit_timestamp = new Date();
    await visitor.save();
    await visitor.populate("flat_id");

    await recordAudit({
      entityType: "GateEntry",
      entityId: visitor._id,
      action: "exit",
      actor: req.user,
      before: { status: "Entered" },
      after: { status: "Exited", exit_timestamp: visitor.exit_timestamp },
      description: `${visitor.visitor_name} exited at ${visitor.flat_id ? `${visitor.flat_id.block_name}-${visitor.flat_id.flat_number}` : `flat #${visitor.flat_id}`}`,
    });

    res.status(200).json({
      success: true,
      message: "Visitor exit recorded successfully.",
      data: visitor,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVisitors = async (req, res, next) => {
  try {
    const visitors = await Visitor.find()
      .populate("flat_id")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    next(error);
  }
};
