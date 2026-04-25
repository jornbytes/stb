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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Full-bleed background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/jubileum_groepsfoto.jpg)',
          animation: 'heroZoom 20s ease-out forwards',
        }}
      />
      {/* Subtle dark overlay so photo doesn't overpower the card */}
      <div className="absolute inset-0 bg-forest-950/50" />

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-md mx-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Card top: accent bar + logo */}
          <div className="bg-forest-950 px-10 pt-10 pb-8 flex flex-col items-center text-center">
            <img
              src="/logo-transparant-150.png"
              alt="Scouting Titus Brandsma"
              className="h-16 w-auto mb-5 drop-shadow-lg"
            />
            <div className="font-display text-white font-bold text-lg tracking-[0.12em] uppercase leading-tight">
              Scouting Titus Brandsma
            </div>
            <div className="mt-1 text-forest-400 text-[11px] tracking-[0.22em] uppercase font-medium">
              Oldenzaal · Sinds 1945
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-6">
              <div className="h-px w-8 bg-scout-red/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-scout-red" />
              <div className="h-px w-8 bg-scout-red/50" />
            </div>
          </div>

          {/* Card body: form */}
          <div className="px-10 py-9">
            <div className="mb-7">
              <h1 className="font-display font-bold text-forest-950 uppercase tracking-tight text-2xl leading-none">
                Privemodus<span className="text-scout-red">.</span>
              </h1>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Log in om de website te bekijken.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.18em]">
                  E-mailadres
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jouw@email.nl"
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-forest-500 focus:bg-white focus:ring-2 focus:ring-forest-100 rounded-xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 outline-none transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.18em]">
                  Wachtwoord
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-forest-500 focus:bg-white focus:ring-2 focus:ring-forest-100 rounded-xl px-4 py-3.5 pr-12 text-sm text-gray-800 placeholder-gray-300 outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <p className="text-red-500 text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 bg-scout-red hover:bg-scout-darkred active:scale-[0.98] disabled:opacity-60 text-white font-display font-bold text-sm py-4 rounded-xl transition-all duration-150 tracking-widest uppercase shadow-lg shadow-scout-red/20"
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
