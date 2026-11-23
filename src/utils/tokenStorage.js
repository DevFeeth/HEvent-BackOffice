const TOKEN_KEY = 'hevent_token';

export const getToken = () =>
    localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);

export const setToken = (token, remember = true) => {
    clearToken();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
};
