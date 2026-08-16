import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

export function PageHero({
  title,
  subtitle,
  crumbs = []




}: {title: string;subtitle?: string;crumbs?: Crumb[];}) {
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {crumbs.length > 0 &&
        <nav aria-label="Fil d’Ariane" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-black/45">
              <li>
                <Link to="/" className="hover:text-brand">
                  Accueil
                </Link>
              </li>
              {crumbs.map((c) =>
            <li key={c.label} className="flex items-center gap-1">
                  <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {c.to ?
              <Link to={c.to} className="hover:text-brand">
                      {c.label}
                    </Link> :

              <span className="text-black/65">{c.label}</span>
              }
                </li>
            )}
            </ol>
          </nav>
        }
        <h1 className="text-2xl font-bold text-black/90 sm:text-4xl">{title}</h1>
        {subtitle &&
        <p className="mt-3 max-w-3xl text-base text-black/65">{subtitle}</p>
        }
      </div>
    </div>);

}