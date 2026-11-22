import {useCallback, useEffect, useState} from 'react';

/**
 * Exécute une fonction asynchrone au montage du composant (et quand `fetcher` change).
 * `fetcher` doit être une fonction stable (définie hors du composant ou via useCallback).
 *
 * Renvoie {data, loading, error, reload, version}
 *  - reload()  : relance le chargement
 *  - version   : augmente à chaque nouveau chargement réussi
 */
export default function useFetch(fetcher) {
    const [reloadKey, setReloadKey] = useState(0);
    const [state, setState] = useState({data: null, loading: true, error: null, version: 0});

    useEffect(() => {
        let cancelled = false;
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
