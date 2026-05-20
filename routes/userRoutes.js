const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // import user logic
const authorize = require('../middleware/auth');
const { validateId, validateUserFields, validateOptionalUserFields } = require('../middleware/validation');
const {upload} = require("../middleware/fileUpload");


router.get('/',authorize(['admin']), userController.getAllUsers);
router.get('/:id', validateId, userController.getUserById);
router.post('/', upload.single('picture'), validateUserFields, userController.createUser);
router.put('/:id', validateId, validateOptionalUserFields, userController.updateUser);
router.delete('/:id', authorize(['admin']), validateId, userController.deleteUser);
router.post('/login', userController.login);
router.post('/send-verification-code', userController.sendVerificationCode);
router.post('/verify-email', userController.completeEmailVerification);
router.post('/reset-password', userController.resetPassword);

module.exports = router;