import {useCallback, useRef, useState} from 'react';
import {ConfirmContext} from '@/context/confirmContext.js';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog.jsx';

export default function ConfirmProvider({children}) {
    const [options, setOptions] = useState(null);
    const resolveRef = useRef(null);

    const confirm = useCallback((opts) => {
        resolveRef.current?.(false);
        setOptions(opts);
        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const close = useCallback((result) => {
        resolveRef.current?.(result);
        resolveRef.current = null;
        setOptions(null);
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {options && (
                <ConfirmDialog
                    {...options}
                    onConfirm={() => close(true)}
                    onCancel={() => close(false)}
                />
            )}
        </ConfirmContext.Provider>
    );
}
