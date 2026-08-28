const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/jobs (Protected: Only logged-in employers can post)
router.post('/', authMiddleware, jobController.createJob);

// GET /api/jobs (Public: Anyone can view the explore page)
router.get('/', jobController.getAllJobs);

// GET /api/jobs/employer/dashboard
router.get('/employer/dashboard', authMiddleware, jobController.getEmployerDashboard);

// GET /api/jobs/seeker/dashboard
router.get('/seeker/dashboard', authMiddleware, jobController.getSeekerDashboard);

// PUT /api/jobs/applications/:applicationId/status
router.put('/applications/:applicationId/status', authMiddleware, jobController.updateApplicationStatus);

// GET /api/jobs/saved (Get all saved jobs for a seeker)
// MUST BE ABOVE THE /:id ROUTE!
router.get('/saved', authMiddleware, jobController.getSavedJobs);

// GET /api/jobs/:id (Public: Anyone can view job details)
router.get('/:id', jobController.getJobById);

// POST /api/jobs/:jobId/apply
router.post('/:jobId/apply', authMiddleware, applicationController.applyForJob);

// POST /api/jobs/:id/save (Toggle save status)
router.post('/:id/save', authMiddleware, jobController.toggleSaveJob);

// DELETE /api/jobs/:id (Employer only)
router.delete('/:id', authMiddleware, jobController.deleteJob);

// PUT /api/jobs/:id (Employer only)
router.put('/:id', authMiddleware, jobController.updateJob);

module.exports = router;