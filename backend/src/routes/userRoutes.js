const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authorize, validateOwnUserId} = require('../middleware/auth');
const {upload} = require("../middleware/fileUpload");

const validate = require('../middleware/validation');
const {
    idSchema,
    userSchema,
    optionalUserSchema,
    loginSchema,
    emailSchema,
    verifyEmailSchema,
    resetPasswordSchema,
    userPaginationSchema
} = require('../middleware/schemas');
const {VALID_ROLES, ADMIN_ROLE} = require("../../models/constants");

router.get(
    '/',
    authorize([ADMIN_ROLE]),
    validate(userPaginationSchema, 'query'),
    userController.getAllUsers);
router.get('/:id', authorize(VALID_ROLES), validate(idSchema, 'params'), validateOwnUserId, userController.getUserById);

// Multer runs first to populate req.body, then Zod validates it
router.post('/', upload.single('picture'), validate(userSchema, 'body'), userController.createUser);
router.put('/:id', authorize(VALID_ROLES), validate(idSchema, 'params'), validateOwnUserId, upload.single('picture'), validate(optionalUserSchema, 'body'), userController.updateUser);

router.delete('/:id', authorize([ADMIN_ROLE]), validate(idSchema, 'params'), userController.deleteUser);
router.post('/login', validate(loginSchema, 'body'), userController.login);
router.post('/send-verification-code', validate(emailSchema, 'body'), userController.sendVerificationCode);
router.post('/verify-email', validate(verifyEmailSchema, 'body'), userController.completeEmailVerification);
router.post('/reset-password', validate(resetPasswordSchema, 'body'), userController.resetPassword);

module.exports = router;