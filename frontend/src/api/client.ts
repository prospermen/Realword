import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken, removeToken } from '../utils/storage';

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      removeToken();
    }
    return Promise.reject(error);
  }
);

export default client;