import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Trash2, CreditCard as Edit2, X, Check, Shield, Newspaper, Users, Eye, EyeOff, AlertCircle } from 'lucide-react';

type Role = 'admin' | 'blogposter' | 'lid';

type WebsiteUser = {
  id: string;
  auth_user_id: string | null;
  email: string;
  display_name: string;
  role: Role;
  must_change_password: boolean;
  created_at: string;
  last_login: string | null;
};

const ROLES: { value: Role; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { value: 'admin', label: 'Admin', desc: 'Volledige toegang tot het beheer', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-red-100 text-red-700' },
  { value: 'blogposter', label: 'Blogposter', desc: 'Kan berichten schrijven en beheren', icon: <Newspaper className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-700' },
  { value: 'lid', label: 'Lid', desc: 'Basistoegang als ingelogd lid', icon: <Users className="w-3.5 h-3.5" />, color: 'bg-green-100 text-green-700' },
];

function RoleBadge({ role }: { role: Role }) {
  const r = ROLES.find((x) => x.value === role)!;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${r.color}`}>
      {r.icon} {r.label}
    </span>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role>('lid');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setError('Vul alle verplichte velden in.');
      return;
    }
    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn.');
      return;
    }
    setLoading(true);
    setError(null);

    // Create auth user via admin API (service role would be needed for this)
    // For now, we create the user via normal signUp and add to website_users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: { data: { display_name: displayName.trim() } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const authUserId = authData.user?.id ?? null;

    const { error: dbError } = await supabase.from('website_users').insert({
      auth_user_id: authUserId,
      email: email.trim(),
      display_name: displayName.trim(),
      role,
      must_change_password: true,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-[440px] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Nieuwe gebruiker aanmaken</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Naam *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jan de Vries"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">E-mailadres *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jan@voorbeeld.nl"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Wachtwoord *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimaal 8 tekens"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Rol *</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${role === r.value ? 'border-forest-400 bg-forest-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.color}`}>{r.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{r.label}</div>
                    <div className="text-xs text-gray-400">{r.desc}</div>
                  </div>
                  {role === r.value && <Check className="w-4 h-4 text-forest-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition">
            Annuleren
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-forest-800 hover:bg-forest-900 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Aanmaken
          </button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }: { user: WebsiteUser; onClose: () => void; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(user.display_name);
  const [role, setRole] = useState<Role>(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!displayName.trim()) { setError('Naam is verplicht.'); return; }
    setLoading(true);
    const { error: dbError } = await supabase.from('website_users').update({ display_name: displayName.trim(), role }).eq('id', user.id);
    if (dbError) { setError(dbError.message); setLoading(false); return; }
    setLoading(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-[400px] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Gebruiker bewerken</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Naam</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Rol</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${role === r.value ? 'border-forest-400 bg-forest-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${r.color}`}>{r.icon}</div>
                  <div className="text-sm font-medium text-gray-800 flex-1">{r.label}</div>
                  {role === r.value && <Check className="w-4 h-4 text-forest-600" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition">Annuleren</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-forest-800 hover:bg-forest-900 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-medium transition">
            {loading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WebsiteUsers() {
  const [users, setUsers] = useState<WebsiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<WebsiteUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('website_users').select('*').order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    await supabase.from('website_users').delete().eq('id', id);
    setDeleteId(null);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gebruikers</h2>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} website gebruiker{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white font-medium px-4 py-2 rounded-xl text-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          Nieuwe gebruiker
        </button>
      </div>

      {/* Role legend */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rollen uitleg</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ROLES.map((r) => (
            <div key={r.value} className="flex items-start gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${r.color}`}>{r.icon}</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{r.label}</div>
                <div className="text-xs text-gray-400">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
          <Users className="w-10 h-10 text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Nog geen gebruikers aangemaakt.</p>
          <button onClick={() => setShowCreate(true)} className="mt-3 text-sm font-medium text-forest-700 hover:text-forest-900 transition">Maak de eerste gebruiker aan</button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Naam</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">E-mail</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-sm shrink-0">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.display_name}</div>
                        <div className="text-xs text-gray-400 sm:hidden">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{user.email}</td>
                  <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditUser(user)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                        title="Bewerken"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={load} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={load} />}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-80 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-1">Gebruiker verwijderen?</h3>
            <p className="text-sm text-gray-500 mb-5">De gebruiker wordt uit de lijst verwijderd. Hun inloggegevens blijven bestaan in het authenticatiesysteem.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition">Annuleren</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 text-sm font-medium transition">Verwijderen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
