import {useCallback, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import {getEvent, updateEvent} from '@/api/events.js';
import {addTicketType, deleteTicketType, getTicketTypesByEvent, updateTicketType} from '@/api/ticketTypes.js';
import {organizerEventsPath, PATHS} from '@/routes/paths.js';
import {toDateInput, toTimeInput} from '@/utils/format.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import {ArrowLeftIcon, CheckIcon, TrashIcon} from '@/components/icons.jsx';
import Loader from '@/components/Loader.jsx';
import styles from './EventEditPage.module.css';

/* ======================================================================
   Données
   ====================================================================== */

async function fetchEventWithTickets(id) {
    const [event, ticketTypes] = await Promise.all([getEvent(id), getTicketTypesByEvent(id)]);
    return {event, ticketTypes};
}

const EVENT_FIELDS = ['name', 'start_date', 'start_time', 'end_date', 'end_time'];

// Événement de l'API -> valeurs du formulaire
const toEventForm = (event) => ({
    name: event.name,
    start_date: toDateInput(event.start_date),
    start_time: toTimeInput(event.start_time),
    end_date: toDateInput(event.end_date),
    end_time: toTimeInput(event.end_time),
});

// Types de tickets de l'API -> lignes du formulaire (valeurs en texte pour les inputs)
let nextRowKey = 0;
const toTicketRow = (ticketType) => ({
    key: nextRowKey++,
    id: ticketType?.id ?? null, // null = nouveau type de ticket, pas encore créé
    name: ticketType?.name ?? '',
    price: ticketType ? Number(ticketType.price).toFixed(2) : '',
    available_quantity: ticketType ? String(ticketType.available_quantity) : '',
});

// Ligne du formulaire -> données envoyées à l'API
const toTicketPayload = (row) => ({
    name: row.name.trim(),
    price: Number(row.price),
    available_quantity: Number(row.available_quantity),
});

// Ne garde que les champs qui ont changé
function diff(original, updated) {
    return Object.fromEntries(
        Object.entries(updated).filter(([key, value]) => original[key] !== value)
    );
}

/* ======================================================================
   Validation
   ====================================================================== */

function validate(form, rows) {
    if (!form.name.trim()) return 'Le nom de l\'événement est obligatoire.';
    if (!form.start_date || !form.start_time || !form.end_date || !form.end_time) {
        return 'Les dates et heures de début et de fin sont obligatoires.';
    }
    if (`${form.end_date}T${form.end_time}` < `${form.start_date}T${form.start_time}`) {
        return 'La fin de l\'événement doit être après son début.';
    }

    const names = new Set();
    for (const row of rows) {
        const name = row.name.trim();
        if (!name) return 'Chaque type de ticket doit avoir un nom.';
        if (names.has(name.toLowerCase())) return `Le type de ticket « ${name} » existe en double.`;
        names.add(name.toLowerCase());

        const price = Number(row.price);
        if (row.price === '' || Number.isNaN(price) || price < 0 || !/^\d+([.,]\d{1,2})?$/.test(row.price)) {
            return `Le prix de « ${name} » doit être un montant positif (2 décimales max).`;
        }
        const quantity = Number(row.available_quantity);
        if (row.available_quantity === '' || !Number.isInteger(quantity) || quantity < 0) {
            return `Le nombre de places de « ${name} » doit être un nombre entier positif.`;
        }
    }
    return null;
}

/* ======================================================================
   Page
   ====================================================================== */

export default function EventEditPage() {
    const {id} = useParams();
    const fetcher = useCallback(() => fetchEventWithTickets(id), [id]);
    const {data, loading, error, reload, version} = useFetch(fetcher);
    const [saveError, setSaveError] = useState('');

    if (loading && !data) return <Loader/>;

    if (error) {
        return (
            <>
                <Link className={styles.back} to={PATHS.EVENTS}>
                    <ArrowLeftIcon/> Retour aux événements
                </Link>
                <p className={styles.error}>{getApiErrorMessage(error, 'Impossible de charger l\'événement.')}</p>
            </>
        );
    }

    // key={version} : le formulaire repart des données fraîches après chaque rechargement
    return (
        <EventEditForm
            key={version}
            event={data.event}
            ticketTypes={data.ticketTypes}
            saveError={saveError}
            onSaveError={(message) => {
                setSaveError(message);
                // Une partie des modifications a pu être enregistrée : on recharge pour repartir de l'état réel
                if (message) reload();
            }}
        />
    );
}

function EventEditForm({event, ticketTypes, saveError, onSaveError}) {
    const navigate = useNavigate();
    const backPath = organizerEventsPath(event.organizer_id);

    const [initialForm] = useState(() => toEventForm(event));
    const [form, setForm] = useState(initialForm);
    const [rows, setRows] = useState(() => ticketTypes.map(toTicketRow));
    const [validationError, setValidationError] = useState('');
    const [saving, setSaving] = useState(false);

    const capacity = rows.reduce((total, row) => total + (Number(row.available_quantity) || 0), 0);

    function updateField(field, value) {
        setForm((current) => ({...current, [field]: value}));
    }

    function updateRow(key, field, value) {
        setRows((current) => current.map((row) => (row.key === key ? {...row, [field]: value} : row)));
    }

    function addRow() {
        setRows((current) => [...current, toTicketRow(null)]);
    }

    function removeRow(key) {
        setRows((current) => current.filter((row) => row.key !== key));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        onSaveError('');

        const normalizedRows = rows.map((row) => ({...row, price: row.price.replace(',', '.')}));
        const message = validate(form, normalizedRows);
        setValidationError(message ?? '');
        if (message) return;

        setSaving(true);
        try {
            // 1. Informations de l'événement (uniquement les champs modifiés)
            const eventChanges = diff(initialForm, {...form, name: form.name.trim()});
            for (const field of Object.keys(eventChanges)) {
                if (!EVENT_FIELDS.includes(field)) delete eventChanges[field];
            }
            if (Object.keys(eventChanges).length > 0) {
                await updateEvent(event.id, eventChanges);
            }

            // 2. Types de tickets retirés
            const keptIds = new Set(normalizedRows.map((row) => row.id));
            for (const ticketType of ticketTypes.filter((t) => !keptIds.has(t.id))) {
                try {
                    await deleteTicketType(ticketType.id);
                } catch (err) {
                    err.customMessage = `Impossible de retirer « ${ticketType.name} » : des tickets ont peut-être déjà été vendus.`;
                    throw err;
                }
            }

            // 3. Types de tickets modifiés
            for (const row of normalizedRows.filter((r) => r.id !== null)) {
                const original = ticketTypes.find((t) => t.id === row.id);
                const changes = diff(
                    {name: original.name, price: Number(original.price), available_quantity: original.available_quantity},
                    toTicketPayload(row)
                );
                if (Object.keys(changes).length > 0) {
                    await updateTicketType(row.id, changes);
                }
            }

            // 4. Nouveaux types de tickets
            for (const row of normalizedRows.filter((r) => r.id === null)) {
                await addTicketType(event.id, toTicketPayload(row));
            }

            navigate(backPath);
        } catch (err) {
            setSaving(false);
            onSaveError(err.customMessage ?? getApiErrorMessage(err, 'L\'enregistrement a échoué.'));
        }
    }

    const errorMessage = validationError || saveError;

    return (
        <form onSubmit={handleSubmit} noValidate>
            <title>HEvent · Modifier l&apos;événement</title>

            <Link className={styles.back} to={backPath}>
                <ArrowLeftIcon/> Retour aux événements de l&apos;organisateur
            </Link>
            <h1 className={styles.title}>Modifier l&apos;événement</h1>

            {/* ---------- Informations générales ---------- */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Informations générales</h2>
                <div className={styles.generalGrid}>
                    <label className={styles.field}>
                        <span className={styles.label}>Nom de l&apos;événement</span>
                        <input
                            className={styles.input}
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            maxLength={100}
                            required
                        />
                    </label>
                    <label className={styles.field}>
                        <span className={styles.label}>Capacité maximale</span>
                        <div className={`${styles.suffixInput} ${styles.readOnly}`}>
                            <input value={capacity} readOnly tabIndex={-1}/>
                            <span>places</span>
                        </div>
                        <span className={styles.hint}>Somme des places des types de tickets</span>
                    </label>
                </div>
            </section>

            {/* ---------- Dates et horaires ---------- */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Dates et horaires</h2>
                <div className={styles.datesGrid}>
                    <label className={styles.field}>
                        <span className={styles.label}>Date de début</span>
                        <input
                            className={styles.input}
                            type="date"
                            value={form.start_date}
                            onChange={(e) => updateField('start_date', e.target.value)}
                            required
                        />
                    </label>
                    <label className={styles.field}>
                        <span className={styles.label}>Heure de début</span>
                        <input
                            className={styles.input}
                            type="time"
                            value={form.start_time}
                            onChange={(e) => updateField('start_time', e.target.value)}
                            required
                        />
                    </label>
                    <div className={styles.separator} aria-hidden/>
                    <label className={styles.field}>
                        <span className={styles.label}>Date de fin</span>
                        <input
                            className={styles.input}
                            type="date"
                            value={form.end_date}
                            min={form.start_date}
                            onChange={(e) => updateField('end_date', e.target.value)}
                            required
                        />
                    </label>
                    <label className={styles.field}>
                        <span className={styles.label}>Heure de fin</span>
                        <input
                            className={styles.input}
                            type="time"
                            value={form.end_time}
                            onChange={(e) => updateField('end_time', e.target.value)}
                            required
                        />
                    </label>
                </div>
            </section>

            {/* ---------- Types de tickets ---------- */}
            <section className={`${styles.section} ${styles.ticketsSection}`}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Types de tickets</h2>
                    <button type="button" className={styles.secondaryButton} onClick={addRow}>
                        + Ajouter un type de ticket
                    </button>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.ticketsTable}>
                        <thead>
                            <tr>
                                <th>Nom du type de ticket</th>
                                <th className={styles.colPrice}>Prix TTC</th>
                                <th className={styles.colQuantity}>Places</th>
                                <th className={styles.colAction}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className={styles.empty}>Aucun type de ticket.</td>
                                </tr>
                            )}
                            {rows.map((row) => (
                                <tr key={row.key}>
                                    <td>
                                        <input
                                            className={styles.input}
                                            value={row.name}
                                            placeholder="Ex : Billet standard"
                                            maxLength={50}
                                            onChange={(e) => updateRow(row.key, 'name', e.target.value)}
                                            aria-label="Nom du type de ticket"
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.suffixInput}>
                                            <input
                                                inputMode="decimal"
                                                value={row.price}
                                                placeholder="0,00"
                                                onChange={(e) => updateRow(row.key, 'price', e.target.value)}
                                                aria-label="Prix TTC"
                                            />
                                            <span>€</span>
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={row.available_quantity}
                                            placeholder="0"
                                            onChange={(e) => updateRow(row.key, 'available_quantity', e.target.value)}
                                            aria-label="Nombre de places"
                                        />
                                    </td>
                                    <td className={styles.colAction}>
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeRow(row.key)}
                                        >
                                            <TrashIcon/> Retirer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className={styles.note}>Tous les prix sont indiqués en euros, taxes comprises.</p>
            </section>

            {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}

            {/* ---------- Actions ---------- */}
            <div className={styles.actions}>
                <Link className={styles.secondaryButton} to={backPath}>Annuler</Link>
                <button type="submit" className={styles.submit} disabled={saving}>
                    <CheckIcon/> {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
                </button>
            </div>
        </form>
    );
}
