const ContactMessage = require('../models/ContactMessage');

const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    await ContactMessage.create({ name, email, message });

    res.status(201).json({
      success: true,
      message: 'Thanks for reaching out. Your message has been received.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContactMessage };
