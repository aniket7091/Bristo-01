const jwt = require('jsonwebtoken');
const Owner = require('../models/Owner');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '7d'
  });

const signupOwner = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingOwner = await Owner.findOne({ email: email.toLowerCase() });
    if (existingOwner) {
      return res.status(409).json({ success: false, message: 'An owner account already exists with this email.' });
    }

    const owner = await Owner.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Owner account created successfully.',
      token: generateToken(owner._id),
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginOwner = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const owner = await Owner.findOne({ email: email.toLowerCase() });
    if (!owner || !(await owner.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      token: generateToken(owner._id),
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOwnerProfile = async (req, res) => {
  res.json({ success: true, owner: req.owner });
};

module.exports = {
  signupOwner,
  loginOwner,
  getOwnerProfile
};
