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
    // Dynamically grab any user marked as 'admin' and create an Admin record
    const adminsToInsert = usersMock
      .filter((user) => user.userRole === 'admin')
      .map((user) => ({
        userId: user.userId,
        roleDescription: 'System Administrator', // You can customize this
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
    const guestsToInsert = guestsMock.map((guest) => ({
      ...guest,
      createdAt: now,
      updatedAt: now,
    }));

    await Guest.bulkCreate(guestsToInsert);

    // 5. Populate the Many-to-Many Junction Table
    // Assuming your guestData.js objects contain 'eventId' and 'guestId' properties
    const eventGuestLinks = guestsMock.map((guest) => ({
      eventId: guest.eventId,
      guestId: guest.guestId,
      createdAt: now,
      updatedAt: now,
    }));

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
