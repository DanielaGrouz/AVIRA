// models/eventModel.js
let events = [
    { eventId: 101, creatorId: 1, title: "Shir's Bachelorette Party", date: "2026-06-15", time: "19:00", location: "Villa Caesarea", eventType: "Bachelorette", guestsCount: 3 },
    { eventId: 102, creatorId: 1, title: "Grandma's 80th Birthday", date: "2026-07-20", time: "12:30", location: "King David Hotel", eventType: "Birthday", guestsCount: 2 },
    { eventId: 103, creatorId: 2, title: "Tech Networking Brunch", date: "2026-05-10", time: "10:00", location: "Mindspace Tel Aviv", eventType: "Networking", guestsCount: 2 },
    { eventId: 104, creatorId: 1, title: "Engagement Dinner - Noa & Dan", date: "2026-08-05", time: "20:30", location: "Pastel Restaurant", eventType: "Dinner", guestsCount: 1 },
    { eventId: 105, creatorId: 2, title: "Annual Yoga Retreat", date: "2026-09-12", time: "08:00", location: "Desert Days Arava", eventType: "Retreat", guestsCount: 1 },
    { eventId: 106, creatorId: 1, title: "Baby Shower - Michal", date: "2026-05-30", time: "16:00", location: "Private Garden, Herzliya", eventType: "Baby Shower", guestsCount: 1 },
    { eventId: 107, creatorId: 3, title: "Product Launch Party", date: "2026-10-01", time: "20:00", location: "Expo Tel Aviv", eventType: "Launch", guestsCount: 2 },
    { eventId: 108, creatorId: 1, title: "Friday Night Family Dinner", date: "2026-05-01", time: "19:30", location: "Home", eventType: "Dinner", guestsCount: 1 },
    { eventId: 109, creatorId: 2, title: "Summer Cocktail Night", date: "2026-07-15", time: "21:00", location: "Rooftop Bar", eventType: "Cocktail", guestsCount: 1 },
    { eventId: 110, creatorId: 1, title: "Wedding Anniversary", date: "2026-11-20", time: "20:00", location: "Sheraton", eventType: "Anniversary", guestsCount: 1, superMarketList: null, tasksList: null }
];

module.exports = events;