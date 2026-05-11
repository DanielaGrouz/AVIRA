const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateId, validateEventFields, validateUserExists, validateGuestFields } = require('../middleware/validation');
const authorize = require("../middleware/auth");
const {upload} = require("../middleware/fileUpload");

// Search and Browse (Placed first to avoid conflicts with /:id)
router.get('/search', eventController.searchEvents);
router.get('/browse', eventController.browseEvents);

// Filtered Retrieval
router.get('/creator/:creatorId', eventController.getEventsByCreator);
router.get('/guest/name/:name', eventController.getEventsByGuestName);
router.get('/guest/phone/:phone', eventController.getEventsByPhone);

// Standard CRUD Operations
router.get('/', authorize(['admin']), eventController.getAllEvents);
router.get('/:id', validateId, eventController.getEventById);
router.post('/', validateUserExists, validateEventFields, eventController.createEvent);
router.put('/:id', validateId, validateEventFields, eventController.updateEvent);
router.delete('/:id', validateId, eventController.deleteEvent);

// Sub-resources (Guests and Tasks for a specific event)
// Changed to /:id/guests to avoid collision with getEventById
router.get('/:id/guests', validateId, eventController.getAllGuestsByEvent);
router.post('/:id/guests', validateId, validateGuestFields, eventController.addGuestToEvent);
router.delete('/:id/guests/:guestId', validateId, eventController.removeGuestFromEvent);
router.put('/:id/guests/:guestId', validateId, validateGuestFields, eventController.updateGuestInEvent);
router.patch('/:id/guests/:guestId/rsvp', validateId, eventController.confirmGuestAttendance);
router.get('/:id/tasks', validateId, eventController.getTasksByEventId);
router.post('/:id/tasks', validateId, eventController.addTaskToEvent);
router.put('/:id/tasks/:taskId', validateId, eventController.updateTaskInEvent);
router.delete('/:id/tasks/:taskId', validateId, eventController.removeTaskFromEvent);

router.get('/:id/generate-invite', validateId, eventController.generateInvite);
router.get('/:id/shopping-list', validateId, eventController.generateShoppingList);
router.get('/:id/task-list', validateId, eventController.generateTaskList);
router.get('/:id/find-stores', validateId, eventController.findStores);
router.put('/:id/save-invitation', upload.single('picture'), validateId, eventController.saveInvitation);

module.exports = router;