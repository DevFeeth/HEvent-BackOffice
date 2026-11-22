// Petites fonctions liées aux utilisateurs, partagées entre plusieurs pages

export const fullName = (user) => (user ? `${user.first_name} ${user.last_name}` : '—');

// Recherche sur le nom, l'email et la ville (query déjà en minuscules)
export const userMatches = (user, query) =>
    `${fullName(user)} ${user.email} ${user.city ?? ''}`.toLowerCase().includes(query);
