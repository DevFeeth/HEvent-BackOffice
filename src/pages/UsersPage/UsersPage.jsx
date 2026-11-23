import {useCallback, useMemo, useState} from 'react';
import {Link, useLocation, useSearchParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import useListControls from '@/hooks/useListControls.js';
import useAuth from '@/hooks/useAuth.js';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import useConfirm from '@/hooks/useConfirm.js';
import {deleteUser, getUsers, updateUser} from '@/api/users.js';
import {getRoles} from '@/api/roles.js';
import {PATHS, userEditPath} from '@/routes/paths.js';
import {formatDate} from '@/utils/format.js';
import {fullName, userMatches} from '@/utils/users.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import DataList from '@/components/DataList/DataList.jsx';
import cells from '@/styles/cells.module.css';
import styles from './UsersPage.module.css';

const NO_USERS = [];

async function fetchUsersAndRoles() {
    const [users, roles] = await Promise.all([getUsers(), getRoles()]);
    return {
        users: users.toSorted((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        roles,
    };
}

export default function UsersPage() {
    const {user: currentUser} = useAuth();
    const {refreshCounts} = useAdminLayout();
    const confirm = useConfirm();
    const location = useLocation();
    const {data, loading, error, reload} = useFetch(fetchUsersAndRoles);

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
                    Un compte qui a des événements, des commandes ou des tickets ne peut pas être supprimé : désactivez-le à la place.
                </>
            ),
        });
        if (confirmed) {
            await runOnUser(user, () => deleteUser(user.id), 'La suppression a échoué.');
        }
    }, [confirm, runOnUser]);

    const columns = useMemo(() => {
        const roles = data?.roles ?? [];
        const isLocked = (user) => user.id === currentUser.id || updatingId === user.id;
        const isSelf = (user) => user.id === currentUser.id;

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
                        <Link
                            className={styles.rowLink}
                            to={userEditPath(user.id)}
                            state={{back: location.pathname + location.search}}
                        >
                            Modifier
                        </Link>
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
                            disabled={isLocked(user)}
                            title={isSelf(user) ? 'Vous ne pouvez pas supprimer votre propre compte' : undefined}
                        >
                            Supprimer
                        </button>
                    </div>
                ),
            },
        ];
    }, [data, currentUser.id, updatingId, changeUser, handleDelete, location]);

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
