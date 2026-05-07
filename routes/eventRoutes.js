const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { validateId, validateEventId, validateGuestFields} = require('../middleware/validation');
const authorize = require("../middleware/auth");
const {validateEventFields, validateUserExists} = require("../middleware/validation");

router.get('/', authorize(['admin']), eventController.getAllEvents);
router.get('/:id', validateId, eventController.getEventById);
router.post('/', validateUserExists, validateEventFields, eventController.createEvent);
router.put('/:id', validateId, validateEventFields, eventController.updateEvent);
router.delete('/:id', validateId, eventController.deleteEvent);
router.get('/:id', validateId, eventController.getAllGuestsByEvent);
router.post('/:id', validateId, validateGuestFields, eventController.addGuestToEvent);

//
// // עדכון פרטי אירוע (שם, מיקום, תאריך וכו')
// router.patch('/event/:eventId', validateId, eventController.updateEventDetails);
//
// // ביטול או אישור סופי של האירוע (שינוי סטטוס האירוע)
// router.patch('/event/:eventId/status', validateId, eventController.changeEventStatus);
//
// // שליחת הזמנות לכל האורחים באירוע
// router.post('/event/:eventId/send-invitations', validateId, notificationController.sendInvitations);
//
// // שליחת הודעת ביטול אירוע לכל האורחים
// router.post('/event/:eventId/send-cancellation', validateId, notificationController.sendCancellationNotice);
//
// // שליחת בקשה לאישור הגעה (RSVP) לאורח ספציפי או לכולם
// router.post('/event/:eventId/request-approval', validateId, notificationController.sendRSVPRequest);
//
//
// // Get all tasks for a specific event
// const taskController = require("../controllers/taskController");
// router.get('/event/:eventId', taskController.getTasksByEventId);
//
// //
// module.exports = router;