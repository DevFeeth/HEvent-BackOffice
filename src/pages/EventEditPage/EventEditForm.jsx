import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {organizerEventsPath} from '@/routes/paths.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import {CheckIcon} from '@/components/icons.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import FormField from '@/components/FormField/FormField.jsx';
import TicketTypesEditor from './TicketTypesEditor.jsx';
import {getCapacity, saveEventChanges, SaveStepError, toEventForm, toTicketRow, validateEventForm} from './eventForm.js';
import styles from './EventEditPage.module.css';

/**
 * Formulaire de modification d'un événement et de ses types de tickets.
 *
 * Props :
 *  - event, ticketTypes : données chargées depuis l'API
 *  - saveError          : erreur d'enregistrement à afficher (gardée par le parent)
 *  - onSaveError(msg)   : signale une erreur d'enregistrement au parent ('' pour l'effacer)
 */
export default function EventEditForm({event, ticketTypes, saveError, onSaveError}) {
    const navigate = useNavigate();
    const backPath = organizerEventsPath(event.organizer_id);

    // Valeurs initiales calculées une seule fois (le parent remonte le formulaire après un rechargement)
    const [initialForm] = useState(() => toEventForm(event));
    const [form, setForm] = useState(initialForm);
    const [rows, setRows] = useState(() => ticketTypes.map(toTicketRow));
    const [validationError, setValidationError] = useState('');
    const [saving, setSaving] = useState(false);

    const updateField = (field) => (e) => setForm((current) => ({...current, [field]: e.target.value}));

    const updateRow = (key, field, value) =>
        setRows((current) => current.map((row) => (row.key === key ? {...row, [field]: value} : row)));
    const addRow = () => setRows((current) => [...current, toTicketRow()]);
    const removeRow = (key) => setRows((current) => current.filter((row) => row.key !== key));

    async function handleSubmit(e) {
        e.preventDefault();
        onSaveError('');
        const message = validateEventForm(form, rows);
        setValidationError(message ?? '');
        if (message) return;

        setSaving(true);
        try {
            await saveEventChanges({event, ticketTypes, initialForm, form, rows});
            navigate(backPath);
        } catch (err) {
            setSaving(false);
            onSaveError(err instanceof SaveStepError ? err.message : getApiErrorMessage(err));
        }
    }

    const errorMessage = validationError || saveError;

    return (
        <form onSubmit={handleSubmit} noValidate>
            <PageHeader
                title="Modifier l'événement"
                back={{to: backPath, label: 'Retour aux événements de l\'organisateur'}}
            />

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
                    <CheckIcon/> {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
            </div>
        </form>
    );
}

