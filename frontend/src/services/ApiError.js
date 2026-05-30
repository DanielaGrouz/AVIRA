export class ApiError extends Error {
    constructor(statusCode, message, data = null) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.data = data;
    }
}