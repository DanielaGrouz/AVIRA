let users = require('../models/userModel');
const bcrypt = require("bcrypt");
const verificationCodes = require("../models/authVerification");
const { sendMail } = require("../utils/emailClient");
const {generateAvatar} = require("../utils/generateAvatarClient");
const fs = require('fs/promises');
const path = require('path');

/**
 * Logic for retrieving a paginated list of users.
 */
const getAllUsersLogic = (page = 1, limit = 5, sortBy = 'id') => {
    let sortedUsers = [...users].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
    return {
        page,
        totalPages: Math.ceil(users.length / limit),
        data: paginatedUsers
    };
};

/**
 * Logic to find a user by ID.
 */
const getUserByIdLogic = (id) => {
    return users.find(u => u.userId === id) || null;
};

/**
 * INTERNAL HELPER: AI Avatar Generation
 * create a unique profile picture if the user
 * doesn't upload their own. It saves the resulting buffer to the disk.
 */
const generateAvatarPicture = async (firstName, lastName) => {
    const roles = ["cat", "dog", "fox", "robot", "astronaut", "wizard", "ninja", "panda", "owl", "dragon"];
    const traitsList = [
        "wearing stylish glasses",
        "with a big happy smile",
        "in a futuristic cyber suit",
        "wearing a cozy winter scarf",
        "with a cool leather jacket",
        "drinking a cup of coffee",
        "with a cyberpunk aesthetic"
    ];
    const colorThemes = [
        "pastel blue", "mint green", "sunset orange", "lavender purple",
        "neon pink", "warm gold", "monochrome slate", "cherry blossom pink"
    ];

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomRole = getRandom(roles);
    const randomTrait = getRandom(traitsList);
    const randomColor = getRandom(colorThemes);

    const userProfile = {
        role: randomRole,
        traits: `${randomTrait}, looking friendly, representing the vibe of a person named ${firstName} ${lastName}`,
        colorTheme: randomColor
    };

    // Call the external AI generation client
    const buffer = await generateAvatar(userProfile);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let finalPicture = path.join(__dirname, '../uploads', `avatar_ai_${uniqueSuffix}.jpg`);

    // Asynchronously write the image to the file system
    await fs.writeFile(finalPicture, buffer, 'utf8');
    return finalPicture;
}

/**
 * Logic for user registration.
 * Includes email uniqueness check, password hashing, and optional avatar generation.
 */
const createUserLogic = async (userData) => {
    const { firstName, lastName, userRole, password, phoneNumber, email, picturePath} = userData;

    // Security Check: Ensure email is unique
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        throw new Error("EMAIL_EXISTS");
    }

    // Password Security: Hash the password before storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Dynamic Avatar: Generate AI picture if no picture was uploaded
    let finalPicture = picturePath;
    if (!picturePath) {
        finalPicture = generateAvatarPicture(firstName, lastName);
    }

    const newUser = {
        userId: users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        userRole: userRole || "user",
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
        picturePath: finalPicture
    };

    users.push(newUser);
    return newUser;
};

/**
 * Updates user profile data and sets a new 'updateDate' timestamp.
 */
const updateUserLogic = (id, updateData) => {
    const userIndex = users.findIndex(u => u.userId === id);
    if (userIndex === -1) throw new Error("USER_NOT_FOUND");

    const { firstName, lastName, userRole, phoneNumber, email, picture } = updateData;

    users[userIndex] = {
        ...users[userIndex],
        firstName: firstName || users[userIndex].firstName,
        lastName: lastName || users[userIndex].lastName,
        userRole: userRole || users[userIndex].userRole,
        updateDate: new Date().toISOString(), // Update timestamp
        phoneNumber: phoneNumber || users[userIndex].phoneNumber,
        email: email || users[userIndex].email,
        picturePath: picture || users[userIndex].picturePath
    };
    return users[userIndex];
};

/**
 * Logic to delete a user.
 */
const deleteUserLogic = (id) => {
    const userIndex = users.findIndex(u => u.userId === id);
    if (userIndex === -1) throw new Error("USER_NOT_FOUND");
    users.splice(userIndex, 1);
    return true;
};

/**
 * INTERNAL HELPER: OTP Verification
 * Validates the 4-digit code and ensures it was submitted within the 15-minute window.
 */
const checkVerificationCodeLogic = (email, code) => {
    const recordIndex = verificationCodes.findIndex(
        c => c.email === email && c.code.toString() === code.toString()
    );
    if (recordIndex === -1) return false;

    const record = verificationCodes[recordIndex];
    const now = new Date();
    const codeTime = new Date(record.timeStamp);

    // Time check: Codes expire after 15 minutes
    const diffInMinutes = (now - codeTime) / (1000 * 60);

    // Clear code after use (prevent replay attacks)
    verificationCodes.splice(recordIndex, 1);

    if (diffInMinutes > 15) return false;
    return true;
};

/**
 * Logic to complete the email verification flow.
 */
const completeEmailVerificationLogic = (email, code) => {
    const isValid = checkVerificationCodeLogic(email, code);
    if (!isValid) throw new Error("INVALID_CODE");

    const user = users.find(u => u.email === email);
    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
};

/**
 * Logic for User Login.
 * Uses bcrypt.compare to check if the plain-text password matches the stored hash.
 */
const loginLogic = async (email, password) => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("EMAIL_NOT_FOUND");

    // Secure password comparison
    const isMatch = await bcrypt.compare(password, user.password).catch(() => password === user.password);
    if (!isMatch) throw new Error("INCORRECT_PASSWORD");

    return user;
};

/**
 * Generates a random 4-digit code, saves it with a timestamp,
 * and sends it to the user's email address.
 */
const sendVerificationCodeLogic = async (email) => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("USER_NOT_FOUND");

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Store code for later verification
    verificationCodes.push({ email, code, timeStamp: new Date().toISOString() });

    // Send email using utility client
    await sendMail(`your code is: ${code}`, "verify your email", email);
    return true;
};

/**
 * Logic for resetting a user's password.
 * Always hashes the new password before updating the "database".
 */
const resetPasswordLogic = async (userId, newPassword) => {
    const user = users.find(u => u.userId === userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updateDate = new Date().toISOString();
    return true;
};

module.exports = {
    getAllUsersLogic,
    getUserByIdLogic,
    createUserLogic,
    updateUserLogic,
    deleteUserLogic,
    completeEmailVerificationLogic,
    loginLogic,
    sendVerificationCodeLogic,
    resetPasswordLogic
};