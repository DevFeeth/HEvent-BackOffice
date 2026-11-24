import {useCallback, useEffect, useState} from 'react';

export default function useFetch(fetcher) {
    const [reloadKey, setReloadKey] = useState(0);
    const [state, setState] = useState({data: null, loading: true, error: null, version: 0});

    useEffect(() => {
        let cancelled = false;
        // Les anciennes données restent affichées pendant le rechargement
        setState((s) => (s.loading ? s : {...s, loading: true}));
        fetcher()
            .then((data) => !cancelled && setState((s) => ({data, loading: false, error: null, version: s.version + 1})))
            .catch((error) => !cancelled && setState((s) => ({...s, data: null, loading: false, error})));
        return () => {
            cancelled = true;
        };
    }, [fetcher, reloadKey]);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    return {...state, reload};
}
