import client from './client.js';

export const getTicketTypesByEvent = async (eventId) =>
    (await client.get(`/events/${eventId}/ticket-types`)).data;

export const addTicketType = async (eventId, ticketType) =>
    (await client.post(`/events/${eventId}/ticket-types`, ticketType)).data;

export const updateTicketType = async (id, fields) => {
    await client.patch(`/ticket-types/${id}`, fields);
};

export const deleteTicketType = async (id) => {
    await client.delete(`/ticket-types/${id}`);
};
