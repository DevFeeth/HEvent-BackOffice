import {useCallback, useEffect, useState} from 'react';
import useFetch from './useFetch.js';
import useDebouncedValue from './useDebouncedValue.js';

export const DEFAULT_PAGE_SIZE = 10;
const NO_ROWS = [];

// Recherche et pagination côté serveur : l'API ne renvoie que la page demandée (LIMIT/OFFSET en SQL).
// fetchPage({search, page, limit}) doit renvoyer {items, total} et être stable (module ou useCallback).
export default function usePagedList(fetchPage, pageSize = DEFAULT_PAGE_SIZE) {
    const [search, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const searched = useDebouncedValue(search.trim());

    const fetcher = useCallback(
        () => fetchPage({search: searched || undefined, page, limit: pageSize}),
        [fetchPage, searched, page, pageSize]
    );
    const {data, loading, error, reload} = useFetch(fetcher);

    const total = data?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    // Après une suppression, la dernière page peut devenir vide : on revient à la dernière page existante
    useEffect(() => {
        if (data && page > pageCount) setPage(pageCount);
    }, [data, page, pageCount]);

    const setSearch = useCallback((value) => {
        setSearchValue(value);
        setPage(1);
    }, []);

    return {
        search, setSearch, page, setPage, pageCount, total,
        rows: data?.items ?? NO_ROWS,
        start: (page - 1) * pageSize,
        loading, error, reload,
    };
}
