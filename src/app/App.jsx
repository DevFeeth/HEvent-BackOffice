import {BrowserRouter} from 'react-router-dom';
import AuthProvider from '@/context/AuthProvider.jsx';
import ConfirmProvider from '@/context/ConfirmProvider.jsx';
import AppRouter from '@/routes/AppRouter.jsx';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ConfirmProvider>
                    <AppRouter/>
                </ConfirmProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
