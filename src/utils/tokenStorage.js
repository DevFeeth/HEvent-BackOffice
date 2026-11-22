const TOKEN_KEY = 'hevent_token';

// "Se souvenir de moi" coché   -> localStorage   (reste après fermeture du navigateur)
// "Se souvenir de moi" décoché -> sessionStorage (effacé à la fermeture de l'onglet)

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
