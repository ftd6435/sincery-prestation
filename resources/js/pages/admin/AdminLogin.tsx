import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LockIcon, ShieldAlertIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/forms/Field';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useSeo } from '../../utils/seo';

export function AdminLogin() {
  const { authenticated, signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useSeo(
    'Connexion | Administration Sincery Prestations',
    'Accès sécurisé à l’espace d’administration Sincery Prestations.'
  );

  if (authenticated) return <Navigate to="/admin/dashboard" replace />;

  const locked = attempts >= 5;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (locked) return;
    if (!email.trim() || !password.trim()) {
      setAttempts((a) => a + 1);
      setError('Identifiants incorrects. Veuillez réessayer.');
      return;
    }
    signIn();
    navigate('/admin/dashboard');
  }

  return (
    <div className="flex min-h-full w-full items-center justify-center bg-black px-6 py-16">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-elevated">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-lg font-bold text-white">
            S
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-semibold text-black/90">
              Sincery Prestations
            </span>
            <span className="block text-sm text-black/45">Administration</span>
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-black/90">Connexion</h1>
        <p className="mt-1.5 text-base text-black/65">
          Accès réservé aux utilisateurs autorisés.
        </p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <TextField
            label="Email"
            name="admin-email"
            type="email"
            required
            value={email}
            onChange={setEmail}
            placeholder="prenom.nom@sincery-prestations.com" />

          <TextField
            label="Mot de passe"
            name="admin-password"
            type="password"
            required
            value={password}
            onChange={setPassword} />


          {error &&
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md bg-danger-bg p-3 text-sm text-[#B91C1C]">

              <ShieldAlertIcon
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true" />

              {locked ?
            'Trop de tentatives. Votre accès est temporairement bloqué.' :
            `${error} Tentative ${attempts} sur 5.`}
            </p>
          }

          <Button type="submit" className="w-full" disabled={locked}>
            <LockIcon className="h-4 w-4" aria-hidden="true" />
            Se connecter
          </Button>
        </form>

        <p className="mt-5 text-sm text-black/45">
          Connexion protégée : limitation des tentatives, sessions sécurisées et
          gestion des rôles (Super Admin, Administrateur, Éditeur).
        </p>
      </div>
    </div>);

}
