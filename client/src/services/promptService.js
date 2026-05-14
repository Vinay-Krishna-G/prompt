import api from '../lib/api.js';

export const getPrompts = async (params = {}) => {
  const { data } = await api.get('/prompts', { params });
  return data.data; // Backend wraps response in { success: true, data: { prompts, pagination } }
};

export const getPromptBySlug = async (slug) => {
  const { data } = await api.get(`/prompts/${slug}`);
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
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return data.data; // { url, publicId, resourceType, format }
};
