import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminChangePassword from './AdminChangePassword';
import AdminDashboard from './AdminDashboard';

type AdminState = 'loading' | 'login' | 'change-password' | 'dashboard';

export default function AdminApp() {
  const [state, setState] = useState<AdminState>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setState('login');
        return;
      }
      checkAdminUser(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setState('login');
        return;
      }
      if (event === 'SIGNED_IN') {
        checkAdminUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdminUser(userId: string) {
    const { data } = await supabase
      .from('admin_users')
      .select('must_change_password')
      .eq('id', userId)
      .maybeSingle();

    if (!data) {
      await supabase.auth.signOut();
      setState('login');
      return;
    }

    if (data.must_change_password) {
      setState('change-password');
    } else {
      setState('dashboard');
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'login') {
    return <AdminLogin />;
  }

  if (state === 'change-password') {
    return <AdminChangePassword onDone={() => setState('dashboard')} />;
  }

  return <AdminDashboard />;
}
