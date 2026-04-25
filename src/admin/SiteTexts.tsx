import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

type SiteText = {
  id: string;
  key: string;
  label: string;
  value: string;
};

export default function SiteTexts() {
  const [texts, setTexts] = useState<SiteText[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTexts();
  }, []);

  async function fetchTexts() {
    setLoading(true);
    const { data } = await supabase.from('site_texts').select('*').order('key');
    const items = data ?? [];
    setTexts(items);
    const vals: Record<string, string> = {};
    items.forEach((t: SiteText) => { vals[t.id] = t.value; });
    setValues(vals);
    setLoading(false);
  }

  async function handleSave(text: SiteText) {
    setSaving((s) => ({ ...s, [text.id]: true }));
    setErrors((e) => ({ ...e, [text.id]: '' }));

    const { error } = await supabase
      .from('site_texts')
      .update({ value: values[text.id], updated_at: new Date().toISOString() })
      .eq('id', text.id);

    setSaving((s) => ({ ...s, [text.id]: false }));

    if (error) {
      setErrors((e) => ({ ...e, [text.id]: 'Opslaan mislukt.' }));
      return;
    }

    setSaved((s) => ({ ...s, [text.id]: true }));
    setTimeout(() => setSaved((s) => ({ ...s, [text.id]: false })), 2000);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Websiteteksten</h2>
        <p className="text-sm text-gray-400">Pas de teksten op de website aan en sla ze afzonderlijk op.</p>
      </div>

      <div className="space-y-4">
        {texts.map((text) => {
          const isLong = text.value.length > 80 || text.key.includes('intro') || text.key.includes('subtitle');
          return (
            <div key={text.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                {text.label}
              </label>
              <div className="text-[10px] text-gray-400 font-mono mb-3">{text.key}</div>

              {isLong ? (
                <textarea
                  value={values[text.id] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [text.id]: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={values[text.id] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [text.id]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                />
              )}

              {errors[text.id] && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {errors[text.id]}
                </div>
              )}

              <div className="flex items-center justify-end mt-3">
                {saved[text.id] && (
                  <span className="flex items-center gap-1.5 text-green-600 text-xs mr-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Opgeslagen
                  </span>
                )}
                <button
                  onClick={() => handleSave(text)}
                  disabled={saving[text.id]}
                  className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving[text.id] ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
