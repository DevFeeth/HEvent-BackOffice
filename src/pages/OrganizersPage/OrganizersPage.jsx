import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import {getUsers} from '@/api/users.js';
import {getEvents} from '@/api/events.js';
import {organizerEventsPath} from '@/routes/paths.js';
import {ROLES} from '@/utils/roles.js';
import {formatDate, plural} from '@/utils/format.js';
import {ArrowRightIcon, SearchIcon} from '@/components/icons.jsx';
import Pagination from '@/components/Pagination.jsx';
import table from '@/styles/table.module.css';
import styles from './OrganizersPage.module.css';

const PAGE_SIZE = 10;

// Organisateurs + nombre d'événements de chacun, les plus récents en premier
async function fetchOrganizers() {
    const [organizers, events] = await Promise.all([
        getUsers({role_name: ROLES.ORGANIZER}),
        getEvents(),
    ]);

    const eventCountByOrganizer = {};
    for (const event of events) {
        eventCountByOrganizer[event.organizer_id] = (eventCountByOrganizer[event.organizer_id] ?? 0) + 1;
    }

    return organizers
        .map((organizer) => ({...organizer, eventCount: eventCountByOrganizer[organizer.id] ?? 0}))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function matchesSearch(organizer, search) {
    const text = `${organizer.first_name} ${organizer.last_name} ${organizer.email} ${organizer.city ?? ''}`;
    return text.toLowerCase().includes(search.trim().toLowerCase());
}

export default function OrganizersPage() {
    const {data: organizers, loading, error} = useFetch(fetchOrganizers);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(
        () => (organizers ?? []).filter((o) => matchesSearch(o, search)),
        [organizers, search]
    );

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const start = (page - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);

    function handleSearch(event) {
        setSearch(event.target.value);
        setPage(1);
    }

    return (
        <>
            <title>HEvent · Organisateurs</title>

            <div className={styles.header}>
                <h1 className={styles.title}>Organisateurs</h1>
                {/* TODO : formulaire d'ajout d'un organisateur */}
                <button className={styles.addButton}>+ Ajouter un organisateur</button>
            </div>

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
                    <span className={table.total}>{plural(filtered.length, 'organisateur')}</span>
                </div>

                <div className={table.wrapper}>
                    <table className={table.table}>
                        <thead>
                            <tr>
                                <th>Organisateur</th>
                                <th>Adresse email</th>
                                <th className={table.center}>Événements</th>
                                <th>Ajouté le</th>
                                <th className={table.right}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={5} className={table.message}>Chargement…</td></tr>
                            )}
                            {error && (
                                <tr><td colSpan={5} className={table.error}>Impossible de charger les organisateurs.</td></tr>
                            )}
                            {!loading && !error && visible.length === 0 && (
                                <tr><td colSpan={5} className={table.message}>Aucun organisateur trouvé.</td></tr>
                            )}
                            {visible.map((organizer) => (
                                <tr key={organizer.id}>
                                    <td>
                                        <div className={table.primary}>{organizer.first_name} {organizer.last_name}</div>
                                        <div className={table.secondary}>{organizer.city}</div>
                                    </td>
                                    <td>{organizer.email}</td>
                                    <td className={table.center}>{organizer.eventCount}</td>
                                    <td>{formatDate(organizer.created_at)}</td>
                                    <td className={table.right}>
                                        <Link className={table.action} to={organizerEventsPath(organizer.id)}>
                                            Voir les événements <ArrowRightIcon/>
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
                            ? '0 organisateur'
                            : `${start + 1}-${start + visible.length} sur ${plural(filtered.length, 'organisateur')}`}
                    </span>
                    <Pagination page={page} pageCount={pageCount} onChange={setPage}/>
                </div>
            </section>
        </>
    );
}
