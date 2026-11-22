import client from './client.js';

export const getMe = async () => (await client.get('/users/me')).data;

// Admin uniquement. Filtres possibles : {role_name, is_active}
export const getUsers = async (params = {}) => (await client.get('/users', {params})).data;
