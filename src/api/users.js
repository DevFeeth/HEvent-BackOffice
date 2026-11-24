import client, {getList} from './client.js';

export const getMe = async () => (await client.get('/users/me')).data;

// params : search, page, limit, role_name, is_active → {items, total}
export const getUsers = (params) => getList('/users', params);

export const createUser = async (user) => (await client.post('/users', user)).data.id;

export const updateUser = async (id, fields) => {
    await client.patch(`/users/${id}`, fields);
};

export const deleteUser = async (id) => {
    await client.delete(`/users/${id}`);
};

export const getUser = async (id) => (await client.get(`/users/${id}`)).data;
