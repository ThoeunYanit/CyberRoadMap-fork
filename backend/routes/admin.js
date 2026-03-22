const express = require('express');
const router = express.Router();
const {
  getAllResources, addResource, updateResource, deleteResource,
  getAllUsers, getStats, addSpecialist,
  getQuestions, addQuestion, updateQuestion, deleteQuestion
} = require('../controllers/adminController');
const {
  getTraitDistribution,
  getCareerDistribution,
  getLowConfidenceUsers,
  getOverview,
} = require('../assessment/analytics');
const verifyToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(verifyToken, adminOnly);

// Resources
router.get('/resources', getAllResources);
router.post('/resources', addResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// Users
router.get('/users', getAllUsers);

// Stats
router.get('/stats', getStats);

// Specialists
router.post('/specialists', addSpecialist);

// Questions
router.get('/questions', getQuestions);
router.post('/questions', addQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Analytics
router.get('/analytics/overview', getOverview);
router.get('/analytics/traits', getTraitDistribution);
router.get('/analytics/careers', getCareerDistribution);
router.get('/analytics/confidence', getLowConfidenceUsers);

module.exports = router;