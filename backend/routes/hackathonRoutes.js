const express = require('express');
const { 
    submitHackathon, 
    getMyHackathons, 
    getAssignedHackathons, 
    updateHackathonStatus, 
    getAcceptedHackathons,
    getHackathonsByYear,
    getHackathonParticipants,
    getStudentHackathons,
    getHackathonStats
} = require('../controllers/hackathonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

// Student routes
router.post('/submit', protect, authorize('student'), upload.fields([
    { name: 'certificate', maxCount: 1 }
]), submitHackathon);
router.get('/my-hackathons', protect, authorize('student'), getMyHackathons);

// Proctor/Staff routes
router.get('/assigned', protect, authorize('proctor'), getAssignedHackathons);
router.put('/:id/status', protect, authorize('proctor'), updateHackathonStatus);

// Staff filtering and analytics routes
router.get('/by-year', protect, authorize('proctor', 'admin'), getHackathonsByYear);
router.get('/participants', protect, authorize('proctor', 'admin'), getHackathonParticipants);
router.get('/student/:studentId', protect, authorize('proctor', 'admin'), getStudentHackathons);
router.get('/stats', protect, authorize('proctor', 'admin'), getHackathonStats);

// Public route
router.get('/accepted', getAcceptedHackathons);

module.exports = router;
