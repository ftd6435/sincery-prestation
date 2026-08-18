import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDownIcon,
  KeyRoundIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { twMerge } from 'tailwind-merge';

export function AvatarDropdown() {
  const { user, authenticated, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initials = (() => {
    if (!user) return 'AS';
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return user.username?.[0]?.toUpperCase() ?? '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrateur',
    editor: 'Éditeur',
    user: 'Utilisateur',
  };

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      toast.success('Déconnexion réussie', { description: 'À bientôt sur Sincery.' });
      navigate('/admin/login', { replace: true });
    } catch {
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  if (!authenticated || !user) return null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-md p-1 transition-colors hover:bg-surface-alt focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <span
          className={twMerge(
            'flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-sm',
            signingOut && 'opacity-60',
          )}
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-base font-semibold text-black/90">
            {user.name}
          </span>
          <span className="block text-sm text-black/45">
            {roleLabel[user.role] ?? user.role}
          </span>
        </span>
        <ChevronDownIcon
          className={twMerge(
            'hidden h-4 w-4 shrink-0 text-black/45 transition-transform sm:block',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-40 mt-2 w-64 origin-top-right rounded-lg border border-line bg-white shadow-elevated"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black/90">
                  {user.name}
                </p>
                <p className="truncate text-xs text-black/55">
                  {user.email ?? user.telephone}
                </p>
              </div>
            </div>

            <ul className="p-1.5 text-sm">
              <li>
                <Link
                  to="/admin/profil"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-black/80 hover:bg-surface-alt hover:text-black/95"
                >
                  <UserCircleIcon className="h-4 w-4 text-black/55" aria-hidden />
                  Mon profil
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/profil#securite"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-black/80 hover:bg-surface-alt hover:text-black/95"
                >
                  <KeyRoundIcon className="h-4 w-4 text-black/55" aria-hidden />
                  Changer mon mot de passe
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-danger hover:bg-danger-bg"
                >
                  {signingOut ? (
                    <ShieldCheckIcon
                      className="h-4 w-4 animate-pulse opacity-60"
                      aria-hidden
                    />
                  ) : (
                    <LogOutIcon className="h-4 w-4" aria-hidden />
                  )}
                  {signingOut ? 'Déconnexion…' : 'Se déconnecter'}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
