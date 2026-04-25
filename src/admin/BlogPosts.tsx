import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus,
  ArrowLeft,
  Trash2,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Image,
  Link,
  Calendar,
  FileText,
} from 'lucide-react';
import RichEditor from './RichEditor';
import { ImagePickerField } from './ImagePicker';

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  published: boolean;
  published_at: string | null;
  post_date: string | null;
  created_at: string;
};

type View = 'list' | 'edit';

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function SidebarSection({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em]">{title}</span>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

function PostEditor({
  editing,
  setEditing,
  onBack,
  onSave,
  saving,
  error,
}: {
  editing: Partial<Post>;
  setEditing: React.Dispatch<React.SetStateAction<Partial<Post> | null>>;
  onBack: () => void;
  onSave: (publish?: boolean) => void;
  saving: boolean;
  error: string;
}) {
  const isNew = !editing.id;

  function handleTitleChange(title: string) {
    setEditing((e) => ({
      ...e,
      title,
      slug: e?.id ? e!.slug : slugify(title),
    }));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide ${
              editing.published ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {editing.published ? 'Gepubliceerd' : 'Concept'}
          </span>

          <button
            onClick={() => onSave(!editing.published)}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white px-3.5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {editing.published
              ? <><EyeOff className="w-3.5 h-3.5" /> Verbergen</>
              : <><Eye className="w-3.5 h-3.5" /> Publiceren</>
            }
          </button>

          <button
            onClick={() => onSave()}
            disabled={saving || !editing.title}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Opslaan…' : 'Opslaan'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* ── Main writing area ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <textarea
              value={editing.title ?? ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={isNew ? 'Titel van het bericht…' : 'Titel'}
              rows={2}
              className="w-full px-5 py-4 text-2xl font-bold text-gray-900 placeholder-gray-300 resize-none focus:outline-none leading-snug"
            />
          </div>

          {/* Rich content editor */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Inhoud</span>
            </div>
            <div className="p-1">
              <RichEditor
                value={editing.content ?? ''}
                onChange={(v) => setEditing((ed) => ({ ...ed, content: v }))}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="w-64 shrink-0 space-y-3">
          {/* Cover image */}
          <SidebarSection icon={Image} title="Afbeelding">
            <ImagePickerField
              label=""
              value={editing.cover_image ?? ''}
              onChange={(url) => setEditing((ed) => ({ ...ed, cover_image: url }))}
            />
          </SidebarSection>

          {/* Publish settings */}
          <SidebarSection icon={Calendar} title="Datum">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
                Berichtdatum
              </label>
              <input
                type="date"
                value={editing.post_date ?? ''}
                onChange={(e) =>
                  setEditing((ed) => ({ ...ed, post_date: e.target.value || null }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-gray-50 focus:bg-white"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                Leeg = publicatiedatum wordt gebruikt
              </p>
            </div>
          </SidebarSection>

          {/* URL slug */}
          <SidebarSection icon={Link} title="URL">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
                Slug
              </label>
              <div className="text-[10px] text-gray-400 mb-1.5 font-mono break-all">/nieuws/</div>
              <input
                type="text"
                value={editing.slug ?? ''}
                onChange={(e) =>
                  setEditing((ed) => ({ ...ed, slug: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-gray-50 focus:bg-white"
                placeholder="url-van-het-bericht"
              />
            </div>
          </SidebarSection>

          {/* Info card */}
          {editing.id && (
            <SidebarSection icon={FileText} title="Info">
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span className="text-gray-400">Aangemaakt</span>
                  <span>{new Date(editing.created_at!).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {editing.published_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gepubliceerd</span>
                    <span>{new Date(editing.published_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </SidebarSection>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogPosts() {
  const [view, setView] = useState<View>('list');
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*');
    const effectiveDate = (p: Post) => {
      const raw = p.post_date ?? p.published_at ?? p.created_at;
      return new Date(raw.length === 10 ? raw + 'T00:00:00' : raw).getTime();
    };
    setPosts((data ?? []).sort((a, b) => effectiveDate(b) - effectiveDate(a)));
    setLoading(false);
  }

  function openNew() {
    setEditing({ title: '', slug: '', content: '', cover_image: '', published: false, post_date: null });
    setView('edit');
  }

  function openEdit(post: Post) {
    setEditing({ ...post });
    setView('edit');
  }

  function handleBack() {
    setEditing(null);
    setError('');
    setView('list');
    fetchPosts();
  }

  async function handleSave(publish?: boolean) {
    if (!editing) return;
    setError('');
    setSaving(true);

    const payload: Partial<Post> = {
      title: editing.title,
      slug: editing.slug || slugify(editing.title ?? ''),
      content: editing.content ?? '',
      cover_image: editing.cover_image ?? '',
      published: publish !== undefined ? publish : editing.published ?? false,
      published_at:
        publish && !editing.published_at ? new Date().toISOString() : editing.published_at ?? null,
      post_date: editing.post_date || null,
    };

    let err;
    if (editing.id) {
      const res = await supabase.from('blog_posts').update(payload).eq('id', editing.id);
      err = res.error;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await supabase.from('blog_posts').insert({ ...payload, author_id: user?.id });
      err = res.error;
    }

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    handleBack();
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je dit bericht wilt verwijderen?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  }

  if (view === 'edit' && editing !== null) {
    return (
      <PostEditor
        editing={editing}
        setEditing={setEditing as React.Dispatch<React.SetStateAction<Partial<Post> | null>>}
        onBack={handleBack}
        onSave={handleSave}
        saving={saving}
        error={error}
      />
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Nieuwsberichten</h2>
          <p className="text-sm text-gray-400">{posts.length} berichten</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" />
          Nieuw bericht
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Nog geen berichten</p>
          <button
            onClick={openNew}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2"
          >
            Maak het eerste bericht aan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-sm transition"
            >
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-100"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {post.published ? 'Gepubliceerd' : 'Concept'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm truncate">{post.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(post.post_date ?? post.published_at ?? post.created_at).toLocaleDateString('nl-NL', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(post)}
                  className="text-xs text-gray-500 hover:text-gray-900 font-medium transition"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-gray-300 hover:text-red-500 transition p-1"
                >
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
