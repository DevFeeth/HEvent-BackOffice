export const ROLES = {
    USER: 'USER',
    ORGANIZER: 'ORGANIZER',
    ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
    [ROLES.USER]: 'Utilisateur',
    [ROLES.ORGANIZER]: 'Organisateur',
    [ROLES.ADMIN]: 'Administrateur',
};

export const BACKOFFICE_ROLES = [ROLES.ADMIN];

export const canAccessBackOffice = (user) => BACKOFFICE_ROLES.includes(user?.role_name);

export class ForbiddenRoleError extends Error {
    constructor() {
        super('Ce compte n\'a pas accès au BackOffice.');
        this.name = 'ForbiddenRoleError';
    }
}
