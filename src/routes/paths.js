export const PATHS = {
    LOGIN: '/',
    USERS: '/utilisateurs',
    USER_EDIT: '/utilisateurs/:id/modifier',
    ORGANIZER_NEW: '/utilisateurs/nouvel-organisateur',
    EVENTS: '/evenements',
    EVENT_NEW: '/evenements/nouveau',
    EVENT_EDIT: '/evenements/:id/modifier',
    CATEGORIES: '/categories',
    ROLES: '/roles',
};

export const HOME_PATH = PATHS.USERS;

export const userEditPath = (userId) => PATHS.USER_EDIT.replace(':id', userId);
export const eventEditPath = (eventId) => PATHS.EVENT_EDIT.replace(':id', eventId);
export const eventNewPath = (organizerId) => (organizerId ? `${PATHS.EVENT_NEW}?organizer=${organizerId}` : PATHS.EVENT_NEW);
export const organizerEventsPath = (organizerId) => `${PATHS.EVENTS}?organizer=${organizerId}`;
export const usersPath = (roleName) => (roleName ? `${PATHS.USERS}?role=${roleName}` : PATHS.USERS);
