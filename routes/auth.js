// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      bloodGroup,
      city,
      lastDonationDate,
      isAvailable
    } = req.body;

    if (!name || !email || !password || !phone || !bloodGroup || !city) {
      return res.status(400).json({ msg: 'Please fill all required fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashed,
      phone,
      bloodGroup,
      city,
      lastDonationDate: lastDonationDate || null,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      role: 'user'
    });

    await user.save();

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/auth/me  -> current logged-in user (for prefill)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error('Get me error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/auth/me  -> update donor details (email, role not editable)
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, bloodGroup, city, lastDonationDate, isAvailable } =
      req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (bloodGroup !== undefined) updates.bloodGroup = bloodGroup;
    if (city !== undefined) updates.city = city;
    if (typeof isAvailable === 'boolean') updates.isAvailable = isAvailable;
    if (lastDonationDate) updates.lastDonationDate = lastDonationDate;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    console.error('Update me error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
