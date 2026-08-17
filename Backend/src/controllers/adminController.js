import Flat from "../models/Flat.js";
import User from "../models/User.js";
import Bill from "../models/Bill.js";
import Notice from "../models/Notice.js";
import Complaint from "../models/Complaint.js";
import GateLog from "../models/GateLog.js";
import AuditLog from "../models/AuditLog.js";
import ServiceStaff from "../models/ServiceStaff.js";
import { recordAudit } from "../utils/auditLog.js";

// Mirrors the SLA policy shown in the Complaint Routing UI (Urgent 4h, High
// 24h, Medium 48h, Low 5d). Applied server-side on assignment so the policy
// is actually enforced regardless of what the client sends.
const SLA_HOURS = { Urgent: 4, High: 24, Medium: 48, Low: 120 };

export const createFlat = async (req, res, next) => {
  try {
    const { block_name, flat_number, occupancy_type } = req.body;

    if (!block_name || !flat_number || !occupancy_type) {
      return res.status(400).json({
        success: false,
        message: "block_name, flat_number, and occupancy_type are required.",
      });
    }

    const existingFlat = await Flat.findOne({ block_name, flat_number });
    if (existingFlat) {
      return res.status(409).json({
        success: false,
        message: `Flat ${flat_number} in Block ${block_name} already exists.`,
      });
    }

    const flat = await Flat.create({ block_name, flat_number, occupancy_type });

    res.status(201).json({
      success: true,
      message: "Flat created successfully",
      data: flat,
    });
  } catch (error) {
    next(error);
  }
};

function generateTempPassword() {
  return Math.random().toString(36).slice(-8);
}

export const onboardResident = async (req, res, next) => {
  try {
    const { name, email, phone_number, block_name, flat_number, occupancy_type } = req.body;

    if (!name || !email || !block_name || !flat_number || !occupancy_type) {
      return res.status(400).json({
        success: false,
        message: "name, email, block_name, flat_number, and occupancy_type are required.",
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    let flat = await Flat.findOne({ block_name, flat_number });
    if (!flat) {
      flat = await Flat.create({
        block_name,
        flat_number,
        occupancy_type,
        owner_name: occupancy_type === "Owner" ? name : "",
        owner_phone: occupancy_type === "Owner" ? phone_number || "" : "",
        is_occupied: true,
      });
    } else if (!flat.is_occupied) {
      flat.is_occupied = true;
      await flat.save();
    }

    const base = email.split("@")[0].toLowerCase();
    let username = base;
    let suffix = 1;
    while (await User.findOne({ username })) {
      suffix += 1;
      username = `${base}${suffix}`;
    }

    const tempPassword = generateTempPassword();

    const user = await User.create({
      username,
      name,
      email: email.toLowerCase(),
      phone_number: phone_number || "",
      password: tempPassword,
      role: "Resident",
      flat_id: flat._id,
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: "Resident onboarded successfully.",
      data: {
        id: user._id,
        username: user.username,
        temp_password: tempPassword,
        role: user.role,
        flat_id: user.flat_id,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with these details already exists.",
      });
    }
    next(error);
  }
};

export const generateBills = async (req, res, next) => {
  try {
    const { amount_due, due_date, billing_month, charges_breakdown } = req.body;

    if (!amount_due || !due_date) {
      return res.status(400).json({
        success: false,
        message: "amount_due and due_date are required.",
      });
    }

    const flats = await Flat.find();
    if (flats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No flats found to generate bills for.",
      });
    }

    const resolvedMonth =
      billing_month || new Date(due_date).toLocaleString("en-US", { month: "long", year: "numeric" });
    const charges = charges_breakdown || {};

    const billRows = flats.map((flat) => ({
      flat_id: flat._id,
      billing_month: resolvedMonth,
      base_amount: amount_due,
      charges_breakdown: {
        maintenance: charges.maintenance || 0,
        water: charges.water || 0,
        security: charges.security || 0,
        repairs: charges.repairs || 0,
        other: charges.other || 0,
      },
      amount_due,
      total_due: amount_due,
      due_date: new Date(due_date),
      payment_status: "Pending",
    }));

    const createdBills = await Bill.insertMany(billRows);

    await Promise.all(
      createdBills.map((bill) =>
        recordAudit({
          entityType: "Bill",
          entityId: bill._id,
          action: "generated",
          actor: req.user,
          before: null,
          after: { billing_month: bill.billing_month, total_due: bill.total_due, due_date: bill.due_date },
          description: `Bill #${bill._id} generated for flat #${bill.flat_id} — ${bill.billing_month}, due ${bill.total_due}`,
        }),
      ),
    );

    res.status(201).json({
      success: true,
      message: `Generated ${createdBills.length} maintenance bills successfully.`,
      count: createdBills.length,
      data: createdBills,
    });
  } catch (error) {
    next(error);
  }
};

export const broadcastNotice = async (req, res, next) => {
  try {
    const { title, description, category, urgent, event_date, event_time, event_location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "title and description are required.",
      });
    }

    const notice = await Notice.create({
      title,
      description,
      category: category || "General",
      urgent: Boolean(urgent),
      event_date: category === "Event" && event_date ? new Date(event_date) : null,
      event_time: category === "Event" ? event_time || "" : "",
      event_location: category === "Event" ? event_location || "" : "",
      created_by: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Notice broadcasted successfully",
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

export const getFlats = async (req, res, next) => {
  try {
    const flats = await Flat.find().sort({ block_name: 1, flat_number: 1 });

    res.status(200).json({
      success: true,
      count: flats.length,
      data: flats,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ["Admin", "Guard"] } }).select("-password");

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone_number, role, gate } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, and role are required.",
      });
    }

    if (!["Admin", "Guard"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role must be Admin or Guard.",
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const base = email.split("@")[0].toLowerCase();
    let username = base;
    let suffix = 1;
    while (await User.findOne({ username })) {
      suffix += 1;
      username = `${base}${suffix}`;
    }

    const tempPassword = generateTempPassword();

    const staff = await User.create({
      username,
      name,
      email: email.toLowerCase(),
      phone_number: phone_number || "",
      password: tempPassword,
      role,
      gate: role === "Guard" ? gate || "" : "",
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      data: {
        id: staff._id,
        username: staff.username,
        temp_password: tempPassword,
        role: staff.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with these details already exists.",
      });
    }
    next(error);
  }
};

export const deactivateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await User.findOne({ _id: id, role: { $in: ["Admin", "Guard"] } });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff account not found.",
      });
    }

    if (String(staff._id) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    staff.is_active = false;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `${staff.name} has been deactivated.`,
      data: { id: staff._id, is_active: staff.is_active },
    });
  } catch (error) {
    next(error);
  }
};

export const reactivateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await User.findOne({ _id: id, role: { $in: ["Admin", "Guard"] } });
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff account not found.",
      });
    }

    staff.is_active = true;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `${staff.name} has been reactivated.`,
      data: { id: staff._id, is_active: staff.is_active },
    });
  } catch (error) {
    next(error);
  }
};

// Service staff (plumber, electrician, ...) never log into the portal — this
// is a directory roster only, distinct from the User-backed portal staff above.
export const getServiceStaff = async (req, res, next) => {
  try {
    const staff = await ServiceStaff.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const createServiceStaff = async (req, res, next) => {
  try {
    const { name, phone_number, service_type } = req.body;

    if (!name || !phone_number || !service_type) {
      return res.status(400).json({
        success: false,
        message: "name, phone_number, and service_type are required.",
      });
    }

    const staff = await ServiceStaff.create({ name, phone_number, service_type, is_active: true });

    res.status(201).json({
      success: true,
      message: `${service_type} added to the staff directory.`,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateServiceStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await ServiceStaff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Service staff not found.",
      });
    }

    staff.is_active = false;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `${staff.name} has been deactivated.`,
      data: { id: staff._id, is_active: staff.is_active },
    });
  } catch (error) {
    next(error);
  }
};

export const reactivateServiceStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await ServiceStaff.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Service staff not found.",
      });
    }

    staff.is_active = true;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `${staff.name} has been reactivated.`,
      data: { id: staff._id, is_active: staff.is_active },
    });
  } catch (error) {
    next(error);
  }
};

export const getResidents = async (req, res, next) => {
  try {
    const residents = await User.find({ role: "Resident" })
      .populate("flat_id", "block_name flat_number occupancy_type")
      .select("-password");

    res.status(200).json({
      success: true,
      count: residents.length,
      data: residents,
    });
  } catch (error) {
    next(error);
  }
};

// Activates a resident who self-registered through POST /api/auth/register —
// their account starts is_active:false and can't log in until an Admin does
// this (see the check in authController.login).
export const verifyResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { block_name } = req.body;

    const resident = await User.findOne({ _id: id, role: "Resident" });
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found.",
      });
    }

    resident.is_active = true;
    await resident.save();

    // Mirrors offboardResident's cleanup in reverse — a resident who was
    // previously offboarded (which zeroes out flat.is_occupied once no
    // active resident remains) and is now being verified/reactivated needs
    // their flat's occupancy restored, or it's stuck showing vacant.
    if (resident.flat_id) {
      // Self-registration never asks which tower the resident is in — the
      // flat is created against a placeholder block, so this is the Admin's
      // one chance to correct it against the real KYC documents.
      const flatUpdate = { is_occupied: true };
      if (block_name && block_name.trim()) flatUpdate.block_name = block_name.trim();
      await Flat.updateOne({ _id: resident.flat_id }, flatUpdate);
    }

    res.status(200).json({
      success: true,
      message: `${resident.name} has been verified and can now log in.`,
      data: { id: resident._id, username: resident.username, is_active: resident.is_active },
    });
  } catch (error) {
    next(error);
  }
};

export const offboardResident = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resident = await User.findOne({ _id: id, role: "Resident" });
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found.",
      });
    }

    resident.is_active = false;
    await resident.save();

    if (resident.flat_id) {
      const stillOccupiedCount = await User.countDocuments({
        flat_id: resident.flat_id,
        role: "Resident",
        is_active: true,
        _id: { $ne: resident._id },
      });
      if (stillOccupiedCount === 0) {
        await Flat.updateOne({ _id: resident.flat_id }, { is_occupied: false });
      }
    }

    res.status(200).json({
      success: true,
      message: `${resident.name} has been offboarded.`,
      data: { id: resident._id, is_active: resident.is_active },
    });
  } catch (error) {
    next(error);
  }
};

export const updateResidentUsername = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "username is required.",
      });
    }

    const resident = await User.findOne({ _id: id, role: "Resident" });
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found.",
      });
    }

    const trimmed = username.trim();
    const existing = await User.findOne({ username: trimmed, _id: { $ne: id } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken.",
      });
    }

    resident.username = trimmed;
    await resident.save();

    res.status(200).json({
      success: true,
      message: "Username updated successfully.",
      data: { id: resident._id, username: resident.username },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken.",
      });
    }
    next(error);
  }
};

// Admin-initiated reset — leaves `password` out of the body to generate a
// fresh temp password (same pattern as onboardResident/createStaff), or
// takes an explicit one when the Admin wants to set it directly.
export const resetResidentPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (password && password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const resident = await User.findOne({ _id: id, role: "Resident" });
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found.",
      });
    }

    const newPassword = password && password.trim() ? password.trim() : generateTempPassword();
    resident.password = newPassword;
    await resident.save();

    res.status(200).json({
      success: true,
      message: `Password updated for ${resident.name}.`,
      data: { id: resident._id, username: resident.username, temp_password: newPassword },
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const { status, assigned_to } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assigned_to) filter.assigned_to = assigned_to;

    const complaints = await Complaint.find(filter)
      .populate("resident_id", "username name email phone_number")
      .populate("flat_id", "block_name flat_number")
      .populate("assigned_to", "username name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const assignComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { assigned_to, sla_due_date } = req.body;

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        message: "assigned_to is required",
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    const previousStatus = complaint.status;
    const previousAssignee = complaint.assigned_to;
    complaint.assigned_to = assigned_to;
    complaint.status = "In-Progress";
    const hours = SLA_HOURS[complaint.priority] || SLA_HOURS.Medium;
    complaint.sla_due_date = sla_due_date ? new Date(sla_due_date) : new Date(Date.now() + hours * 60 * 60 * 1000);

    await complaint.save();

    await recordAudit({
      entityType: "Complaint",
      entityId: complaint._id,
      action: "assigned",
      actor: req.user,
      before: { status: previousStatus, assigned_to: previousAssignee },
      after: { status: complaint.status, assigned_to: complaint.assigned_to, sla_due_date: complaint.sla_due_date },
      description: `Complaint #${complaint._id} (${complaint.category}) assigned to user #${assigned_to}, status → In-Progress`,
    });

    res.status(200).json({
      success: true,
      message: "Complaint assigned successfully.",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status, resolution_notes } = req.body;

    if (!status || !["Pending", "In-Progress", "Resolved", "Closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required: Pending, In-Progress, Resolved, Closed",
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    const previousStatus = complaint.status;
    complaint.status = status;
    if (resolution_notes) complaint.resolution_notes = resolution_notes;
    if (status === "Resolved" || status === "Closed") {
      complaint.resolution_date = new Date();
    }

    await complaint.save();

    await recordAudit({
      entityType: "Complaint",
      entityId: complaint._id,
      action: "status_change",
      actor: req.user,
      before: { status: previousStatus },
      after: { status: complaint.status, resolution_notes: complaint.resolution_notes || null },
      description: `Complaint #${complaint._id} status changed ${previousStatus} → ${status}`,
    });

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully.",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getBillingReport = async (req, res, next) => {
  try {
    const bills = await Bill.find()
      .populate("flat_id", "block_name flat_number occupancy_type")
      .sort({ due_date: 1 });

    const total_bills = bills.length;
    const paid_bills = bills.filter((b) => b.payment_status === "Paid").length;
    const pending_bills = bills.filter((b) => b.payment_status === "Pending").length;
    const overdue_bills = bills.filter((b) => b.due_date < new Date() && b.payment_status === "Pending").length;

    const total_collected = bills
      .filter((b) => b.payment_status === "Paid")
      .reduce((sum, b) => sum + b.total_due, 0);

    const total_pending = bills
      .filter((b) => b.payment_status === "Pending")
      .reduce((sum, b) => sum + b.total_due, 0);

    res.status(200).json({
      success: true,
      summary: {
        total_bills,
        paid_bills,
        pending_bills,
        overdue_bills,
        total_collected,
        total_pending,
        collection_percentage: total_bills > 0 ? ((paid_bills / total_bills) * 100).toFixed(2) : 0,
      },
      data: bills,
    });
  } catch (error) {
    next(error);
  }
};

export const markBillPaid = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const { payment_method } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found.",
      });
    }

    if (bill.payment_status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Bill has already been paid.",
      });
    }

    const previousStatus = bill.payment_status;
    bill.payment_status = "Paid";
    bill.payment_date = new Date();
    bill.payment_method = payment_method || "Cash";
    await bill.save();

    await recordAudit({
      entityType: "Bill",
      entityId: bill._id,
      action: "marked_paid",
      actor: req.user,
      before: { payment_status: previousStatus },
      after: { payment_status: bill.payment_status, payment_method: bill.payment_method, total_due: bill.total_due },
      description: `Bill #${bill._id} marked paid via ${bill.payment_method} (₹${bill.total_due}) by admin`,
    });

    res.status(200).json({
      success: true,
      message: "Bill marked as paid.",
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

export const applyPenalty = async (req, res, next) => {
  try {
    const { billId } = req.params;
    const { penalty_amount } = req.body;

    if (!penalty_amount || penalty_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid penalty_amount is required",
      });
    }

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found.",
      });
    }

    const previousTotalDue = bill.total_due;
    const previousStatus = bill.payment_status;
    bill.penalty_amount = penalty_amount;
    bill.total_due = bill.amount_due + Number(penalty_amount);
    bill.payment_status = "Overdue";

    await bill.save();

    await recordAudit({
      entityType: "Bill",
      entityId: bill._id,
      action: "penalty_applied",
      actor: req.user,
      before: { total_due: previousTotalDue, payment_status: previousStatus },
      after: { total_due: bill.total_due, penalty_amount: bill.penalty_amount, payment_status: bill.payment_status },
      description: `Penalty of ₹${penalty_amount} applied to Bill #${bill._id}, total due ₹${previousTotalDue} → ₹${bill.total_due}`,
    });

    res.status(200).json({
      success: true,
      message: "Penalty applied successfully.",
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const totalResidents = await User.countDocuments({ role: "Resident" });
    const totalFlats = await Flat.countDocuments();
    const occupiedFlats = await Flat.countDocuments({ is_occupied: true });

    const bills = await Bill.find();
    const totalDues = bills.reduce((sum, b) => sum + b.total_due, 0);
    const collectedDues = bills
      .filter((b) => b.payment_status === "Paid")
      .reduce((sum, b) => sum + b.total_due, 0);
    const pendingDues = bills
      .filter((b) => b.payment_status === "Pending")
      .reduce((sum, b) => sum + b.total_due, 0);

    const openComplaints = await Complaint.countDocuments({ status: { $in: ["Pending", "In-Progress"] } });
    const totalComplaints = await Complaint.countDocuments();

    const todayLogs = await GateLog.countDocuments({
      entry_time: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    const recentComplaints = await Complaint.find({ status: { $ne: "Closed" } })
      .populate("resident_id", "username name email")
      .populate("flat_id", "block_name flat_number")
      .populate("assigned_to", "username name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_residents: totalResidents,
          total_flats: totalFlats,
          occupied_flats: occupiedFlats,
          vacancy_rate: totalFlats > 0 ? (((totalFlats - occupiedFlats) / totalFlats) * 100).toFixed(2) : 0,
          total_dues: totalDues,
          collected_dues: collectedDues,
          pending_dues: pendingDues,
          collection_percentage: totalDues > 0 ? ((collectedDues / totalDues) * 100).toFixed(2) : 0,
          open_complaints: openComplaints,
          total_complaints: totalComplaints,
          today_gate_entries: todayLogs,
        },
        recent_complaints: recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { entity_type, entity_id, from_date, to_date, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (entity_type) filter.entity_type = entity_type;
    if (entity_id) filter.entity_id = entity_id;

    if (from_date || to_date) {
      filter.createdAt = {};
      if (from_date) filter.createdAt.$gte = new Date(from_date);
      if (to_date) filter.createdAt.$lte = new Date(to_date);
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

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
