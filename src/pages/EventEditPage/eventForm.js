import {updateEvent} from '@/api/events.js';
import {addTicketType, deleteTicketType, updateTicketType} from '@/api/ticketTypes.js';
import {toDateInput, toTimeInput} from '@/utils/format.js';
import {getApiErrorMessage} from '@/utils/apiError.js';

export const toEventForm = (event) => ({
    name: event.name,
    start_date: toDateInput(event.start_date),
    start_time: toTimeInput(event.start_time),
    end_date: toDateInput(event.end_date),
    end_time: toTimeInput(event.end_time),
});

let nextRowKey = 0;
export const toTicketRow = (ticketType = null) => ({
    key: nextRowKey++,
    id: ticketType?.id ?? null,
    name: ticketType?.name ?? '',
    price: ticketType ? Number(ticketType.price).toFixed(2) : '',
    available_quantity: ticketType ? String(ticketType.available_quantity) : '',
});

const toTicketPayload = (row) => ({
    name: row.name.trim(),
    price: Number(row.price.replace(',', '.')),
    available_quantity: Number(row.available_quantity),
});

const diff = (original, updated) =>
    Object.fromEntries(Object.entries(updated).filter(([key, value]) => original[key] !== value));

const hasChanges = (changes) => Object.keys(changes).length > 0;

export const getCapacity = (rows) =>
    rows.reduce((total, row) => total + (Number(row.available_quantity) || 0), 0);

const PRICE_PATTERN = /^\d+([.,]\d{1,2})?$/;

function validateTicketRow(row, names) {
    const name = row.name.trim();
    if (!name) return 'Chaque type de ticket doit avoir un nom.';
    if (names.has(name.toLowerCase())) return `Le type de ticket « ${name} » existe en double.`;
    if (!PRICE_PATTERN.test(row.price)) {
        return `Le prix de « ${name} » doit être un montant positif (2 décimales max).`;
    }
    const quantity = Number(row.available_quantity);
    if (row.available_quantity === '' || !Number.isInteger(quantity) || quantity < 0) {
        return `Le nombre de places de « ${name} » doit être un nombre entier positif.`;
    }
    return null;
}

export function validateEventForm(form, rows) {
    if (!form.name.trim()) return 'Le nom de l\'événement est obligatoire.';
    if (!form.start_date || !form.start_time || !form.end_date || !form.end_time) {
        return 'Les dates et heures de début et de fin sont obligatoires.';
    }
    if (`${form.end_date}T${form.end_time}` < `${form.start_date}T${form.start_time}`) {
        return 'La fin de l\'événement doit être après son début.';
    }

    const names = new Set();
    for (const row of rows) {
        const error = validateTicketRow(row, names);
        if (error) return error;
        names.add(row.name.trim().toLowerCase());
    }
    return null;
}

export class SaveStepError extends Error {
    constructor(step, cause) {
        super(`${step} : ${getApiErrorMessage(cause)}`, {cause});
        this.name = 'SaveStepError';
    }
}

async function runStep(step, action) {
    try {
        await action();
    } catch (error) {
        throw new SaveStepError(step, error);
    }
}

export async function saveEventChanges({event, ticketTypes, initialForm, form, rows}) {
    const eventChanges = diff(initialForm, {...form, name: form.name.trim()});
    if (hasChanges(eventChanges)) {
        await runStep('Événement', () => updateEvent(event.id, eventChanges));
    }

    const keptIds = new Set(rows.map(({id}) => id));
    for (const ticketType of ticketTypes.filter(({id}) => !keptIds.has(id))) {
        await runStep(`Retrait de « ${ticketType.name} »`, () => deleteTicketType(ticketType.id));
    }

    const ticketTypesById = new Map(ticketTypes.map((ticketType) => [ticketType.id, ticketType]));
    for (const row of rows.filter(({id}) => id !== null)) {
        const original = ticketTypesById.get(row.id);
        const changes = diff(
            {name: original.name, price: Number(original.price), available_quantity: original.available_quantity},
            toTicketPayload(row)
        );
        if (hasChanges(changes)) {
            await runStep(`Modification de « ${original.name} »`, () => updateTicketType(row.id, changes));
        }
    }

    for (const row of rows.filter(({id}) => id === null)) {
        const payload = toTicketPayload(row);
        await runStep(`Ajout de « ${payload.name} »`, () => addTicketType(event.id, payload));
    }
}
