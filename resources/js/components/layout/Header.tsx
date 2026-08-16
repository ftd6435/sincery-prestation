import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FileTextIcon,
  MenuIcon,
  PhoneIcon,
  SearchIcon,
  ShoppingBagIcon,
  XIcon } from
'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '../Logo';
import { useSelection } from '../../contexts/SelectionContext';
import { company } from '../../data/company';

const links = [
{ to: '/', label: 'Accueil' },
{ to: '/a-propos', label: 'À propos' },
{ to: '/boutique', label: 'Boutique' },
{ to: '/partenaires', label: 'Partenaires' },
{ to: '/actualites', label: 'Actualités' },
{ to: '/contact', label: 'Contact' }];


export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { count } = useSelection();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/boutique?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-white">
      <div className="hidden bg-black text-sm text-white/70 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
          <p>Équipements professionnels — EPI, sécurité, engins, matériel</p>
          <div className="flex items-center gap-5">
            <a
              href={`tel:${company.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 hover:text-white/95">

              <PhoneIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {company.phone}
            </a>
            <Link to="/devis" className="hover:text-white/95">
              Demander un devis
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) =>
            <li key={link.to}>
                <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                `relative block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                isActive ?
                'text-brand' :
                'text-black/65 hover:text-black/90'}`

                }>

                  {link.label}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-label="Rechercher un produit"
            className="flex h-10 w-10 items-center justify-center rounded-md text-black/65 hover:bg-surface-alt hover:text-black/90">

            <SearchIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            to="/devis"
            className="hidden h-10 items-center gap-2 rounded-md px-3 text-base font-medium text-black/65 hover:bg-surface-alt hover:text-black/90 md:flex">

            <FileTextIcon className="h-5 w-5" aria-hidden="true" />
            Devis
          </Link>

          <Link
            to="/ma-selection"
            className="flex h-10 items-center gap-2 rounded-md bg-brand px-3 text-base font-semibold text-white shadow-glow hover:bg-brand-dark">

            <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Ma sélection</span>
            <span
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-sm font-bold text-brand"
              aria-label={`${count} article${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`}>

              {count}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Ouvrir le menu"
            className="flex h-10 w-10 items-center justify-center rounded-md text-black/65 hover:bg-surface-alt lg:hidden">

            {menuOpen ?
            <XIcon className="h-5 w-5" aria-hidden="true" /> :

            <MenuIcon className="h-5 w-5" aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {searchOpen &&
        <motion.div
          key="search"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="overflow-hidden border-t border-line bg-surface-alt">

            <form
            onSubmit={submitSearch}
            role="search"
            className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">

              <SearchIcon
              className="h-5 w-5 shrink-0 text-black/45"
              aria-hidden="true" />

              <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, une référence…"
              aria-label="Rechercher un produit"
              className="w-full bg-transparent py-1 text-base text-black/90 outline-none placeholder:text-black/45" />

              <button
              type="submit"
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">

                Rechercher
              </button>
            </form>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {menuOpen &&
        <motion.nav
          key="mobile-nav"
          aria-label="Navigation mobile"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="overflow-hidden border-t border-line bg-white lg:hidden">

            <ul className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
              {links.map((link) =>
            <li key={link.to}>
                  <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                `block border-b border-line px-1 py-3 text-base font-medium ${
                isActive ? 'text-brand' : 'text-black/90'}`

                }>

                    {link.label}
                  </NavLink>
                </li>
            )}
              <li>
                <Link
                to="/devis"
                className="block px-1 py-3 text-base font-semibold text-brand">

                  Demander un devis
                </Link>
              </li>
            </ul>
          </motion.nav>
        }
      </AnimatePresence>
    </header>);

}
