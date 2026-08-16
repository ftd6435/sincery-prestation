import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BellIcon,
  BoxesIcon,
  FileTextIcon,
  FolderTreeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  NewspaperIcon,
  PackageIcon,
  SettingsIcon,
  UsersIcon,
  XIcon } from
'lucide-react';

const navItems = [
{ to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboardIcon },
{ to: '/admin/produits', label: 'Produits', icon: PackageIcon },
{ to: '/admin/categories', label: 'Catégories', icon: FolderTreeIcon },
{ to: '/admin/commandes', label: 'Commandes', icon: BoxesIcon },
{ to: '/admin/devis', label: 'Devis', icon: FileTextIcon },
{ to: '/admin/actualites', label: 'Actualités', icon: NewspaperIcon },
{ to: '/admin/partenaires', label: 'Partenaires', icon: UsersIcon },
{ to: '/admin/messages', label: 'Messages', icon: MailIcon },
{ to: '/admin/utilisateurs', label: 'Utilisateurs', icon: UsersIcon },
{ to: '/admin/parametres', label: 'Paramètres', icon: SettingsIcon }];


export function AdminLayout() {
  const [open, setOpen] = useState(false);

  const nav =
  <nav aria-label="Navigation administration" className="p-3">
      <ul className="space-y-1">
        {navItems.map((item) =>
      <li key={item.to}>
            <NavLink
          to={item.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
          `flex items-center gap-3 rounded-md px-3 py-2 text-base transition-colors ${
          isActive ?
          'bg-brand text-white' :
          'text-white/70 hover:bg-white/10 hover:text-white/95'}`

          }>
          
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
      )}
      </ul>
    </nav>;


  return (
    <div className="flex min-h-full w-full bg-surface-page">
      <aside className="hidden w-64 shrink-0 flex-col bg-black lg:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-lg font-bold text-white">
            S
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold text-white/95">
              Sincery
            </span>
            <span className="block text-sm text-white/70">Administration</span>
          </span>
        </div>
        {nav}
        <div className="mt-auto border-t border-white/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-base text-white/70 hover:bg-white/10 hover:text-white/95">
            
            <LogOutIcon className="h-4 w-4" aria-hidden="true" />
            Retour au site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Ouvrir le menu d’administration"
            className="flex h-10 w-10 items-center justify-center rounded-md text-black/65 hover:bg-surface-alt lg:hidden">
            
            {open ?
            <XIcon className="h-5 w-5" aria-hidden="true" /> :

            <MenuIcon className="h-5 w-5" aria-hidden="true" />
            }
          </button>

          <p className="hidden text-base text-black/65 sm:block">
            Espace d’administration — Sincery Prestations
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-md text-black/65 hover:bg-surface-alt">
              
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                AS
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-base font-semibold text-black/90">
                  Amadou Sincery
                </span>
                <span className="block text-sm text-black/45">Super Admin</span>
              </span>
            </div>
          </div>
        </header>

        {open && <div className="bg-black lg:hidden">{nav}</div>}

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>);

}