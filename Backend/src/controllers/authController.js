import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Flat from '../models/Flat.js';

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      flat_id: user.flat_id?._id || user.flat_id
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
}

// Shapes a User doc (with flat_id populated) into what the frontend's
// AuthContext expects — it needs a display name, initials, and flat/block
// strings up front rather than a bare id it would have to look up itself.
function toClientUser(user) {
  const flat = user.flat_id && typeof user.flat_id === 'object' ? user.flat_id : null;

  return {
    id: user._id,
    username: user.username,
    name: user.name,
    role: user.role.toLowerCase(),
    email: user.email,
    phone: user.phone_number || '',
    flat: flat ? `${flat.block_name.replace(/^Tower\s*/i, '')}-${flat.flat_number}` : null,
    block: flat ? flat.block_name : null,
    occupancyType: flat ? flat.occupancy_type : null,
    gate: user.role === 'Guard' ? user.gate || null : undefined,
    society: 'Green Valley'
  };
}

// Public — validates credentials and issues a token directly. No OTP step.
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.'
      });
    }

    const user = await User.findOne({ username }).populate('flat_id');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your registration is still being verified by the Society Admin. Try again in a working day.'
      });
    }

    user.last_login = new Date();
    await user.save();

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: toClientUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// Public — residents self-register here (Admin/Guard accounts are created by
// the Society Admin only, matching the SRS and the frontend's Register page).
// Accounts start inactive; an Admin has to verify and activate them before
// they can log in (see the is_active check in `login` above).
export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, block, flat, occupancyType, password } = req.body;

    if (!fullName || !email || !flat || !occupancyType || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, flat number, occupancy type and password are required.'
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const blockName = block || 'Tower B';
    let flatDoc = await Flat.findOne({ block_name: blockName, flat_number: flat });
    if (!flatDoc) {
      flatDoc = await Flat.create({
        block_name: blockName,
        flat_number: flat,
        occupancy_type: occupancyType,
        owner_name: occupancyType === 'Owner' ? fullName : '',
        owner_phone: occupancyType === 'Owner' ? phone || '' : '',
        is_occupied: true
      });
    }

    // Base the username on the email's local part, disambiguating on collision
    // (e.g. aarav.mehta, aarav.mehta2, aarav.mehta3 ...).
    const base = email.split('@')[0].toLowerCase();
    let username = base;
    let suffix = 1;
    while (await User.findOne({ username })) {
      suffix += 1;
      username = `${base}${suffix}`;
    }

    const user = await User.create({
      username,
      name: fullName,
      email: email.toLowerCase(),
      phone_number: phone || '',
      password,
      role: 'Resident',
      flat_id: flatDoc._id,
      is_active: false
    });

    res.status(201).json({
      success: true,
      message: 'Account created. Your details are verified against the society register before access is granted — usually within one working day.',
      data: { id: user._id, username: user.username }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with these details already exists.'
      });
    }
    next(error);
  }
};
