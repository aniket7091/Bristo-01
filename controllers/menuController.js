const MenuItem = require('../models/MenuItem');

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const getMenuItems = async (req, res, next) => {
  try {
    const { search = '', category = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, createdAt: -1 });

    res.json({ success: true, count: menuItems.length, menuItems });
  } catch (error) {
    next(error);
  }
};

const getMenuItemById = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    res.json({ success: true, menuItem });
  } catch (error) {
    next(error);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const name = normalizeText(req.body.name);
    const category = normalizeText(req.body.category);
    const description = normalizeText(req.body.description);
    const imageUrl = normalizeText(req.body.imageUrl);
    const imageFileId = normalizeText(req.body.imageFileId);
    const price = Number(req.body.price);

    if (!name || !category || !imageUrl || Number.isNaN(price)) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, and imageUrl are required.'
      });
    }

    const menuItem = await MenuItem.create({
      name,
      category,
      description,
      imageUrl,
      imageFileId,
      price,
      isAvailable: req.body.isAvailable !== false
    });

    res.status(201).json({ success: true, message: 'Menu item created successfully.', menuItem });
  } catch (error) {
    next(error);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const updates = {};
    ['name', 'category', 'description', 'imageUrl', 'imageFileId'].forEach((field) => {
      if (field in req.body) {
        updates[field] = normalizeText(req.body[field]);
      }
    });

    if ('price' in req.body) {
      const price = Number(req.body.price);
      if (Number.isNaN(price)) {
        return res.status(400).json({ success: false, message: 'Price must be a valid number.' });
      }
      updates.price = price;
    }

    if ('isAvailable' in req.body) {
      updates.isAvailable = Boolean(req.body.isAvailable);
    }

    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    res.json({ success: true, message: 'Menu item updated successfully.', menuItem });
  } catch (error) {
    next(error);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    res.json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
