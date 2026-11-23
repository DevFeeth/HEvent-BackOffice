import {Navigate, Outlet} from 'react-router-dom';
import useAuth from '@/hooks/useAuth.js';
import Loader from '@/components/Loader/Loader.jsx';
import {PATHS} from './paths.js';

export default function ProtectedRoute() {
    const {isAuthenticated, loading} = useAuth();

    if (loading) return <Loader/>;
    return isAuthenticated ? <Outlet/> : <Navigate to={PATHS.LOGIN} replace/>;
}
