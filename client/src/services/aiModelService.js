import api from '../lib/api.js';

export const getAIModels = async () => {
  const { data } = await api.get('/aimodels');
  return data.data;
};

export const createAIModel = async (modelData) => {
  const { data } = await api.post('/aimodels', modelData);
  return data.data;
};

export const updateAIModel = async (id, modelData) => {
  const { data } = await api.patch(`/aimodels/${id}`, modelData);
  return data.data;
};

export const deleteAIModel = async (id) => {
  await api.delete(`/aimodels/${id}`);
};
