const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/applications/apply/:jobId (Protected: Seeker only)
router.post('/apply/:jobId', authMiddleware, applicationController.applyForJob);

// GET /api/applications/job/:jobId (Protected: Employer only)
router.get('/job/:jobId', authMiddleware, applicationController.getJobApplications);

module.exports = router;