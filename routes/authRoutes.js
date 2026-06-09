const express = require('express');
const { signupOwner, loginOwner, getOwnerProfile } = require('../controllers/authController');
const { protectOwner } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signupOwner);
router.post('/login', loginOwner);
router.get('/me', protectOwner, getOwnerProfile);

module.exports = router;
