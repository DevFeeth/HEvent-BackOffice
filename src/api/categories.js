import client from './client.js';

export const getCategories = async () => (await client.get('/categories')).data;

export const addCategory = async (name, label) => {
    await client.post('/categories', {name, label});
};

export const updateCategory = async (name, label) => {
    await client.patch(`/categories/${encodeURIComponent(name)}`, {label});
};

export const deleteCategory = async (name) => {
    await client.delete(`/categories/${encodeURIComponent(name)}`);
};
