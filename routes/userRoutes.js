const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // import user logic
const authorize = require('../middleware/auth');
const { validateId, validateUserFields } = require('../middleware/validation');


router.get('/',authorize(['admin']), userController.getAllUsers);
router.get('/:id', validateId, userController.getUserById);
router.post('/', validateUserFields, userController.createUser);
router.put('/:id', validateId, validateUserFields, userController.updateUser);
router.delete('/:id', validateId, userController.deleteUser);
router.post('/login', userController.login);
router.post('/send-verification-code', userController.sendVerificationCode);
router.post('/verify-email', userController.completeEmailVerification);
router.post('/reset-password', userController.resetPassword);

module.exports = router;