let users = require('../models/userModel');
const bcrypt = require("bcrypt");
const verificationCodes = require("../models/authVerification");
const { sendMail } = require("../utils/emailClient");
const {generateAvatar} = require("../utils/generateAvatarClient");
const fs = require('fs/promises');
const path = require('path');
const jwt = require("jsonwebtoken");
const sharp = require('sharp');


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

    const userProfile = {
        role: getRandom(roles),
        traits: `${getRandom(traitsList)}, looking friendly, representing the vibe of a person named ${firstName} ${lastName}`,
        colorTheme: getRandom(colorThemes)
    };

    const buffer = await generateAvatar(userProfile);

    if (!buffer) {
        throw new Error("AVATAR_GENERATION_FAILED");
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `avatar_ai_${uniqueSuffix}.png`;

    const savePath = path.join(__dirname, '../uploads/avatar', fileName);

    await sharp(buffer)
        .resize(96, 96)
        .png()
        .toFile(savePath);

    return `/uploads/avatar/${fileName}`;
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

    let finalPicture = picturePath;
    if (!picturePath) {
        try {
            finalPicture = await generateAvatarPicture(firstName, lastName);
        }catch (error) {
            try {
                const avatarFolder = path.join(__dirname, '../uploads/avatar');
                const files = await fs.readdir(avatarFolder);
                const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

                if (imageFiles.length > 0) {
                    const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];

                    finalPicture = `/uploads/avatar/${randomFile}`;
                } else {
                    finalPicture = `/uploads/avatar/avatar1.png`;
                }
            }
            catch (error) {
                console.error("Error picking random avatar:", error);
                finalPicture = `/uploads/avatar/avatar1.png`;

            }
        }
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
        picturePath: finalPicture,
        isEmailVerified: false,
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
    console.log(recordIndex, email, code);
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
const completeEmailVerificationLogic = async (email, code) => {
    const isValid = checkVerificationCodeLogic(email, code);
    if (!isValid) throw new Error("INVALID_CODE");

    const user = users.find(u => u.email === email);
    if (!user) throw new Error("USER_NOT_FOUND");
    user.isEmailVerified = true;
    const token = await createToken(user);
    return {user, token};
};

const createToken = async (user) => {

    const tokenPayload = {
        userId: user.userId,
        userRole: user.userRole,
        email: user.email,
    };

    return jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        {expiresIn: '24h'}
    );
}

/**
 * Logic for User Login.
 * Uses bcrypt.compare to check if the plain-text password matches the stored hash.
 */
const loginLogic = async (email, password) => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("EMAIL_NOT_FOUND");
    if (!user.isEmailVerified) throw new Error("EMAIL_NOT_VERIFIED");
    // Secure password comparison
    const isMatch = await bcrypt.compare(password, user.password).catch(() => password === user.password);
    if (!isMatch) throw new Error("INCORRECT_PASSWORD");
    const token = await createToken(user);
    return {user, token };
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
const resetPasswordLogic = async (email, newPassword, code) => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("USER_NOT_FOUND");
    const isValid = checkVerificationCodeLogic(email, code);
    if (!isValid) throw new Error("INVALID_CODE");


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