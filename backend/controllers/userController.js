const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

/**
 * Retrieves a paginated list of all users.
 */
const getAllUsers = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'id';

        const result = userService.getAllUsersLogic(page, limit, sortBy);

        res.status(200).json({ success: true, data: result, error: null });
    } catch (error) {
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

/**
 * Finds a single user by their numeric ID.
 */
const getUserById = (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const user = userService.getUserByIdLogic(id);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `User with ID ${id} was not found.`, details : {} }
            });
        }
        res.status(200).json({ success: true, data: user, error: null });
    } catch (error) {
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

/**
 * Handles User Registration.
 * Note: Processes 'req.file' for profile pictures and uses 'async/await'
 * for password hashing or database operations in the service.
 */
const createUser = async (req, res) => {
    try {
        // Handle file upload path if a file was provided via middleware (e.g., Multer)
        let picturePath = null;
        if (req.file){
            picturePath = `/uploads/${req.file.filename}`
        }

        // Merge body data with the generated picture path
        const data = {...req.body, picturePath};
        const newUser = await userService.createUserLogic(data);

        res.status(201).json({
            success: true,
            data: {
                message: "User registered successfully. Please verify user's email.",
                user: { userId: newUser.userId, email: newUser.email },
            },
            error: null
        });
    } catch (error) {
        // Prevent duplicate registrations
        if (error.message === "EMAIL_EXISTS") {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "EMAIL_EXISTS", message: "A user with this email already exists", details:{}}
            });
        }
        res.status(500).json({ success: false, data: null, error: { code: "SERVER_ERROR", message: error.message, details: {}} });
    }
};

/**
 * Updates user profile details.
 */
const updateUser = (req, res) => {
    const id = parseInt(req.params.id);
    try {
        userService.updateUserLogic(id, req.body);

        res.status(200).json({ success: true, data: { userId: id }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null,
                error: { code: "NOT_FOUND", message: `User with id: ${id} not found.`, details:{} } });
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details : {}
            }
        });
    }
};

/**
 * Permanently removes a user record.
 */
const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);
    try {
        userService.deleteUserLogic(id);

        res.status(200).json({ success: true, data: { userId: id }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null,
                error: { code: "NOT_FOUND", message: `User with id: ${id} not found.`, details:{} } });
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details : {}
            }
        });
    }
};

/**
 * Finalizes the email verification process using a code sent to the user.
 */
const completeEmailVerification = async (req, res) => {
    try {
        const { email, code } = req.body;
        const {user, token} = await userService.completeEmailVerificationLogic(email, code);
        const { password, ...safeUserCopy } = user;
        res.status(200).json({
            success: true,
            data: { user: safeUserCopy, token: token, message: "users email has been verified." },
            error: null
        });
    } catch (error) {
        // Handle incorrect or expired OTP codes
        if (error.message === "INVALID_CODE") {
            return res.status(400).json({ success: false, data: null, error: { code: "INVALID_CODE", message: "The verification code is incorrect or expired", details:{} } });
        }
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `User with email ${req.body.email} was not found.`, details:{} } });
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details : {}
            }
        });
    }
};

/**
 * Authenticates user credentials.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const {user, token} = await userService.loginLogic(email, password);
        const { password: _, ...safeUserCopy } = user;

        res.status(200).json({
            success: true,
            data: {
                user: safeUserCopy,
                token: token
            },
            error: null
        });
    } catch (error) {
        // Specific errors for security: distinct messages for missing email vs wrong password
        if (error.message === "EMAIL_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "Email not exists", details:{} } });
        }
        if (error.message === "EMAIL_NOT_VERIFIED"){
            return res.status(401).json({ success: false, data: null, error: { code: "EMAIL_NOT_VERIFIED", message: "Email is not verified", details:{} } });
        }
        if (error.message === "INCORRECT_PASSWORD") {
            return res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Incorrect password", details:{} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "SERVER_ERROR", message: error.message, details: {} } });
    }
};

/**
 * Triggers the sending of a new OTP/Verification code to the user's email.
 */
const sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        await userService.sendVerificationCodeLogic(email);
        res.status(200).json({ success: true, data: { message: "Verification code sent to email" }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "User with this email not found" , details:{} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "SERVER_ERROR", message: error.message , details: {} } });
    }
};

/**
 * Updates the user's password, typically used after a successful "Forgot Password" flow.
 */
const resetPassword = async (req, res) => {
    const { email, newPassword, code } = req.body;
    try {
        await userService.resetPasswordLogic(email, newPassword, code);

        res.status(200).json({ success: true, data: { message: "Password updated successfully" }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `User with id: ${userId} not found.`, details:{} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "SERVER_ERROR", message: error.message, details: {} } });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, login, sendVerificationCode, resetPassword, completeEmailVerification };