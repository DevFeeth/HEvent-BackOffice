import {useCallback, useState} from 'react';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import useAuth from '@/hooks/useAuth.js';
import {getUser, updateUser} from '@/api/users.js';
import {getRoles} from '@/api/roles.js';
import {organizerEventsPath, PATHS} from '@/routes/paths.js';
import {ROLES} from '@/utils/roles.js';
import {fullName} from '@/utils/users.js';
import {formatDate} from '@/utils/format.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import {ArrowRightIcon} from '@/components/icons.jsx';
import Loader from '@/components/Loader/Loader.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.jsx';
import FormField from '@/components/FormField/FormField.jsx';
import styles from './UserEditPage.module.css';

const MIN_PASSWORD_LENGTH = 8;
const TEXT_FIELDS = ['first_name', 'last_name', 'email', 'address', 'postal_code', 'city'];

async function fetchUserAndRoles(id) {
    const [user, roles] = await Promise.all([getUser(id), getRoles()]);
    return {user, roles};
}

const toUserForm = (user) => ({
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    email: user.email ?? '',
    address: user.address ?? '',
    postal_code: user.postal_code ?? '',
    city: user.city ?? '',
    role_name: user.role_name,
    is_active: user.is_active ? 'true' : 'false',
    password: '',
});

function validate(form) {
    if (!form.first_name.trim() || !form.last_name.trim()) return 'Le prénom et le nom sont obligatoires.';
    if (!form.email.trim()) return 'L\'adresse email est obligatoire.';
    if (form.password && form.password.length < MIN_PASSWORD_LENGTH) {
        return `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
    }
    return null;
}

function getChangedFields(initial, form) {
    const fields = {};
    for (const field of TEXT_FIELDS) {
        const value = form[field].trim();
        if (value !== initial[field].trim()) fields[field] = value;
    }
    if (form.role_name !== initial.role_name) fields.role_name = form.role_name;
    if (form.is_active !== initial.is_active) fields.is_active = form.is_active === 'true';
    if (form.password) fields.password = form.password;
    return fields;
}

function UserEditForm({user, roles, backPath}) {
    const navigate = useNavigate();
    const {user: currentUser} = useAuth();
    const isSelf = user.id === currentUser.id;

    const [initialForm] = useState(() => toUserForm(user));
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const updateField = (field) => (e) => setForm((current) => ({...current, [field]: e.target.value}));

    async function handleSubmit(e) {
        e.preventDefault();
        const message = validate(form);
        setError(message ?? '');
        if (message) return;

        const fields = getChangedFields(initialForm, form);
        if (Object.keys(fields).length === 0) {
            navigate(backPath);
            return;
        }

        setSaving(true);
        try {
            await updateUser(user.id, fields);
            navigate(backPath);
        } catch (err) {
            setSaving(false);
            setError(getApiErrorMessage(err, 'L\'enregistrement a échoué.'));
        }
    }

    return (
        <>
            <PageHeader title={`Modifier ${fullName(user)}`} back={{to: backPath, label: 'Retour aux utilisateurs'}}>
                {user.role_name === ROLES.ORGANIZER && (
                    <Link className="button button--secondary" to={organizerEventsPath(user.id)}>
                        Voir ses événements <ArrowRightIcon/>
                    </Link>
                )}
            </PageHeader>

            <form className={styles.card} onSubmit={handleSubmit} noValidate>
                <h2 className={styles.sectionTitle}>Informations personnelles</h2>
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

                <h2 className={styles.sectionTitle}>Compte</h2>
                <div className={styles.grid}>
                    <FormField label="Rôle" hint={isSelf ? 'Vous ne pouvez pas modifier votre propre rôle' : undefined}>
                        <select value={form.role_name} onChange={updateField('role_name')} disabled={isSelf}>
                            {roles.map((role) => (
                                <option key={role.name} value={role.name}>{role.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Statut" hint={isSelf ? 'Vous ne pouvez pas désactiver votre propre compte' : undefined}>
                        <select value={form.is_active} onChange={updateField('is_active')} disabled={isSelf}>
                            <option value="true">Actif</option>
                            <option value="false">Désactivé</option>
                        </select>
                    </FormField>
                    <FormField
                        label="Nouveau mot de passe (optionnel)"
                        hint={`Laisser vide pour ne pas le changer. ${MIN_PASSWORD_LENGTH} caractères minimum.`}
                    >
                        <input
                            type="password"
                            value={form.password}
                            onChange={updateField('password')}
                            autoComplete="new-password"
                            maxLength={72}
                        />
                    </FormField>
                    <FormField label="Inscrit le">
                        <input value={formatDate(user.created_at)} readOnly disabled/>
                    </FormField>
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <div className={styles.actions}>
                    <Link className="button button--secondary" to={backPath}>Annuler</Link>
                    <button type="submit" disabled={saving}>
                        {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </>
    );
}

export default function UserEditPage() {
    const {id} = useParams();
    const location = useLocation();
    const backPath = location.state?.back ?? PATHS.USERS;
    const fetcher = useCallback(() => fetchUserAndRoles(id), [id]);
    const {data, loading, error, reload, version} = useFetch(fetcher);

    if (error) {
        return (
            <>
                <PageHeader title="Modifier l'utilisateur" back={{to: backPath, label: 'Retour aux utilisateurs'}}/>
                <ErrorMessage error={error} fallback="Impossible de charger l'utilisateur." onRetry={reload}/>
            </>
        );
    }

    if (loading && !data) return <Loader/>;

    return <UserEditForm key={version} user={data.user} roles={data.roles} backPath={backPath}/>;
}
