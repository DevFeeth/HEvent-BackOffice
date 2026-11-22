import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import useAuth from '@/hooks/useAuth.js';
import {HOME_PATH} from '@/routes/paths.js';
import {ForbiddenRoleError} from '@/utils/roles.js';
import styles from './LoginPage.module.css';

function getErrorMessage(error) {
    if (error instanceof ForbiddenRoleError) {
        return 'Accès réservé aux administrateurs.';
    }
    switch (error.response?.status) {
        case 401: return 'Email ou mot de passe incorrect.';
        case 400: return 'Email ou mot de passe invalide.';
        default: return "Impossible de joindre l'API.";
    }
}

export default function LoginPage() {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password, remember);
            navigate(HOME_PATH, {replace: true});
        } catch (e) {
            setError(getErrorMessage(e));
            setLoading(false);
        }
    }

    return (
        <div className={styles.page}>
            <title>HEvent · Connexion</title>

            <main className={styles.main}>
                <form className={styles.card} onSubmit={handleSubmit}>
                    <h1 className={styles.title}>Connexion</h1>
                    <p className={styles.subtitle}>
                        Ravi de vous retrouver ! Connectez-vous pour gérer vos organisateurs et vos événements.
                    </p>

                    <label className={styles.field}>
                        <span className={styles.label}>Adresse email</span>
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="vous@exemple.fr"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            autoFocus
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Mot de passe</span>
                        <input
                            className={styles.input}
                            type="password"
                            placeholder="Saisissez votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    <div className={styles.options}>
                        <label className={styles.remember}>
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            Se souvenir de moi
                        </label>
                        {/* TODO : page "mot de passe oublié" (pas encore de route dans l'API) */}
                        <a className={styles.link} href="#">Mot de passe oublié ?</a>
                    </div>

                    {error && <p className={styles.error} role="alert">{error}</p>}

                    <button className={styles.submit} type="submit" disabled={loading}>
                        {loading ? 'Connexion…' : 'Se connecter'}
                    </button>

                    <p className={styles.note}>Pas encore d&apos;accès ? Contactez votre administrateur.</p>
                </form>
            </main>

        </div>
    );
}
