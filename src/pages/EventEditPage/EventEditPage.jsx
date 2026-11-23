import {useCallback, useState} from 'react';
import {useParams} from 'react-router-dom';
import useFetch from '@/hooks/useFetch.js';
import {getEvent} from '@/api/events.js';
import {getTicketTypesByEvent} from '@/api/ticketTypes.js';
import {PATHS} from '@/routes/paths.js';
import Loader from '@/components/Loader/Loader.jsx';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.jsx';
import EventEditForm from './EventEditForm.jsx';

async function fetchEventWithTickets(id) {
    const [event, ticketTypes] = await Promise.all([getEvent(id), getTicketTypesByEvent(id)]);
    return {event, ticketTypes};
}

export default function EventEditPage() {
    const {id} = useParams();
    const fetcher = useCallback(() => fetchEventWithTickets(id), [id]);
    const {data, loading, error, reload, version} = useFetch(fetcher);
    const [saveError, setSaveError] = useState('');

    const handleSaveError = useCallback((message) => {
        setSaveError(message);
        if (message) reload();
    }, [reload]);

    if (error) {
        return (
            <>
                <PageHeader title="Modifier l'événement" back={{to: PATHS.EVENTS, label: 'Retour aux événements'}}/>
                <ErrorMessage error={error} fallback="Impossible de charger l'événement." onRetry={reload}/>
            </>
        );
    }

    if (loading && !data) return <Loader/>;

    return (
        <EventEditForm
            key={version}
            event={data.event}
            ticketTypes={data.ticketTypes}
            saveError={saveError}
            onSaveError={handleSaveError}
        />
    );
}

