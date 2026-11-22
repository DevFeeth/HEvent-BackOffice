import {Navigate, Route, Routes} from 'react-router-dom';
import {PATHS} from './paths.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import AdminLayout from '@/layouts/AdminLayout.jsx';
import LoginPage from '@/pages/LoginPage/LoginPage.jsx';
import OrganizersPage from '@/pages/OrganizersPage/OrganizersPage.jsx';
import EventsPage from '@/pages/EventsPage/EventsPage.jsx';
import EventEditPage from '@/pages/EventEditPage/EventEditPage.jsx';
import UsersPage from '@/pages/UsersPage/UsersPage.jsx';

export default function AppRouter() {
    return (
        <Routes>
            {/* Pages publiques */}
            <Route element={<PublicRoute/>}>
                <Route path={PATHS.LOGIN} element={<LoginPage/>}/>
            </Route>

            {/* Pages protégées, toutes avec le menu latéral de l'AdminLayout */}
            <Route element={<ProtectedRoute/>}>
                <Route element={<AdminLayout/>}>
                    <Route path={PATHS.ORGANIZERS} element={<OrganizersPage/>}/>
                    <Route path={PATHS.EVENTS} element={<EventsPage/>}/>
                    <Route path={PATHS.EVENT_EDIT} element={<EventEditPage/>}/>
                    <Route path={PATHS.USERS} element={<UsersPage/>}/>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to={PATHS.LOGIN} replace/>}/>
        </Routes>
    );
}
