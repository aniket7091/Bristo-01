const express = require('express');
const { createOrder, getOrders, updateOrderStatus, getOrderByIdPublic, getInvoice } = require('../controllers/orderController');
const { protectOwner } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createOrder);
router.get('/', protectOwner, getOrders);
router.patch('/:id/status', protectOwner, updateOrderStatus);
router.get('/:id/track', getOrderByIdPublic);
router.get('/:id/invoice', protectOwner, getInvoice);

module.exports = router;
