import EmergencyContact from "../models/EmergencyContact.js";
import User from "../models/User.js";

export const getEmergencyContacts = async (req, res, next) => {
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

    const contacts = await EmergencyContact.find({ resident_id: req.user.id }).sort({ is_primary: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const addEmergencyContact = async (req, res, next) => {
  try {
    const {
      contact_name,
      relationship,
      phone_number,
      email,
      address,
      is_primary,
    } = req.body;

    if (!contact_name || !relationship || !phone_number) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: contact_name, relationship, phone_number",
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

    const contact = await EmergencyContact.create({
      resident_id: req.user.id,
      flat_id: flatId,
      contact_name,
      relationship,
      phone_number,
      email: email || "",
      address: address || "",
      is_primary: is_primary || false,
    });

    res.status(201).json({
      success: true,
      message: "Emergency contact added successfully.",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmergencyContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      contact_name,
      relationship,
      phone_number,
      email,
      address,
      is_primary,
    } = req.body;

    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found.",
      });
    }

    if (String(contact.resident_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this contact.",
      });
    }

    if (contact_name) contact.contact_name = contact_name;
    if (relationship) contact.relationship = relationship;
    if (phone_number) contact.phone_number = phone_number;
    if (email) contact.email = email;
    if (address) contact.address = address;
    if (is_primary !== undefined) contact.is_primary = is_primary;

    await contact.save();

    res.status(200).json({
      success: true,
      message: "Emergency contact updated successfully.",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmergencyContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found.",
      });
    }

    if (String(contact.resident_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this contact.",
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: "Emergency contact deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found.",
      });
    }

    if (String(contact.resident_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this contact.",
      });
    }

    await EmergencyContact.updateMany(
      { resident_id: req.user.id, _id: { $ne: id } },
      { is_primary: false },
    );

    contact.is_primary = true;
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Primary emergency contact updated successfully.",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};
