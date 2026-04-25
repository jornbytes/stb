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
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }

  function openNew() {
    setEditing({ title: '', slug: '', content: '', cover_image: '', published: false });
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

  function handleTitleChange(title: string) {
    setEditing((e) => ({
      ...e,
      title,
      slug: e?.id ? e.slug : slugify(title),
    }));
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
      <div className="max-w-3xl">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar overzicht
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {editing.id ? 'Bericht bewerken' : 'Nieuw bericht'}
            </h2>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                editing.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {editing.published ? 'Gepubliceerd' : 'Concept'}
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* Cover image */}
            <ImagePickerField
              label="Afbeelding (optioneel)"
              value={editing.cover_image ?? ''}
              onChange={(url) => setEditing((ed) => ({ ...ed, cover_image: url }))}
            />

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={editing.title ?? ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titel van het bericht"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition font-medium"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                URL-slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 shrink-0">/nieuws/</span>
                <input
                  type="text"
                  value={editing.slug ?? ''}
                  onChange={(e) => setEditing((ed) => ({ ...ed, slug: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition font-mono text-gray-600"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                Inhoud *
              </label>
              <RichEditor
                value={editing.content ?? ''}
                onChange={(v) => setEditing((ed) => ({ ...ed, content: v }))}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              onClick={() => handleSave(!editing.published)}
              disabled={saving}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 transition"
            >
              {editing.published ? (
                <><EyeOff className="w-4 h-4" /> Zet op concept</>
              ) : (
                <><Eye className="w-4 h-4" /> Publiceren</>
              )}
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving || !editing.title}
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

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Blogberichten</h2>
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
                      post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {post.published ? 'Gepubliceerd' : 'Concept'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm truncate">{post.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(post.created_at).toLocaleDateString('nl-NL', {
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
