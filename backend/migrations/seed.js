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

const runSeeder = async () => {
  try {
    await sequelize.authenticate();

    // force: true drops existing tables and recreates them from scratch
    await sequelize.sync({ force: true });

    const now = new Date();

    // 1. Prepare and Insert Users
    const usersToInsert = usersMock.map((user) => {
      const { originalPassword, ...dbUser } = user;
      return {
        ...dbUser,
        createDate: user.createDate || now,
        updateDate: user.updateDate || now,
      };
    });

    await User.bulkCreate(usersToInsert);

    // 2. Prepare and Insert Admins
    const adminsToInsert = usersMock
        .filter((user) => user.userRole === 'admin')
        .map((user) => ({
          userId: user.userId,
          roleDescription: 'System Administrator',
          createdAt: now,
          updatedAt: now,
        }));

    await Admin.bulkCreate(adminsToInsert);

    // 3. Prepare and Insert Events
    const eventsToInsert = eventsMock.map((event) => ({
      ...event,
      createdAt: now,
      updatedAt: now,
    }));

    await Event.bulkCreate(eventsToInsert);

    // 4. Prepare and Insert Guests
    const uniqueGuestsMap = new Map();

    guestsMock.forEach((guest) => {
      const relatedEvent = eventsMock.find((e) => e.eventId === guest.eventId);
      const creatorId = relatedEvent ? relatedEvent.creatorId : 1;

      const uniqueKey = `${guest.phone}-${creatorId}`;

      if (!uniqueGuestsMap.has(uniqueKey)) {
        uniqueGuestsMap.set(uniqueKey, {
          guestId: guest.guestId, // Store the primary ID for this unique person
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

    // 5. Populate the Many-to-Many Junction Table
    const eventGuestLinks = guestsMock.map((guest) => {
      // Find who the creator is so we can generate the unique key again
      const relatedEvent = eventsMock.find((e) => e.eventId === guest.eventId);
      const creatorId = relatedEvent ? relatedEvent.creatorId : 1;
      const uniqueKey = `${guest.phone}-${creatorId}`;

      // Grab the ACTUAL guest record that was inserted into the database
      const actualDatabaseGuest = uniqueGuestsMap.get(uniqueKey);

      return {
        eventId: guest.eventId,
        guestId: actualDatabaseGuest.guestId, // Use the resolved ID, safely linking to an existing row!
        status: guest.status || 'pending',
        role: guest.role || 'guest',
        createdAt: now,
        updatedAt: now,
      };
    });

    await EventGuestList.bulkCreate(eventGuestLinks);

    // 6. Prepare and Insert Tasks
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