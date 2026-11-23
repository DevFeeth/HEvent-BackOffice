import {useCallback, useEffect, useMemo, useState} from 'react';
import {AuthContext} from './authContext.js';
import {login as apiLogin} from '@/api/auth.js';
import {getMe} from '@/api/users.js';
import {AUTH_EXPIRED_EVENT} from '@/api/client.js';
import {clearToken, getToken, setToken} from '@/utils/tokenStorage.js';
import {canAccessBackOffice, ForbiddenRoleError} from '@/utils/roles.js';

export default function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(getToken()));

    useEffect(() => {
        if (!getToken()) return;
        getMe()
            .then((me) => {
                if (canAccessBackOffice(me)) {
                    setUser(me);
                } else {
                    clearToken();
                }
            })
            .catch(() => clearToken())
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const onExpired = () => setUser(null);
        window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
    }, []);

    const login = useCallback(async (email, password, remember = true) => {
        const token = await apiLogin(email, password);
        setToken(token, remember);
        try {
            const me = await getMe();
            if (!canAccessBackOffice(me)) {
                throw new ForbiddenRoleError();
            }
            setUser(me);
        } catch (error) {
            clearToken();
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({user, loading, isAuthenticated: Boolean(user), login, logout}),
        [user, loading, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
