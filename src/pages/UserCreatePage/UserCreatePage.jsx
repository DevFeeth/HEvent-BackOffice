import {useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {createUser, updateUser} from '@/api/users.js';
import {getRoles} from '@/api/roles.js';
import {usersPath} from '@/routes/paths.js';
import {ROLES} from '@/utils/roles.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import useFetch from '@/hooks/useFetch.js';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import FormField from '@/components/FormField/FormField.jsx';
import styles from './UserCreatePage.module.css';

// L'inscription crée toujours un compte USER : un autre rôle demande une 2e requête
const DEFAULT_ROLE = ROLES.USER;

const fetchRoles = async () => (await getRoles()).items;

const EMPTY_FORM = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    address: '',
    postal_code: '',
    city: '',
};

const OPTIONAL_FIELDS = ['address', 'postal_code', 'city'];
const MIN_PASSWORD_LENGTH = 8;

function toPayload(form) {
    const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, key === 'password' ? value : value.trim()])
    );
    for (const field of OPTIONAL_FIELDS) {
        if (!payload[field]) delete payload[field];
    }
    return payload;
}

function validate(form) {
    if (!form.first_name.trim() || !form.last_name.trim()) return 'Le prénom et le nom sont obligatoires.';
    if (!form.email.trim()) return 'L\'adresse email est obligatoire.';
    if (form.password.length < MIN_PASSWORD_LENGTH) {
        return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    }
    return null;
}

export default function UserCreatePage() {
    const navigate = useNavigate();
    const {refreshCounts} = useAdminLayout();
    // ?role= : le rôle de l'onglet actif dans la liste des utilisateurs
    const [searchParams] = useSearchParams();
    const backPath = usersPath(searchParams.get('role'));
    const {data: roles} = useFetch(fetchRoles);

    const [form, setForm] = useState(EMPTY_FORM);
    const [roleName, setRoleName] = useState(searchParams.get('role') || DEFAULT_ROLE);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const updateField = (field) => (e) => setForm((current) => ({...current, [field]: e.target.value}));

    async function handleSubmit(e) {
        e.preventDefault();
        const message = validate(form);
        setError(message ?? '');
        if (message) return;

        setSaving(true);
        let userId = null;
        try {
            userId = await createUser(toPayload(form));
            if (roleName !== DEFAULT_ROLE) await updateUser(userId, {role_name: roleName});
            refreshCounts();
            navigate(usersPath(roleName));
        } catch (err) {
            setSaving(false);
            setError(userId
                ? 'Le compte a été créé mais son rôle n\'a pas pu lui être attribué. Modifiez son rôle depuis la page Utilisateurs.'
                : getApiErrorMessage(err, 'La création a échoué.'));
        }
    }

    return (
        <>
            <PageHeader title="Ajouter un utilisateur" back={{to: backPath, label: 'Retour aux utilisateurs'}}/>

            <form className={styles.card} onSubmit={handleSubmit} noValidate>
                <div className={styles.grid}>
                    <FormField label="Prénom">
                        <input value={form.first_name} onChange={updateField('first_name')} maxLength={50} required/>
                    </FormField>
                    <FormField label="Nom">
                        <input value={form.last_name} onChange={updateField('last_name')} maxLength={50} required/>
                    </FormField>
                    <FormField label="Adresse email">
                        <input type="email" value={form.email} onChange={updateField('email')} maxLength={254} required/>
                    </FormField>
                    <FormField label="Mot de passe" hint={`${MIN_PASSWORD_LENGTH} caractères minimum`}>
                        <input
                            type="password"
                            value={form.password}
                            onChange={updateField('password')}
                            autoComplete="new-password"
                            minLength={MIN_PASSWORD_LENGTH}
                            maxLength={72}
                            required
                        />
                    </FormField>
                    <FormField label="Rôle">
                        <select value={roleName} onChange={(e) => setRoleName(e.target.value)} disabled={!roles}>
                            {(roles ?? [{name: roleName, label: '…'}]).map((role) => (
                                <option key={role.name} value={role.name}>{role.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Adresse (optionnel)">
                        <input value={form.address} onChange={updateField('address')} maxLength={255}/>
                    </FormField>
                    <div className={styles.cityRow}>
                        <FormField label="Code postal">
                            <input value={form.postal_code} onChange={updateField('postal_code')} maxLength={10}/>
                        </FormField>
                        <FormField label="Ville">
                            <input value={form.city} onChange={updateField('city')} maxLength={100}/>
                        </FormField>
                    </div>
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <div className={styles.actions}>
                    <Link className="button button--secondary" to={backPath}>Annuler</Link>
                    <button type="submit" disabled={saving}>
                        {saving ? 'Création…' : 'Créer l\'utilisateur'}
                    </button>
                </div>
            </form>
        </>
    );
}
