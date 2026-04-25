import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ImagePickerModal } from './ImagePicker';
import {
  Save,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  X,
  ChevronDown,
} from 'lucide-react';

type Settings = Record<string, string>;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// ─── helpers ──────────────────────────────────────────────────────────────────

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

// ─── sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 tracking-widest uppercase mb-1.5">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-gray-50 focus:bg-white';

const textareaCls = inputCls + ' resize-none';

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={textareaCls}
    />
  );
}

function PhotoField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... of /bestand.jpg"
          className={inputCls + ' flex-1 font-mono text-xs'}
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="shrink-0 flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-lg px-3 py-2 text-sm transition"
        >
          <ImageIcon className="w-4 h-4" />
          Kiezen
        </button>
      </div>
      {value && (
        <div className="mt-2 relative inline-block">
          <img
            src={value}
            alt=""
            className="h-24 rounded-lg object-cover border border-gray-200"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 text-gray-500 hover:text-gray-900 transition"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {pickerOpen && (
        <ImagePickerModal
          onSelect={(url) => { onChange(url); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </Field>
  );
}

function SaveBar({
  state,
  onSave,
}: {
  state: SaveState;
  onSave: () => void;
}) {
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

function Accordion({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

// ─── sections ─────────────────────────────────────────────────────────────────

const HERO_KEYS = [
  'hero_title_1', 'hero_title_2', 'hero_title_3',
  'hero_subtitle', 'hero_bg_image',
  'hero_stat_1_value', 'hero_stat_1_label',
  'hero_stat_2_value', 'hero_stat_2_label',
  'hero_stat_3_value', 'hero_stat_3_label',
];
const OVER_ONS_KEYS = ['over_ons_title', 'over_ons_text_1', 'over_ons_text_2', 'over_ons_photo'];
const GEBOUW_KEYS = ['gebouw_title', 'gebouw_text', 'gebouw_photo'];
const VIDEO_KEYS = ['video_youtube_id'];
const CONTACT_KEYS = ['contact_address', 'contact_whatsapp', 'contact_hours'];
const FOOTER_KEYS = ['footer_tagline'];

const SPELTAK_DEFAULTS = [
  { naam: 'Bevers',     leeftijd: '5 – 7 jaar'   },
  { naam: 'Welpen',     leeftijd: '7 – 11 jaar'  },
  { naam: 'Scouts',     leeftijd: '11 – 15 jaar' },
  { naam: 'Verkenners', leeftijd: '14 – 17 jaar' },
  { naam: 'Explorers',  leeftijd: '17 – 21 jaar' },
  { naam: 'Stam',       leeftijd: '21+'           },
];
const SPELTAKKEN_KEYS = Array.from({ length: 6 }, (_, i) => [
  `speltak_${i}_naam`, `speltak_${i}_leeftijd`, `speltak_${i}_beschrijving`, `speltak_${i}_href`,
]).flat();

function HeroSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Koptitel regel 1">
          <TextInput value={s.hero_title_1 ?? ''} onChange={(v) => set('hero_title_1', v)} placeholder="Avontuur" />
        </Field>
        <Field label="Koptitel regel 2">
          <TextInput value={s.hero_title_2 ?? ''} onChange={(v) => set('hero_title_2', v)} placeholder="Vriendschap" />
        </Field>
        <Field label="Koptitel regel 3">
          <TextInput value={s.hero_title_3 ?? ''} onChange={(v) => set('hero_title_3', v)} placeholder="Groei" />
        </Field>
      </div>
      <Field label="Ondertitel">
        <Textarea value={s.hero_subtitle ?? ''} onChange={(v) => set('hero_subtitle', v)} rows={3} />
      </Field>
      <PhotoField
        label="Achtergrondafbeelding"
        value={s.hero_bg_image ?? ''}
        onChange={(v) => set('hero_bg_image', v)}
        hint="Aanbevolen: liggend, minimaal 1920×1080px"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['hero_stat_1_value', 'hero_stat_1_label', 'Statistiek 1'],
          ['hero_stat_2_value', 'hero_stat_2_label', 'Statistiek 2'],
          ['hero_stat_3_value', 'hero_stat_3_label', 'Statistiek 3'],
        ].map(([vk, lk, heading]) => (
          <div key={vk} className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{heading}</p>
            <input
              type="text"
              value={s[vk] ?? ''}
              onChange={(e) => set(vk, e.target.value)}
              placeholder="70+"
              className={inputCls}
            />
            <input
              type="text"
              value={s[lk] ?? ''}
              onChange={(e) => set(lk, e.target.value)}
              placeholder="Jaar actief"
              className={inputCls}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function OverOnsSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <Field label="Titel">
        <TextInput value={s.over_ons_title ?? ''} onChange={(v) => set('over_ons_title', v)} />
      </Field>
      <Field label="Alinea 1">
        <Textarea value={s.over_ons_text_1 ?? ''} onChange={(v) => set('over_ons_text_1', v)} rows={4} />
      </Field>
      <Field label="Alinea 2">
        <Textarea value={s.over_ons_text_2 ?? ''} onChange={(v) => set('over_ons_text_2', v)} rows={3} />
      </Field>
      <PhotoField
        label="Foto"
        value={s.over_ons_photo ?? ''}
        onChange={(v) => set('over_ons_photo', v)}
      />
    </>
  );
}

function GebouwSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <Field label="Titel">
        <TextInput value={s.gebouw_title ?? ''} onChange={(v) => set('gebouw_title', v)} />
      </Field>
      <Field label="Tekst">
        <Textarea value={s.gebouw_text ?? ''} onChange={(v) => set('gebouw_text', v)} rows={4} />
      </Field>
      <PhotoField
        label="Foto"
        value={s.gebouw_photo ?? ''}
        onChange={(v) => set('gebouw_photo', v)}
      />
    </>
  );
}

function VideoSectionEditor({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  const id = s.video_youtube_id ?? '';
  return (
    <>
      <Field label="YouTube video-ID" hint='Het gedeelte na "watch?v=" in de URL, bijv. 7jhFlcPjLTU'>
        <TextInput value={id} onChange={(v) => set('video_youtube_id', v)} placeholder="7jhFlcPjLTU" />
      </Field>
      {id && (
        <div className="aspect-video max-w-md rounded-lg overflow-hidden border border-gray-200">
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt="Video preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </>
  );
}

function ContactSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <Field label="Adres">
        <TextInput value={s.contact_address ?? ''} onChange={(v) => set('contact_address', v)} placeholder="Potskampstraat, Oldenzaal" />
      </Field>
      <Field label="WhatsApp">
        <TextInput value={s.contact_whatsapp ?? ''} onChange={(v) => set('contact_whatsapp', v)} placeholder="+31 541 363 172" />
      </Field>
      <Field label="Bijeenkomsttijden">
        <TextInput value={s.contact_hours ?? ''} onChange={(v) => set('contact_hours', v)} placeholder="Wekelijks (tijden per speltak)" />
      </Field>
    </>
  );
}

function SpeltakkenSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      {SPELTAK_DEFAULTS.map((d, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">
            Speltak {i + 1} — {s[`speltak_${i}_naam`] || d.naam}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Naam">
              <TextInput
                value={s[`speltak_${i}_naam`] ?? d.naam}
                onChange={(v) => set(`speltak_${i}_naam`, v)}
                placeholder={d.naam}
              />
            </Field>
            <Field label="Leeftijd">
              <TextInput
                value={s[`speltak_${i}_leeftijd`] ?? d.leeftijd}
                onChange={(v) => set(`speltak_${i}_leeftijd`, v)}
                placeholder={d.leeftijd}
              />
            </Field>
          </div>
          <Field label="Beschrijving">
            <Textarea
              value={s[`speltak_${i}_beschrijving`] ?? ''}
              onChange={(v) => set(`speltak_${i}_beschrijving`, v)}
              rows={2}
              placeholder="Korte omschrijving van deze speltak..."
            />
          </Field>
          <Field label="Link (optioneel)" hint='Waar gaat de "Meer weten" knop naartoe? Bijv. /bevers of https://...'>
            <TextInput
              value={s[`speltak_${i}_href`] ?? ''}
              onChange={(v) => set(`speltak_${i}_href`, v)}
              placeholder="/bevers"
            />
          </Field>
        </div>
      ))}
    </div>
  );
}

function FooterSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <Field label="Tagline onder logo">
      <TextInput value={s.footer_tagline ?? ''} onChange={(v) => set('footer_tagline', v)} placeholder="Oldenzaal · Sinds 1945" />
    </Field>
  );
}

// ─── main export ──────────────────────────────────────────────────────────────

export default function HomepageEditor() {
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

  const sections: {
    id: string;
    title: string;
    keys: string[];
    children: React.ReactNode;
    defaultOpen?: boolean;
  }[] = [
    {
      id: 'hero',
      title: 'Hero — bovenste sectie',
      keys: HERO_KEYS,
      defaultOpen: true,
      children: <HeroSection s={settings} set={set} />,
    },
    {
      id: 'speltakken',
      title: 'Speltakken',
      keys: SPELTAKKEN_KEYS,
      children: <SpeltakkenSection s={settings} set={set} />,
    },
    {
      id: 'over_ons',
      title: 'Over ons',
      keys: OVER_ONS_KEYS,
      children: <OverOnsSection s={settings} set={set} />,
    },
    {
      id: 'gebouw',
      title: 'Ons gebouw',
      keys: GEBOUW_KEYS,
      children: <GebouwSection s={settings} set={set} />,
    },
    {
      id: 'video',
      title: 'Video',
      keys: VIDEO_KEYS,
      children: <VideoSectionEditor s={settings} set={set} />,
    },
    {
      id: 'contact',
      title: 'Contact',
      keys: CONTACT_KEYS,
      children: <ContactSection s={settings} set={set} />,
    },
    {
      id: 'footer',
      title: 'Footer',
      keys: FOOTER_KEYS,
      children: <FooterSection s={settings} set={set} />,
    },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Homepagina bewerken</h2>
        <p className="text-sm text-gray-400">Teksten en foto's per sectie aanpassen</p>
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
