import api from '../lib/api.js';

export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data.data; // { users: [...] }
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/users/${id}/role`, { role });
  return data.data;
};
