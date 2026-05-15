import api from '../lib/api.js';

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data.data; // { categories: [...] }
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post('/categories', categoryData);
  return data.data;
};

export const updateCategory = async (id, categoryData) => {
  const { data } = await api.patch(`/categories/${id}`, categoryData);
  return data.data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data.data;
};
