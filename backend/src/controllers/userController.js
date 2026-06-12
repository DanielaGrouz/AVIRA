const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'userId';

        const result = await userService.getAllUsersLogic(page, limit, sortBy);

        res.status(200).json({ success: true, data: result, error: null });
    } catch (error) {
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

const getUserById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const user = await userService.getUserByIdLogic(id);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `User with ID ${id} was not found.`, details: {} }
            });
        }
        res.status(200).json({ success: true, data: user, error: null });
    } catch (error) {
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

const createUser = async (req, res) => {
    try {
        let picturePath = null;
        if (req.file) {
            picturePath = `/uploads/${req.file.filename}`;
        }

        const data = { ...req.body, picturePath };
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
        if (error.message === "EMAIL_EXISTS") {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "EMAIL_EXISTS", message: "A user with this email already exists", details: {} }
            });
        }
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

const updateUser = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        let picture = null;
        if (req.file) {
            picture = `/uploads/${req.file.filename}`;
        }

        const updateData = { ...req.body };
        if (picture) updateData.picture = picture;

        const updatedUser = await userService.updateUserLogic(id, updateData);
        res.status(200).json({ success: true, data: updatedUser, error: null });

    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `User with id: ${id} not found.`, details: {} } });
        }
        if (error.message === "EMAIL_EXISTS") {
            return res.status(400).json({ success: false, data: null, error: { code: "EMAIL_EXISTS", message: "A user with this email already exists.", details: {} } });
        }
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

const deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);

    if (req.user && req.user.userId === id) {
        return res.status(403).json({
            success: false, data: null,
            error: { code: "FORBIDDEN", message: "You cannot delete your own account.", details: {} }
        });
    }

    try {
        await userService.deleteUserLogic(id);
        res.status(200).json({ success: true, data: { userId: id }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `User with id: ${id} not found.`, details: {} } });
        }
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

const completeEmailVerification = async (req, res) => {
    try {
        const { email, code } = req.body;
        const { user, token } = await userService.completeEmailVerificationLogic(email, code);
        const { password, ...safeUserCopy } = user;

        res.status(200).json({
            success: true,
            data: { user: safeUserCopy, token: token, message: "users email has been verified." },
            error: null
        });
    } catch (error) {
        if (error.message === "INVALID_CODE") {
            return res.status(400).json({ success: false, data: null, error: { code: "INVALID_CODE", message: "The verification code is incorrect or expired", details: {} } });
        }
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `User with email ${req.body.email} was not found.`, details: {} } });
        }
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await userService.loginLogic(email, password);
        const { password: _, ...safeUserCopy } = user;

        res.status(200).json({
            success: true,
            data: { user: safeUserCopy, token: token },
            error: null
        });
    } catch (error) {
        if (error.message === "EMAIL_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "Email not exists", details: {} } });
        }
        if (error.message === "EMAIL_NOT_VERIFIED") {
            return res.status(401).json({ success: false, data: null, error: { code: "EMAIL_NOT_VERIFIED", message: "Email is not verified", details: {} } });
        }
        if (error.message === "INCORRECT_PASSWORD") {
            return res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Incorrect password", details: {} } });
        }
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

const sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        await userService.sendVerificationCodeLogic(email);
        res.status(200).json({ success: true, data: { message: "Verification code sent to email" }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "User with this email not found", details: {} } });
        }
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

const resetPassword = async (req, res) => {
    const { email, newPassword, code } = req.body;
    try {
        await userService.resetPasswordLogic(email, newPassword, code);
        res.status(200).json({ success: true, data: { message: "Password updated successfully" }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `User with email: ${email} not found.`, details: {} } });
        }
        if (error.message === "INVALID_CODE") {
            return res.status(400).json({ success: false, data: null, error: { code: "INVALID_CODE", message: "Invalid verification code", details: {} } });
        }
        res.status(500).json({
            success: false, data: null,
            error: { code: "SERVER_ERROR", message: "Internal Server Error", details: error.message }
        });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, login, sendVerificationCode, resetPassword, completeEmailVerification };