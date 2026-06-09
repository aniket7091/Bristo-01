const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    excerpt: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['brewing', 'culture', 'recipes', 'sustainability', 'news'],
      default: 'news'
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      trim: true,
      default: 'Bristo Team'
    },
    readTime: {
      type: String,
      trim: true,
      default: '3 min read'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogPost', blogPostSchema);
