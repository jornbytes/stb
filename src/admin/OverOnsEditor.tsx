import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

type Settings = Record<string, string>;
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function useSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        const map: Settings = {};
        (data ?? []).forEach((r) => { map[r.key] = r.value ?? ''; });
        setSettings(map);
        setLoading(false);
      });
  }, []);

  return { settings, setSettings, loading };
}

async function saveKeys(keys: string[], settings: Settings): Promise<string | null> {
  const rows = keys.map((k) => ({ key: k, value: settings[k] ?? '', updated_at: new Date().toISOString() }));
  const { error } = await supabase.from('site_settings').upsert(rows);
  return error ? error.message : null;
}

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-gray-50 focus:bg-white';

const textareaCls = inputCls + ' resize-none';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 tracking-widest uppercase mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={textareaCls} />
  );
}

function SaveBar({ state, onSave }: { state: SaveState; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
      {state === 'saved' && (
        <span className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" /> Opgeslagen
        </span>
      )}
      {state === 'error' && (
        <span className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" /> Opslaan mislukt
        </span>
      )}
      <button
        type="button"
        disabled={state === 'saving'}
        onClick={onSave}
        className="ml-auto flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
      >
        <Save className="w-4 h-4" />
        {state === 'saving' ? 'Opslaan...' : 'Opslaan'}
      </button>
    </div>
  );
}

function Accordion({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

// ─── Key groups ───────────────────────────────────────────────────────────────

const HERO_KEYS = [
  'overons_hero_badge', 'overons_hero_subtitle',
  'overons_stat_1_value', 'overons_stat_1_label',
  'overons_stat_2_value', 'overons_stat_2_label',
  'overons_stat_3_value', 'overons_stat_3_label',
  'overons_stat_4_value', 'overons_stat_4_label',
];

const TIMELINE_KEYS = [
  'overons_tl_badge', 'overons_tl_title',
  ...Array.from({ length: 6 }, (_, i) => [
    `overons_tl_${i+1}_year`,
    `overons_tl_${i+1}_title`,
    `overons_tl_${i+1}_text`,
  ]).flat(),
];

const QUOTE_KEYS = ['overons_quote_photo', 'overons_quote_text', 'overons_quote_sub'];

const VALUES_KEYS = [
  'overons_values_badge', 'overons_values_title',
  'overons_val_1_title', 'overons_val_1_text',
  'overons_val_2_title', 'overons_val_2_text',
  'overons_val_3_title', 'overons_val_3_text',
];

const CTA_KEYS = ['overons_cta_title', 'overons_cta_text', 'overons_cta_button'];

const TIMELINE_DEFAULTS = [
  { year: '1930s',   title: 'De eerste stappen',   text: 'Op bescheiden schaal ontstaat scouting in Oldenzaal...' },
  { year: '1940–45', title: 'Verboden avontuur',    text: 'De bezetter verbiedt samenscholing...' },
  { year: '1945',    title: 'Wedergeboorte',         text: 'Direct na de bevrijding blazen de Oldenzaalse parochies...' },
  { year: '1970s',   title: 'Fusie & nieuwe thuis', text: 'Na een strijd om de locatie fuseren de Paulus- en Tarcisiusgroep...' },
  { year: '1980',    title: 'Één grote familie',     text: 'De St. Agnesgroep sluit zich aan...' },
  { year: 'Vandaag', title: '70+ jaar avontuur',     text: 'Met ruim 40 vrijwilligers en zes speltakken...' },
];

const VALUES_DEFAULTS = [
  { title: 'Gemeenschap',       text: 'Van Bever tot Stam — iedereen is welkom...' },
  { title: 'Natuur & avontuur', text: 'Bossen, rivieren en velden zijn onze speeltuin...' },
  { title: 'Vrijwilligers',     text: 'Meer dan 40 gepassioneerde leiders staan elke week klaar...' },
];

// ─── Section components ───────────────────────────────────────────────────────

function HeroSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <Field label="Badge tekst" hint='Kleine badge boven de titel, bijv. "Scouting Titus Brandsma · Oldenzaal"'>
        <TextInput value={s.overons_hero_badge ?? ''} onChange={(v) => set('overons_hero_badge', v)} placeholder="Scouting Titus Brandsma · Oldenzaal" />
      </Field>
      <Field label="Ondertitel" hint="Grote beschrijvingstekst onder de paginatitel">
        <Textarea value={s.overons_hero_subtitle ?? ''} onChange={(v) => set('overons_hero_subtitle', v)} rows={2} placeholder="Meer dan 70 jaar kampvuren, vriendschappen en avontuur..." />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map((n) => (
          <div key={n} className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Statistiek {n}</p>
            <TextInput
              value={s[`overons_stat_${n}_value`] ?? ''}
              onChange={(v) => set(`overons_stat_${n}_value`, v)}
              placeholder={['1945','70+','40+','6'][n-1]}
            />
            <TextInput
              value={s[`overons_stat_${n}_label`] ?? ''}
              onChange={(v) => set(`overons_stat_${n}_label`, v)}
              placeholder={['Opgericht','Jaar avontuur','Vrijwilligers','Speltakken'][n-1]}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function TimelineSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Badge">
          <TextInput value={s.overons_tl_badge ?? ''} onChange={(v) => set('overons_tl_badge', v)} placeholder="Onze geschiedenis" />
        </Field>
        <Field label="Titel">
          <TextInput value={s.overons_tl_title ?? ''} onChange={(v) => set('overons_tl_title', v)} placeholder="Van vonk tot vlam" />
        </Field>
      </div>
      <div className="space-y-4">
        {TIMELINE_DEFAULTS.map((d, i) => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Tijdlijn item {i+1}</p>
            <div className="grid grid-cols-2 gap-2">
              <TextInput
                value={s[`overons_tl_${i+1}_year`] ?? ''}
                onChange={(v) => set(`overons_tl_${i+1}_year`, v)}
                placeholder={d.year}
              />
              <TextInput
                value={s[`overons_tl_${i+1}_title`] ?? ''}
                onChange={(v) => set(`overons_tl_${i+1}_title`, v)}
                placeholder={d.title}
              />
            </div>
            <Textarea
              value={s[`overons_tl_${i+1}_text`] ?? ''}
              onChange={(v) => set(`overons_tl_${i+1}_text`, v)}
              rows={2}
              placeholder={d.text}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function QuoteSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <Field label="Foto URL" hint="Achtergrondafbeelding van de citaatbalk (breed, donker)">
        <TextInput value={s.overons_quote_photo ?? ''} onChange={(v) => set('overons_quote_photo', v)} placeholder="/jubileum_groepsfoto.jpg" />
      </Field>
      <Field label="Citaat" hint="Wordt getoond zonder aanhalingstekens in te typen">
        <TextInput value={s.overons_quote_text ?? ''} onChange={(v) => set('overons_quote_text', v)} placeholder="De natuur is onze tweede thuis" />
      </Field>
      <Field label="Onderschrift">
        <TextInput value={s.overons_quote_sub ?? ''} onChange={(v) => set('overons_quote_sub', v)} placeholder="Scouting Titus Brandsma · Oldenzaal · Sinds 1945" />
      </Field>
    </>
  );
}

function ValuesSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Badge">
          <TextInput value={s.overons_values_badge ?? ''} onChange={(v) => set('overons_values_badge', v)} placeholder="Wie zijn wij" />
        </Field>
        <Field label="Titel">
          <TextInput value={s.overons_values_title ?? ''} onChange={(v) => set('overons_values_title', v)} placeholder="Meer dan een club" />
        </Field>
      </div>
      {VALUES_DEFAULTS.map((d, i) => (
        <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Kaart {i+1}</p>
          <TextInput
            value={s[`overons_val_${i+1}_title`] ?? ''}
            onChange={(v) => set(`overons_val_${i+1}_title`, v)}
            placeholder={d.title}
          />
          <Textarea
            value={s[`overons_val_${i+1}_text`] ?? ''}
            onChange={(v) => set(`overons_val_${i+1}_text`, v)}
            rows={2}
            placeholder={d.text}
          />
        </div>
      ))}
    </>
  );
}

function CtaSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <Field label="Titel">
        <TextInput value={s.overons_cta_title ?? ''} onChange={(v) => set('overons_cta_title', v)} placeholder="Doe jij mee?" />
      </Field>
      <Field label="Tekst">
        <Textarea value={s.overons_cta_text ?? ''} onChange={(v) => set('overons_cta_text', v)} rows={2} placeholder="Of je nu 5 of 50 jaar bent — er is een plek voor jou..." />
      </Field>
      <Field label="Knoptekst">
        <TextInput value={s.overons_cta_button ?? ''} onChange={(v) => set('overons_cta_button', v)} placeholder="Lid worden" />
      </Field>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function OverOnsEditor() {
  const { settings, setSettings, loading } = useSettings();
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  const set = useCallback((k: string, v: string) => {
    setSettings((prev) => ({ ...prev, [k]: v }));
  }, [setSettings]);

  async function handleSave(keys: string[], sectionId: string) {
    setSaveStates((s) => ({ ...s, [sectionId]: 'saving' }));
    const err = await saveKeys(keys, settings);
    setSaveStates((s) => ({ ...s, [sectionId]: err ? 'error' : 'saved' }));
    if (!err) setTimeout(() => setSaveStates((s) => ({ ...s, [sectionId]: 'idle' })), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  const sections = [
    { id: 'hero',     title: 'Hero — statistieken & badge',    keys: HERO_KEYS,     children: <HeroSection s={settings} set={set} />,     defaultOpen: true },
    { id: 'timeline', title: 'Tijdlijn — Van vonk tot vlam',   keys: TIMELINE_KEYS, children: <TimelineSection s={settings} set={set} /> },
    { id: 'quote',    title: 'Citaatbalk',                     keys: QUOTE_KEYS,    children: <QuoteSection s={settings} set={set} /> },
    { id: 'values',   title: 'Waardenkaarten — Meer dan een club', keys: VALUES_KEYS, children: <ValuesSection s={settings} set={set} /> },
    { id: 'cta',      title: 'Call-to-action onderaan',        keys: CTA_KEYS,      children: <CtaSection s={settings} set={set} /> },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Over ons pagina bewerken</h2>
        <p className="text-sm text-gray-400">Teksten van de /over-ons pagina aanpassen</p>
      </div>

      {sections.map((sec) => (
        <Accordion key={sec.id} title={sec.title} defaultOpen={sec.defaultOpen}>
          {sec.children}
          <SaveBar
            state={saveStates[sec.id] ?? 'idle'}
            onSave={() => handleSave(sec.keys, sec.id)}
          />
        </Accordion>
      ))}
    </div>
  );
}
