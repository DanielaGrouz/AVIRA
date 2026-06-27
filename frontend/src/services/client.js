import axios from 'axios';
import { ApiError } from './ApiError';
import Config from './Config';

const apiClient = axios.create({
  baseURL: Config.BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const userData = JSON.parse(localStorage.getItem('avira_user'));
  console.log(`user now is: ${JSON.stringify(userData)}`);
  if (userData) {
    config.headers['x-user-role'] = userData.user.userRole;
    config.headers['x-user-token'] = userData.token;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(error);
    if (error.response) {
      console.log(error.response);

      if (error.response.status === 401) {
        localStorage.removeItem('avira_user');
        return;
      }

      const errorMessage =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        'An error occurred with the API';

      throw new ApiError(error.response.status, errorMessage, error.response.data);
    } else if (error.request) {
      console.error('Server is unreachable, redirecting to 500 page...');
      window.location.href = '/server-error';

      return Promise.reject(new ApiError(503, 'Network Error: No response from server.'));
    } else {
      throw new ApiError(500, `Request Error: ${error.message}`);
    }
  }
);

export default apiClient;
