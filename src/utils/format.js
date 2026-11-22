// "2026-09-12T10:00:00Z" -> "12-09-2026"
export function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${date.getFullYear()}`;
}

// Date d'événement renvoyée par l'API ("2026-10-22T00:00:00.000Z") -> "2026-10-22" (format <input type="date">)
export const toDateInput = (value) => (value ? value.slice(0, 10) : '');

// Heure d'événement renvoyée par l'API ("1970-01-01T09:00:00.000Z") -> "09:00" (format <input type="time">)
export const toTimeInput = (value) => (value ? value.slice(11, 16) : '');

// "2026-10-22" -> "22-10-2026"
export function formatDateInput(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}-${month}-${year}`;
}

// Gère le pluriel simple : plural(6, 'organisateur') -> "6 organisateurs"
export function plural(count, word) {
    return `${count} ${word}${count > 1 ? 's' : ''}`;
}
