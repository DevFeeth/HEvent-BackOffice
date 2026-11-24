import {useCallback, useMemo} from 'react';
import {Link, useLocation, useSearchParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import usePagedList from '@/hooks/usePagedList.js';
import {getEvents} from '@/api/events.js';
import {getUser} from '@/api/users.js';
import {eventEditPath, usersPath} from '@/routes/paths.js';
import {ROLES} from '@/utils/roles.js';
import {formatDateInput, toDateInput} from '@/utils/format.js';
import {EVENT_STATUS_LABELS} from '@/utils/eventStatus.js';
import {fullName} from '@/utils/users.js';
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
const actionsColumn = (back) => ({
    key: 'actions',
    header: 'Actions',
    align: 'right',
    render: (event) => (
        <Link className={cells.action} to={eventEditPath(event.id)} state={{back}}>
            Modifier <ArrowRightIcon/>
        </Link>
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

    const organizerFetcher = useCallback(() => fetchOrganizer(organizerId), [organizerId]);
    const {data: organizer} = useFetch(organizerFetcher);

    const back = location.pathname + location.search;
    const columns = useMemo(() => [
        ...(organizerId ? COLUMNS.filter(({key}) => key !== 'organizer') : COLUMNS),
        actionsColumn(back),
    ], [organizerId, back]);

    const title = organizer ? `Événements de ${fullName(organizer)}` : 'Événements';
    const headerBack = organizerId ? {to: usersPath(ROLES.ORGANIZER), label: 'Retour aux utilisateurs'} : undefined;

    return (
        <>
            <PageHeader title={title} back={headerBack}/>

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
