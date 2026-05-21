import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  Mail, Phone, Calendar, MessageSquare, ChevronDown, ChevronUp,
  Inbox, Trash2, CheckCircle, Send, X, AlertTriangle,
  Bold, Italic, Underline, Link as LinkIcon,
} from 'lucide-react';
import FormNotificationSubscribers from './FormNotificationSubscribers';

type Submission = {
  id: string;
  naam: string;
  email: string;
  telefoon: string;
  geboortedatum: string | null;
  speltak: string;
  opmerking: string;
  created_at: string;
  behandeld: boolean;
};

type Filter = 'all' | 'open' | 'behandeld';

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState<Submission | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('membership_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setSubmissions(data ?? []);
    setLoading(false);
  }

  async function markBehandeld(id: string) {
    await supabase
      .from('membership_requests')
      .update({ behandeld: true })
      .eq('id', id);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, behandeld: true } : s));
  }

  async function deleteSubmission(id: string) {
    await supabase.from('membership_requests').delete().eq('id', id);
    setSubmissions(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
    if (expanded === id) setExpanded(null);
  }

  function fmt(dt: string) {
    return new Date(dt).toLocaleDateString('nl-NL', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const filtered = submissions.filter(s => {
    if (filter === 'open') return !s.behandeld;
    if (filter === 'behandeld') return s.behandeld;
    return true;
  });

  const openCount = submissions.filter(s => !s.behandeld).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Notification subscribers */}
      <div className="mb-6">
        <FormNotificationSubscribers formType="membership" />
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Aanmeldingen</h2>
          <p className="text-sm text-gray-400">
            {submissions.length} totaal &middot; {openCount} open
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {(['all', 'open', 'behandeld'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
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
            {filter === 'open' ? 'Geen openstaande aanmeldingen' : filter === 'behandeld' ? 'Nog geen behandelde aanmeldingen' : 'Nog geen aanmeldingen ontvangen'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const open = expanded === s.id;
            return (
              <div
                key={s.id}
                className={`bg-white rounded-xl border overflow-hidden transition-shadow ${
                  s.behandeld ? 'border-gray-100 opacity-75' : 'border-gray-200 hover:shadow-sm'
                }`}
              >
                {/* Header row */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  onClick={() => setExpanded(open ? null : s.id)}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    s.behandeld ? 'bg-gray-100' : 'bg-forest-100'
                  }`}>
                    <span className={`font-bold text-sm ${s.behandeld ? 'text-gray-400' : 'text-forest-700'}`}>
                      {s.naam.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm truncate">{s.naam}</span>
                      {s.behandeld && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium shrink-0">
                          <CheckCircle className="w-3 h-3" /> Behandeld
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {s.speltak && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-100 text-forest-700 font-medium">{s.speltak}</span>
                      )}
                      <span className="text-xs text-gray-400">{fmt(s.created_at)}</span>
                    </div>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {/* Detail panel */}
                {open && (
                  <div className="border-t border-gray-100">
                    <div className="px-5 pt-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Detail icon={<Mail className="w-3.5 h-3.5" />} label="E-mail" value={s.email}>
                        <a href={`mailto:${s.email}`} className="text-forest-600 hover:underline text-sm">{s.email}</a>
                      </Detail>
                      {s.telefoon && (
                        <Detail icon={<Phone className="w-3.5 h-3.5" />} label="Telefoon" value={s.telefoon}>
                          <a href={`tel:${s.telefoon}`} className="text-forest-600 hover:underline text-sm">{s.telefoon}</a>
                        </Detail>
                      )}
                      {s.geboortedatum && (
                        <Detail
                          icon={<Calendar className="w-3.5 h-3.5" />}
                          label="Geboortedatum"
                          value={new Date(s.geboortedatum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        />
                      )}
                      {s.opmerking && (
                        <div className="sm:col-span-2">
                          <Detail icon={<MessageSquare className="w-3.5 h-3.5" />} label="Opmerking" value={s.opmerking} />
                        </div>
                      )}
                    </div>

                    {/* Action bar */}
                    <div className="px-5 pb-4 flex flex-wrap gap-2">
                      {!s.behandeld && (
                        <>
                          <button
                            onClick={() => setEmailModal(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Uitnodiging sturen
                          </button>
                          <button
                            onClick={() => markBehandeld(s.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Markeer als behandeld
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
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

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <ConfirmModal onClose={() => setDeleteConfirm(null)}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Aanmelding verwijderen?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Dit kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => deleteSubmission(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </ConfirmModal>
      )}

      {/* Email invitation modal */}
      {emailModal && (
        <EmailModal
          submission={emailModal}
          onClose={() => setEmailModal(null)}
          onSent={(id) => {
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, behandeld: true } : s));
            setEmailModal(null);
          }}
        />
      )}
    </div>
  );
}

function Detail({
  icon, label, value, children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
        {children ?? <div className="text-sm text-gray-800">{value}</div>}
      </div>
    </div>
  );
}

function ConfirmModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Simple inline WYSIWYG toolbar + editable area ────────────────────────────

function MailBodyEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(cmd: string, value?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, value ?? undefined);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function handleLink() {
    const url = prompt('URL:');
    if (url) exec('createLink', url);
  }

  return (
    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {[
          { title: 'Vet', icon: <Bold className="w-3.5 h-3.5" />, action: () => exec('bold') },
          { title: 'Cursief', icon: <Italic className="w-3.5 h-3.5" />, action: () => exec('italic') },
          { title: 'Onderstrepen', icon: <Underline className="w-3.5 h-3.5" />, action: () => exec('underline') },
        ].map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            onMouseDown={(e) => { e.preventDefault(); t.action(); }}
            className="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition"
          >
            {t.icon}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          title="Link invoegen"
          onMouseDown={(e) => { e.preventDefault(); handleLink(); }}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable body */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        onBlur={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); exec('bold'); }
          if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); exec('italic'); }
        }}
        data-placeholder="Schrijf hier je bericht..."
        className={[
          'flex-1 min-h-[240px] px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none overflow-y-auto',
          '[&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-forest-600 [&_a]:underline',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none',
        ].join(' ')}
      />
    </div>
  );
}

// ─── Mail-client style modal ──────────────────────────────────────────────────

function EmailModal({
  submission,
  onClose,
  onSent,
}: {
  submission: Submission;
  onClose: () => void;
  onSent: (id: string) => void;
}) {
  const speltakTekst = submission.speltak ? ` bij de ${submission.speltak}` : '';
  const defaultSubject = `Uitnodiging scouting${speltakTekst}`;
  const defaultBody = `Hoi ${submission.naam},<br><br>Leuk dat je wil komen kijken${speltakTekst}! We vinden het super dat je interesse hebt in onze scouting.<br><br>We nemen binnenkort contact met je op om een datum af te spreken.<br><br>Tot snel!<br>Het scoutingteam`;

  const [subject, setSubject] = useState(defaultSubject);
  const [bodyHtml, setBodyHtml] = useState(defaultBody);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    setSending(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          submissionId: submission.id,
          naam: submission.naam,
          email: submission.email,
          speltak: submission.speltak,
          subject,
          bodyHtml,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Onbekende fout');
      onSent(submission.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Mail compose window */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 48px)' }}>

        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold">Nieuwe uitnodiging</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header fields */}
        <div className="border-b border-gray-100 shrink-0">
          {/* Aan */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-400 w-12 shrink-0">Aan</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="w-5 h-5 rounded-full bg-forest-200 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-forest-700">{submission.naam.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm text-gray-800 font-medium">{submission.naam}</span>
                <span className="text-xs text-gray-400">&lt;{submission.email}&gt;</span>
              </div>
            </div>
          </div>

          {/* Onderwerp */}
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="text-xs font-medium text-gray-400 w-12 shrink-0">Onderwerp</span>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-300"
              placeholder="Onderwerp..."
            />
          </div>
        </div>

        {/* WYSIWYG body */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <MailBodyEditor initialHtml={defaultBody} onChange={setBodyHtml} />
        </div>

        {/* Footer / send bar */}
        <div className="shrink-0 px-5 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          {error ? (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5 flex-1">{error}</p>
          ) : (
            <span className="text-xs text-gray-400">
              Na verzending wordt de aanmelding automatisch op <strong>Behandeld</strong> gezet.
            </span>
          )}
          <button
            onClick={send}
            disabled={sending || !subject.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shrink-0"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {sending ? 'Versturen...' : 'Verstuur'}
          </button>
        </div>
      </div>
    </div>
  );
}
