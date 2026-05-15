import api from '../lib/api.js';

export const getPrompts = async (params = {}) => {
  const { data } = await api.get('/prompts', { params });
  return data.data; // { prompts, pagination }
};

export const getPromptBySlug = async (slug) => {
  const { data } = await api.get(`/prompts/${slug}`);
  return data.data;
};

// Admin: fetch a prompt by MongoDB _id (not slug)
export const getPromptById = async (id) => {
  const { data } = await api.get(`/prompts/admin/${id}`);
  return data.data;
};

export const createPrompt = async (promptData) => {
  const { data } = await api.post('/prompts', promptData);
  return data.data;
};

export const uploadAsset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data; // { url, publicId, resourceType, format }
};

// Admin: update a prompt by MongoDB _id
export const updatePrompt = async (id, promptData) => {
  const { data } = await api.put(`/prompts/admin/${id}`, promptData);
  return data.data;
};

export const deletePrompt = async (id) => {
  const { data } = await api.delete(`/prompts/${id}`);
  return data.data;
};

export const toggleLike = async (id) => {
  const { data } = await api.post(`/prompts/${id}/like`);
  return data.data;
};

export const toggleSave = async (id) => {
  const { data } = await api.post(`/prompts/${id}/save`);
  return data.data;
};

export const getSavedPrompts = async () => {
  const { data } = await api.get('/prompts/user/saved');
  return data.data.prompts;
};

export const getLikedPrompts = async () => {
  const { data } = await api.get('/prompts/user/liked');
  return data.data.prompts;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/prompts/admin/stats');
  return data.data;
};
