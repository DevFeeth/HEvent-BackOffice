import {useEffect, useRef} from 'react';
import {TrashIcon} from '@/components/icons.jsx';
import styles from './ConfirmDialog.module.css';

/**
 * Popup de confirmation (élément <dialog> natif : Échap et clic sur le fond annulent).
 * Utiliser via le hook useConfirm() plutôt que directement.
 *
 * Props :
 *  - title, message : textes affichés
 *  - confirmLabel   : texte du bouton de validation (défaut : « Supprimer »)
 *  - cancelLabel    : texte du bouton d'annulation (défaut : « Annuler »)
 *  - danger         : bouton de validation rouge (défaut : true)
 *  - onConfirm(), onCancel()
 */
export default function ConfirmDialog({
    title = 'Confirmer la suppression',
    message,
    confirmLabel = 'Supprimer',
    cancelLabel = 'Annuler',
    danger = true,
    onConfirm,
    onCancel,
}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);

    // Clic sur le fond (en dehors de la boîte) = annuler
    const handleClick = (e) => {
        if (e.target === dialogRef.current) onCancel();
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            onCancel={(e) => {
                e.preventDefault();
                onCancel();
            }}
            onClick={handleClick}
            aria-labelledby="confirm-dialog-title"
        >
            <div className={styles.content}>
                {danger && (
                    <div className={styles.icon}>
                        <TrashIcon/>
                    </div>
                )}
                <div>
                    <h2 id="confirm-dialog-title" className={styles.title}>{title}</h2>
                    {message && <p className={styles.message}>{message}</p>}
                </div>
            </div>
            <div className={styles.actions}>
                <button type="button" className="button--secondary" onClick={onCancel} autoFocus>
                    {cancelLabel}
                </button>
                <button type="button" className={danger ? styles.danger : undefined} onClick={onConfirm}>
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}
