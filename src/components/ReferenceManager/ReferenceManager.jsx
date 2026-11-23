import {useCallback, useMemo, useState} from 'react';
import useFetch from '@/hooks/useFetch.js';
import useListControls from '@/hooks/useListControls.js';
import useConfirm from '@/hooks/useConfirm.js';
import {getApiErrorMessage} from '@/utils/apiError.js';
import PageHeader from '@/components/PageHeader/PageHeader.jsx';
import DataList from '@/components/DataList/DataList.jsx';
import cells from '@/styles/cells.module.css';
import styles from './ReferenceManager.module.css';

const NAME_PATTERN = /^[A-Z0-9_-]+$/;
const EMPTY_ITEM = {name: '', label: ''};
const NO_ITEMS = [];

const referenceMatches = (item, query) => `${item.name} ${item.label}`.toLowerCase().includes(query);

function validateNewItem({name, label}, items) {
    if (!NAME_PATTERN.test(name)) return 'Le code ne peut contenir que des lettres, chiffres, « _ » et « - ».';
    if (!label) return 'Le libellé est obligatoire.';
    if (items.some((item) => item.name === name)) return `Le code « ${name} » existe déjà.`;
    return null;
}

export default function ReferenceManager({
    title, addLabel, itemWord, usageHeader,
    fetchItems, onCreate, onUpdate, onDelete, getLockReason, onChanged,
}) {
    const confirm = useConfirm();
    const {data, loading, error, reload} = useFetch(fetchItems);
    const items = data ?? NO_ITEMS;
    const controls = useListControls(items, referenceMatches);

    const [newItem, setNewItem] = useState(null);
    const [editing, setEditing] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

    const run = useCallback(async (action) => {
        setBusy(true);
        setMessage('');
        try {
            await action();
            reload();
            onChanged?.();
            return true;
        } catch (err) {
            setMessage(getApiErrorMessage(err));
            return false;
        } finally {
            setBusy(false);
        }
    }, [reload, onChanged]);

    async function handleCreate(e) {
        e.preventDefault();
        const item = {name: newItem.name.trim(), label: newItem.label.trim()};
        const validationError = validateNewItem(item, items);
        setMessage(validationError ?? '');
        if (!validationError && await run(() => onCreate(item.name, item.label))) {
            setNewItem(null);
        }
    }

    const handleUpdate = useCallback(async (e) => {
        e.preventDefault();
        const label = editing.label.trim();
        if (!label) {
            setMessage('Le libellé est obligatoire.');
            return;
        }
        if (await run(() => onUpdate(editing.name, label))) {
            setEditing(null);
        }
    }, [editing, run, onUpdate]);

    const handleDelete = useCallback(async (item) => {
        const confirmed = await confirm({
            title: `Supprimer « ${item.label} » ?`,
            message: <>L&apos;élément <code>{item.name}</code> sera définitivement supprimé. Cette action est irréversible.</>,
        });
        if (confirmed) {
            await run(() => onDelete(item.name));
        }
    }, [confirm, run, onDelete]);

    const columns = useMemo(() => {
        const isEditing = (item) => editing?.name === item.name;

        return [
            {key: 'name', header: 'Code', width: 200, render: (item) => <code className={cells.code}>{item.name}</code>},
            {
                key: 'label',
                header: 'Libellé',
                render: (item) => (isEditing(item) ? (
                    <input
                        className={styles.input}
                        form="edit-form"
                        value={editing.label}
                        onChange={(e) => setEditing({...editing, label: e.target.value})}
                        maxLength={50}
                        autoFocus
                        aria-label="Libellé"
                    />
                ) : item.label),
            },
            {key: 'usage', header: usageHeader, align: 'center'},
            {
                key: 'actions',
                header: 'Actions',
                align: 'right',
                render: (item) => (isEditing(item) ? (
                    <form id="edit-form" className={styles.rowActions} onSubmit={handleUpdate}>
                        <button type="submit" disabled={busy}>Enregistrer</button>
                        <button type="button" className="button--secondary" onClick={() => setEditing(null)}>
                            Annuler
                        </button>
                    </form>
                ) : (
                    <div className={styles.rowActions}>
                        <button
                            type="button"
                            className="button--link"
                            onClick={() => setEditing({name: item.name, label: item.label})}
                            disabled={busy}
                        >
                            Modifier
                        </button>
                        <button
                            type="button"
                            className={`button--link ${styles.danger}`}
                            onClick={() => handleDelete(item)}
                            disabled={busy || Boolean(getLockReason?.(item))}
                            title={getLockReason?.(item) ?? undefined}
                        >
                            Supprimer
                        </button>
                    </div>
                )),
            },
        ];
    }, [editing, busy, usageHeader, getLockReason, handleUpdate, handleDelete]);

    return (
        <>
            <PageHeader title={title}>
                <button type="button" onClick={() => setNewItem(EMPTY_ITEM)} disabled={newItem !== null}>
                    {addLabel}
                </button>
            </PageHeader>

            {message && <p className={styles.error} role="alert">{message}</p>}

            <DataList
                controls={controls}
                itemWord={itemWord}
                columns={columns}
                getRowKey={(item) => item.name}
                getRowClassName={(item) => (editing?.name === item.name ? styles.editingRow : undefined)}
                loading={loading}
                error={error}
                onRetry={reload}
            >
                {newItem && (
                    <form className={styles.addForm} onSubmit={handleCreate}>
                        <input
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value.toUpperCase()})}
                            placeholder="CODE"
                            maxLength={25}
                            autoFocus
                            aria-label="Code"
                        />
                        <input
                            className={styles.labelInput}
                            value={newItem.label}
                            onChange={(e) => setNewItem({...newItem, label: e.target.value})}
                            placeholder="Libellé"
                            maxLength={50}
                            aria-label="Libellé"
                        />
                        <button type="submit" disabled={busy}>Ajouter</button>
                        <button type="button" className="button--secondary" onClick={() => setNewItem(null)}>
                            Annuler
                        </button>
                    </form>
                )}
            </DataList>
        </>
    );
}
