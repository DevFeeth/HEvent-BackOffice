import {lazy, Suspense} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {PATHS} from './paths.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import Loader from '@/components/Loader/Loader.jsx';

const AdminLayout = lazy(() => import('@/layouts/AdminLayout.jsx'));
const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage.jsx'));
const UserCreatePage = lazy(() => import('@/pages/UserCreatePage/UserCreatePage.jsx'));
const EventsPage = lazy(() => import('@/pages/EventsPage/EventsPage.jsx'));
const EventEditPage = lazy(() => import('@/pages/EventEditPage/EventEditPage.jsx'));
const UsersPage = lazy(() => import('@/pages/UsersPage/UsersPage.jsx'));
const UserEditPage = lazy(() => import('@/pages/UserEditPage/UserEditPage.jsx'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage/CategoriesPage.jsx'));
const RolesPage = lazy(() => import('@/pages/RolesPage/RolesPage.jsx'));

export default function AppRouter() {
    return (
        <Suspense fallback={<Loader/>}>
            <Routes>
                <Route element={<PublicRoute/>}>
                    <Route path={PATHS.LOGIN} element={<LoginPage/>}/>
                </Route>

                <Route element={<ProtectedRoute/>}>
                    <Route element={<AdminLayout/>}>
                        <Route path={PATHS.USER_NEW} element={<UserCreatePage/>}/>
                        <Route path={PATHS.EVENTS} element={<EventsPage/>}/>
                        <Route path={PATHS.EVENT_NEW} element={<EventEditPage key="new"/>}/>
                        <Route path={PATHS.EVENT_EDIT} element={<EventEditPage/>}/>
                        <Route path={PATHS.USERS} element={<UsersPage/>}/>
                        <Route path={PATHS.USER_EDIT} element={<UserEditPage/>}/>
                        <Route path={PATHS.CATEGORIES} element={<CategoriesPage/>}/>
                        <Route path={PATHS.ROLES} element={<RolesPage/>}/>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to={PATHS.LOGIN} replace/>}/>
            </Routes>
        </Suspense>
    );
}
