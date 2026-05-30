import apiClient from './client';

class UserService {
    constructor() {
        this.route = '/users';
    }

    login(email, password) {
        return apiClient.post(`${this.route}/login`, { email, password });
    }

    getAll() {
        return apiClient.get(this.route);
    }

    getById(id) {
        return apiClient.get(`${this.route}/${id}`);
    }

    create(email, password, firstName, lastName, phoneNumber, picture, userRole) {
        const formData = new FormData();

        formData.append('email', email);
        formData.append('password', password);

        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('phoneNumber', phoneNumber);
        formData.append('userRole', userRole);

        if (picture) formData.append('picture', picture);

        return apiClient.post(this.route, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    update(id, data) {
        return apiClient.put(`${this.route}/${id}`, data);
    }

    delete(id) {
        return apiClient.delete(`${this.route}/${id}`);
    }

    updateSettings(id, data) {
        // Assuming this maps to the same PUT route based on your original code
        return apiClient.put(`${this.route}/${id}`, data);
    }

    sendVerificationCode(email) {
        return apiClient.post(`${this.route}/send-verification-code`, { email });
    }

    completeEmailVerification(email, code) {
        return apiClient.post(`${this.route}/verify-email`, { email, code });
    }

    resetPassword(email, newPassword, code) {
        return apiClient.post(`${this.route}/reset-password`, { email, newPassword, code });
    }
}

// Export a single instance of the service (Singleton pattern)
export default new UserService();