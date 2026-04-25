import { useState, useEffect, ReactNode } from 'react';
import { supabase } from './lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Onjuist e-mailadres of wachtwoord.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Full-bleed background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/jubileum_groepsfoto.jpg)',
          animation: 'heroZoom 20s ease-out forwards',
        }}
      />

      {/* Left-side dark gradient for contrast on the form side */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/70 to-forest-950/20" />
      {/* Overall dark tint so the right side stays readable */}
      <div className="absolute inset-0 bg-forest-950/30" />

      {/* Layout: left panel + photo right */}
      <div className="relative z-10 flex w-full min-h-screen">

        {/* Left: login card */}
        <div className="flex flex-col justify-center px-10 md:px-16 lg:px-24 w-full md:max-w-lg lg:max-w-xl xl:max-w-2xl">

          {/* Logo */}
          <div className="flex items-center gap-4 mb-14">
            <img
              src="/logo-transparant-150.png"
              alt="Scouting Titus Brandsma"
              className="h-14 w-auto drop-shadow-2xl"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <div className="leading-tight">
              <div className="font-display text-white font-semibold text-sm tracking-wide uppercase">Scouting</div>
              <div className="font-display text-scout-red text-xs tracking-wider uppercase">Titus Brandsma</div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <p className="text-forest-400 text-xs font-semibold tracking-[0.25em] uppercase mb-3">
              Website in privemodus
            </p>
            <h1
              className="font-display font-bold text-white uppercase tracking-tight leading-none"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)' }}
            >
              Welkom terug<span className="text-scout-red">.</span>
            </h1>
            <p className="text-white/40 text-sm mt-3 leading-relaxed max-w-xs">
              Log in met je account om de website te bekijken.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.18em]">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jouw@email.nl"
                className="w-full bg-white/[0.07] border border-white/12 hover:border-white/25 focus:border-forest-400 focus:bg-white/[0.1] rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.18em]">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.07] border border-white/12 hover:border-white/25 focus:border-forest-400 focus:bg-white/[0.1] rounded-2xl px-5 py-4 pr-12 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-scout-red hover:bg-scout-darkred active:scale-[0.98] disabled:opacity-50 text-white font-display font-bold text-sm py-4 rounded-2xl transition-all duration-150 tracking-widest uppercase shadow-xl shadow-scout-red/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Inloggen…
                </span>
              ) : (
                'Inloggen'
              )}
            </button>
          </form>

          <p className="mt-14 text-white/15 text-[10px] tracking-[0.3em] uppercase">
            Altijd voorbereid · Oldenzaal sinds 1945
          </p>
        </div>

        {/* Right: decorative overlay text on the photo */}
        <div className="hidden md:flex flex-1 flex-col items-end justify-end p-12 pointer-events-none">
          <div className="text-right">
            <div
              className="font-display font-bold text-white/5 uppercase leading-none select-none"
              style={{ fontSize: 'clamp(5rem, 12vw, 10rem)' }}
            >
              Scouting
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authed' | 'unauthed'>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'authed' : 'unauthed');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setStatus(session ? 'authed' : 'unauthed');
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-forest-950 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthed') {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
