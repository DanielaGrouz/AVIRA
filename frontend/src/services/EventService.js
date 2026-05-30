import apiClient from './client';

class EventService {
    constructor() {
        this.route = '/events';
    }

    // --- Filtered Retrieval ---
    getByCreator(creatorId) {
        return apiClient.get(`${this.route}/creator/${creatorId}`);
    }

    getByGuestName(name) {
        return apiClient.get(`${this.route}/guest/name/${name}`);
    }

    getByGuestPhone(phone) {
        return apiClient.get(`${this.route}/guest/phone/${phone}`);
    }

    // --- Standard CRUD ---
    getAll(page, sortBy, searchQuery, limit) {
        return apiClient.get(this.route, { params: { page, sortBy, searchQuery, limit } });
    }

    getById(id) {
        return apiClient.get(`${this.route}/${id}`);
    }

    create(title, date, time, location, eventType, guestsCount) {
        // Construct the payload object expected by your backend
        const eventData = {
            title,
            date,
            time,
            location,
            eventType,
            guestsCount
        };
        return apiClient.post(this.route, eventData);
    }

    update(id, data) {
        return apiClient.put(`${this.route}/${id}`, data);
    }

    delete(id) {
        return apiClient.delete(`${this.route}/${id}`);
    }

    // --- Guest Sub-resources ---
    getGuests(eventId) {
        return apiClient.get(`${this.route}/${eventId}/guests`);
    }

    addGuest(guestData) {
        return apiClient.post(`${this.route}/${guestData.eventId}/guests`, guestData);
    }

    updateGuest(guestId, guestData) {
        return apiClient.put(`${this.route}/${guestData.eventId}/guests/${guestId}`, guestData);
    }

    removeGuest(eventId, guestId) {
        return apiClient.delete(`${this.route}/${eventId}/guests/${guestId}`);
    }

    confirmGuestAttendance(eventId, guestId, status) {
        return apiClient.patch(`${this.route}/${eventId}/guests/${guestId}/rsvp`, { status });
    }

    // --- Task Sub-resources ---
    getTasks(eventId) {
        return apiClient.get(`${this.route}/${eventId}/tasks`);
    }

    addTask(eventId, taskData) {
        return apiClient.post(`${this.route}/${eventId}/tasks`, taskData);
    }

    updateTask(eventId, taskId, taskData) {
        return apiClient.put(`${this.route}/${eventId}/tasks/${taskId}`, taskData);
    }

    removeTask(eventId, taskId) {
        return apiClient.delete(`${this.route}/${eventId}/tasks/${taskId}`);
    }

    // --- Utilities & Integrations ---
    generateInvite(eventId) {
        return apiClient.get(`${this.route}/${eventId}/generate-invite`, { responseType: 'blob' });
    }

    generateShoppingList(eventId) {
        return apiClient.get(`${this.route}/${eventId}/shopping-list`);
    }

    generateTaskList(eventId) {
        return apiClient.get(`${this.route}/${eventId}/task-list`);
    }

    findStores(eventId, location) {
        // Note: Backend uses req.body for a GET request here.
        // Passing data in a GET request config for axios:
        return apiClient.get(`${this.route}/${eventId}/find-stores`, { data: { location } });
    }

    saveInvitation(eventId, file) {
        const formData = new FormData();
        formData.append('picture', file);
        return apiClient.put(`${this.route}/${eventId}/save-invitation`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
}

export default new EventService();