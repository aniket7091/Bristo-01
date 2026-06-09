const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

const GST_RATE = 0.18;

const generateInvoiceNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const count = await Order.countDocuments({
    invoiceNumber: { $ne: '' },
    createdAt: { $gte: startOfDay }
  });
  const serial = String(count + 1).padStart(4, '0');
  return `BRS-${dateStr}-${serial}`;
};

const createOrder = async (req, res, next) => {
  try {
    const { customerName, tableNumber, items } = req.body;

    if (!customerName || !tableNumber || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, table number, and at least one item are required.'
      });
    }

    const normalizedTable = Number(tableNumber);
    if (Number.isNaN(normalizedTable) || normalizedTable < 1) {
      return res.status(400).json({ success: false, message: 'Table number must be a valid positive number.' });
    }

    const menuIds = items.map((item) => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuIds } });
    const menuMap = new Map(menuItems.map((item) => [item._id.toString(), item]));

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = menuMap.get(item.menuItemId);
      const quantity = Number(item.quantity);

      if (!menuItem) {
        return res.status(404).json({ success: false, message: 'One or more selected menu items no longer exist.' });
      }

      if (Number.isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each order item quantity must be at least 1.' });
      }

      subtotal += menuItem.price * quantity;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        imageUrl: menuItem.imageUrl
      });
    }

    const gstAmount = Math.round(subtotal * GST_RATE * 100) / 100;
    const totalAmount = subtotal + gstAmount;

    const order = await Order.create({
      customerName: customerName.trim(),
      tableNumber: normalizedTable,
      items: orderItems,
      subtotal,
      gstAmount,
      totalAmount,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Order placed successfully.', order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { status, tableNumber } = req.query;
    const query = {};

    if (status) {
      if (['pending', 'preparing', 'ready', 'completed'].includes(status)) {
        query.status = status;
      } else if (status === 'current') {
        // Backward compatibility: "current" maps to all non-completed statuses
        query.status = { $in: ['pending', 'preparing', 'ready'] };
      }
    }

    if (tableNumber) {
      query.tableNumber = Number(tableNumber);
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const groupedOrders = orders.reduce((accumulator, order) => {
      const tableKey = `Table ${order.tableNumber}`;
      if (!accumulator[tableKey]) {
        accumulator[tableKey] = [];
      }
      accumulator[tableKey].push(order);
      return accumulator;
    }, {});

    res.json({ success: true, count: orders.length, groupedOrders, orders });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, estimatedMinutes } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updateData = { status };

    if (estimatedMinutes && Number(estimatedMinutes) >= 1) {
      updateData.estimatedMinutes = Number(estimatedMinutes);
    }

    // Auto-generate invoice number when completing
    if (status === 'completed') {
      updateData.invoiceNumber = await generateInvoiceNumber();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (error) {
    next(error);
  }
};

const getOrderByIdPublic = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        customerName: order.customerName,
        tableNumber: order.tableNumber,
        items: order.items,
        subtotal: order.subtotal,
        gstAmount: order.gstAmount,
        totalAmount: order.totalAmount,
        status: order.status,
        estimatedMinutes: order.estimatedMinutes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Invoice can only be generated for completed orders.' });
    }

    res.json({
      success: true,
      invoice: {
        invoiceNumber: order.invoiceNumber,
        date: order.updatedAt || order.createdAt,
        customerName: order.customerName,
        tableNumber: order.tableNumber,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          lineTotal: item.price * item.quantity
        })),
        subtotal: order.subtotal,
        gstRate: GST_RATE * 100,
        gstAmount: order.gstAmount,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderByIdPublic,
  getInvoice
};
