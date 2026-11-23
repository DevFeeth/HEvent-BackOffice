import {useOutletContext} from 'react-router-dom';

export default function useAdminLayout() {
    return useOutletContext();
}
