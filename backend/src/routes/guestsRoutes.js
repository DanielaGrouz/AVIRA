const express = require('express');
const router = express.Router();
const { authorize, validateEventId } = require('../middleware/auth');
const eventController = require('../controllers/eventController');
const validate = require('../middleware/validation');
const {
  idSchema,
  idAndGuestIdSchema,
  guestSchema,
  rsvpBodySchema,
  tokenParamSchema,
  guestPaginationSchema,
} = require('../middleware/schemas');
const { VALID_ROLES } = require('../../models/constants');

router.get(
  '/:id/guests',
  authorize(VALID_ROLES),
  validate(idSchema, 'params'),
  validateEventId,
  validate(guestPaginationSchema, 'query'),
  eventController.getAllGuestsByEvent
);
router.post(
  '/:id/guests',
  authorize(VALID_ROLES),
  validate(idSchema, 'params'),
  validateEventId,
  validate(guestSchema, 'body'),
  eventController.addGuestToEvent
);
router.delete(
  '/:id/guests/:guestId',
  authorize(VALID_ROLES),
  validate(idAndGuestIdSchema, 'params'),
  validateEventId,
  eventController.removeGuestFromEvent
);
router.put(
  '/:id/guests/:guestId',
  authorize(VALID_ROLES),
  validate(idAndGuestIdSchema, 'params'),
  validateEventId,
  validate(guestSchema, 'body'),
  eventController.updateGuestInEvent
);
router.patch('/guests/rsvp', validate(rsvpBodySchema, 'body'), eventController.updateGuestRSVP);
router.get(
  '/guests/rsvp/:token',
  validate(tokenParamSchema, 'params'),
  eventController.getGuestRSVPData
);

module.exports = router;
