import {TrashIcon} from '@/components/icons.jsx';
import styles from './EventEditPage.module.css';

/**
 * Tableau éditable des types de tickets.
 *
 * Props :
 *  - rows : lignes du formulaire [{key, id, name, price, available_quantity}]
 *  - onChange(key, field, value), onAdd(), onRemove(key)
 */
export default function TicketTypesEditor({rows, onChange, onAdd, onRemove}) {
    return (
        <section className={`${styles.section} ${styles.ticketsSection}`}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Types de tickets</h2>
                <button type="button" className="button button--secondary" onClick={onAdd}>
                    + Ajouter un type de ticket
                </button>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.ticketsTable}>
                    <thead>
                        <tr>
                            <th>Nom du type de ticket</th>
                            <th className={styles.colPrice}>Prix TTC</th>
                            <th className={styles.colQuantity}>Places</th>
                            <th className={styles.colAction}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={4} className={styles.empty}>Aucun type de ticket.</td>
                            </tr>
                        )}
                        {rows.map((row) => (
                            <tr key={row.key}>
                                <td>
                                    <input
                                        className={styles.input}
                                        value={row.name}
                                        placeholder="Ex : Billet standard"
                                        maxLength={50}
                                        onChange={(e) => onChange(row.key, 'name', e.target.value)}
                                        aria-label="Nom du type de ticket"
                                    />
                                </td>
                                <td>
                                    <div className={styles.suffixInput}>
                                        <input
                                            inputMode="decimal"
                                            value={row.price}
                                            placeholder="0,00"
                                            onChange={(e) => onChange(row.key, 'price', e.target.value)}
                                            aria-label="Prix TTC"
                                        />
                                        <span>€</span>
                                    </div>
                                </td>
                                <td>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={row.available_quantity}
                                        placeholder="0"
                                        onChange={(e) => onChange(row.key, 'available_quantity', e.target.value)}
                                        aria-label="Nombre de places"
                                    />
                                </td>
                                <td className={styles.colAction}>
                                    <button type="button" className={styles.removeButton} onClick={() => onRemove(row.key)}>
                                        <TrashIcon/> Retirer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className={styles.note}>Tous les prix sont indiqués en euros, taxes comprises.</p>
        </section>
    );
}

