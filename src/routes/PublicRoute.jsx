import {Navigate, Outlet} from 'react-router-dom';
import useAuth from '@/hooks/useAuth.js';
import Loader from '@/components/Loader/Loader.jsx';
import {HOME_PATH} from './paths.js';

export default function PublicRoute() {
    const {isAuthenticated, loading} = useAuth();

    if (loading) return <Loader/>;
    return isAuthenticated ? <Navigate to={HOME_PATH} replace/> : <Outlet/>;
}
