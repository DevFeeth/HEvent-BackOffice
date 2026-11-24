import client, {getList} from './client.js';

// params : search, page, limit, organizer_id → {items, total}
export const getEvents = (params) => getList('/events', params);

export const getEvent = async (id) => (await client.get(`/events/${id}`)).data;

export const updateEvent = async (id, fields) => {
    await client.patch(`/events/${id}`, fields);
};

// organizer_id : l'organisateur choisi par l'admin → id du nouvel événement
export const addEvent = async (event) => (await client.post('/events', event)).data.id;

export const deleteEvent = async (id) => {
    await client.delete(`/events/${id}`);
};
