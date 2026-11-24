import {useEffect, useState} from 'react';

// Renvoie la valeur seulement quand elle n'a plus changé pendant `delay` ms (évite une requête par frappe)
export default function useDebouncedValue(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
