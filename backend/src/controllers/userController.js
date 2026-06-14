const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');

const getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortDirection, searchQuery } = req.query;

    const result = await userService.getAllUsersLogic(page, limit, sortBy, sortDirection, searchQuery);

    res.status(200).json({ success: true, data: result, error: null });
});

const getUserById = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userService.getUserByIdLogic(id);

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    res.status(200).json({ success: true, data: user, error: null });
});

const createUser = asyncHandler(async (req, res) => {
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
});

const updateUser = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);

    let picture = null;
    if (req.file) {
        picture = `/uploads/${req.file.filename}`;
    }

    const updateData = { ...req.body };
    if (picture) updateData.picture = picture;

    const updatedUser = await userService.updateUserLogic(id, updateData);
    res.status(200).json({ success: true, data: updatedUser, error: null });
});

const deleteUser = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);

    // Block deleting self - throws to global handler for 403 Forbidden
    if (req.user && req.user.userId === id) {
        throw new Error("CANNOT_DELETE_OWN_ACCOUNT");
    }

    await userService.deleteUserLogic(id);
    res.status(200).json({ success: true, data: { userId: id }, error: null });
});

const completeEmailVerification = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    const { user, token } = await userService.completeEmailVerificationLogic(email, code);

    const { password, ...safeUserCopy } = user;

    res.status(200).json({
        success: true,
        data: { user: safeUserCopy, token: token, message: "users email has been verified." },
        error: null
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await userService.loginLogic(email, password);

    const { password: _, ...safeUserCopy } = user;

    res.status(200).json({
        success: true,
        data: { user: safeUserCopy, token: token },
        error: null
    });
});

const sendVerificationCode = asyncHandler(async (req, res) => {
    const { email } = req.body;
    await userService.sendVerificationCodeLogic(email);
    res.status(200).json({ success: true, data: { message: "Verification code sent to email" }, error: null });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword, code } = req.body;
    await userService.resetPasswordLogic(email, newPassword, code);
    res.status(200).json({ success: true, data: { message: "Password updated successfully" }, error: null });
});

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
    sendVerificationCode,
    resetPassword,
    completeEmailVerification
};