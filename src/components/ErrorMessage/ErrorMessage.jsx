import {getApiErrorMessage, isRetryableError} from '@/utils/apiError.js';
import styles from './ErrorMessage.module.css';

export default function ErrorMessage({error, fallback, onRetry}) {
    if (!error) return null;

    return (
        <div className={styles.error} role="alert">
            <span>{getApiErrorMessage(error, fallback)}</span>
            {onRetry && isRetryableError(error) && (
                <button type="button" className={styles.retry} onClick={onRetry}>Réessayer</button>
            )}
        </div>
    );
}
