import {NavLink, Outlet} from 'react-router-dom';
import useAuth from '@/hooks/useAuth.js';
import useFetch from '@/hooks/useFetch.js';
import {getUsers} from '@/api/users.js';
import {getEvents} from '@/api/events.js';
import {PATHS} from '@/routes/paths.js';
import {ROLE_LABELS, ROLES} from '@/utils/roles.js';
import {CalendarIcon, UsersIcon} from '@/components/icons.jsx';
import styles from './AdminLayout.module.css';

// Compteurs affichés dans le menu
async function fetchCounts() {
    const [users, events] = await Promise.all([getUsers(), getEvents()]);
    return {
        organizers: users.filter((u) => u.role_name === ROLES.ORGANIZER).length,
        events: events.length,
        users: users.length,
    };
}

const NAV_ITEMS = [
    {to: PATHS.ORGANIZERS, label: 'Organisateurs', icon: UsersIcon, countKey: 'organizers'},
    {to: PATHS.EVENTS, label: 'Événements', icon: CalendarIcon, countKey: 'events'},
    {to: PATHS.USERS, label: 'Utilisateurs', icon: UsersIcon, countKey: 'users'},
];

// Structure commune à toutes les pages connectées : menu latéral + contenu
export default function AdminLayout() {
    const {user, logout} = useAuth();
    const {data: counts} = useFetch(fetchCounts);

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>HEvent</div>

                <nav className={styles.nav}>
                    <span className={styles.navTitle}>Gestion</span>
                    {NAV_ITEMS.map(({to, label, icon: Icon, countKey}) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                        >
                            <Icon/>
                            <span className={styles.navLabel}>{label}</span>
                            <span className={styles.navCount}>{counts?.[countKey] ?? ''}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.account}>
                    <span className={styles.accountName}>{user.first_name} {user.last_name}</span>
                    <span className={styles.accountRole}>{ROLE_LABELS[user.role_name]}</span>
                    <button className={styles.logout} onClick={logout}>Se déconnecter</button>
                </div>
            </aside>

            <main className={styles.content}>
                <Outlet/>
            </main>
        </div>
    );
}
