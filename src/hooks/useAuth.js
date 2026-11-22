import {useContext} from 'react';
import {AuthContext} from '@/context/authContext.js';

export default function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
    }
    return context;
}
