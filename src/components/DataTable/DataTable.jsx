import ErrorMessage from '@/components/ErrorMessage/ErrorMessage.jsx';
import styles from './DataTable.module.css';

const ALIGN_CLASS = {
    center: styles.center,
    right: styles.right,
};

/**
 * Tableau générique.
 *
 * Props :
 *  - columns : [{key, header, align?: 'center'|'right', width?, render?: (row) => JSX}]
 *              sans render, la cellule affiche row[key]
 *  - rows, getRowKey(row)
 *  - loading, error, onRetry, emptyMessage : états affichés à la place des lignes
 *  - getRowClassName(row) : classe CSS optionnelle par ligne
 */
export default function DataTable({
    columns, rows, getRowKey, loading = false, error = null, onRetry,
    emptyMessage = 'Aucun élément.', getRowClassName,
}) {
    let status = null;
    if (error) {
        status = <ErrorMessage error={error} onRetry={onRetry}/>;
    } else if (loading && rows.length === 0) {
        status = 'Chargement…';
    } else if (rows.length === 0) {
        status = emptyMessage;
    }

    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map(({key, header, align, width}) => (
                            <th key={key} className={ALIGN_CLASS[align]} style={width ? {width} : undefined}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {status ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.status}>{status}</td>
                        </tr>
                    ) : rows.map((row) => (
                        <tr key={getRowKey(row)} className={getRowClassName?.(row)}>
                            {columns.map(({key, align, render}) => (
                                <td key={key} className={ALIGN_CLASS[align]}>
                                    {render ? render(row) : row[key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
