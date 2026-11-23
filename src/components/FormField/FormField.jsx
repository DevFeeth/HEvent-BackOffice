import styles from './FormField.module.css';

export default function FormField({label, hint, children}) {
    return (
        <label className={styles.field}>
            <span className={styles.label}>{label}</span>
            {children}
            {hint && <span className={styles.hint}>{hint}</span>}
        </label>
    );
}
