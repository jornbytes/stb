import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus, ArrowLeft, Trash2, Eye, EyeOff, Save, AlertCircle,
  Globe, Lock, KeyRound, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react';
import RichEditor from './RichEditor';
import { ImagePickerField } from './ImagePicker';

type Visibility = 'public' | 'private' | 'password';

type Page = {
  id: string;
  title: string;
  slug: string;
  hero_subtitle: string;
  hero_image: string;
  hero_image_position: string;
  content: string;
  published: boolean;
  visibility: Visibility;
  password: string;
  seo_title: string;
  seo_description: string;
  created_at: string;
};

type View = 'list' | 'edit';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function SidebarSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition"
      >
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-500 mb-1">{children}</label>;
}

function Input({ value, onChange, placeholder, type = 'text', mono }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 transition ${mono ? 'font-mono text-gray-600' : ''}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 transition resize-none"
    />
  );
}

// ─── Meekijken form settings ──────────────────────────────────────────────────

const MEEKIJKEN_KEYS = [
  'meekijken_form_badge',
  'meekijken_form_title',
  'meekijken_form_subtitle',
  'meekijken_form_button',
  'meekijken_trust_1_title',
  'meekijken_trust_1_sub',
  'meekijken_trust_2_title',
  'meekijken_trust_2_sub',
  'meekijken_trust_3_title',
  'meekijken_trust_3_sub',
  'meekijken_success_title',
  'meekijken_success_text',
  'meekijken_privacy_text',
];

type MeekijkenSettingMap = Record<string, string>;

function MeekijkenSettings() {
  const [settings, setSettings] = useState<MeekijkenSettingMap>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', MEEKIJKEN_KEYS)
      .then(({ data }) => {
        const map: MeekijkenSettingMap = {};
        (data ?? []).forEach(r => { map[r.key] = r.value; });
        setSettings(map);
      });
  }, []);

  const set = useCallback((key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  async function handleSave() {
    setSaveState('saving');
    const rows = MEEKIJKEN_KEYS.map(key => ({
      key,
      value: settings[key] ?? '',
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('site_settings').upsert(rows);
    if (error) { setSaveState('error'); return; }
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2500);
  }

  const s = settings;
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 transition';

  return (
    <div className="border border-forest-200 rounded-xl overflow-hidden bg-forest-50/40">
      {/* Header */}
      <div className="px-4 py-3 border-b border-forest-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-forest-800 uppercase tracking-wider">Formulier &amp; teksten</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="flex items-center gap-1.5 text-xs bg-forest-800 hover:bg-forest-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition font-medium"
        >
          <Save className="w-3.5 h-3.5" />
          {saveState === 'saving' ? 'Opslaan...' : saveState === 'saved' ? 'Opgeslagen!' : 'Opslaan'}
        </button>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-4">
        {saveState === 'error' && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Opslaan mislukt
          </div>
        )}

        {/* Sectie-header */}
        <div>
          <Label>Label boven de titel</Label>
          <input className={inp} value={s.meekijken_form_badge ?? ''} onChange={e => set('meekijken_form_badge', e.target.value)} placeholder="Gratis en vrijblijvend" />
        </div>
        <div>
          <Label>Formulier titel</Label>
          <input className={inp} value={s.meekijken_form_title ?? ''} onChange={e => set('meekijken_form_title', e.target.value)} placeholder="Meld je aan" />
        </div>
        <div>
          <Label>Formulier ondertitel</Label>
          <textarea className={inp + ' resize-none'} rows={2} value={s.meekijken_form_subtitle ?? ''} onChange={e => set('meekijken_form_subtitle', e.target.value)} placeholder="Vul het formulier in en wij nemen snel contact op..." />
        </div>
        <div>
          <Label>Tekst verstuur-knop</Label>
          <input className={inp} value={s.meekijken_form_button ?? ''} onChange={e => set('meekijken_form_button', e.target.value)} placeholder="Aanmelden voor meekijken" />
        </div>
        <div>
          <Label>Privacy-tekst onder knop</Label>
          <input className={inp} value={s.meekijken_privacy_text ?? ''} onChange={e => set('meekijken_privacy_text', e.target.value)} placeholder="Je gegevens worden alleen gebruikt om contact met je op te nemen..." />
        </div>

        {/* Trust badges */}
        <div className="border-t border-forest-200 pt-3">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Vertrouwensbadges</p>
          {([
            ['meekijken_trust_1_title', 'meekijken_trust_1_sub', 'Badge 1'],
            ['meekijken_trust_2_title', 'meekijken_trust_2_sub', 'Badge 2'],
            ['meekijken_trust_3_title', 'meekijken_trust_3_sub', 'Badge 3'],
          ] as const).map(([tk, sk, label]) => (
            <div key={tk} className="mb-2">
              <Label>{label}</Label>
              <div className="flex gap-2">
                <input className={inp} value={s[tk] ?? ''} onChange={e => set(tk, e.target.value)} placeholder="Titel" />
                <input className={inp} value={s[sk] ?? ''} onChange={e => set(sk, e.target.value)} placeholder="Ondertitel" />
              </div>
            </div>
          ))}
        </div>

        {/* Succes-scherm */}
        <div className="border-t border-forest-200 pt-3">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Na verzending</p>
          <div className="space-y-2">
            <div>
              <Label>Succesbericht titel</Label>
              <input className={inp} value={s.meekijken_success_title ?? ''} onChange={e => set('meekijken_success_title', e.target.value)} placeholder="Aanmelding ontvangen!" />
            </div>
            <div>
              <Label>Succesbericht tekst</Label>
              <textarea className={inp + ' resize-none'} rows={2} value={s.meekijken_success_text ?? ''} onChange={e => set('meekijken_success_text', e.target.value)} placeholder="Bedankt voor je aanmelding. We nemen zo snel mogelijk contact..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Focal Point Picker ───────────────────────────────────────────────────────

const FOCAL_POINTS: { label: string; value: string; x: string; y: string }[] = [
  { label: 'Links boven',   value: 'left top',      x: '0%',   y: '0%'   },
  { label: 'Midden boven',  value: 'center top',    x: '50%',  y: '0%'   },
  { label: 'Rechts boven',  value: 'right top',     x: '100%', y: '0%'   },
  { label: 'Links midden',  value: 'left center',   x: '0%',   y: '50%'  },
  { label: 'Midden',        value: 'center',        x: '50%',  y: '50%'  },
  { label: 'Rechts midden', value: 'right center',  x: '100%', y: '50%'  },
  { label: 'Links onder',   value: 'left bottom',   x: '0%',   y: '100%' },
  { label: 'Midden onder',  value: 'center bottom', x: '50%',  y: '100%' },
  { label: 'Rechts onder',  value: 'right bottom',  x: '100%', y: '100%' },
];

function FocalPointPicker({ value, onChange, imageUrl }: {
  value: string;
  onChange: (v: string) => void;
  imageUrl: string;
}) {
  const current = FOCAL_POINTS.find(p => p.value === value) ?? FOCAL_POINTS[4];

  return (
    <div>
      <Label>Uitsnede afbeelding</Label>
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        {/* Live mini preview */}
        <div
          className="w-full h-20 bg-cover transition-all duration-300"
          style={{ backgroundImage: `url(${imageUrl})`, backgroundPosition: value }}
        />
        {/* 3×3 grid */}
        <div className="grid grid-cols-3 gap-px bg-gray-200 border-t border-gray-200">
          {FOCAL_POINTS.map((pt) => (
            <button
              key={pt.value}
              type="button"
              title={pt.label}
              onClick={() => onChange(pt.value)}
              className={`relative h-8 flex items-center justify-center transition-colors ${
                pt.value === value
                  ? 'bg-forest-700'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full transition-colors ${
                pt.value === value ? 'bg-white' : 'bg-gray-300'
              }`} />
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">{current.label}</p>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

export default function Pages() {
  const [view, setView] = useState<View>('list');
  const [pages, setPages] = useState<Page[]>([]);
  const [editing, setEditing] = useState<Partial<Page> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchPages(); }, []);

  async function fetchPages() {
    setLoading(true);
    const { data } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
    setPages(data ?? []);
    setLoading(false);
  }

  function openNew() {
    setEditing({
      title: '', slug: '', hero_subtitle: '', hero_image: '', hero_image_position: 'center', content: '',
      published: false, visibility: 'public', password: '',
      seo_title: '', seo_description: '',
    });
    setView('edit');
  }

  function openEdit(page: Page) { setEditing({ ...page }); setView('edit'); }

  function handleBack() { setEditing(null); setError(''); setView('list'); fetchPages(); }

  function upd(patch: Partial<Page>) { setEditing((e) => ({ ...e, ...patch })); }

  function handleTitleChange(title: string) {
    setEditing((e) => ({ ...e, title, slug: e?.id ? e.slug : slugify(title) }));
  }

  async function handleSave(publish?: boolean) {
    if (!editing) return;
    setError('');
    setSaving(true);

    const payload = {
      title: editing.title,
      slug: editing.slug || slugify(editing.title ?? ''),
      hero_subtitle: editing.hero_subtitle ?? '',
      hero_image: editing.hero_image ?? '',
      hero_image_position: editing.hero_image_position ?? 'center',
      content: editing.content ?? '',
      published: publish !== undefined ? publish : editing.published ?? false,
      visibility: editing.visibility ?? 'public',
      password: editing.password ?? '',
      seo_title: editing.seo_title ?? '',
      seo_description: editing.seo_description ?? '',
    };

    let err;
    if (editing.id) {
      const res = await supabase.from('pages').update(payload).eq('id', editing.id);
      err = res.error;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await supabase.from('pages').insert({ ...payload, author_id: user?.id });
      err = res.error;
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    handleBack();
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je deze pagina wilt verwijderen?')) return;
    await supabase.from('pages').delete().eq('id', id);
    fetchPages();
  }

  // ── Edit view ──────────────────────────────────────────────────────────────

  if (view === 'edit' && editing !== null) {
    const vis = editing.visibility ?? 'public';
    const seoTitle = editing.seo_title || editing.title || '';
    const charDesc = (editing.seo_description ?? '').length;

    return (
      <div className="min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition shrink-0">
            <ArrowLeft className="w-4 h-4" />
            Terug
          </button>

          <div className="flex items-center gap-3">
            {editing.published && editing.slug && (
              <a href={`/${editing.slug}`} target="_blank" rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition">
                <ExternalLink className="w-3.5 h-3.5" />
                Bekijken
              </a>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${editing.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {editing.published ? 'Gepubliceerd' : 'Concept'}
            </span>
            <button
              onClick={() => handleSave(!editing.published)}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
            >
              {editing.published ? <><EyeOff className="w-3.5 h-3.5" /> Concept</> : <><Eye className="w-3.5 h-3.5" /> Publiceren</>}
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving || !editing.title}
              className="flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Two-column layout: editor left, sidebar right */}
        <div className="flex gap-6 items-start">

          {/* ── Editor column ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Hero preview */}
            <div
              className="relative h-36 rounded-2xl overflow-hidden bg-forest-950"
              style={editing.hero_image ? {
                backgroundImage: `url(${editing.hero_image})`,
                backgroundSize: 'cover',
                backgroundPosition: editing.hero_image_position ?? 'center',
              } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 to-forest-950/80 flex flex-col items-center justify-center text-white text-center px-6">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Hero voorbeeld</p>
                <h3 className="font-bold text-2xl uppercase tracking-tight drop-shadow">{editing.title || 'Paginatitel'}</h3>
                {editing.hero_subtitle && <p className="text-white/60 text-sm mt-1">{editing.hero_subtitle}</p>}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label>Paginatitel *</Label>
              <input
                type="text"
                value={editing.title ?? ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Naam van de pagina"
                className="w-full border-0 border-b-2 border-gray-200 focus:border-forest-400 outline-none py-2 text-xl font-bold text-gray-900 bg-transparent transition"
              />
            </div>

            {/* Rich editor */}
            <div>
              <Label>Inhoud</Label>
              <RichEditor
                value={editing.content ?? ''}
                onChange={(v) => upd({ content: v })}
              />
            </div>

            {/* Meekijken-specific: form settings */}
            {editing.slug === 'meekijken' && (
              <div>
                <MeekijkenSettings />
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <div className="w-72 shrink-0 space-y-4">

            {/* Hero settings */}
            <SidebarSection title="Hero">
              <div>
                <ImagePickerField
                  label="Afbeelding"
                  value={editing.hero_image ?? ''}
                  onChange={(url) => upd({ hero_image: url })}
                  previewHeight="h-28"
                />
              </div>
              {editing.hero_image && (
                <FocalPointPicker
                  value={editing.hero_image_position ?? 'center'}
                  onChange={(v) => upd({ hero_image_position: v })}
                  imageUrl={editing.hero_image}
                />
              )}
              <div>
                <Label>Ondertitel</Label>
                <Input value={editing.hero_subtitle ?? ''} onChange={(v) => upd({ hero_subtitle: v })} placeholder="Korte omschrijving..." />
              </div>
            </SidebarSection>

            {/* URL / slug */}
            <SidebarSection title="URL">
              <div>
                <Label>Slug</Label>
                <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-forest-400 transition">
                  <span className="text-gray-400 text-sm shrink-0">/</span>
                  <input
                    type="text"
                    value={editing.slug ?? ''}
                    onChange={(e) => upd({ slug: e.target.value })}
                    className="flex-1 text-sm font-mono text-gray-700 focus:outline-none bg-transparent"
                    placeholder="mijn-pagina"
                  />
                </div>
              </div>
            </SidebarSection>

            {/* Visibility */}
            <SidebarSection title="Zichtbaarheid">
              <div className="space-y-1.5">
                {([
                  { val: 'public', icon: <Globe className="w-4 h-4" />, label: 'Openbaar', desc: 'Iedereen kan de pagina bekijken' },
                  { val: 'private', icon: <Lock className="w-4 h-4" />, label: 'Prive', desc: 'Alleen zichtbaar in het admin-panel' },
                  { val: 'password', icon: <KeyRound className="w-4 h-4" />, label: 'Wachtwoord', desc: 'Bezoekers moeten een wachtwoord invoeren' },
                ] as const).map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => upd({ visibility: opt.val })}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                      vis === opt.val
                        ? 'border-forest-400 bg-forest-50 text-forest-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${vis === opt.val ? 'text-forest-600' : 'text-gray-400'}`}>{opt.icon}</span>
                    <div>
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-[11px] text-gray-400 leading-tight">{opt.desc}</div>
                    </div>
                    {vis === opt.val && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-forest-500 mt-1 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {vis === 'password' && (
                <div className="pt-1">
                  <Label>Wachtwoord</Label>
                  <Input
                    type="text"
                    value={editing.password ?? ''}
                    onChange={(v) => upd({ password: v })}
                    placeholder="Kies een wachtwoord"
                  />
                </div>
              )}
            </SidebarSection>

            {/* SEO */}
            <SidebarSection title="SEO" defaultOpen={false}>
              <div className="rounded-xl border border-gray-200 p-3 space-y-1 bg-gray-50">
                <div className="text-xs font-semibold text-blue-600 truncate">{seoTitle || 'Paginatitel'}</div>
                <div className="text-[11px] text-green-700 truncate">scouting-tb.nl/{editing.slug || 'mijn-pagina'}</div>
                <div className="text-[11px] text-gray-500 line-clamp-2">
                  {editing.seo_description || 'Voeg een meta-omschrijving toe voor betere vindbaarheid in zoekmachines.'}
                </div>
              </div>

              <div>
                <Label>SEO-titel</Label>
                <Input
                  value={editing.seo_title ?? ''}
                  onChange={(v) => upd({ seo_title: v })}
                  placeholder={editing.title || 'Paginatitel'}
                />
                <p className="text-[11px] text-gray-400 mt-1">Laat leeg om de paginatitel te gebruiken</p>
              </div>

              <div>
                <Label>Meta-omschrijving</Label>
                <Textarea
                  value={editing.seo_description ?? ''}
                  onChange={(v) => upd({ seo_description: v })}
                  placeholder="Korte omschrijving voor zoekmachines (max. 160 tekens)..."
                  rows={3}
                />
                <p className={`text-[11px] mt-1 ${charDesc > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                  {charDesc}/160 tekens
                </p>
              </div>
            </SidebarSection>

          </div>
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────

  const visIcon = (v: Visibility) =>
    v === 'private' ? <Lock className="w-3 h-3" /> :
    v === 'password' ? <KeyRound className="w-3 h-3" /> :
    <Globe className="w-3 h-3" />;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pagina's</h2>
          <p className="text-sm text-gray-400">{pages.length} pagina{pages.length !== 1 ? "'s" : ''}</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-forest-800 hover:bg-forest-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
          <Plus className="w-4 h-4" />
          Nieuwe pagina
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
          <p className="text-gray-400 text-sm mb-3">Nog geen pagina's aangemaakt</p>
          <button onClick={openNew} className="text-sm font-medium text-forest-700 hover:text-forest-900 underline underline-offset-2">
            Maak de eerste pagina aan
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm transition">
              {page.hero_image && (
                <img src={page.hero_image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${page.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {page.published ? 'Gepubliceerd' : 'Concept'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                    {visIcon(page.visibility ?? 'public')}
                    {page.visibility === 'private' ? 'Prive' : page.visibility === 'password' ? 'Wachtwoord' : 'Openbaar'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">/{page.slug}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm truncate">{page.title}</h3>
                {page.hero_subtitle && <p className="text-xs text-gray-400 truncate">{page.hero_subtitle}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {page.published && (
                  <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-gray-300 hover:text-gray-600 transition">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => openEdit(page)} className="text-xs text-gray-500 hover:text-gray-900 font-medium transition px-2 py-1 rounded-lg hover:bg-gray-100">
                  Bewerken
                </button>
                <button onClick={() => handleDelete(page.id)} className="text-gray-300 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
