import FamilyMember from "../models/FamilyMember.js";
import User from "../models/User.js";

async function resolveFlatId(req) {
  if (req.user.flat_id) return req.user.flat_id;
  const user = await User.findById(req.user.id);
  return user?.flat_id || null;
}

export const getFamilyMembers = async (req, res, next) => {
  try {
    const flatId = await resolveFlatId(req);
    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const members = await FamilyMember.find({ resident_id: req.user.id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const addFamilyMember = async (req, res, next) => {
  try {
    const { name, relationship, age, phone_number } = req.body;

    if (!name || !relationship) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, relationship",
      });
    }

    const flatId = await resolveFlatId(req);
    if (!flatId) {
      return res.status(400).json({
        success: false,
        message: "No flat associated with this resident account.",
      });
    }

    const member = await FamilyMember.create({
      resident_id: req.user.id,
      flat_id: flatId,
      name,
      relationship,
      age: age || null,
      phone_number: phone_number || "",
    });

    res.status(201).json({
      success: true,
      message: "Family member added successfully.",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFamilyMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await FamilyMember.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Family member not found.",
      });
    }

    if (String(member.resident_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove this entry.",
      });
    }

    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: "Family member removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
