import ReferenceManager from '@/components/ReferenceManager/ReferenceManager.jsx';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import {addRole, deleteRole, getRoles, updateRole} from '@/api/roles.js';
import {getUsers} from '@/api/users.js';
import {ROLES} from '@/utils/roles.js';
import {plural} from '@/utils/format.js';

const BASE_ROLES = new Set(Object.values(ROLES));

async function fetchRoles() {
    const [roles, users] = await Promise.all([getRoles(), getUsers()]);
    return roles.map((role) => ({
        ...role,
        usage: users.filter((user) => user.role_name === role.name).length,
    }));
}

function getLockReason(role) {
    if (BASE_ROLES.has(role.name)) return 'Rôle de base, il ne peut pas être supprimé';
    if (role.usage > 0) return `Attribué à ${plural(role.usage, 'utilisateur')}`;
    return null;
}

export default function RolesPage() {
    const {refreshCounts} = useAdminLayout();

    return (
        <ReferenceManager
            title="Rôles"
            addLabel="+ Ajouter un rôle"
            itemWord="rôle"
            usageHeader="Utilisateurs"
            fetchItems={fetchRoles}
            onCreate={addRole}
            onUpdate={updateRole}
            onDelete={deleteRole}
            getLockReason={getLockReason}
            onChanged={refreshCounts}
        />
    );
}
