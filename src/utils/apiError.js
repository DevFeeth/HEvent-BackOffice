export const ERROR_KIND = {
    NETWORK: 'network',
    SERVER: 'server',
    CLIENT: 'client',
};

export function getErrorKind(error) {
    const status = error?.response?.status;
    if (!status) return ERROR_KIND.NETWORK;
    return status >= 500 ? ERROR_KIND.SERVER : ERROR_KIND.CLIENT;
}

export const isRetryableError = (error) => getErrorKind(error) !== ERROR_KIND.CLIENT;

const KNOWN_MESSAGES = {
    'The dates of an event cannot be in the past': 'Les dates d\'un événement ne peuvent pas être dans le passé.',
    'The quantity cannot be lower than the number of tickets already sold':
        'Le nombre de places ne peut pas être inférieur au nombre de tickets déjà vendus.',
    'An event with tickets sold cannot go back to draft':
        'Un événement avec des tickets vendus ne peut pas repasser en brouillon.',
    'This value is already in use': 'Cette valeur est déjà utilisée.',
    'Cannot delete: other data is linked to it': 'Suppression impossible : d\'autres données y sont liées.',
    'Referenced resource does not exist': 'Un élément lié n\'existe pas.',
    'Base roles cannot be deleted': 'Les rôles de base ne peuvent pas être supprimés.',
    'Resource not found': 'Élément introuvable.',
    'Inconsistent data': 'Les données sont incohérentes (par exemple une fin avant le début).',
    'A value is out of range': 'Une valeur dépasse la limite autorisée.',
    'No field to update': 'Aucune modification à enregistrer.',
};

const STATUS_MESSAGES = {
    400: 'Les données envoyées sont invalides.',
    401: 'Votre session a expiré. Veuillez vous reconnecter.',
    403: 'Vous n\'avez pas le droit d\'effectuer cette action.',
    404: 'Élément introuvable.',
    409: 'Cette action entre en conflit avec les données existantes.',
};

function getClientErrorMessage(response, fallback) {
    const body = response.data;
    if (typeof body === 'string' && body) {
        return KNOWN_MESSAGES[body] ?? body;
    }
    if (Array.isArray(body) && body.length > 0) {
        return body.map(({message}) => message).join(' ');
    }
    return STATUS_MESSAGES[response.status] ?? fallback;
}

export function getApiErrorMessage(error, fallback = 'Une erreur est survenue.') {
    switch (getErrorKind(error)) {
        case ERROR_KIND.NETWORK:
            return 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.';
        case ERROR_KIND.SERVER:
            return 'Le serveur rencontre un problème. Réessayez dans quelques instants.';
        default:
            return getClientErrorMessage(error.response, fallback);
    }
}
