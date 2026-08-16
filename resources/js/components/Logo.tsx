import { Link } from 'react-router-dom';

export function Logo({ inverted = false }: { inverted?: boolean }) {
  const logoSrc = inverted ? '/logos/sp-white-logo.png' : '/logos/sp-black-logo.jpeg';
  const logoAlt = 'Sincery Prestations';

  return (
    <Link
      to="/"
      className="flex items-center gap-2.5"
      aria-label="Sincery Prestations — retour à l’accueil"
    >
      <span
        className={
          'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden ' +
          (inverted ? 'rounded-full bg-white p-0.5' : 'rounded-md')
        }
      >
        <img
          src={logoSrc}
          alt={logoAlt}
          className="h-full w-full object-contain"
        />
      </span>
      <span className="leading-tight">
        <span
          className={`block text-lg font-semibold ${inverted ? 'text-white' : 'text-black/90'}`}
        >
          Sincery
        </span>
        <span
          className={`block text-sm ${inverted ? 'text-white/70' : 'text-black/45'}`}
        >
          Prestations
        </span>
      </span>
    </Link>
  );
}
