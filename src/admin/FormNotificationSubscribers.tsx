import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Plus, Trash2, CheckCircle, AlertCircle, Users } from 'lucide-react';

type FormType = 'contact' | 'meekijken' | 'membership';

type WebsiteUser = {
  id: string;
  display_name: string;
  email: string;
  role: string;
};

type Subscriber = {
  id: string;
  website_user_id: string;
  website_users: WebsiteUser;
};

export default function FormNotificationSubscribers({ formType }: { formType: FormType }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [allUsers, setAllUsers] = useState<WebsiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function load() {
    setLoading(true);
    const [{ data: subs }, { data: users }] = await Promise.all([
      supabase
        .from('form_notification_subscribers')
        .select('id, website_user_id, website_users(id, display_name, email, role)')
        .eq('form_type', formType),
      supabase
        .from('website_users')
        .select('id, display_name, email, role')
        .order('display_name'),
    ]);
    setSubscribers((subs as Subscriber[]) ?? []);
    setAllUsers(users ?? []);
    setLoading(false);
  }

  async function addSubscriber() {
    if (!selectedUserId) return;
    setAdding(true);
    const { error } = await supabase
      .from('form_notification_subscribers')
      .insert({ form_type: formType, website_user_id: selectedUserId });
    setAdding(false);
    if (error) {
      setStatus('error');
    } else {
      setSelectedUserId('');
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
      await load();
    }
  }

  async function removeSubscriber(id: string) {
    await supabase.from('form_notification_subscribers').delete().eq('id', id);
    setSubscribers(s => s.filter(x => x.id !== id));
  }

  const subscribedIds = new Set(subscribers.map(s => s.website_user_id));
  const available = allUsers.filter(u => !subscribedIds.has(u.id));

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    blogposter: 'Blogposter',
    lid: 'Lid',
  };

  const roleBadge: Record<string, string> = {
    admin: 'bg-gray-900 text-white',
    blogposter: 'bg-blue-100 text-blue-800',
    lid: 'bg-green-100 text-green-800',
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition text-left"
      >
        <div className="flex items-center gap-2.5">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-800">E-mailmeldingen</span>
          {!open && subscribers.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {subscribers.length} ontvanger{subscribers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{open ? 'Inklappen' : 'Uitklappen'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Gebruikers hieronder ontvangen een e-mailmelding zodra er een nieuwe inzending binnenkomt.
          </p>

          {loading ? (
            <div className="space-y-2">
              {[0, 1].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Huidige abonnees */}
              {subscribers.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                  <Users className="w-4 h-4" />
                  Nog geen ontvangers ingesteld.
                </div>
              ) : (
                <div className="space-y-2">
                  {subscribers.map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {(s.website_users.display_name || s.website_users.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{s.website_users.display_name || s.website_users.email}</div>
                          <div className="text-xs text-gray-400 truncate">{s.website_users.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadge[s.website_users.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {roleLabel[s.website_users.role] ?? s.website_users.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSubscriber(s.id)}
                          className="text-gray-300 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Toevoegen */}
              {available.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  >
                    <option value="">Gebruiker toevoegen...</option>
                    {available.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.display_name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addSubscriber}
                    disabled={!selectedUserId || adding}
                    className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {adding ? 'Toevoegen...' : 'Toevoegen'}
                  </button>
                </div>
              )}

              {status === 'saved' && (
                <div className="flex items-center gap-1.5 text-green-600 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" /> Opgeslagen
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" /> Opslaan mislukt — gebruiker is mogelijk al toegevoegd
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
