export function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${date.getFullYear()}`;
}

export const toDateInput = (value) => (value ? value.slice(0, 10) : '');

export const toTimeInput = (value) => (value ? value.slice(11, 16) : '');

export function formatDateInput(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}-${month}-${year}`;
}

export function plural(count, word) {
    return `${count} ${word}${count > 1 ? 's' : ''}`;
}
