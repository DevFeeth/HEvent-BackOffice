// Toutes les URLs de l'application, à un seul endroit
export const PATHS = {
    LOGIN: '/',
    ORGANIZERS: '/organisateurs',
    EVENTS: '/evenements',
    EVENT_EDIT: '/evenements/:id/modifier',
    USERS: '/utilisateurs',
};

// Page d'arrivée après connexion
export const HOME_PATH = PATHS.ORGANIZERS;

// Construction des URLs avec paramètres
export const eventEditPath = (eventId) => PATHS.EVENT_EDIT.replace(':id', eventId);
export const organizerEventsPath = (organizerId) => `${PATHS.EVENTS}?organizer=${organizerId}`;
