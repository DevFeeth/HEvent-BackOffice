import {Link} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import useListControls from '@/hooks/useListControls.js';
import {getUsers} from '@/api/users.js';
import {getEvents} from '@/api/events.js';
import {organizerEventsPath, PATHS} from '@/routes/paths.js';
import {ROLES} from '@/utils/roles.js';
import {formatDate} from '@/utils/format.js';
import {fullName, userMatches} from '@/utils/users.js';
import {ArrowRightIcon} from '@/components/icons.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import DataList from '@/components/DataList/DataList.jsx';
import cells from '@/styles/cells.module.css';

const NO_ITEMS = [];

// Organisateurs + nombre d'événements de chacun, les plus récents en premier
async function fetchOrganizers() {
    const [organizers, events] = await Promise.all([
        getUsers({role_name: ROLES.ORGANIZER}),
        getEvents(),
    ]);

    const eventCountByOrganizer = new Map();
    for (const {organizer_id: organizerId} of events) {
        eventCountByOrganizer.set(organizerId, (eventCountByOrganizer.get(organizerId) ?? 0) + 1);
    }

    return organizers
        .map((organizer) => ({...organizer, eventCount: eventCountByOrganizer.get(organizer.id) ?? 0}))
        .toSorted((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

const COLUMNS = [
    {
        key: 'name',
        header: 'Organisateur',
        render: (organizer) => (
            <>
                <div className={cells.primary}>{fullName(organizer)}</div>
                <div className={cells.secondary}>{organizer.city}</div>
            </>
        ),
    },
    {key: 'email', header: 'Adresse email'},
    {key: 'eventCount', header: 'Événements', align: 'center'},
    {key: 'created_at', header: 'Ajouté le', render: (organizer) => formatDate(organizer.created_at)},
    {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        render: (organizer) => (
            <Link className={cells.action} to={organizerEventsPath(organizer.id)}>
                Voir les événements <ArrowRightIcon/>
            </Link>
        ),
    },
];

export default function OrganizersPage() {
    const {data, loading, error, reload} = useFetch(fetchOrganizers);
    const controls = useListControls(data ?? NO_ITEMS, userMatches);

    return (
        <>
            <PageHeader title="Organisateurs">
                <Link className="button" to={PATHS.ORGANIZER_NEW}>+ Ajouter un organisateur</Link>
            </PageHeader>

            <DataList
                controls={controls}
                itemWord="organisateur"
                columns={COLUMNS}
                getRowKey={(organizer) => organizer.id}
                loading={loading}
                error={error}
                onRetry={reload}
                emptyMessage="Aucun organisateur trouvé."
            />
        </>
    );
}
