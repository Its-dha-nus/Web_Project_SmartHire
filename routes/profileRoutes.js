const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/profiles/seeker
// Notice how authMiddleware is placed in the middle!
router.post('/seeker', authMiddleware, profileController.createSeekerProfile);

// POST /api/profiles/employer
router.post('/employer', authMiddleware, profileController.createEmployerProfile);
// PUT /api/profiles/me
router.put('/me', authMiddleware, profileController.updateMyProfile);
// GET /api/profiles/applicant/:applicationId
router.get('/applicant/:applicationId', authMiddleware, profileController.getApplicantByApplicationId);
// GET /api/profiles/me
router.get('/me', authMiddleware, profileController.getMyProfile);

module.exports = router;