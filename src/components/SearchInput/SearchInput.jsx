import {SearchIcon} from '@/components/icons.jsx';
import styles from './SearchInput.module.css';

/** Champ de recherche avec icône. onChange reçoit directement la valeur saisie. */
export default function SearchInput({value, onChange, placeholder = 'Rechercher…'}) {
    return (
        <label className={styles.search}>
            <SearchIcon/>
            <input
                className={styles.input}
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={placeholder}
            />
        </label>
    );
}
