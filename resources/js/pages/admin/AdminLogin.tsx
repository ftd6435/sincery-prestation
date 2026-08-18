import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LockIcon, ShieldAlertIcon, PhoneIcon, Loader2Icon, EyeIcon, EyeOffIcon, SparklesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/forms/Field';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useSeo } from '../../utils/seo';
import { ApiRequestError } from '../../lib/api';

const loginSchema = z.object({
  telephone: z.string().min(9, 'Le numéro de téléphone doit comporter au moins 9 caractères'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function AdminLogin() {
  const { authenticated, signIn, loading } = useAdminAuth();
  const [attempts, setAttempts] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateFrom = typeof location.state?.from === 'string' ? location.state.from : null;
  const redirect = searchParams.get('redirect') ?? stateFrom ?? '/admin/dashboard';

  useSeo(
    'Connexion | Administration Sincery Prestations',
    'Accès sécurisé à l’espace d’administration Sincery Prestations.'
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema) as never,
    defaultValues: { telephone: '', password: '' },
    mode: 'onChange',
  });

  if (authenticated) return <Navigate to={redirect} replace />;

  const locked = attempts >= 5;
  const busy = isSubmitting || loading;

  async function submit(values: LoginValues) {
    if (locked || busy) return;

    setFormError(null);
    try {
      await signIn(values.telephone, values.password);
      toast.success('Bienvenue dans l’espace d’administration Sincery Prestations');
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Erreur lors de la connexion';
      setAttempts((a) => a + 1);
      setFormError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0b1b2c]">
      {/* Professional background: deep navy + bordeaux accent gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 15% 0%, rgba(193,39,45,0.28) 0%, rgba(193,39,45,0) 55%), radial-gradient(90% 70% at 100% 100%, rgba(59,78,113,0.55) 0%, rgba(11,27,44,0) 55%), linear-gradient(135deg, #0d1c30 0%, #102441 45%, #1b1529 100%)',
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-24 h-[22rem] w-[22rem] rounded-full bg-[#c1272d]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }} />

      {/* Main grid */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 lg:px-10">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: brand + logo */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="hidden flex-col justify-center text-white lg:flex"
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/80">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Espace d’administration
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)] ring-4 ring-white/10">
                <img
                  src="/logos/sp-black-logo.jpeg"
                  alt="Sincery Prestations"
                  className="h-full w-full rounded-full object-contain"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-white">
                  Sincery Prestations
                </div>
                <div className="mt-1 text-sm text-white/70">
                  Espace d’administration
                </div>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-bold leading-[1.1] text-white xl:text-5xl">
              Gérez votre activité,<br />
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                en toute simplicité.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
              Tableau de bord, commandes, devis, produits, actualités et clients —
              tout votre écosystème Sincery réuni dans un seul espace sécurisé.
            </p>

            <ul className="mt-10 space-y-4">
              {[
                { t: 'Sessions sécurisées', d: 'Authentification par token Sanctum et protection CSRF.' },
                { t: 'Contrôle d’accès par rôles', d: 'Super Admin, Administrateur et Éditeur : permissions granularisées.' },
                { t: 'Historique des actions', d: 'Traçabilité complète des modifications et audit log.' },
              ].map((item) => (
                <li key={item.t} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-brand">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.5 7.5a1 1 0 0 1-1.42 0l-3.5-3.5a1 1 0 1 1 1.42-1.42l2.79 2.79 6.79-6.79a1 1 0 0 1 1.42 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.t}</div>
                    <div className="text-sm text-white/75">{item.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: login card */}
          <div className="flex w-full items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/5 backdrop-blur-xl sm:p-10"
            >
              {/* Mobile-only logo header */}
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-md ring-1 ring-black/5">
                    <img
                      src="/logos/sp-black-logo.jpeg"
                      alt="Sincery Prestations"
                      className="h-full w-full rounded-full object-contain"
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[15px] font-extrabold tracking-tight text-black/90">
                      Sincery Prestations
                    </div>
                    <div className="text-xs text-black/50">
                      Administration
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
                  Admin
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white shadow-[0_10px_24px_-10px_rgba(193,39,45,0.9)]">
                  <LockIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[1.65rem] font-extrabold tracking-tight text-black/90">Connexion</h2>
                  <p className="mt-0.5 text-sm text-black/60">
                    Accès réservé aux utilisateurs autorisés.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(submit as Parameters<typeof handleSubmit>[0])}
                noValidate
                className="mt-8 space-y-5"
              >
                <div>
                  <TextField
                    label="Numéro de téléphone"
                    type="tel"
                    required
                    placeholder="+224 6XX XX XX XX"
                    icon={<PhoneIcon className="h-4 w-4" aria-hidden="true" />}
                    error={errors.telephone?.message ?? null}
                    className="[&_input]:h-12 [&_input]:rounded-xl [&_input]:border-black/10 [&_input]:bg-white [&_input]:pl-11 [&_input]:shadow-sm [&_input]:focus:border-brand [&_input]:focus:ring-4 [&_input]:focus:ring-brand/15"
                    {...register('telephone')}
                  />
                </div>

                <div>
                  <TextField
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    icon={<LockIcon className="h-4 w-4" aria-hidden="true" />}
                    error={errors.password?.message ?? null}
                    suffix={
                      <button
                        type="button"
                        className="-mr-1 flex h-8 w-8 items-center justify-center rounded-md text-black/45 transition-colors hover:bg-black/5 hover:text-brand focus:text-brand focus:outline-none"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                        )}
                      </button>
                    }
                    className="[&_input]:h-12 [&_input]:rounded-xl [&_input]:border-black/10 [&_input]:bg-white [&_input]:pl-11 [&_input]:shadow-sm [&_input]:focus:border-brand [&_input]:focus:ring-4 [&_input]:focus:ring-brand/15"
                    {...register('password')}
                  />
                </div>

                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-bg p-4 text-sm text-[#B91C1C]"
                  >
                    <ShieldAlertIcon
                      className="mt-0.5 h-[18px] w-[18px] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="flex-1 leading-relaxed">
                      {locked
                        ? 'Trop de tentatives. Votre accès est temporairement bloqué pendant 2 minutes.'
                        : `${formError} Tentative ${Math.min(attempts, 5)} sur 5.`}
                    </span>
                  </motion.div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-sm text-black/65 select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-line text-brand focus:ring-2 focus:ring-brand"
                      defaultChecked
                    />
                    Rester connecté
                  </label>
                  <button
                    type="button"
                    className="text-sm font-semibold text-brand underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
                    onClick={() => toast.info('Contactez un Super Administrateur pour réinitialiser votre mot de passe.')}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl !bg-gradient-to-r !from-[#c1272d] !to-[#9f1a22] text-base font-semibold text-white shadow-[0_14px_28px_-14px_rgba(193,39,45,0.9)] transition-all hover:shadow-[0_18px_36px_-12px_rgba(193,39,45,1)] active:translate-y-[1px]"
                  disabled={locked || busy}
                >
                  {busy ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2Icon className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
                      <span>Connexion en cours…</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      <LockIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Se connecter</span>
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-8 flex items-start gap-3 rounded-xl bg-brand/5 p-4 text-sm leading-relaxed text-black/65 ring-1 ring-brand/10">
                <ShieldAlertIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-black/80">Connexion protégée</div>
                  Limitation des tentatives, sessions sécurisées et gestion des rôles
                  (Super Admin, Administrateur, Éditeur).
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs text-white/75 sm:flex-row lg:px-10">
          <div>© {new Date().getFullYear()} Sincery Prestations — Tous droits réservés.</div>
          <div className="flex items-center gap-4">
            <span>Conçu avec soin pour l’équipe Sincery.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
