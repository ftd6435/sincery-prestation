import React from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { company } from '../../data/company';
import { categories } from '../../data/categories';
import { Logo } from '../Logo';

const navLinks = [
{ to: '/', label: 'Accueil' },
{ to: '/a-propos', label: 'À propos' },
{ to: '/boutique', label: 'Boutique' },
{ to: '/partenaires', label: 'Partenaires' },
{ to: '/actualites', label: 'Actualités' },
{ to: '/contact', label: 'Contact' }];


const legalLinks = [
{ to: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
{ to: '/conditions-generales', label: 'Conditions générales' },
{ to: '/mentions-legales', label: 'Mentions légales' }];


export function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-black text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo inverted />
          <p className="mt-4 text-sm leading-relaxed">
            Vente de produits professionnels : équipements de protection
            individuelle, accessoires pour engins, sécurité et matériel
            professionnel.
          </p>
          <div className="mt-5 flex gap-3">
            {company.socials.map((s) =>
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-md border border-white/20 px-3 py-1.5 text-sm hover:border-brand hover:text-white/95">
              
                {s.name}
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Navigation du pied de page">
          <h2 className="text-lg font-semibold text-white/95">Navigation</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((l) =>
            <li key={l.to}>
                <Link to={l.to} className="hover:text-white/95">
                  {l.label}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <nav aria-label="Catégories de la boutique">
          <h2 className="text-lg font-semibold text-white/95">Boutique</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) =>
            <li key={c.slug}>
                <Link to={`/boutique/${c.slug}`} className="hover:text-white/95">
                  {c.name}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div>
          <h2 className="text-lg font-semibold text-white/95">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <PhoneIcon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              <a href={`tel:${company.phone.replace(/\s/g, '')}`}>
                {company.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MailIcon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPinIcon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{company.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Sincery Prestations. Tous droits réservés.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((l) =>
            <li key={l.to}>
                <Link to={l.to} className="hover:text-white/95">
                  {l.label}
                </Link>
              </li>
            )}
            <li>
              <Link to="/admin" className="hover:text-white/95">
                Administration
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>);

}