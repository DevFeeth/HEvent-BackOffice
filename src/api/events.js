import client from './client.js';

// Un admin reçoit tous les événements (brouillons compris).
// Filtres possibles : {status, category_name, organizer_id}
export const getEvents = async (params = {}) => (await client.get('/events', {params})).data;

export const getEvent = async (id) => (await client.get(`/events/${id}`)).data;

// fields : uniquement les champs modifiés
// {name, description, start_date: 'YYYY-MM-DD', end_date, start_time: 'HH:mm', end_time, status, ...}
export const updateEvent = async (id, fields) => {
    await client.patch(`/events/${id}`, fields);
};
