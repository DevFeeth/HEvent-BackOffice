import {Link} from 'react-router-dom';
import {ArrowLeftIcon} from '@/components/icons.jsx';
import styles from './PageHeader.module.css';

/**
 * En-tête commun des pages : lien retour (optionnel), titre, actions à droite (optionnel).
 *
 * Props : title, back ({to, label}), children (boutons d'action)
 */
export default function PageHeader({title, back, children}) {
    return (
        <>
            <title>{`HEvent · ${title}`}</title>
            {back && (
                <Link className={styles.back} to={back.to}>
                    <ArrowLeftIcon/> {back.label}
                </Link>
            )}
            <div className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
                {children}
            </div>
        </>
    );
}
