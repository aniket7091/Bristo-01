const express = require('express');
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protectOwner } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', protectOwner, createMenuItem);
router.put('/:id', protectOwner, updateMenuItem);
router.delete('/:id', protectOwner, deleteMenuItem);

module.exports = router;
