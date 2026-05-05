const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
// const { validateId } = require('../middleware/validationMiddleware');

router.get('/', authorize(['admin']), eventController.getAllEvents);

module.exports = router;