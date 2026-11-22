import {useCallback, useMemo, useState} from 'react';
import useFetch from '@/hooks/useFetch.js';
import useListControls from '@/hooks/useListControls.js';
import useAuth from '@/hooks/useAuth.js';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import {getUsers, updateUser} from '@/api/users.js';
import {getRoles} from '@/api/roles.js';
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
    const {data, loading, error, reload} = useFetch(fetchUsersAndRoles);
    const controls = useListControls(data?.users ?? NO_USERS, userMatches);
    const [updatingId, setUpdatingId] = useState(null);
    const [actionError, setActionError] = useState('');

    const changeUser = useCallback(async (user, fields) => {
        setUpdatingId(user.id);
        setActionError('');
        try {
            await updateUser(user.id, fields);
            reload();
            refreshCounts();
        } catch (err) {
            setActionError(getApiErrorMessage(err, 'La modification a échoué.'));
        } finally {
            setUpdatingId(null);
        }
    }, [reload, refreshCounts]);

    // Les colonnes dépendent des rôles chargés et de l'utilisateur en cours de modification
    const columns = useMemo(() => {
        const roles = data?.roles ?? [];
        // On ne peut pas modifier son propre compte (risque de perdre l'accès admin)
        const isLocked = (user) => user.id === currentUser.id || updatingId === user.id;

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
                    <button
                        type="button"
                        className="button--link"
                        onClick={() => changeUser(user, {is_active: !user.is_active})}
                        disabled={isLocked(user)}
                    >
                        {user.is_active ? 'Désactiver' : 'Réactiver'}
                    </button>
                ),
            },
        ];
    }, [data, currentUser.id, updatingId, changeUser]);

    return (
        <>
            <PageHeader title="Utilisateurs"/>

            {actionError && <p className={styles.error} role="alert">{actionError}</p>}

            <DataList
                controls={controls}
                itemWord="utilisateur"
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
