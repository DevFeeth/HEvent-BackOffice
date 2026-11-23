import {useCallback, useMemo} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import useListControls from '@/hooks/useListControls.js';
import {getEvents} from '@/api/events.js';
import {getUsers} from '@/api/users.js';
import {eventEditPath, usersPath} from '@/routes/paths.js';
import {ROLES} from '@/utils/roles.js';
import {formatDateInput, toDateInput, toTimeInput} from '@/utils/format.js';
import {EVENT_STATUS_LABELS} from '@/utils/eventStatus.js';
import {fullName} from '@/utils/users.js';
import {ArrowRightIcon} from '@/components/icons.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import DataList from '@/components/DataList/DataList.jsx';
import cells from '@/styles/cells.module.css';
import styles from './EventsPage.module.css';

const NO_EVENTS = [];

const eventStart = (event) => `${toDateInput(event.start_date)}T${toTimeInput(event.start_time)}`;

async function fetchEvents(organizerId) {
    const [events, users] = await Promise.all([
        getEvents(organizerId ? {organizer_id: organizerId} : {}),
        getUsers(),
    ]);
    const usersById = new Map(users.map((user) => [user.id, user]));
    return {
        organizer: organizerId ? usersById.get(Number(organizerId)) ?? null : null,
        events: events
            .map((event) => ({...event, organizer: usersById.get(event.organizer_id) ?? null}))
            .toSorted((a, b) => eventStart(b).localeCompare(eventStart(a))),
    };
}

const eventMatches = (event, query) =>
    `${event.name} ${event.category_name} ${fullName(event.organizer)}`.toLowerCase().includes(query);

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
    {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (event) => (
            <Link className={cells.action} to={eventEditPath(event.id)}>
                Modifier <ArrowRightIcon/>
            </Link>
        ),
    },
];

export default function EventsPage() {
    const [searchParams] = useSearchParams();
    const organizerId = searchParams.get('organizer');

    const fetcher = useCallback(() => fetchEvents(organizerId), [organizerId]);
    const {data, loading, error, reload} = useFetch(fetcher);
    const controls = useListControls(data?.events ?? NO_EVENTS, eventMatches);

    const columns = useMemo(
        () => (organizerId ? COLUMNS.filter(({key}) => key !== 'organizer') : COLUMNS),
        [organizerId]
    );

    const title = data?.organizer ? `Événements de ${fullName(data.organizer)}` : 'Événements';
    const back = organizerId ? {to: usersPath(ROLES.ORGANIZER), label: 'Retour aux utilisateurs'} : undefined;

    return (
        <>
            <PageHeader title={title} back={back}/>

            <DataList
                controls={controls}
                itemWord="événement"
                columns={columns}
                getRowKey={(event) => event.id}
                loading={loading}
                error={error}
                onRetry={reload}
                emptyMessage="Aucun événement trouvé."
            />
        </>
    );
}
