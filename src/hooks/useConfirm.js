import {useContext} from 'react';
import {ConfirmContext} from '@/context/confirmContext.js';

export default function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm doit être utilisé dans un <ConfirmProvider>');
    }
    return context;
}
