import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ inverted = false }: {inverted?: boolean;}) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5"
      aria-label="Sincery Prestations — retour à l’accueil">
      
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-lg font-bold text-white">
        S
      </span>
      <span className="leading-tight">
        <span
          className={`block text-lg font-semibold ${inverted ? 'text-white' : 'text-black/90'}`}>
          
          Sincery
        </span>
        <span
          className={`block text-sm ${inverted ? 'text-white/70' : 'text-black/45'}`}>
          
          Prestations
        </span>
      </span>
    </Link>);

}