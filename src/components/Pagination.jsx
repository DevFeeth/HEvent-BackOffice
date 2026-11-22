import {ChevronLeftIcon, ChevronRightIcon} from './icons.jsx';
import styles from './Pagination.module.css';

export default function Pagination({page, pageCount, onChange}) {
    return (
        <div className={styles.pagination}>
            <span className={styles.label}>Page {page} sur {pageCount}</span>
            <button
                className={styles.button}
                onClick={() => onChange(page - 1)}
                disabled={page <= 1}
                aria-label="Page précédente"
            >
                <ChevronLeftIcon/>
            </button>
            <span className={`${styles.button} ${styles.current}`}>{page}</span>
            <button
                className={styles.button}
                onClick={() => onChange(page + 1)}
                disabled={page >= pageCount}
                aria-label="Page suivante"
            >
                <ChevronRightIcon/>
            </button>
        </div>
    );
}
