import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [pexelsKey, setPexelsKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'pexels_api_key')
      .maybeSingle()
      .then(({ data }) => {
        setPexelsKey(data?.value ?? '');
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'pexels_api_key', value: pexelsKey.trim(), updated_at: new Date().toISOString() });

    setSaving(false);
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Instellingen</h2>
        <p className="text-sm text-gray-400">Globale configuratie voor de beheeromgeving</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Pexels API-sleutel</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Gratis aan te maken op{' '}
            <a
              href="https://www.pexels.com/api/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 inline-flex items-center gap-0.5"
            >
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
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between">
            {status === 'saved' ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Opgeslagen
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
