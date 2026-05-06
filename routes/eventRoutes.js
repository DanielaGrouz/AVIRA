// const express = require('express');
// const router = express.Router();
// const eventController = require('../controllers/eventController');
// const { validateId } = require('../middleware/validation');
// const authorize = require("../middleware/auth");
// const userController = require("../controllers/userController");
// const {validateUserFields} = require("../middleware/validation");
// const guestController = require("../controllers/guestController");
//
// router.get('/', authorize(['admin']), eventController.getAllEvents);
// router.get('/:id', validateId, userController.getEventById);
// router.post('/', validateUserFields, userController.createEvent);
// router.put('/:id', validateId, validateUserFields, userController.updateEvent);
// router.delete('/:id', validateId, userController.deleteEvent);
// router.get('/:eventId', validateId, eventController.getAllGuestsByEvent);
//
// router.post('/event/:eventId', validateId, validateGuestFields, guestController.addGuestToEvent);
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
//
// module.exports = router;