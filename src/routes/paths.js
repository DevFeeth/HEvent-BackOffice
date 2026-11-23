// Toutes les URLs de l'application, à un seul endroit
export const PATHS = {
    LOGIN: '/',
    USERS: '/utilisateurs',
    ORGANIZER_NEW: '/utilisateurs/nouvel-organisateur',
    EVENTS: '/evenements',
    EVENT_EDIT: '/evenements/:id/modifier',
    CATEGORIES: '/categories',
    ROLES: '/roles',
};

// Page d'arrivée après connexion
export const HOME_PATH = PATHS.USERS;

// Construction des URLs avec paramètres
export const eventEditPath = (eventId) => PATHS.EVENT_EDIT.replace(':id', eventId);
export const organizerEventsPath = (organizerId) => `${PATHS.EVENTS}?organizer=${organizerId}`;
// Liste des utilisateurs, éventuellement filtrée sur un rôle (ex : usersPath('ORGANIZER'))
export const usersPath = (roleName) => (roleName ? `${PATHS.USERS}?role=${roleName}` : PATHS.USERS);
