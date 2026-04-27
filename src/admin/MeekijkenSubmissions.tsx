import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Mail, Phone, Calendar, MessageSquare, ChevronDown, ChevronUp,
  Inbox, Trash2, CheckCircle, AlertTriangle, X,
} from 'lucide-react';

type MeekijkenRequest = {
  id: string;
  naam: string;
  email: string;
  telefoon: string;
  leeftijd: number | null;
  opmerking: string;
  created_at: string;
  behandeld: boolean;
};

type Filter = 'all' | 'open' | 'behandeld';

export default function MeekijkenSubmissions() {
  const [requests, setRequests] = useState<MeekijkenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('meekijken_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  }

  async function markBehandeld(id: string) {
    await supabase.from('meekijken_requests').update({ behandeld: true }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, behandeld: true } : r));
  }

  async function deleteRequest(id: string) {
    await supabase.from('meekijken_requests').delete().eq('id', id);
    setRequests(prev => prev.filter(r => r.id !== id));
    setDeleteConfirm(null);
    if (expanded === id) setExpanded(null);
  }

  function fmt(dt: string) {
    return new Date(dt).toLocaleDateString('nl-NL', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const filtered = requests.filter(r => {
    if (filter === 'open') return !r.behandeld;
    if (filter === 'behandeld') return r.behandeld;
    return true;
  });

  const openCount = requests.filter(r => !r.behandeld).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Meekijken aanmeldingen</h2>
          <p className="text-sm text-gray-400">{requests.length} totaal &middot; {openCount} open</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {(['all', 'open', 'behandeld'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'open' ? 'Open' : 'Behandeld'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {filter === 'open'
              ? 'Geen openstaande aanmeldingen'
              : filter === 'behandeld'
              ? 'Nog geen behandelde aanmeldingen'
              : 'Nog geen meekijken aanmeldingen ontvangen'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const open = expanded === r.id;
            return (
              <div
                key={r.id}
                className={`bg-white rounded-xl border overflow-hidden transition-shadow ${
                  r.behandeld ? 'border-gray-100 opacity-75' : 'border-gray-200 hover:shadow-sm'
                }`}
              >
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  onClick={() => setExpanded(open ? null : r.id)}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    r.behandeld ? 'bg-gray-100' : 'bg-forest-100'
                  }`}>
                    <span className={`font-bold text-sm ${r.behandeld ? 'text-gray-400' : 'text-forest-700'}`}>
                      {r.naam.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm truncate">{r.naam}</span>
                      {r.behandeld && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium shrink-0">
                          <CheckCircle className="w-3 h-3" /> Behandeld
                        </span>
                      )}
                      {r.leeftijd && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-100 text-forest-700 font-medium shrink-0">
                          {r.leeftijd} jaar
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{fmt(r.created_at)}</span>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {open && (
                  <div className="border-t border-gray-100">
                    <div className="px-5 pt-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Detail icon={<Mail className="w-3.5 h-3.5" />} label="E-mail">
                        <a href={`mailto:${r.email}`} className="text-forest-600 hover:underline text-sm">{r.email}</a>
                      </Detail>
                      {r.telefoon && (
                        <Detail icon={<Phone className="w-3.5 h-3.5" />} label="Telefoon">
                          <a href={`tel:${r.telefoon}`} className="text-forest-600 hover:underline text-sm">{r.telefoon}</a>
                        </Detail>
                      )}
                      {r.leeftijd && (
                        <Detail icon={<Calendar className="w-3.5 h-3.5" />} label="Leeftijd">
                          <span className="text-sm text-gray-800">{r.leeftijd} jaar</span>
                        </Detail>
                      )}
                      {r.opmerking && (
                        <div className="sm:col-span-2">
                          <Detail icon={<MessageSquare className="w-3.5 h-3.5" />} label="Opmerking">
                            <span className="text-sm text-gray-800">{r.opmerking}</span>
                          </Detail>
                        </div>
                      )}
                    </div>

                    <div className="px-5 pb-4 flex flex-wrap gap-2">
                      {!r.behandeld && (
                        <button
                          onClick={() => markBehandeld(r.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Markeer als behandeld
                        </button>
                      )}
                      <a
                        href={`mailto:${r.email}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        E-mail sturen
                      </a>
                      <button
                        onClick={() => setDeleteConfirm(r.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Verwijderen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Aanmelding verwijderen?</h3>
              <p className="text-sm text-gray-500 mb-6">Dit kan niet ongedaan worden gemaakt.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => deleteRequest(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
        {children}
      </div>
    </div>
  );
}
