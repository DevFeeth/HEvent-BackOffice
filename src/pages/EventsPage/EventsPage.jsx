import {useCallback, useMemo, useState} from 'react';
import {Link, useLocation, useSearchParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import usePagedList from '@/hooks/usePagedList.js';
import useConfirm from '@/hooks/useConfirm.js';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import {deleteEvent, getEvents} from '@/api/events.js';
import {getUser} from '@/api/users.js';
import {eventEditPath, eventNewPath, usersPath} from '@/routes/paths.js';
import {ROLES} from '@/utils/roles.js';
import {formatDateInput, toDateInput} from '@/utils/format.js';
import {EVENT_STATUS_LABELS} from '@/utils/eventStatus.js';
import {fullName} from '@/utils/users.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import {ArrowRightIcon} from '@/components/icons.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import DataList from '@/components/DataList/DataList.jsx';
import cells from '@/styles/cells.module.css';
import styles from './EventsPage.module.css';

const formatEventDate = (value) => formatDateInput(toDateInput(value));

const COLUMNS = [
    {
        key: 'name',
        header: 'Événement',
        render: (event) => (
            <>
                <div className={cells.primary}>{event.name}</div>
                <div className={cells.secondary}>{event.category_name}</div>
            </>
        ),
    },
    {key: 'organizer', header: 'Organisateur', render: (event) => fullName(event.organizer)},
    {key: 'start_date', header: 'Début', render: (event) => formatEventDate(event.start_date)},
    {key: 'end_date', header: 'Fin', render: (event) => formatEventDate(event.end_date)},
    {
        key: 'status',
        header: 'Statut',
        render: ({status}) => (
            <span className={`${styles.status} ${styles[status]}`}>{EVENT_STATUS_LABELS[status] ?? status}</span>
        ),
    },
];

// back : page à retrouver après la modification (liste générale ou événements d'un organisateur)
const actionsColumn = (back, onDelete, deletingId) => ({
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (event) => (
        <div className={styles.rowActions}>
            <Link className={cells.action} to={eventEditPath(event.id)} state={{back}}>
                Modifier <ArrowRightIcon/>
            </Link>
            <button
                type="button"
                className={`button--link ${styles.danger}`}
                onClick={() => onDelete(event)}
                disabled={deletingId === event.id}
            >
                Supprimer
            </button>
        </div>
    ),
});

const fetchOrganizer = (id) => (id ? getUser(id) : Promise.resolve(null));

export default function EventsPage() {
    const [searchParams] = useSearchParams();
    const organizerId = searchParams.get('organizer');
    const location = useLocation();

    const fetchPage = useCallback(
        (params) => getEvents({...params, organizer_id: organizerId ?? undefined}),
        [organizerId]
    );
    const list = usePagedList(fetchPage);
    const {reload} = list;
    const confirm = useConfirm();
    const {refreshCounts} = useAdminLayout();
    const [deletingId, setDeletingId] = useState(null);
    const [actionError, setActionError] = useState('');

    const handleDelete = useCallback(async (event) => {
        const confirmed = await confirm({
            title: `Supprimer « ${event.name} » ?`,
            message: (
                <>
                    L&apos;événement et ses types de tickets seront définitivement supprimés. Cette action est irréversible.
                    Un événement qui a déjà vendu des tickets ne peut pas être supprimé : annulez-le à la place.
                </>
            ),
        });
        if (!confirmed) return;
        setDeletingId(event.id);
        setActionError('');
        try {
            await deleteEvent(event.id);
            reload();
            refreshCounts();
        } catch (err) {
            setActionError(getApiErrorMessage(err, 'La suppression a échoué.'));
        } finally {
            setDeletingId(null);
        }
    }, [confirm, reload, refreshCounts]);

    const organizerFetcher = useCallback(() => fetchOrganizer(organizerId), [organizerId]);
    const {data: organizer} = useFetch(organizerFetcher);

    const back = location.pathname + location.search;
    const columns = useMemo(() => [
        ...(organizerId ? COLUMNS.filter(({key}) => key !== 'organizer') : COLUMNS),
        actionsColumn(back, handleDelete, deletingId),
    ], [organizerId, back, handleDelete, deletingId]);

    const title = organizer ? `Événements de ${fullName(organizer)}` : 'Événements';
    const headerBack = organizerId ? {to: usersPath(ROLES.ORGANIZER), label: 'Retour aux utilisateurs'} : undefined;

    return (
        <>
            <PageHeader title={title} back={headerBack}>
                <Link className="button" to={eventNewPath(organizerId)} state={{back}}>+ Ajouter un événement</Link>
            </PageHeader>

            {actionError && <p className={styles.error} role="alert">{actionError}</p>}

            <DataList
                list={list}
                itemWord="événement"
                columns={columns}
                getRowKey={(event) => event.id}
                emptyMessage="Aucun événement trouvé."
            />
        </>
    );
}
