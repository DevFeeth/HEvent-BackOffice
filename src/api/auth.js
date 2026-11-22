import client from './client.js';

export const login = async (email, password) => {
    const {data} = await client.post('/users/login', {email, password});
    return data.token;
};
