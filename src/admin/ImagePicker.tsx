import { useState, useRef, useEffect } from 'react';
import { Upload, Search, X, Check, Image as ImageIcon, ExternalLink, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Tab = 'upload' | 'library' | 'pexels';

type MediaFile = {
  id: string;
  filename: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size: number;
  created_at: string;
};

type PexelsPhoto = {
  id: number;
  alt: string;
  src: { medium: string; large2x: string };
  photographer: string;
};

interface ImagePickerModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function ImagePickerModal({ onSelect, onClose }: ImagePickerModalProps) {
  const [tab, setTab] = useState<Tab>('library');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [pexelsQuery, setPexelsQuery] = useState('scouting natuur buiten');
  const [pexelsResults, setPexelsResults] = useState<PexelsPhoto[]>([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [pexelsError, setPexelsError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [pexelsKey, setPexelsKey] = useState('');
  const [keyLoaded, setKeyLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const didSearchPexels = useRef(false);

  useEffect(() => {
    loadFiles();
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'pexels_api_key')
      .maybeSingle()
      .then(({ data }) => {
        setPexelsKey(data?.value ?? '');
        setKeyLoaded(true);
      });
  }, []);

  async function loadFiles() {
    setFilesLoading(true);
    const { data } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });
    setFiles(data ?? []);
    setFilesLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setUploading(true);
    setUploadError(null);
    let lastUrl = '';
    for (const file of selected) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) { setUploadError(`Upload mislukt: ${error.message}`); continue; }
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      await supabase.from('media_files').insert({
        filename: file.name,
        storage_path: path,
        public_url: urlData.publicUrl,
        mime_type: file.type,
        size: file.size,
      });
      lastUrl = urlData.publicUrl;
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await loadFiles();
    if (lastUrl) { onSelect(lastUrl); onClose(); }
  }

  async function searchPexels(query: string, key = pexelsKey) {
    if (!query.trim() || !key) return;
    setPexelsLoading(true);
    setPexelsError(null);
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=24&locale=nl-NL`,
        { headers: { Authorization: key } }
      );
      if (res.status === 401) throw new Error('Ongeldige API-sleutel. Controleer je sleutel en probeer opnieuw.');
      if (!res.ok) throw new Error('Pexels kon niet worden bereikt.');
      const json = await res.json();
      setPexelsResults(json.photos ?? []);
    } catch (err) {
      setPexelsError(err instanceof Error ? err.message : 'Onbekende fout.');
    }
    setPexelsLoading(false);
  }

  useEffect(() => {
    if (tab === 'pexels' && keyLoaded && pexelsKey && !didSearchPexels.current) {
      didSearchPexels.current = true;
      searchPexels(pexelsQuery);
    }
  }, [tab, keyLoaded]);

  const filteredFiles = files.filter((f) =>
    f.filename.toLowerCase().includes(librarySearch.toLowerCase()) &&
    f.mime_type.startsWith('image/')
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'library', label: 'Mediabibliotheek' },
    { key: 'upload', label: 'Uploaden' },
    { key: 'pexels', label: 'Pexels' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[900px] max-w-[96vw] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  tab === t.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
              {uploadError && (
                <div className="w-full max-w-md bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {uploadError}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center gap-4 w-full max-w-md border-2 border-dashed border-gray-200 rounded-2xl p-12 hover:border-gray-400 hover:bg-gray-50 transition disabled:opacity-60 cursor-pointer"
              >
                {uploading ? (
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 text-gray-300" />
                )}
                <div className="text-center">
                  <p className="font-medium text-gray-700">{uploading ? 'Uploaden...' : 'Klik om bestanden te kiezen'}</p>
                  <p className="text-sm text-gray-400 mt-1">JPG, PNG, GIF, WebP, SVG</p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          )}

          {/* Library tab */}
          {tab === 'library' && (
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek op bestandsnaam..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                />
              </div>
              {filesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                  <ImageIcon className="w-10 h-10" />
                  <p className="text-sm">Geen afbeeldingen gevonden</p>
                  <button
                    onClick={() => setTab('upload')}
                    className="text-sm text-gray-700 font-medium underline underline-offset-2"
                  >
                    Upload een afbeelding
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filteredFiles.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedUrl(f.public_url)}
                      onDoubleClick={() => { onSelect(f.public_url); onClose(); }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition group ${
                        selectedUrl === f.public_url
                          ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={f.public_url} alt={f.filename} className="w-full h-full object-cover" />
                      {selectedUrl === f.public_url && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 px-1.5 opacity-0 group-hover:opacity-100 transition">
                        <p className="text-white text-[10px] truncate">{f.filename}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pexels tab */}
          {tab === 'pexels' && (
            <div className="p-6 space-y-4">
              {keyLoaded && !pexelsKey && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <Key className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-800 flex-1">
                    Geen Pexels API-sleutel ingesteld.
                  </p>
                  <button
                    onClick={onClose}
                    className="text-xs text-amber-700 underline underline-offset-2 shrink-0"
                  >
                    Ga naar Instellingen
                  </button>
                </div>
              )}

              {(!keyLoaded || pexelsKey) && (
                <>
                  <form
                    onSubmit={(e) => { e.preventDefault(); searchPexels(pexelsQuery); }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Zoek foto's op Pexels..."
                        value={pexelsQuery}
                        onChange={(e) => setPexelsQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={pexelsLoading}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition"
                    >
                      {pexelsLoading ? 'Zoeken...' : 'Zoeken'}
                    </button>
                  </form>

                  {pexelsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                      {pexelsError} Controleer de API-sleutel via Instellingen.
                    </div>
                  )}

                  {pexelsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                  ) : pexelsResults.length === 0 && !pexelsError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                      <ImageIcon className="w-10 h-10" />
                      <p className="text-sm">Geen resultaten</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {pexelsResults.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedUrl(p.src.large2x)}
                            onDoubleClick={() => { onSelect(p.src.large2x); onClose(); }}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition group ${
                              selectedUrl === p.src.large2x
                                ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1'
                                : 'border-transparent hover:border-gray-300'
                            }`}
                          >
                            <img src={p.src.medium} alt={p.alt} className="w-full h-full object-cover" />
                            {selectedUrl === p.src.large2x && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 px-1.5 opacity-0 group-hover:opacity-100 transition">
                              <p className="text-white text-[10px] truncate">door {p.photographer}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        Foto's via
                        <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                          Pexels <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedUrl && tab !== 'upload' && (
          <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
            <img src={selectedUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{selectedUrl}</p>
            </div>
            <button
              onClick={() => { onSelect(selectedUrl); onClose(); }}
              className="shrink-0 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition"
            >
              Selecteren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ImagePickerFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewHeight?: string;
}

export function ImagePickerField({ value, onChange, label, previewHeight = 'h-36' }: ImagePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasValidImage = value && !imgError;

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      {hasValidImage ? (
        <div className="rounded-xl overflow-hidden border border-gray-200 mb-2">
          <img
            src={value}
            alt=""
            className={`w-full ${previewHeight} object-cover`}
            onError={() => setImgError(true)}
          />
          <div className="flex gap-2 px-3 py-2 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Wijzigen
            </button>
            <button
              type="button"
              onClick={() => { onChange(''); setImgError(false); }}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition"
            >
              Verwijderen
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition"
        >
          <ImageIcon className="w-5 h-5" />
          Afbeelding kiezen
        </button>
      )}
      {open && <ImagePickerModal onSelect={(url) => { onChange(url); setImgError(false); }} onClose={() => setOpen(false)} />}
    </div>
  );
}
