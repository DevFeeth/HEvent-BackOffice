import client from './client.js';

export const getMe = async () => (await client.get('/users/me')).data;

// Admin uniquement. Filtres possibles : {role_name, is_active}
export const getUsers = async (params = {}) => (await client.get('/users', {params})).data;

// Création d'un compte (rôle USER par défaut). Renvoie l'id du nouveau compte.
// user : {email, first_name, last_name, password, address?, postal_code?, city?}
export const createUser = async (user) => (await client.post('/users', user)).data.id;

// Admin uniquement. fields : uniquement les champs modifiés (role_name, is_active, ...)
export const updateUser = async (id, fields) => {
    await client.patch(`/users/${id}`, fields);
};
