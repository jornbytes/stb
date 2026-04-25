import { useState, useEffect, ReactNode } from 'react';
import { supabase } from './lib/supabase';
import { Eye, EyeOff, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-forest-950 relative flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage: 'url(/jubileum_groepsfoto.jpg)',
          animation: 'heroZoom 20s ease-out forwards',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(7,26,11,0.9)_100%)]" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-forest-950 to-transparent" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center">
        <img
          src="/logo-transparant-150.png"
          alt="Scouting Titus Brandsma"
          className="h-20 w-auto mb-8 drop-shadow-2xl"
          style={{ filter: 'brightness(0) invert(1)' }}
        />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 mb-4">
            <Lock className="w-4 h-4 text-forest-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white uppercase tracking-[0.1em]">
            Privemodus
          </h1>
          <p className="text-forest-400 text-xs mt-2 tracking-[0.15em] uppercase font-medium">
            Log in om de website te bekijken
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-forest-400 uppercase tracking-[0.15em]">
              E-mailadres
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jouw@email.nl"
              className="w-full bg-white/[0.06] border border-white/10 hover:border-white/20 focus:border-forest-400 focus:bg-white/[0.09] rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-forest-400 uppercase tracking-[0.15em]">
              Wachtwoord
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/[0.06] border border-white/10 hover:border-white/20 focus:border-forest-400 focus:bg-white/[0.09] rounded-xl px-4 py-3.5 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center pt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-forest-600 hover:bg-forest-500 active:bg-forest-700 disabled:opacity-50 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors duration-150 tracking-wide shadow-lg shadow-black/30"
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

        <p className="mt-12 text-forest-700 text-[10px] tracking-[0.25em] uppercase">
          Altijd voorbereid
        </p>
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
