import {useCallback, useMemo, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import useListControls from '@/hooks/useListControls.js';
import useAuth from '@/hooks/useAuth.js';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import useConfirm from '@/hooks/useConfirm.js';
import {deleteUser, getUsers, updateUser} from '@/api/users.js';
import {getRoles} from '@/api/roles.js';
import {getEvents} from '@/api/events.js';
import {organizerEventsPath, PATHS} from '@/routes/paths.js';
import {formatDate} from '@/utils/format.js';
import {fullName, userMatches} from '@/utils/users.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import {ArrowRightIcon} from '@/components/icons.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import DataList from '@/components/DataList/DataList.jsx';
import cells from '@/styles/cells.module.css';
import styles from './UsersPage.module.css';

const NO_USERS = [];

// Utilisateurs (les plus récents en premier) + nombre d'événements de chacun + rôles disponibles
async function fetchUsersAndRoles() {
    const [users, roles, events] = await Promise.all([getUsers(), getRoles(), getEvents()]);

    const eventCountByUser = new Map();
    for (const {organizer_id: organizerId} of events) {
        eventCountByUser.set(organizerId, (eventCountByUser.get(organizerId) ?? 0) + 1);
    }

    return {
        users: users
            .map((user) => ({...user, eventCount: eventCountByUser.get(user.id) ?? 0}))
            .toSorted((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        roles,
    };
}

export default function UsersPage() {
    const {user: currentUser} = useAuth();
    const {refreshCounts} = useAdminLayout();
    const confirm = useConfirm();
    const {data, loading, error, reload} = useFetch(fetchUsersAndRoles);

    // Filtre par rôle gardé dans l'URL (?role=ORGANIZER) : on peut y faire un lien et il survit au rechargement
    const [searchParams, setSearchParams] = useSearchParams();
    const roleFilter = searchParams.get('role') ?? '';

    const allUsers = data?.users ?? NO_USERS;
    const users = useMemo(
        () => (roleFilter ? allUsers.filter((user) => user.role_name === roleFilter) : allUsers),
        [allUsers, roleFilter]
    );
    const controls = useListControls(users, userMatches);
    const {setPage} = controls;

    const [updatingId, setUpdatingId] = useState(null);
    const [actionError, setActionError] = useState('');

    const changeRoleFilter = (roleName) => {
        setSearchParams(roleName ? {role: roleName} : {}, {replace: true});
        setPage(1);
    };

    // Lance un appel API sur un utilisateur puis recharge la liste et les compteurs du menu
    const runOnUser = useCallback(async (user, action, fallback) => {
        setUpdatingId(user.id);
        setActionError('');
        try {
            await action();
            reload();
            refreshCounts();
        } catch (err) {
            setActionError(getApiErrorMessage(err, fallback));
        } finally {
            setUpdatingId(null);
        }
    }, [reload, refreshCounts]);

    const changeUser = useCallback(
        (user, fields) => runOnUser(user, () => updateUser(user.id, fields), 'La modification a échoué.'),
        [runOnUser]
    );

    const handleDelete = useCallback(async (user) => {
        const confirmed = await confirm({
            title: `Supprimer ${fullName(user)} ?`,
            message: (
                <>
                    Le compte <strong>{user.email}</strong> sera définitivement supprimé. Cette action est irréversible.
                    Un compte qui a des commandes ou des tickets ne peut pas être supprimé : désactivez-le à la place.
                </>
            ),
        });
        if (confirmed) {
            await runOnUser(user, () => deleteUser(user.id), 'La suppression a échoué.');
        }
    }, [confirm, runOnUser]);

    // Les colonnes dépendent des rôles chargés et de l'utilisateur en cours de modification
    const columns = useMemo(() => {
        const roles = data?.roles ?? [];
        // On ne peut pas modifier son propre compte (risque de perdre l'accès admin)
        const isLocked = (user) => user.id === currentUser.id || updatingId === user.id;
        const deleteLockReason = (user) => {
            if (user.id === currentUser.id) return 'Vous ne pouvez pas supprimer votre propre compte';
            if (user.eventCount > 0) return 'Cet utilisateur a des événements : désactivez son compte à la place';
            return null;
        };

        return [
            {
                key: 'name',
                header: 'Utilisateur',
                render: (user) => (
                    <>
                        <div className={cells.primary}>{fullName(user)}</div>
                        <div className={cells.secondary}>{user.city}</div>
                    </>
                ),
            },
            {key: 'email', header: 'Adresse email'},
            {
                key: 'role',
                header: 'Rôle',
                render: (user) => (
                    <select
                        className={styles.select}
                        value={user.role_name}
                        onChange={(e) => changeUser(user, {role_name: e.target.value})}
                        disabled={isLocked(user)}
                        aria-label={`Rôle de ${fullName(user)}`}
                    >
                        {roles.map((role) => (
                            <option key={role.name} value={role.name}>{role.label}</option>
                        ))}
                    </select>
                ),
            },
            {
                key: 'events',
                header: 'Événements',
                align: 'center',
                render: (user) => (user.eventCount > 0 ? (
                    <Link className={cells.action} to={organizerEventsPath(user.id)} title="Voir ses événements">
                        {user.eventCount} <ArrowRightIcon/>
                    </Link>
                ) : <span className={cells.secondary}>—</span>),
            },
            {
                key: 'status',
                header: 'Statut',
                render: (user) => (
                    <span className={user.is_active ? styles.active : styles.inactive}>
                        {user.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                ),
            },
            {key: 'created_at', header: 'Inscrit le', render: (user) => formatDate(user.created_at)},
            {
                key: 'actions',
                header: 'Actions',
                align: 'right',
                render: (user) => (
                    <div className={styles.rowActions}>
                        <button
                            type="button"
                            className="button--link"
                            onClick={() => changeUser(user, {is_active: !user.is_active})}
                            disabled={isLocked(user)}
                        >
                            {user.is_active ? 'Désactiver' : 'Réactiver'}
                        </button>
                        <button
                            type="button"
                            className={`button--link ${styles.danger}`}
                            onClick={() => handleDelete(user)}
                            disabled={isLocked(user) || Boolean(deleteLockReason(user))}
                            title={deleteLockReason(user) ?? undefined}
                        >
                            Supprimer
                        </button>
                    </div>
                ),
            },
        ];
    }, [data, currentUser.id, updatingId, changeUser, handleDelete]);

    // Onglets du filtre : « Tous » + un par rôle, avec le nombre d'utilisateurs
    const roleTabs = useMemo(() => {
        const countByRole = new Map();
        for (const {role_name: role} of allUsers) {
            countByRole.set(role, (countByRole.get(role) ?? 0) + 1);
        }
        return [
            {name: '', label: 'Tous', count: allUsers.length},
            ...(data?.roles ?? []).map((role) => ({...role, count: countByRole.get(role.name) ?? 0})),
        ];
    }, [allUsers, data]);

    const filters = (
        <div className={styles.roleFilter} role="group" aria-label="Filtrer par rôle">
            {roleTabs.map((tab) => (
                <button
                    key={tab.name}
                    type="button"
                    className={`${styles.roleTab} ${roleFilter === tab.name ? styles.roleTabActive : ''}`}
                    onClick={() => changeRoleFilter(tab.name)}
                    aria-pressed={roleFilter === tab.name}
                >
                    {tab.label}
                    <span className={styles.roleCount}>{tab.count}</span>
                </button>
            ))}
        </div>
    );

    return (
        <>
            <PageHeader title="Utilisateurs">
                <Link className="button" to={PATHS.ORGANIZER_NEW}>+ Ajouter un organisateur</Link>
            </PageHeader>

            {actionError && <p className={styles.error} role="alert">{actionError}</p>}

            <DataList
                controls={controls}
                itemWord="utilisateur"
                filters={filters}
                columns={columns}
                getRowKey={(user) => user.id}
                loading={loading}
                error={error}
                onRetry={reload}
                emptyMessage="Aucun utilisateur trouvé."
            />
        </>
    );
}
