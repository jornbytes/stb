import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, CreditCard as Edit2, LogOut, ChevronDown, Shield } from 'lucide-react';

type AdminUser = {
  id: string;
  email: string;
};

export default function AdminTopbar({ pageSlug }: { pageSlug?: string }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }

      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (data) {
        setAdmin({ id: session.user.id, email: session.user.email ?? '' });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAdmin(null); return; }
      (async () => {
        const { data } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();
        if (data) {
          setAdmin({ id: session.user.id, email: session.user.email ?? '' });
        } else {
          setAdmin(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Push the fixed public navbar down by 40px via a CSS var on <html>
  useEffect(() => {
    document.documentElement.style.setProperty('--admin-bar-h', admin ? '40px' : '0px');
    return () => { document.documentElement.style.setProperty('--admin-bar-h', '0px'); };
  }, [admin]);

  if (loading || !admin) return null;

  return (
    <div className="sticky top-0 z-[999] bg-gray-900/95 backdrop-blur-sm border-b border-white/10 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between gap-4">
        {/* Left: label */}
        <div className="flex items-center gap-2 text-white/60">
          <Shield className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs">Ingelogd als admin</span>
          <span className="text-white/30">·</span>
          <span className="text-xs text-white/80 font-medium truncate max-w-[200px]">{admin.email}</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {pageSlug && (
            <a
              href={`/admin`}
              className="flex items-center gap-1.5 text-xs font-medium bg-forest-700 hover:bg-forest-600 text-white px-3 py-1 rounded-lg transition"
            >
              <Edit2 className="w-3 h-3" />
              Pagina bewerken
            </a>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/10"
            >
              <Settings className="w-3.5 h-3.5" />
              <ChevronDown className={`w-3 h-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                  <a
                    href="/admin"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Beheer panel
                  </a>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={async () => { await supabase.auth.signOut(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Uitloggen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
