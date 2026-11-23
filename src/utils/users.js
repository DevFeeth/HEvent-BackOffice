export const fullName = (user) => (user ? `${user.first_name} ${user.last_name}` : '—');

export const userMatches = (user, query) =>
    `${fullName(user)} ${user.email} ${user.city ?? ''}`.toLowerCase().includes(query);
