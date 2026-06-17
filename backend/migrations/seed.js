const {
  sequelize,
  User,
  Admin,
  Event,
  Guest,
  EventGuestList,
  Task,
} = require('../models/index.js');
const usersMock = require('./userData.js');
const eventsMock = require('./eventData.js');
const guestsMock = require('./guestData.js');
const tasksMock = require('./taskData.js');
const bcrypt = require('bcrypt');

const calcHash = async (originalPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(originalPassword, salt);
};

const runSeeder = async () => {
  try {
    await sequelize.authenticate();

    await sequelize.sync({ force: true });

    const now = new Date();

    const usersToInsert = usersMock.map((user) => {
      const { originalPassword, ...dbUser } = user;
      return {
        ...dbUser,
        createDate: user.createDate || now,
        updateDate: user.updateDate || now,
      };
    });

    await User.bulkCreate(usersToInsert);

    const adminsToInsert = usersMock
      .filter((user) => user.userRole === 'admin')
      .map((user) => ({
        userId: user.userId,
        roleDescription: 'System Administrator',
        createdAt: now,
        updatedAt: now,
      }));

    await Admin.bulkCreate(adminsToInsert);

    const eventsToInsert = eventsMock.map((event) => ({
      ...event,
      createdAt: now,
      updatedAt: now,
    }));

    await Event.bulkCreate(eventsToInsert);

    const uniqueGuestsMap = new Map();

    guestsMock.forEach((guest) => {
      const relatedEvent = eventsMock.find((e) => e.eventId === guest.eventId);
      const creatorId = relatedEvent ? relatedEvent.creatorId : 1;

      const uniqueKey = `${guest.phone}-${creatorId}`;

      if (!uniqueGuestsMap.has(uniqueKey)) {
        uniqueGuestsMap.set(uniqueKey, {
          guestId: guest.guestId,
          name: guest.name,
          phone: guest.phone,
          creatorId: creatorId,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    const guestsToInsert = Array.from(uniqueGuestsMap.values());
    await Guest.bulkCreate(guestsToInsert);

    const eventGuestLinks = guestsMock.map((guest) => {
      const relatedEvent = eventsMock.find((e) => e.eventId === guest.eventId);
      const creatorId = relatedEvent ? relatedEvent.creatorId : 1;
      const uniqueKey = `${guest.phone}-${creatorId}`;

      const actualDatabaseGuest = uniqueGuestsMap.get(uniqueKey);

      return {
        eventId: guest.eventId,
        guestId: actualDatabaseGuest.guestId,
        status: guest.status || 'pending',
        role: guest.role || 'guest',
        createdAt: now,
        updatedAt: now,
      };
    });

    await EventGuestList.bulkCreate(eventGuestLinks);

    const tasksToInsert = tasksMock.map((task) => ({
      ...task,
      createdAt: now,
      updatedAt: now,
    }));

    await Task.bulkCreate(tasksToInsert);

    console.log('Database successfully seeded with new Admin and Junction tables!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeder();
