import {useCallback, useMemo, useState} from 'react';

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Recherche + pagination côté client d'une liste.
 *
 * @param items    liste complète (doit être stable : résultat de useFetch / useMemo)
 * @param matches  (item, query) => boolean ; query est déjà en minuscules et sans espaces autour.
 *                 Doit être stable (définie hors du composant).
 * @param pageSize nombre d'éléments par page
 */
export default function useListControls(items, matches, pageSize = DEFAULT_PAGE_SIZE) {
    const [search, setSearchValue] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query ? items.filter((item) => matches(item, query)) : items;
    }, [items, matches, search]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    // Si la liste rétrécit (suppression, recherche), on ne reste pas sur une page vide
    const currentPage = Math.min(page, pageCount);
    const start = (currentPage - 1) * pageSize;

    const visible = useMemo(
        () => filtered.slice(start, start + pageSize),
        [filtered, start, pageSize]
    );

    // Une nouvelle recherche repart de la première page
    const setSearch = useCallback((value) => {
        setSearchValue(value);
        setPage(1);
    }, []);

    return {search, setSearch, page: currentPage, setPage, pageCount, filtered, visible, start};
}
