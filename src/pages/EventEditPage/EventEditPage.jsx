import {useCallback, useState} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import {getEvent} from '@/api/events.js';
import {getTicketTypesByEvent} from '@/api/ticketTypes.js';
import {getCategories} from '@/api/categories.js';
import {getUsers} from '@/api/users.js';
import {PATHS} from '@/routes/paths.js';
import {ROLES} from '@/utils/roles.js';
import Loader from '@/components/Loader/Loader.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.jsx';
import EventEditForm from './EventEditForm.jsx';

// shortcut: listes limitées à 100 (maximum de l'API), passer à un champ avec recherche si elles grandissent
const ALL = {limit: 100};

// Sans id : création d'un événement, il faut aussi la liste des organisateurs
async function fetchFormData(id) {
    const [event, ticketTypes, categories, organizers] = await Promise.all([
        id ? getEvent(id) : null,
        id ? getTicketTypesByEvent(id) : [],
        getCategories(ALL),
        id ? null : getUsers({...ALL, role_name: ROLES.ORGANIZER, is_active: true}),
    ]);
    return {event, ticketTypes, categories: categories.items, organizers: organizers?.items ?? []};
}

export default function EventEditPage() {
    const {id} = useParams();
    const location = useLocation();
    const fetcher = useCallback(() => fetchFormData(id), [id]);
    const {data, loading, error, reload, version} = useFetch(fetcher);
    // Une création dont un type de ticket a échoué arrive ici avec son message d'erreur
    const [saveError, setSaveError] = useState(location.state?.saveError ?? '');

    const handleSaveError = useCallback((message) => {
        setSaveError(message);
        if (message) reload();
    }, [reload]);

    if (error) {
        return (
            <>
                <PageHeader
                    title={id ? 'Modifier l\'événement' : 'Ajouter un événement'}
                    back={{to: PATHS.EVENTS, label: 'Retour aux événements'}}
                />
                <ErrorMessage error={error} fallback="Impossible de charger le formulaire." onRetry={reload}/>
            </>
        );
    }

    if (loading && !data) return <Loader/>;

    return (
        <EventEditForm
            key={`${id ?? 'new'}-${version}`}
            event={data.event}
            ticketTypes={data.ticketTypes}
            categories={data.categories}
            organizers={data.organizers}
            saveError={saveError}
            onSaveError={handleSaveError}
        />
    );
}
