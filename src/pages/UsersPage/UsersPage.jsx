import {useCallback, useMemo, useState} from 'react';
import {Link, useLocation, useSearchParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import usePagedList from '@/hooks/usePagedList.js';
import useAuth from '@/hooks/useAuth.js';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import useConfirm from '@/hooks/useConfirm.js';
import {deleteUser, getUsers, updateUser} from '@/api/users.js';
import {getRoles} from '@/api/roles.js';
import {PATHS, userEditPath} from '@/routes/paths.js';
import {formatDate} from '@/utils/format.js';
import {fullName} from '@/utils/users.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import DataList from '@/components/DataList/DataList.jsx';
import cells from '@/styles/cells.module.css';
import styles from './UsersPage.module.css';

const NO_ROLES = [];

// Tous les rôles (peu nombreux) avec leur nombre d'utilisateurs, pour le filtre et le changement de rôle
const fetchRoles = async () => (await getRoles()).items;

export default function UsersPage() {
    const {user: currentUser} = useAuth();
    const {refreshCounts} = useAdminLayout();
    const confirm = useConfirm();
    const location = useLocation();

    const [searchParams, setSearchParams] = useSearchParams();
    const roleFilter = searchParams.get('role') ?? '';

    const fetchPage = useCallback(
        (params) => getUsers({...params, role_name: roleFilter || undefined}),
        [roleFilter]
    );
    const list = usePagedList(fetchPage);
    const {setPage, reload} = list;
    const {data: rolesData, reload: reloadRoles} = useFetch(fetchRoles);
    const roles = rolesData ?? NO_ROLES;

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
            reloadRoles();
            refreshCounts();
        } catch (err) {
            setActionError(getApiErrorMessage(err, fallback));
        } finally {
            setUpdatingId(null);
        }
    }, [reload, reloadRoles, refreshCounts]);

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
    }, [roles, currentUser.id, updatingId, changeUser, handleDelete, location]);

    // Les compteurs viennent de l'API (user_count) : pas besoin de charger tous les utilisateurs
    const roleTabs = useMemo(() => [
        {name: '', label: 'Tous', count: roles.reduce((sum, role) => sum + role.user_count, 0)},
        ...roles.map((role) => ({...role, count: role.user_count})),
    ], [roles]);

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
                list={list}
                itemWord="utilisateur"
                filters={filters}
                columns={columns}
                getRowKey={(user) => user.id}
                emptyMessage="Aucun utilisateur trouvé."
            />
        </>
    );
}
