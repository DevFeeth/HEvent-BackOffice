import styles from './FormField.module.css';

/**
 * Champ de formulaire : libellé + contrôle (input, select...) + aide optionnelle.
 *
 * Props : label, hint (texte d'aide), children (le contrôle)
 */
export default function FormField({label, hint, children}) {
    return (
        <label className={styles.field}>
            <span className={styles.label}>{label}</span>
            {children}
            {hint && <span className={styles.hint}>{hint}</span>}
        </label>
    );
}
