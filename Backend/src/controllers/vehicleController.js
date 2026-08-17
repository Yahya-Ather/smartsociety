import Vehicle from "../models/Vehicle.js";
import User from "../models/User.js";
import Flat from "../models/Flat.js";

export const getVehicles = async (req, res, next) => {
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

    const vehicles = await Vehicle.find({ resident_id: req.user.id, is_active: true });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const registerVehicle = async (req, res, next) => {
  try {
    const { vehicle_number, vehicle_type, vehicle_model, color } = req.body;

    if (!vehicle_number || !vehicle_type || !vehicle_model) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: vehicle_number, vehicle_type, vehicle_model",
      });
    }

    const existingVehicle = await Vehicle.findOne({ vehicle_number: vehicle_number.toUpperCase() });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number already registered.",
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

    const vehicle = await Vehicle.create({
      resident_id: req.user.id,
      flat_id: flatId,
      vehicle_number: vehicle_number.toUpperCase(),
      vehicle_type,
      vehicle_model,
      color: color || "",
      is_active: true,
    });

    const flat = await Flat.findById(flatId);
    if (flat) {
      flat.registered_vehicles = (flat.registered_vehicles || 0) + 1;
      await flat.save();
    }

    res.status(201).json({
      success: true,
      message: "Vehicle registered successfully.",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vehicle_model, color, vehicle_type } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    if (String(vehicle.resident_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this vehicle.",
      });
    }

    if (vehicle_model) vehicle.vehicle_model = vehicle_model;
    if (color) vehicle.color = color;
    if (vehicle_type) vehicle.vehicle_type = vehicle_type;

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const deregisterVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    if (String(vehicle.resident_id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to deregister this vehicle.",
      });
    }

    vehicle.is_active = false;
    await vehicle.save();

    const flat = await Flat.findById(vehicle.flat_id);
    if (flat && flat.registered_vehicles > 0) {
      flat.registered_vehicles -= 1;
      await flat.save();
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deregistered successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ is_active: true })
      .populate("resident_id", "username email")
      .populate("flat_id", "block_name flat_number");

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};
