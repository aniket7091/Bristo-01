const express = require('express');
const {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} = require('../controllers/blogController');
const { protectOwner } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/',     getBlogPosts);
router.get('/:id',  getBlogPostById);
router.post('/',    protectOwner, createBlogPost);
router.put('/:id',  protectOwner, updateBlogPost);
router.delete('/:id', protectOwner, deleteBlogPost);

module.exports = router;
