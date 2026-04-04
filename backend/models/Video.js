const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail URL is required'],
  },
  s3Key: {
    type: String,
    required: [true, 'S3 Key is required'],
    unique: true,
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: [
      'Gaming',
      'Album Songs',
      'Movie Scenes',
      'Racing',
      'Cartoons',
      'News',
      'Sports',
      'Documentary',
      'Comedy',
      'Technology',
      'Education',
      'Travel'
    ],
  },
  views: {
    type: Number,
    default: 0,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster genre-based queries
videoSchema.index({ genre: 1 });

// Index for search functionality
videoSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Video', videoSchema);