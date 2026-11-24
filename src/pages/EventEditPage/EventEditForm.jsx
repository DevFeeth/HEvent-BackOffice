import {useState} from 'react';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {eventEditPath, organizerEventsPath, PATHS} from '@/routes/paths.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import {EVENT_STATUS_LABELS} from '@/utils/eventStatus.js';
import {fullName} from '@/utils/users.js';
import useConfirm from '@/hooks/useConfirm.js';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import {CheckIcon} from '@/components/icons.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import FormField from '@/components/FormField/FormField.jsx';
import TicketTypesEditor from './TicketTypesEditor.jsx';
import {
    createEventWithTickets,
    getCapacity,
    saveEventChanges,
    SaveStepError,
    toEventForm,
    toTicketRow,
    validateEventForm,
} from './eventForm.js';
import styles from './EventEditPage.module.css';

// event null : création d'un événement
export default function EventEditForm({event, ticketTypes, categories, organizers, saveError, onSaveError}) {
    const isNew = !event;
    const navigate = useNavigate();
    const confirm = useConfirm();
    const {refreshCounts} = useAdminLayout();
    const [searchParams] = useSearchParams();
    // Retour à la liste d'où l'on vient ; sans historique, aux événements de l'organisateur
    const location = useLocation();
    const backPath = location.state?.back ?? (isNew ? PATHS.EVENTS : organizerEventsPath(event.organizer_id));

    const [initialForm] = useState(() => toEventForm(event, searchParams.get('organizer') ?? ''));
    const [form, setForm] = useState(initialForm);
    const [rows, setRows] = useState(() => ticketTypes.map(toTicketRow));
    const [validationError, setValidationError] = useState('');
    const [saving, setSaving] = useState(false);

    const updateField = (field) => (e) => setForm((current) => ({...current, [field]: e.target.value}));

    const updateRow = (key, field, value) =>
        setRows((current) => current.map((row) => (row.key === key ? {...row, [field]: value} : row)));
    const addRow = () => setRows((current) => [...current, toTicketRow()]);
    async function removeRow(key) {
        const row = rows.find((r) => r.key === key);
        const isFilled = row.id || row.name.trim() || row.price.trim() || row.available_quantity.trim();
        if (isFilled) {
            const confirmed = await confirm({
                title: 'Retirer ce type de ticket ?',
                message: row.id
                    ? <>« <strong>{row.name || 'Sans nom'}</strong> » sera supprimé lors de l&apos;enregistrement de l&apos;événement.</>
                    : <>« <strong>{row.name || 'Sans nom'}</strong> » sera retiré du formulaire.</>,
                confirmLabel: 'Retirer',
            });
            if (!confirmed) return;
        }
        setRows((current) => current.filter((r) => r.key !== key));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        onSaveError('');
        const message = validateEventForm(form, rows);
        setValidationError(message ?? '');
        if (message) return;

        setSaving(true);
        try {
            if (isNew) {
                await createEventWithTickets({form, rows});
                refreshCounts();
            } else {
                await saveEventChanges({event, ticketTypes, initialForm, form, rows});
            }
            navigate(backPath);
        } catch (err) {
            setSaving(false);
            const errorMessage = err instanceof SaveStepError ? err.message : getApiErrorMessage(err);
            if (err.eventId) {
                // L'événement existe déjà : on continue en modification pour ne pas le créer deux fois
                refreshCounts();
                navigate(eventEditPath(err.eventId), {replace: true, state: {back: backPath, saveError: errorMessage}});
                return;
            }
            onSaveError(errorMessage);
        }
    }

    const errorMessage = validationError || saveError;
    const title = isNew ? 'Ajouter un événement' : 'Modifier l\'événement';

    return (
        <form onSubmit={handleSubmit} noValidate>
            <PageHeader title={title} back={{to: backPath, label: 'Retour aux événements'}}/>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Informations générales</h2>
                <div className={styles.generalGrid}>
                    <FormField label="Nom de l'événement">
                        <input value={form.name} onChange={updateField('name')} maxLength={100} required/>
                    </FormField>
                    <FormField label="Capacité maximale" hint="Somme des places des types de tickets">
                        <div className={`${styles.suffixInput} ${styles.readOnly}`}>
                            <input value={getCapacity(rows)} readOnly tabIndex={-1}/>
                            <span>places</span>
                        </div>
                    </FormField>
                </div>
                <div className={styles.detailsGrid}>
                    {isNew && (
                        <FormField label="Organisateur">
                            <select value={form.organizer_id} onChange={updateField('organizer_id')} required>
                                <option value="">Choisir un organisateur</option>
                                {organizers.map((organizer) => (
                                    <option key={organizer.id} value={organizer.id}>{fullName(organizer)}</option>
                                ))}
                            </select>
                        </FormField>
                    )}
                    <FormField label="Catégorie">
                        <select value={form.category_name} onChange={updateField('category_name')} required>
                            <option value="">Choisir une catégorie</option>
                            {categories.map((category) => (
                                <option key={category.name} value={category.name}>{category.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Statut">
                        <select value={form.status} onChange={updateField('status')}>
                            {Object.entries(EVENT_STATUS_LABELS).map(([status, label]) => (
                                <option key={status} value={status}>{label}</option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Dates et horaires</h2>
                <div className={styles.datesGrid}>
                    <FormField label="Date de début">
                        <input type="date" value={form.start_date} onChange={updateField('start_date')} required/>
                    </FormField>
                    <FormField label="Heure de début">
                        <input type="time" value={form.start_time} onChange={updateField('start_time')} required/>
                    </FormField>
                    <div className={styles.separator} aria-hidden/>
                    <FormField label="Date de fin">
                        <input
                            type="date"
                            value={form.end_date}
                            min={form.start_date}
                            onChange={updateField('end_date')}
                            required
                        />
                    </FormField>
                    <FormField label="Heure de fin">
                        <input type="time" value={form.end_time} onChange={updateField('end_time')} required/>
                    </FormField>
                </div>
            </section>

            <TicketTypesEditor rows={rows} onChange={updateRow} onAdd={addRow} onRemove={removeRow}/>

            {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}

            <div className={styles.actions}>
                <Link className="button button--secondary" to={backPath}>Annuler</Link>
                <button type="submit" className={styles.submit} disabled={saving}>
                    <CheckIcon/> {saving ? 'Enregistrement…' : (isNew ? 'Créer l\'événement' : 'Enregistrer les modifications')}
                </button>
            </div>
        </form>
    );
}
