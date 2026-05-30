import axios from 'axios';
import { ApiError } from './ApiError';


const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
});

// Request Interceptor: Attach the role header
apiClient.interceptors.request.use((config) => {
    const userData = JSON.parse(localStorage.getItem('avira_user'));
    console.log(`user now is: ${JSON.stringify(userData)}`);
    if (userData) {
        config.headers['x-user-role'] = userData.user.userRole;
        config.headers['x-user-token'] = userData.token;
    }
    return config;
});

// Response Interceptor: Global Status Code Wrapper
apiClient.interceptors.response.use(
    (response) => {
        // Any 2xx status code comes here
        return response;
    },
    (error) => {
        // Any non-2xx status code triggers this wrapper
        if (error.response) {
            // The server responded with a status outside the 2xx range
            throw new ApiError(
                error.response.status,
                error.response.data?.message || 'An error occurred with the API',
                error.response.data
            );
        } else if (error.request) {
            // The request was made but no response was received
            throw new ApiError(503, 'Network Error: No response from server.');
        } else {
            // Something else triggered an error
            throw new ApiError(500, `Request Error: ${error.message}`);
        }
    }
);

export default apiClient;