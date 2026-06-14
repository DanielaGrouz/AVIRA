const { User, Guest, VerificationCode } = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const { sendMail } = require('../utils/emailClient');
const { generateAvatar } = require('../utils/generateAvatarClient');
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} = require('../utils/errors');
const { Op } = require('sequelize');

const getAllUsersLogic = async (page, limit, sortBy, sortDirection, searchQuery) => {
  const offset = (page - 1) * limit;
  let whereClause = {};

  // Dynamic Search Query Logic
  if (searchQuery && searchQuery.trim() !== '') {
    // Split the search query into individual words
    const queryTerms = searchQuery.trim().split(/\s+/);

    // Ensure EVERY word typed matches AT LEAST ONE of the user fields
    whereClause[Op.and] = queryTerms.map((term) => ({
      [Op.or]: [
        { firstName: { [Op.like]: `%${term}%` } },
        { lastName: { [Op.like]: `%${term}%` } },
        { email: { [Op.like]: `%${term}%` } },
        { phoneNumber: { [Op.like]: `%${term}%` } },
      ],
    }));
  }
  const validSortDirection = sortDirection === '1' ? 'ASC' : 'DESC';

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    order: [[sortBy, validSortDirection]],
    limit: limit,
    offset: offset,
    attributes: { exclude: ['password'] }, // Do not send passwords to the client
  });

  return {
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    totalItems: count,
    data: rows,
  };
};

const getUserByIdLogic = async (id) => {
  return await User.findByPk(id, { attributes: { exclude: ['password'] } });
};

const generateAvatarPicture = async (firstName, lastName) => {
  const roles = [
    'cat',
    'dog',
    'fox',
    'robot',
    'astronaut',
    'wizard',
    'ninja',
    'panda',
    'owl',
    'dragon',
  ];
  const traitsList = [
    'wearing stylish glasses',
    'with a big happy smile',
    'in a futuristic cyber suit',
    'wearing a cozy winter scarf',
    'with a cool leather jacket',
    'drinking a cup of coffee',
    'with a cyberpunk aesthetic',
  ];
  const colorThemes = [
    'pastel blue',
    'mint green',
    'sunset orange',
    'lavender purple',
    'neon pink',
    'warm gold',
    'monochrome slate',
    'cherry blossom pink',
  ];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const userProfile = {
    role: getRandom(roles),
    traits: `${getRandom(traitsList)}, looking friendly, representing the vibe of a person named ${firstName} ${lastName}`,
    colorTheme: getRandom(colorThemes),
  };

  const buffer = await generateAvatar(userProfile);

  if (!buffer) {
    throw new InternalServerError('Failed to generate AI avatar', 'AVATAR_GENERATION_FAILED');
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const fileName = `avatar_ai_${uniqueSuffix}.png`;
  const savePath = path.join(__dirname, '../uploads/avatar', fileName);

  await sharp(buffer).resize(96, 96).png().toFile(savePath);

  return `/uploads/avatar/${fileName}`;
};

const createUserLogic = async (userData) => {
  const { firstName, lastName, userRole, password, phoneNumber, email, picturePath } = userData;

  // Security Check: Ensure email is unique
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('A user with this email already exists.', 'EMAIL_EXISTS');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let finalPicture = picturePath;
  if (!picturePath) {
    try {
      finalPicture = await generateAvatarPicture(firstName, lastName);
    } catch (error) {
      try {
        const avatarFolder = path.join(__dirname, '../sources/avatar');
        const files = await fs.readdir(avatarFolder);
        const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));

        if (imageFiles.length > 0) {
          const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
          finalPicture = `/sources/src/avatar/${randomFile}`;
        } else {
          finalPicture = `/sources/avatar/avatar1.png`;
        }
      } catch (error) {
        console.error('Error picking random avatar:', error);
        finalPicture = `/sources/avatar/avatar1.png`;
      }
    }
  }

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phoneNumber,
    userRole: userRole || 'user',
    picturePath: finalPicture,
    isEmailVerified: false,
  });

  return newUser.get({ plain: true }); // Return plain object
};

const updateUserLogic = async (id, updateData) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError(`User with id: ${id} not found.`, 'USER_NOT_FOUND');
  }

  if (updateData.email && updateData.email !== user.email) {
    const emailTaken = await User.findOne({ where: { email: updateData.email } });
    if (emailTaken) {
      throw new BadRequestError('A user with this email already exists.', 'EMAIL_EXISTS');
    }
  }

  const oldPhone = user.phoneNumber;
  const { firstName, lastName, userRole, phoneNumber, email, picture } = updateData;

  await user.update({
    firstName: firstName || user.firstName,
    lastName: lastName || user.lastName,
    userRole: userRole || user.userRole,
    phoneNumber: phoneNumber || user.phoneNumber,
    email: email || user.email,
    picturePath: picture || user.picturePath,
  });

  await Guest.update(
    {
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phoneNumber,
    },
    { where: { phone: oldPhone } }
  );

  return await User.findByPk(id, { attributes: { exclude: ['password'] } });
};

const deleteUserLogic = async (id) => {
  const deleted = await User.destroy({ where: { userId: id } });
  if (!deleted) {
    throw new NotFoundError(`User with id: ${id} not found.`, 'USER_NOT_FOUND');
  }
  return true;
};

const checkVerificationCodeLogic = async (email, code) => {
  const record = await VerificationCode.findOne({
    where: { email, code: code.toString() },
  });

  if (!record) return false;

  const now = new Date();
  const codeTime = new Date(record.timeStamp);
  const diffInMinutes = (now - codeTime) / (1000 * 60);

  // Clear code after use (prevent replay attacks)
  await record.destroy();

  return diffInMinutes <= 15;
};

const completeEmailVerificationLogic = async (email, code) => {
  const isValid = await checkVerificationCodeLogic(email, code);
  if (!isValid) {
    throw new BadRequestError('The verification code is incorrect or expired.', 'INVALID_CODE');
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError(`User with email ${email} was not found.`, 'USER_NOT_FOUND');
  }

  user.isEmailVerified = true;
  await user.save();

  const token = await createToken(user);
  return { user: user.get({ plain: true }), token };
};

const createToken = async (user) => {
  const tokenPayload = {
    userId: user.userId,
    userRole: user.userRole,
    email: user.email,
  };
  return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

const loginLogic = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('Email does not exist.', 'EMAIL_NOT_FOUND');
  }

  if (!user.isEmailVerified) {
    throw new UnauthorizedError('Email is not verified.', 'EMAIL_NOT_VERIFIED');
  }

  const isMatch = await bcrypt
    .compare(password, user.password)
    .catch(() => password === user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Incorrect password.', 'INCORRECT_PASSWORD');
  }

  const token = await createToken(user);
  return { user: user.get({ plain: true }), token };
};

const sendVerificationCodeLogic = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('User with this email not found.', 'USER_NOT_FOUND');
  }

  await VerificationCode.destroy({ where: { email } });

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  await VerificationCode.create({
    email,
    code,
    timeStamp: new Date(),
  });

  await sendMail(`your code is: ${code}`, 'verify your email', email);
  return true;
};

const resetPasswordLogic = async (email, newPassword, code) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError(`User with email: ${email} not found.`, 'USER_NOT_FOUND');
  }

  const isValid = await checkVerificationCodeLogic(email, code);
  if (!isValid) {
    throw new BadRequestError('Invalid verification code.', 'INVALID_CODE');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

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
  resetPasswordLogic,
};
