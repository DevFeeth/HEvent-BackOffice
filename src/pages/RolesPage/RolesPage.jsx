import ReferenceManager from '@/components/ReferenceManager/ReferenceManager.jsx';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import {addRole, deleteRole, getRoles, updateRole} from '@/api/roles.js';
import {ROLES} from '@/utils/roles.js';
import {plural} from '@/utils/format.js';

const BASE_ROLES = new Set(Object.values(ROLES));

function getLockReason(role) {
    if (BASE_ROLES.has(role.name)) return 'Rôle de base, il ne peut pas être supprimé';
    if (role.user_count > 0) return `Attribué à ${plural(role.user_count, 'utilisateur')}`;
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
            usageKey="user_count"
            fetchPage={getRoles}
            onCreate={addRole}
            onUpdate={updateRole}
            onDelete={deleteRole}
            getLockReason={getLockReason}
            onChanged={refreshCounts}
        />
    );
}
