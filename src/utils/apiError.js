// Traductions des messages d'erreur connus renvoyés par l'API
const KNOWN_MESSAGES = {
    'The dates of an event cannot be in the past': 'Les dates d\'un événement ne peuvent pas être dans le passé.',
    'The quantity cannot be lower than the number of tickets already sold':
        'Le nombre de places ne peut pas être inférieur au nombre de tickets déjà vendus.',
    'An event with tickets sold cannot go back to draft':
        'Un événement avec des tickets vendus ne peut pas repasser en brouillon.',
};

/** Transforme une erreur axios en message lisible pour l'utilisateur. */
export function getApiErrorMessage(error, fallback = 'Une erreur est survenue.') {
    const response = error?.response;
    if (!response) return "Impossible de joindre l'API.";

    const body = response.data;
    if (typeof body === 'string' && body) {
        return KNOWN_MESSAGES[body] ?? body;
    }
    // Erreurs de validation (vine) : [{message, field}, ...]
    if (Array.isArray(body) && body.length > 0) {
        return body.map((e) => e.message).join(' ');
    }
    switch (response.status) {
        case 403: return 'Vous n\'avez pas le droit d\'effectuer cette action.';
        case 404: return 'Élément introuvable.';
        default: return fallback;
    }
}
