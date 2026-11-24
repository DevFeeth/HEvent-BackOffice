import client, {getList} from './client.js';

// params : search, page, limit → {items, total} ; chaque catégorie a son event_count
export const getCategories = (params) => getList('/categories', params);

export const addCategory = async (name, label) => {
    await client.post('/categories', {name, label});
};

export const updateCategory = async (name, label) => {
    await client.patch(`/categories/${encodeURIComponent(name)}`, {label});
};

export const deleteCategory = async (name) => {
    await client.delete(`/categories/${encodeURIComponent(name)}`);
};
