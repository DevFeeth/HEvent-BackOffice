import client from './client.js';

export const getEvents = async (params = {}) => (await client.get('/events', {params})).data;

export const getEvent = async (id) => (await client.get(`/events/${id}`)).data;

export const updateEvent = async (id, fields) => {
    await client.patch(`/events/${id}`, fields);
};
