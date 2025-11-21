const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const donors = await User.find({ role: 'user' }).select('-password');
    res.json(donors);
  } catch (err) {
    console.error('Get donors error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
