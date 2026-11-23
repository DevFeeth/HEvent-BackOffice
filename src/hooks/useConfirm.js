import {useContext} from 'react';
import {ConfirmContext} from '@/context/confirmContext.js';

/**
 * Renvoie confirm(options) : ouvre la popup de confirmation et renvoie une promesse
 * résolue à true (confirmé) ou false (annulé).
 *
 * Exemple :
 *   const confirm = useConfirm();
 *   if (await confirm({title: 'Supprimer ?', message: '...'})) { ... }
 */
export default function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm doit être utilisé dans un <ConfirmProvider>');
    }
    return context;
}
