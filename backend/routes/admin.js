const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/admin/videos
// @desc    Add new video
// @access  Private/Admin
router.post('/videos', protect, admin, async (req, res) => {
  try {
    const { title, description, thumbnail, s3Key, duration, genre } = req.body;

    // Validation
    if (!title || !description || !thumbnail || !s3Key || !duration || !genre) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if s3Key already exists
    const existingVideo = await Video.findOne({ s3Key });
    if (existingVideo) {
      return res.status(400).json({ message: 'Video with this S3 key already exists' });
    }

    const video = await Video.create({
      title,
      description,
      thumbnail,
      s3Key,
      duration,
      genre,
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Server error creating video' });
  }
});

// @route   PUT /api/admin/videos/:id
// @desc    Update video
// @access  Private/Admin
router.put('/videos/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, thumbnail, s3Key, duration, genre } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Update fields
    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;
    video.s3Key = s3Key || video.s3Key;
    video.duration = duration || video.duration;
    video.genre = genre || video.genre;

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Server error updating video' });
  }
});

// @route   DELETE /api/admin/videos/:id
// @desc    Delete video
// @access  Private/Admin
router.delete('/videos/:id', protect, admin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Server error deleting video' });
  }
});

// @route   GET /api/admin/videos
// @desc    Get all videos for admin (includes all metadata)
// @access  Private/Admin
router.get('/videos', protect, admin, async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadDate: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Server error fetching videos' });
  }
});

module.exports = router;