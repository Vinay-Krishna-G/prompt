import api from '../lib/api.js';

export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data.data;
};

export const registerUser = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data.data;
};

export const getMe = async () => {
  const { data } = await api.get('/users/me');
  return data.data;
};
