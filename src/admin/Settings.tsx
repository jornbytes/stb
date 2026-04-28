import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Save, Key, ExternalLink, CheckCircle, AlertCircle,
  Link, Plus, Trash2, GripVertical, Globe, FileText, Mail,
  Settings as SettingsIcon, Users, MessageCircle,
} from 'lucide-react';

type FooterLink = {
  id: number;
  label: string;
  href: string;
  link_type: 'page' | 'external';
  position: number;
};

type Page = { id: string; title: string; slug: string };

type Tab = 'algemeen' | 'popup';

// ─── Reusable save-status helpers ────────────────────────────────────────────

type SaveStatus = 'idle' | 'saved' | 'error';

function StatusRow({ status, errorMsg, saving, disabled }: {
  status: SaveStatus; errorMsg?: string; saving: boolean; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {status === 'saved' ? (
        <span className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" /> Opgeslagen
        </span>
      ) : status === 'error' ? (
        <span className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" /> {errorMsg || 'Opslaan mislukt'}
        </span>
      ) : <span />}
      <button
        type="submit"
        disabled={saving || disabled}
        className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Opslaan...' : 'Opslaan'}
      </button>
    </div>
  );
}

// ─── Contact email section ────────────────────────────────────────────────────

function ContactEmailSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'contact_email')
      .maybeSingle()
      .then(({ data }) => {
        setEmail(data?.value ?? '');
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'contact_email', value: email.trim(), updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { setStatus('error'); setErrorMsg(error.message); }
    else { setStatus('saved'); setTimeout(() => setStatus('idle'), 3000); }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Emailadres voor websiteberichten</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Alle emails die via de website worden verstuurd (contactformulier, aanmeldingen, etc.) gaan naar dit adres.
        </p>
      </div>
      <form onSubmit={handleSave} className="p-6 space-y-4">
        {loading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="bijv. info@scoutingtitusbrandsma.nl"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            autoComplete="email"
          />
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}
        <StatusRow status={status} saving={saving} disabled={loading} />
      </form>
    </div>
  );
}

// ─── Pexels section ──────────────────────────────────────────────────────────

function PexelsSection() {
  const [pexelsKey, setPexelsKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'pexels_api_key')
      .maybeSingle()
      .then(({ data }) => { setPexelsKey(data?.value ?? ''); setLoading(false); });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'pexels_api_key', value: pexelsKey.trim(), updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { setStatus('error'); setErrorMsg(error.message); }
    else { setStatus('saved'); setTimeout(() => setStatus('idle'), 3000); }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Pexels API-sleutel</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Gratis aan te maken op{' '}
          <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer"
            className="underline underline-offset-2 inline-flex items-center gap-0.5">
            pexels.com/api <ExternalLink className="w-3 h-3" />
          </a>
          . Geldt voor alle admins.
        </p>
      </div>
      <form onSubmit={handleSave} className="p-6 space-y-4">
        {loading ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <input
            type="text"
            value={pexelsKey}
            onChange={(e) => { setPexelsKey(e.target.value); setStatus('idle'); }}
            placeholder="Plak hier je Pexels API-sleutel..."
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            autoComplete="off"
          />
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}
        <StatusRow status={status} saving={saving} disabled={loading} />
      </form>
    </div>
  );
}

// ─── Footer links section ─────────────────────────────────────────────────────

function FooterLinksSection() {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('footer_links').select('*').order('position'),
      supabase.from('pages').select('id, title, slug').eq('published', true).order('title'),
    ]).then(([{ data: fl }, { data: pg }]) => {
      setLinks(fl ?? []);
      setPages(pg ?? []);
      setLoading(false);
    });
  }, []);

  function updateLink(idx: number, patch: Partial<FooterLink>) {
    setLinks(ls => ls.map((l, i) => i === idx ? { ...l, ...patch } : l));
    setStatus('idle');
  }

  function addLink() {
    const maxPos = links.reduce((m, l) => Math.max(m, l.position), -1);
    setLinks(ls => [...ls, { id: -Date.now(), label: '', href: '', link_type: 'external', position: maxPos + 1 }]);
  }

  function removeLink(idx: number) {
    setLinks(ls => ls.filter((_, i) => i !== idx));
    setStatus('idle');
  }

  function onDragStart(idx: number) { setDragIdx(idx); }
  function onDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setDragOverIdx(idx); }
  function onDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const reordered = [...links];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setLinks(reordered.map((l, i) => ({ ...l, position: i })));
    setDragIdx(null);
    setDragOverIdx(null);
    setStatus('idle');
  }

  async function handleSave() {
    setSaving(true);
    setStatus('idle');
    const { error: delErr } = await supabase.from('footer_links').delete().gte('id', 0);
    if (delErr) { setSaving(false); setStatus('error'); return; }
    const toInsert = links.map((l, i) => ({ label: l.label, href: l.href, link_type: l.link_type, position: i }));
    if (toInsert.length > 0) {
      const { error: insErr } = await supabase.from('footer_links').insert(toInsert);
      if (insErr) { setSaving(false); setStatus('error'); return; }
    }
    const { data } = await supabase.from('footer_links').select('*').order('position');
    setLinks(data ?? []);
    setSaving(false);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 3000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Footer links</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Links die onderaan elke pagina worden getoond. Sleep om de volgorde te wijzigen.
          </p>
        </div>
        <button
          onClick={addLink}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" /> Link toevoegen
        </button>
      </div>

      <div className="p-6 space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : links.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nog geen footer links. Voeg er een toe.</p>
        ) : (
          links.map((link, idx) => (
            <div
              key={link.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={() => onDrop(idx)}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                dragOverIdx === idx && dragIdx !== idx
                  ? 'border-gray-400 bg-gray-50 scale-[1.01]'
                  : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
              }`}
            >
              <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(idx, { label: e.target.value })}
                placeholder="Tekst"
                className="w-32 shrink-0 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white"
              />
              <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => updateLink(idx, { link_type: 'page', href: '' })}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition ${
                    link.link_type === 'page' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-3 h-3" /> Pagina
                </button>
                <button
                  type="button"
                  onClick={() => updateLink(idx, { link_type: 'external', href: '' })}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition border-l border-gray-200 ${
                    link.link_type === 'external' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Globe className="w-3 h-3" /> Extern
                </button>
              </div>
              {link.link_type === 'external' ? (
                <input
                  type="url"
                  value={link.href}
                  onChange={(e) => updateLink(idx, { href: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white"
                />
              ) : (
                <select
                  value={link.href}
                  onChange={(e) => updateLink(idx, { href: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white"
                >
                  <option value="">Kies een pagina...</option>
                  {pages.map(p => (
                    <option key={p.id} value={`/${p.slug}`}>{p.title}</option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => removeLink(idx)}
                className="text-gray-300 hover:text-red-500 transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}

        <div className="flex items-center justify-between pt-2">
          {status === 'saved' ? (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" /> Opgeslagen
            </span>
          ) : status === 'error' ? (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" /> Opslaan mislukt
            </span>
          ) : <span />}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lid Worden Popup editor ──────────────────────────────────────────────────

const POPUP_KEYS = [
  'lidworden_popup_title',
  'lidworden_popup_subtitle',
  'lidworden_popup_button',
  'lidworden_popup_success_title',
  'lidworden_popup_success_text',
  'lidworden_popup_privacy_text',
] as const;

type PopupKey = typeof POPUP_KEYS[number];

const POPUP_DEFAULTS: Record<PopupKey, string> = {
  lidworden_popup_title:         'Lid worden',
  lidworden_popup_subtitle:      'Scouting Titus Brandsma',
  lidworden_popup_button:        'Aanmelding versturen',
  lidworden_popup_success_title: 'Aanmelding ontvangen!',
  lidworden_popup_success_text:  'Bedankt voor je aanmelding. We nemen zo snel mogelijk contact met je op om alles te bespreken. Welkom bij Scouting Titus Brandsma!',
  lidworden_popup_privacy_text:  'Na je aanmelding nemen we contact met je op voor een kennismaking.',
};

function LidWordenPopupEditor() {
  const [values, setValues] = useState<Record<PopupKey, string>>(POPUP_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [...POPUP_KEYS])
      .then(({ data }) => {
        if (data) {
          const m: Partial<Record<PopupKey, string>> = {};
          data.forEach(r => { m[r.key as PopupKey] = r.value; });
          setValues(v => ({ ...v, ...m }));
        }
        setLoading(false);
      });
  }, []);

  function set(key: PopupKey, val: string) {
    setValues(v => ({ ...v, [key]: val }));
    setStatus('idle');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    const rows = POPUP_KEYS.map(key => ({ key, value: values[key], updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('site_settings').upsert(rows);
    setSaving(false);
    if (error) { setStatus('error'); setErrorMsg(error.message); }
    else { setStatus('saved'); setTimeout(() => setStatus('idle'), 3000); }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition';
  const textareaCls = inputCls + ' resize-none';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Lid worden popup</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Teksten in het aanmeldformulier dat opent als bezoekers op "Meekijken" of "Direct aanmelden" klikken.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="pb-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Koptekst popup</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Titel</label>
                  <input
                    type="text"
                    value={values.lidworden_popup_title}
                    onChange={e => set('lidworden_popup_title', e.target.value)}
                    placeholder={POPUP_DEFAULTS.lidworden_popup_title}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Subtitel</label>
                  <input
                    type="text"
                    value={values.lidworden_popup_subtitle}
                    onChange={e => set('lidworden_popup_subtitle', e.target.value)}
                    placeholder={POPUP_DEFAULTS.lidworden_popup_subtitle}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Form internals */}
            <div className="pb-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Formulier</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Verzendknop tekst</label>
                  <input
                    type="text"
                    value={values.lidworden_popup_button}
                    onChange={e => set('lidworden_popup_button', e.target.value)}
                    placeholder={POPUP_DEFAULTS.lidworden_popup_button}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Privacy tekst (onderaan formulier)</label>
                  <textarea
                    rows={2}
                    value={values.lidworden_popup_privacy_text}
                    onChange={e => set('lidworden_popup_privacy_text', e.target.value)}
                    placeholder={POPUP_DEFAULTS.lidworden_popup_privacy_text}
                    className={textareaCls}
                  />
                </div>
              </div>
            </div>

            {/* Success state */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Bevestigingsscherm (na versturen)</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Titel bevestiging</label>
                  <input
                    type="text"
                    value={values.lidworden_popup_success_title}
                    onChange={e => set('lidworden_popup_success_title', e.target.value)}
                    placeholder={POPUP_DEFAULTS.lidworden_popup_success_title}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Tekst bevestiging</label>
                  <textarea
                    rows={3}
                    value={values.lidworden_popup_success_text}
                    onChange={e => set('lidworden_popup_success_text', e.target.value)}
                    placeholder={POPUP_DEFAULTS.lidworden_popup_success_text}
                    className={textareaCls}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        <StatusRow status={status} saving={saving} disabled={loading} />
      </form>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'algemeen', label: 'Algemeen', icon: <SettingsIcon className="w-4 h-4" /> },
  { id: 'popup',    label: 'Lid worden popup', icon: <MessageCircle className="w-4 h-4" /> },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [tab, setTab] = useState<Tab>('algemeen');

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Instellingen</h2>
        <p className="text-sm text-gray-400">Globale configuratie voor de website en beheeromgeving</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'algemeen' && (
        <>
          <ContactEmailSection />
          <PexelsSection />
          <FooterLinksSection />
        </>
      )}

      {tab === 'popup' && (
        <LidWordenPopupEditor />
      )}
    </div>
  );
}
