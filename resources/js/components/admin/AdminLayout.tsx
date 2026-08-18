import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BellIcon,
  BoxesIcon,
  FileTextIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  MessageSquareTextIcon,
  NewspaperIcon,
  PackageIcon,
  SettingsIcon,
  TagIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { AvatarDropdown } from './ui/AvatarDropdown';

const navItems = [
  { to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboardIcon },
  { to: '/admin/produits', label: 'Produits', icon: PackageIcon },
  { to: '/admin/categories', label: 'Catégories', icon: FolderTreeIcon },
  { to: '/admin/commandes', label: 'Commandes', icon: BoxesIcon },
  { to: '/admin/devis', label: 'Devis', icon: FileTextIcon },
  { to: '/admin/actualites', label: 'Actualités', icon: NewspaperIcon },
  { to: '/admin/commentaires', label: 'Commentaires', icon: MessageSquareTextIcon },
  { to: '/admin/partenaires', label: 'Partenaires', icon: UsersIcon },
  { to: '/admin/partenaires-categories', label: 'Catégories partenaires', icon: TagIcon },
  { to: '/admin/messages', label: 'Messages', icon: MailIcon },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: UsersIcon },
  { to: '/admin/parametres', label: 'Paramètres', icon: SettingsIcon },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when the route changes (nav click)
  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const nav = (
    <nav aria-label="Navigation administration" className="p-3">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-base transition-colors ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white/95'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full bg-surface-page">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-black shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 ring-1 ring-white/10"
                  aria-label="Sincery Prestations — retour à l’accueil"
                >
                  <img
                    src="/logos/sp-black-logo.jpeg"
                    alt="Sincery Prestations"
                    className="h-full w-full rounded-full object-contain"
                  />
                </Link>
                <span className="leading-tight">
                  <span className="block text-base font-semibold text-white/95">Sincery</span>
                  <span className="block text-sm text-white/70">Administration</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu d’administration"
                className="flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
              >
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {nav}
            <div className="mt-auto border-t border-white/10 p-3">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-base text-white/70 hover:bg-white/10 hover:text-white/95"
              >
                <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                Retour au site
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar (sticky) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-black lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Link
            to="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 ring-1 ring-white/10"
            aria-label="Sincery Prestations — retour à l’accueil"
          >
            <img
              src="/logos/sp-black-logo.jpeg"
              alt="Sincery Prestations"
              className="h-full w-full rounded-full object-contain"
            />
          </Link>
          <span className="leading-tight">
            <span className="block text-base font-semibold text-white/95">Sincery</span>
            <span className="block text-sm text-white/70">Administration</span>
          </span>
        </div>
        {nav}
        <div className="mt-auto border-t border-white/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-base text-white/70 hover:bg-white/10 hover:text-white/95"
          >
            <LogOutIcon className="h-4 w-4" aria-hidden="true" />
            Retour au site
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-surface-alt px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-mobile-sidebar"
            aria-label="Ouvrir le menu d’administration"
            className="flex h-10 w-10 items-center justify-center rounded-md text-black/65 hover:bg-white lg:hidden"
          >
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <p className="hidden text-base text-black/65 sm:block">
            Espace d’administration — Sincery Prestations
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-md text-black/65 hover:bg-white"
            >
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" />
            </button>
            <AvatarDropdown />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
