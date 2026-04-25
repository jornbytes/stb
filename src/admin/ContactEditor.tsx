import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ImagePickerModal } from './ImagePicker';
import {
  Save, CheckCircle, AlertCircle, Image as ImageIcon, X, ChevronDown,
  Plus, Trash2, GripVertical,
} from 'lucide-react';

type Settings = Record<string, string>;
type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type FormField = { key: string; label: string; type: 'text' | 'email' | 'textarea'; placeholder: string; required: boolean };

// ─── helpers ──────────────────────────────────────────────────────────────────

function useSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
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

// ─── shared UI ────────────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-gray-50 focus:bg-white';

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
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />;
}

function Textarea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls + ' resize-none'} />;
}

function PhotoField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="https://... of /bestand.jpg" className={inputCls + ' flex-1 font-mono text-xs'} />
        <button type="button" onClick={() => setPickerOpen(true)}
          className="shrink-0 flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-lg px-3 py-2 text-sm transition">
          <ImageIcon className="w-4 h-4" /> Kiezen
        </button>
      </div>
      {value && (
        <div className="mt-2 relative inline-block">
          <img src={value} alt="" className="h-24 rounded-lg object-cover border border-gray-200"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
          <button type="button" onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 text-gray-500 hover:text-gray-900 transition">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {pickerOpen && <ImagePickerModal onSelect={(url) => { onChange(url); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
    </Field>
  );
}

function SaveBar({ state, onSave }: { state: SaveState; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
      {state === 'saved' && <span className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle className="w-4 h-4" /> Opgeslagen</span>}
      {state === 'error' && <span className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> Opslaan mislukt</span>}
      <button type="button" disabled={state === 'saving'} onClick={onSave}
        className="ml-auto flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition">
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
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition">
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

// ─── Form fields editor ───────────────────────────────────────────────────────

function FormFieldsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [fields, setFields] = useState<FormField[]>(() => {
    try { return JSON.parse(value); } catch { return []; }
  });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  function update(newFields: FormField[]) {
    setFields(newFields);
    onChange(JSON.stringify(newFields));
  }

  function addField() {
    update([...fields, { key: `veld_${Date.now()}`, label: '', type: 'text', placeholder: '', required: false }]);
  }

  function removeField(idx: number) { update(fields.filter((_, i) => i !== idx)); }

  function patchField(idx: number, patch: Partial<FormField>) {
    update(fields.map((f, i) => i === idx ? { ...f, ...patch } : f));
  }

  function onDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const reordered = [...fields];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    update(reordered);
    setDragIdx(null);
    setDragOverIdx(null);
  }

  return (
    <div className="space-y-3">
      {fields.map((f, idx) => (
        <div key={f.key + idx}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
          onDrop={() => onDrop(idx)}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          className={`flex items-start gap-2 p-3 rounded-xl border transition-all ${dragOverIdx === idx && dragIdx !== idx ? 'border-gray-400 bg-gray-50' : 'border-gray-100 bg-gray-50/50'}`}>

          <div className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing pt-2 shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2">
            <input type="text" value={f.label} onChange={(e) => patchField(idx, { label: e.target.value })}
              placeholder="Label" className={inputCls} />
            <input type="text" value={f.placeholder} onChange={(e) => patchField(idx, { placeholder: e.target.value })}
              placeholder="Plaatshouder" className={inputCls} />
            <select value={f.type} onChange={(e) => patchField(idx, { type: e.target.value as FormField['type'] })}
              className={inputCls}>
              <option value="text">Tekstveld</option>
              <option value="email">E-mailveld</option>
              <option value="textarea">Tekstvak (meerdere regels)</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={f.required} onChange={(e) => patchField(idx, { required: e.target.checked })}
                className="rounded" />
              Verplicht
            </label>
          </div>

          <button type="button" onClick={() => removeField(idx)}
            className="text-gray-300 hover:text-red-500 transition pt-2 shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addField}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-lg transition w-full justify-center">
        <Plus className="w-3.5 h-3.5" /> Veld toevoegen
      </button>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

const HERO_KEYS = ['contact_title', 'contact_subtitle', 'contact_hero_image'];
const INFO_KEYS = ['contact_intro', 'contact_address', 'contact_whatsapp', 'contact_hours', 'contact_email', 'contact_maps_url'];
const FORM_KEYS = ['contact_form_title', 'contact_form_button', 'contact_form_fields'];

function HeroSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <Field label="Paginatitel">
        <TextInput value={s.contact_title ?? ''} onChange={(v) => set('contact_title', v)} placeholder="Contact" />
      </Field>
      <Field label="Ondertitel (hero)">
        <Textarea value={s.contact_subtitle ?? ''} onChange={(v) => set('contact_subtitle', v)} rows={2}
          placeholder="Heb je een vraag? We staan voor je klaar." />
      </Field>
      <PhotoField label="Hero-afbeelding" value={s.contact_hero_image ?? ''} onChange={(v) => set('contact_hero_image', v)}
        hint="Liggend formaat aanbevolen, minimaal 1920×1080px" />
    </>
  );
}

function InfoSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <Field label="Inleidende tekst">
        <Textarea value={s.contact_intro ?? ''} onChange={(v) => set('contact_intro', v)} rows={3}
          placeholder="Neem gerust contact met ons op..." />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Adres">
          <TextInput value={s.contact_address ?? ''} onChange={(v) => set('contact_address', v)} placeholder="Potskampstraat, Oldenzaal" />
        </Field>
        <Field label="WhatsApp-nummer">
          <TextInput value={s.contact_whatsapp ?? ''} onChange={(v) => set('contact_whatsapp', v)} placeholder="+31 541 363 172" />
        </Field>
        <Field label="Bijeenkomsttijden">
          <TextInput value={s.contact_hours ?? ''} onChange={(v) => set('contact_hours', v)} placeholder="Wekelijks (tijden per speltak)" />
        </Field>
        <Field label="E-mailadres (optioneel)">
          <TextInput value={s.contact_email ?? ''} onChange={(v) => set('contact_email', v)} placeholder="info@scouting..." />
        </Field>
      </div>
      <Field label="Google Maps embed-URL" hint="Ga naar Google Maps → Delen → Embedden → kopieer de src-URL">
        <TextInput value={s.contact_maps_url ?? ''} onChange={(v) => set('contact_maps_url', v)}
          placeholder="https://www.google.com/maps/embed?pb=..." />
      </Field>
    </>
  );
}

function FormSection({ s, set }: { s: Settings; set: (k: string, v: string) => void }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Formuliertitel">
          <TextInput value={s.contact_form_title ?? ''} onChange={(v) => set('contact_form_title', v)} placeholder="Stuur een bericht" />
        </Field>
        <Field label="Knoptekst">
          <TextInput value={s.contact_form_button ?? ''} onChange={(v) => set('contact_form_button', v)} placeholder="Verstuur bericht" />
        </Field>
      </div>
      <Field label="Formuliervelden" hint="Stel in welke velden bezoekers moeten invullen. Sleep om de volgorde te wijzigen.">
        <FormFieldsEditor value={s.contact_form_fields ?? '[]'} onChange={(v) => set('contact_form_fields', v)} />
      </Field>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ContactEditor() {
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
    { id: 'hero', title: 'Hero — koptekst & afbeelding', keys: HERO_KEYS, defaultOpen: true, children: <HeroSection s={settings} set={set} /> },
    { id: 'info', title: 'Contactgegevens', keys: INFO_KEYS, children: <InfoSection s={settings} set={set} /> },
    { id: 'form', title: 'Contactformulier', keys: FORM_KEYS, children: <FormSection s={settings} set={set} /> },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Contactpagina bewerken</h2>
        <p className="text-sm text-gray-400">
          Pas de inhoud en het formulier van de contactpagina aan.{' '}
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="text-forest-700 hover:underline">
            Bekijk pagina &rarr;
          </a>
        </p>
      </div>

      {sections.map((sec) => (
        <Accordion key={sec.id} title={sec.title} defaultOpen={sec.defaultOpen}>
          {sec.children}
          <SaveBar state={saveStates[sec.id] ?? 'idle'} onSave={() => handleSave(sec.keys, sec.id)} />
        </Accordion>
      ))}
    </div>
  );
}
