import {BrowserRouter} from 'react-router-dom';
import AuthProvider from '@/context/AuthProvider.jsx';
import AppRouter from '@/routes/AppRouter.jsx';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRouter/>
            </AuthProvider>
        </BrowserRouter>
    );
}
