import {useMemo} from 'react';
import {NavLink, Outlet} from 'react-router-dom';
import useAuth from '@/hooks/useAuth.js';
import useFetch from '@/hooks/useFetch.js';
import {getUsers} from '@/api/users.js';
import {getEvents} from '@/api/events.js';
import {getCategories} from '@/api/categories.js';
import {getRoles} from '@/api/roles.js';
import {PATHS} from '@/routes/paths.js';
import {ROLE_LABELS} from '@/utils/roles.js';
import {CalendarIcon, ShieldIcon, TagIcon, UsersIcon} from '@/components/icons.jsx';
import styles from './AdminLayout.module.css';

async function fetchCounts() {
    const [users, events, categories, roles] = await Promise.all([
        getUsers(), getEvents(), getCategories(), getRoles(),
    ]);
    return {
        events: events.length,
        users: users.length,
        categories: categories.length,
        roles: roles.length,
    };
}

const NAV_SECTIONS = [
    {
        title: 'Gestion',
        items: [
            {to: PATHS.USERS, label: 'Utilisateurs', icon: UsersIcon, countKey: 'users'},
            {to: PATHS.EVENTS, label: 'Événements', icon: CalendarIcon, countKey: 'events'},
        ],
    },
    {
        title: 'Paramètres',
        items: [
            {to: PATHS.CATEGORIES, label: 'Catégories', icon: TagIcon, countKey: 'categories'},
            {to: PATHS.ROLES, label: 'Rôles', icon: ShieldIcon, countKey: 'roles'},
        ],
    },
];

const navLinkClass = ({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`;

export default function AdminLayout() {
    const {user, logout} = useAuth();
    const {data: counts, reload: refreshCounts} = useFetch(fetchCounts);

    const outletContext = useMemo(() => ({refreshCounts}), [refreshCounts]);

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>HEvent</div>

                {NAV_SECTIONS.map(({title, items}) => (
                    <nav key={title} className={styles.nav}>
                        <span className={styles.navTitle}>{title}</span>
                        {items.map(({to, label, icon: Icon, countKey}) => (
                            <NavLink key={to} to={to} className={navLinkClass}>
                                <Icon/>
                                <span className={styles.navLabel}>{label}</span>
                                <span className={styles.navCount}>{counts?.[countKey] ?? ''}</span>
                            </NavLink>
                        ))}
                    </nav>
                ))}

                <div className={styles.account}>
                    <span className={styles.accountName}>{user.first_name} {user.last_name}</span>
                    <span className={styles.accountRole}>{ROLE_LABELS[user.role_name]}</span>
                    <button type="button" className={styles.logout} onClick={logout}>Se déconnecter</button>
                </div>
            </aside>

            <main className={styles.content}>
                <Outlet context={outletContext}/>
            </main>
        </div>
    );
}
