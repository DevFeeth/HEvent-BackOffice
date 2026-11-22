// Rôles définis par l'API (table "role")
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

// Rôles autorisés à se connecter au BackOffice
export const BACKOFFICE_ROLES = [ROLES.ADMIN];

export const canAccessBackOffice = (user) => BACKOFFICE_ROLES.includes(user?.role_name);

// Erreur levée quand un compte valide n'a pas le bon rôle
export class ForbiddenRoleError extends Error {
    constructor() {
        super('Ce compte n\'a pas accès au BackOffice.');
        this.name = 'ForbiddenRoleError';
    }
}
