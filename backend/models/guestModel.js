let guests = [
    // --- Event 101 (3 People) ---
    { guestId: 1, eventId: 101, name: "Daniela Levi", phone: "050-0000001", status: "confirmed", role: "manager" },
    { guestId: 11, eventId: 101, name: "Noa Arad", phone: "050-1111111", status: "confirmed", role: "guest" },
    { guestId: 12, eventId: 101, name: "Yosef Cohen", phone: "050-0000002", status: "pending", role: "guest" },

    // --- Event 102 (2 People) ---
    { guestId: 2, eventId: 102,  name: "Daniela Levi", phone: "050-0000001", status: "confirmed", role: "manager" },
    { guestId: 13, eventId: 102,  name: "Abraham Cohen", phone: "054-3333333", status: "confirmed", role: "guest" },

    // --- Event 103 (2 People) ---
    { guestId: 3, eventId: 103,  name: "Yosef Cohen", phone: "050-0000002", status: "confirmed", role: "manager" },
    { guestId: 14, eventId: 103,  name: "Daniela Levi", phone: "050-0000001", status: "confirmed", role: "guest" },

    // --- Event 104 (1 Person - Manager Only) ---
    { guestId: 4, eventId: 104,  name: "Daniela Levi", phone: "050-0000001", status: "confirmed", role: "manager" },

    // --- Event 105 (1 Person - Manager Only) ---
    { guestId: 5, eventId: 105, name: "Yosef Cohen", phone: "050-0000002", status: "confirmed", role: "manager" },

    // --- Event 106 (1 Person - Manager Only) ---
    { guestId: 6, eventId: 106,  name: "Daniela Levi", phone: "050-0000001", status: "confirmed", role: "manager" },

    // --- Event 107 (2 People) ---
    { guestId: 7, eventId: 107, name: "Yosef Cohen", phone: "050-0000002", status: "confirmed", role: "manager" },
    { guestId: 15, eventId: 107,  name: "Mark Zuckerberg", phone: "055-9999999", status: "pending", role: "guest" },

    // --- Event 108 (1 Person - Manager Only) ---
    { guestId: 8, eventId: 108,  name: "Daniela Levi", phone: "050-0000001", status: "confirmed", role: "manager" },

    // --- Event 109 (1 Person - Manager Only) ---
    { guestId: 9, eventId: 109,  name: "Yosef Cohen", phone: "050-0000002", status: "confirmed", role: "manager" },

    // --- Event 110 (1 Person - Manager Only) ---
    { guestId: 10, eventId: 110,  name: "Daniela Levi", phone: "050-0000001", status: "confirmed", role: "manager" }
];

module.exports = guests;