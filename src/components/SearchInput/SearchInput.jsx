import {SearchIcon} from '@/components/icons.jsx';
import styles from './SearchInput.module.css';

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
