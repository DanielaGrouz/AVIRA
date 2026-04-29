const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateId } = require('../middleware/validationMiddleware');

router.get('/', eventController.getAllEvents);
router.get('/:id', validateId, eventController.getEventWithDetails);
router.get('/:id/ai-shopping-list', validateId, eventController.generateAIShoppingList);

module.exports = router;