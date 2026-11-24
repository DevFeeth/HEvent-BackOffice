import client, {getList} from './client.js';

// params : search, page, limit → {items, total} ; chaque rôle a son user_count
export const getRoles = (params) => getList('/roles', params);

export const addRole = async (name, label) => {
    await client.post('/roles', {name, label});
};

export const updateRole = async (name, label) => {
    await client.patch(`/roles/${encodeURIComponent(name)}`, {label});
};

export const deleteRole = async (name) => {
    await client.delete(`/roles/${encodeURIComponent(name)}`);
};
