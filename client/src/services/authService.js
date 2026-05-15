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

export const verifyEmail = async (verificationData) => {
  const { data } = await api.post('/auth/verify', verificationData);
  return data.data;
};

export const resendOTP = async (email) => {
  const { data } = await api.post('/auth/resend-otp', { email });
  return data.data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data.data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data.data;
};
