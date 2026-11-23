import client from './client.js';

export const getRoles = async () => (await client.get('/roles')).data;

export const addRole = async (name, label) => {
    await client.post('/roles', {name, label});
};

export const updateRole = async (name, label) => {
    await client.patch(`/roles/${encodeURIComponent(name)}`, {label});
};

export const deleteRole = async (name) => {
    await client.delete(`/roles/${encodeURIComponent(name)}`);
};
