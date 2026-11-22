import {useCallback, useMemo, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import {getEvents} from '@/api/events.js';
import {getUsers} from '@/api/users.js';
import {eventEditPath, PATHS} from '@/routes/paths.js';
import {formatDateInput, plural, toDateInput} from '@/utils/format.js';
import {EVENT_STATUS_LABELS} from '@/utils/eventStatus.js';
import {ArrowLeftIcon, ArrowRightIcon, SearchIcon} from '@/components/icons.jsx';
import Pagination from '@/components/Pagination.jsx';
import table from '@/styles/table.module.css';
import styles from './EventsPage.module.css';

const PAGE_SIZE = 10;

// Événements (éventuellement d'un seul organisateur) + nom de leur organisateur
async function fetchEvents(organizerId) {
    const [events, users] = await Promise.all([
        getEvents(organizerId ? {organizer_id: organizerId} : {}),
        getUsers(),
    ]);
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));
    return {
        organizer: organizerId ? usersById[organizerId] ?? null : null,
        events: events.map((event) => ({...event, organizer: usersById[event.organizer_id] ?? null})),
    };
}

const fullName = (user) => (user ? `${user.first_name} ${user.last_name}` : '—');

function matchesSearch(event, search) {
    const text = `${event.name} ${event.category_name} ${fullName(event.organizer)}`;
    return text.toLowerCase().includes(search.trim().toLowerCase());
}

export default function EventsPage() {
    const [searchParams] = useSearchParams();
    const organizerId = searchParams.get('organizer');

    const fetcher = useCallback(() => fetchEvents(organizerId), [organizerId]);
    const {data, loading, error} = useFetch(fetcher);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(
        () => (data?.events ?? []).filter((e) => matchesSearch(e, search)),
        [data, search]
    );

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);

    function handleSearch(event) {
        setSearch(event.target.value);
        setPage(1);
    }

    const title = data?.organizer ? `Événements de ${fullName(data.organizer)}` : 'Événements';

    return (
        <>
            <title>HEvent · Événements</title>

            {organizerId && (
                <Link className={styles.back} to={PATHS.ORGANIZERS}>
                    <ArrowLeftIcon/> Retour aux organisateurs
                </Link>
            )}
            <h1 className={styles.title}>{title}</h1>

            <section className={table.card}>
                <div className={table.toolbar}>
                    <label className={table.search}>
                        <SearchIcon/>
                        <input
                            className={table.searchInput}
                            type="search"
                            placeholder="Rechercher…"
                            value={search}
                            onChange={handleSearch}
                        />
                    </label>
                    <span className={table.total}>{plural(filtered.length, 'événement')}</span>
                </div>

                <div className={table.wrapper}>
                    <table className={table.table}>
                        <thead>
                            <tr>
                                <th>Événement</th>
                                {!organizerId && <th>Organisateur</th>}
                                <th>Début</th>
                                <th>Fin</th>
                                <th>Statut</th>
                                <th className={table.right}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={6} className={table.message}>Chargement…</td></tr>
                            )}
                            {error && (
                                <tr><td colSpan={6} className={table.error}>Impossible de charger les événements.</td></tr>
                            )}
                            {!loading && !error && visible.length === 0 && (
                                <tr><td colSpan={6} className={table.message}>Aucun événement trouvé.</td></tr>
                            )}
                            {visible.map((event) => (
                                <tr key={event.id}>
                                    <td>
                                        <div className={table.primary}>{event.name}</div>
                                        <div className={table.secondary}>{event.category_name}</div>
                                    </td>
                                    {!organizerId && <td>{fullName(event.organizer)}</td>}
                                    <td>{formatDateInput(toDateInput(event.start_date))}</td>
                                    <td>{formatDateInput(toDateInput(event.end_date))}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[event.status]}`}>
                                            {EVENT_STATUS_LABELS[event.status] ?? event.status}
                                        </span>
                                    </td>
                                    <td className={table.right}>
                                        <Link className={table.action} to={eventEditPath(event.id)}>
                                            Modifier <ArrowRightIcon/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={table.footer}>
                    <span>
                        {filtered.length === 0
                            ? '0 événement'
                            : `${start + 1}-${start + visible.length} sur ${plural(filtered.length, 'événement')}`}
                    </span>
                    <Pagination page={page} pageCount={pageCount} onChange={setPage}/>
                </div>
            </section>
        </>
    );
}
