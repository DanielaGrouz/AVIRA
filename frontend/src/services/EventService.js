import apiClient from './client';

class EventService {
    constructor() {
        this.route = '/events';
    }

    // --- Standard CRUD ---
    getAll(page, sortBy, searchQuery, limit) {
        return apiClient.get(this.route, { params: { page, sortBy, searchQuery, limit } });
    }

    getById(id) {
        return apiClient.get(`${this.route}/${id}`);
    }

    create(title, date, time, location, eventType) {
        // Construct the payload object expected by your backend
        const eventData = {
            title,
            date,
            time,
            location,
            eventType,
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
    getGuests(eventId, page, sortBy, searchQuery, limit, sortDirection) {
        return apiClient.get(`${this.route}/${eventId}/guests`, { params: { page, sortBy, searchQuery, limit, sortDirection } });
    }

    addGuest(guestData) {
        return apiClient.post(`${this.route}/${guestData.eventId}/guests`, guestData);
    }

    updateGuest(guestId, guestData) {
        return apiClient.put(`${this.route}/${guestData.eventId}/guests/${guestId}`, guestData);
    }

    deleteGuest(eventId, guestId) {
        return apiClient.delete(`${this.route}/${eventId}/guests/${guestId}`);
    }

    updateGuestAttendance(eventId, guestId, status) {
        return apiClient.patch(`${this.route}/${eventId}/guests/${guestId}/rsvp`, { status });
    }

    // --- Task Sub-resources ---
    getTasks(eventId, page, sortBy, searchQuery, limit, sortDirection) {
        return apiClient.get(`${this.route}/${eventId}/tasks`, { params: { page, sortBy, searchQuery, limit, sortDirection } });
    }

    addTask(taskData) {
        return apiClient.post(`${this.route}/${taskData.eventId}/tasks`, taskData);
    }

    updateTask(taskId, taskData) {
        return apiClient.put(`${this.route}/${taskData.eventId}/tasks/${taskId}`, taskData);
    }

    deleteTask(eventId, taskId) {
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

    findStores(location, eventId) {
        return apiClient.get(`${this.route}/${eventId}/find-stores`, {
            params: {
                lat: location.lat,
                lon: location.lon
            }
        });
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