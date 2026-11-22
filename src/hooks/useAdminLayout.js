import {useOutletContext} from 'react-router-dom';

/**
 * Accès aux fonctions partagées par l'AdminLayout avec ses pages (via <Outlet context>).
 * Renvoie {refreshCounts} : recharge les compteurs du menu latéral après une modification.
 */
export default function useAdminLayout() {
    return useOutletContext();
}
