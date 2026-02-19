import axios from 'axios';
import { getUserData } from '../Dashboard/dashboardService';

const BASE_URL = 'https://lms.akiliapp.co.tz/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const userData = getUserData();
    const token = userData?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (userData?.id) {
      config.params = { ...config.params, user_id: userData.id };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: clear user and redirect to login (e.g. if using a global auth handler)
    }
    return Promise.reject(error);
  }
);

export { apiClient, BASE_URL };
export default apiClient;
