import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Copy, Trash2, Image as ImageIcon, X, Check, Search } from 'lucide-react';

async function apiUpload(files: File[]): Promise<{ filename: string; storage_path: string; public_url: string; mime_type: string; size: number }[]> {
  const results = [];
  for (const file of files) {
    const ext = file.name.split('.').pop();
    const storageName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(storageName, file, { contentType: file.type });
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(storageName);
    results.push({
      filename: file.name,
      storage_path: storageName,
      public_url: urlData.publicUrl,
      mime_type: file.type,
      size: file.size,
    });
  }
  return results;
}

async function apiDelete(storagePath: string): Promise<void> {
  await supabase.storage.from('media').remove([storagePath]);
}

type MediaFile = {
  id: string;
  filename: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size: number;
  created_at: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary({ onSelect, selectable = false }: { onSelect?: (url: string) => void; selectable?: boolean }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });
    setFiles(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (!selectedFiles.length) return;
    setUploading(true);
    setError(null);

    try {
      const uploaded = await apiUpload(selectedFiles);
      for (const u of uploaded) {
        await supabase.from('media_files').insert(u);
      }
    } catch (err) {
      setError(`Upload mislukt: ${err instanceof Error ? err.message : String(err)}`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    load();
  }

  async function handleDelete(file: MediaFile) {
    await apiDelete(file.storage_path);
    await supabase.from('media_files').delete().eq('id', file.id);
    setDeleteId(null);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  }

  function copyUrl(file: MediaFile) {
    navigator.clipboard.writeText(file.public_url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filtered = files.filter((f) =>
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mediabibliotheek</h2>
          <p className="text-sm text-gray-400 mt-0.5">{files.length} bestand{files.length !== 1 ? 'en' : ''} geüpload</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-forest-800 hover:bg-forest-900 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-xl text-sm transition"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'Uploaden...' : 'Uploaden'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Bestanden zoeken..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 transition bg-white"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="w-10 h-10 text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">
            {search ? 'Geen bestanden gevonden.' : 'Nog geen bestanden geüpload.'}
          </p>
          {!search && (
            <button onClick={() => fileInputRef.current?.click()} className="mt-3 text-sm font-medium text-forest-700 hover:text-forest-900 transition">
              Upload je eerste bestand
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((file) => (
            <div key={file.id} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Thumbnail */}
              <div
                className={`aspect-square bg-gray-50 flex items-center justify-center overflow-hidden ${selectable ? 'cursor-pointer' : ''}`}
                onClick={() => selectable && onSelect?.(file.public_url)}
              >
                {file.mime_type.startsWith('image/') ? (
                  <img src={file.public_url} alt={file.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-300">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px] uppercase tracking-wide">{file.mime_type.split('/')[1]}</span>
                  </div>
                )}
                {selectable && (
                  <div className="absolute inset-0 bg-forest-900/0 group-hover:bg-forest-900/30 transition flex items-center justify-center">
                    <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition bg-forest-900/70 px-2 py-1 rounded-lg">Selecteer</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs font-medium text-gray-700 truncate leading-tight" title={file.filename}>{file.filename}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatBytes(file.size)}</p>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => { e.stopPropagation(); copyUrl(file); }}
                  title="Kopieer URL"
                  className="w-7 h-7 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm transition"
                >
                  {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(file.id); }}
                  title="Verwijderen"
                  className="w-7 h-7 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-200 shadow-sm transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-80 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-1">Bestand verwijderen?</h3>
            <p className="text-sm text-gray-500 mb-5">Dit kan niet ongedaan worden gemaakt. Pagina's die dit bestand gebruiken zullen de afbeelding niet meer tonen.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition">
                Annuleren
              </button>
              <button
                onClick={() => {
                  const file = files.find((f) => f.id === deleteId);
                  if (file) handleDelete(file);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 text-sm font-medium transition"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
