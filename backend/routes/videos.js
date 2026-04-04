const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { getSignedUrl } = require('../config/aws');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/videos
// @desc    Get all videos (with optional genre filter)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { genre } = req.query;
    
    let query = {};
    if (genre) {
      query.genre = genre;
    }

    const videos = await Video.find(query).sort({ uploadDate: -1 });

    // Add signed URLs to each video
    const videosWithUrls = videos.map(video => {
      const signedUrl = getSignedUrl(video.s3Key);
      return {
        ...video.toObject(),
        videoUrl: signedUrl,
      };
    });

    res.json(videosWithUrls);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Server error fetching videos' });
  }
});

// @route   GET /api/videos/genres
// @desc    Get all unique genres
// @access  Private
router.get('/genres', protect, async (req, res) => {
  try {
    const genres = await Video.distinct('genre');
    res.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Server error fetching genres' });
  }
});

// @route   GET /api/videos/search
// @desc    Search videos by title or description
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const videos = await Video.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    // Add signed URLs
    const videosWithUrls = videos.map(video => {
      const signedUrl = getSignedUrl(video.s3Key);
      return {
        ...video.toObject(),
        videoUrl: signedUrl,
      };
    });

    res.json(videosWithUrls);
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ message: 'Server error searching videos' });
  }
});

// @route   GET /api/videos/:id
// @desc    Get single video by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    // Generate signed URL
    const signedUrl = getSignedUrl(video.s3Key);

    res.json({
      ...video.toObject(),
      videoUrl: signedUrl,
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Server error fetching video' });
  }
});

module.exports = router;