const BlogPost = require('../models/BlogPost');

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

/* GET /api/blog  — public, supports ?category=&featured= */
const getBlogPosts = async (req, res, next) => {
  try {
    const query = { isPublished: true };
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === 'true') query.isFeatured = true;

    const posts = await BlogPost.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

/* GET /api/blog/:id — public */
const getBlogPostById = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post || !post.isPublished) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

/* POST /api/blog — protected (owner) */
const createBlogPost = async (req, res, next) => {
  try {
    const title    = normalizeText(req.body.title);
    const excerpt  = normalizeText(req.body.excerpt);
    const category = normalizeText(req.body.category);
    const imageUrl = normalizeText(req.body.imageUrl);

    if (!title || !excerpt || !category || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, category, and imageUrl are required.'
      });
    }

    const post = await BlogPost.create({
      title,
      excerpt,
      category,
      imageUrl,
      author:     normalizeText(req.body.author) || 'Bristo Team',
      readTime:   normalizeText(req.body.readTime) || '3 min read',
      isFeatured: req.body.isFeatured === true || req.body.isFeatured === 'true',
      isPublished: req.body.isPublished !== false && req.body.isPublished !== 'false'
    });

    res.status(201).json({ success: true, message: 'Blog post created.', post });
  } catch (error) {
    next(error);
  }
};

/* PUT /api/blog/:id — protected (owner) */
const updateBlogPost = async (req, res, next) => {
  try {
    const updates = {};
    ['title', 'excerpt', 'category', 'imageUrl', 'author', 'readTime'].forEach((field) => {
      if (field in req.body) updates[field] = normalizeText(req.body[field]);
    });
    if ('isFeatured' in req.body)  updates.isFeatured  = Boolean(req.body.isFeatured);
    if ('isPublished' in req.body) updates.isPublished = Boolean(req.body.isPublished);

    const post = await BlogPost.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    res.json({ success: true, message: 'Blog post updated.', post });
  } catch (error) {
    next(error);
  }
};

/* DELETE /api/blog/:id — protected (owner) */
const deleteBlogPost = async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Blog post deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost };
