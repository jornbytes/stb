import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  GripVertical, Plus, Trash2, ExternalLink, FileText,
  Save, X, ChevronDown, Globe, Link,
  BookOpen, HardDrive, Mail, Star, Home, Users,
} from 'lucide-react';

export const NAV_ICONS: { value: string; label: string; icon: React.ElementType }[] = [
  { value: '',            label: 'Geen (tekst)',   icon: FileText },
  { value: 'home',        label: 'Home',           icon: Home },
  { value: 'book',        label: 'SOL / Boek',     icon: BookOpen },
  { value: 'drive',       label: 'Google Drive',   icon: HardDrive },
  { value: 'mail',        label: 'Mail',           icon: Mail },
  { value: 'users',       label: 'Leden',          icon: Users },
  { value: 'star',        label: 'Ster',           icon: Star },
  { value: 'external',    label: 'Externe link',   icon: ExternalLink },
];

type NavItem = {
  id: string;
  label: string;
  type: 'page' | 'external';
  page_id: string | null;
  href: string;
  position: number;
  open_in_new_tab: boolean;
  icon: string;
};

type Page = {
  id: string;
  title: string;
  slug: string;
};

type EditState = {
  id: string | null;
  label: string;
  type: 'page' | 'external';
  page_id: string;
  href: string;
  open_in_new_tab: boolean;
  icon: string;
};

function emptyEdit(): EditState {
  return { id: null, label: '', type: 'external', page_id: '', href: '', open_in_new_tab: false, icon: '' };
}

export default function NavMenu() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('nav_items').select('*').order('position'),
      supabase.from('pages').select('id, title, slug').order('title'),
    ]).then(([navRes, pagesRes]) => {
      setItems(navRes.data ?? []);
      setPages(pagesRes.data ?? []);
      setLoading(false);
    });
  }, []);

  // ── Drag-to-reorder ──────────────────────────────────────────────────────────

  function onDragStart(id: string) {
    setDragging(id);
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (dragging && dragging !== id) setDragOver(id);
  }

  function onDrop(targetId: string) {
    if (!dragging || dragging === targetId) { reset(); return; }
    const next = [...items];
    const fromIdx = next.findIndex(i => i.id === dragging);
    const toIdx = next.findIndex(i => i.id === targetId);
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const reordered = next.map((item, idx) => ({ ...item, position: idx }));
    setItems(reordered);
    reset();
    saveOrder(reordered);
  }

  function reset() {
    setDragging(null);
    setDragOver(null);
  }

  async function saveOrder(ordered: NavItem[]) {
    await Promise.all(
      ordered.map(item =>
        supabase.from('nav_items').update({ position: item.position }).eq('id', item.id)
      )
    );
  }

  // ── Move up / down ────────────────────────────────────────────────────────────

  function move(idx: number, dir: -1 | 1) {
    const next = [...items];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const reordered = next.map((item, i) => ({ ...item, position: i }));
    setItems(reordered);
    saveOrder(reordered);
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  async function deleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('nav_items').delete().eq('id', id);
  }

  // ── Save edit / new ───────────────────────────────────────────────────────────

  async function saveEdit() {
    if (!edit) return;
    setSaving(true);

    const resolvedHref = edit.type === 'page'
      ? (pages.find(p => p.id === edit.page_id)?.slug ? `/${pages.find(p => p.id === edit.page_id)!.slug}` : '')
      : edit.href;

    if (edit.id) {
      // Update
      const { data } = await supabase
        .from('nav_items')
        .update({
          label: edit.label,
          type: edit.type,
          page_id: edit.type === 'page' ? edit.page_id || null : null,
          href: resolvedHref,
          open_in_new_tab: edit.open_in_new_tab,
          icon: edit.icon,
        })
        .eq('id', edit.id)
        .select()
        .single();
      if (data) setItems(prev => prev.map(i => i.id === data.id ? data : i));
    } else {
      // Insert
      const position = items.length;
      const { data } = await supabase
        .from('nav_items')
        .insert({
          label: edit.label,
          type: edit.type,
          page_id: edit.type === 'page' ? edit.page_id || null : null,
          href: resolvedHref,
          open_in_new_tab: edit.open_in_new_tab,
          icon: edit.icon,
          position,
        })
        .select()
        .single();
      if (data) setItems(prev => [...prev, data]);
    }

    setSaving(false);
    setEdit(null);
  }

  function startEdit(item: NavItem) {
    setEdit({
      id: item.id,
      label: item.label,
      type: item.type,
      page_id: item.page_id ?? '',
      href: item.href,
      open_in_new_tab: item.open_in_new_tab,
      icon: item.icon ?? '',
    });
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
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Navigatiemenu</h2>
          <p className="text-sm text-gray-400">Sleep items om de volgorde aan te passen</p>
        </div>
        <button
          onClick={() => setEdit(emptyEdit())}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Item toevoegen
        </button>
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
            Nog geen navigatie-items. Voeg er een toe.
          </div>
        )}

        {items.map((item, idx) => {
          const isDraggingThis = dragging === item.id;
          const isDragTarget = dragOver === item.id;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(item.id)}
              onDragOver={e => onDragOver(e, item.id)}
              onDrop={() => onDrop(item.id)}
              onDragEnd={reset}
              className={`group bg-white border rounded-xl flex items-center gap-3 px-4 py-3 transition-all cursor-default select-none ${
                isDraggingThis ? 'opacity-40 border-forest-400' : isDragTarget ? 'border-forest-400 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Grip */}
              <div className="text-gray-300 group-hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0 transition-colors">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Icon */}
              <div className="shrink-0">
                {item.type === 'page'
                  ? <FileText className="w-4 h-4 text-forest-600" />
                  : item.href.startsWith('#')
                    ? <Link className="w-4 h-4 text-gray-400" />
                    : <Globe className="w-4 h-4 text-blue-500" />
                }
              </div>

              {/* Label + href */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-400 truncate">{item.href || (item.type === 'page' ? 'Pagina' : 'Geen URL')}</div>
              </div>

              {/* Type badge */}
              <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                item.type === 'page' ? 'bg-forest-100 text-forest-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {item.type === 'page' ? 'Pagina' : 'Link'}
              </span>

              {item.open_in_new_tab && (
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" title="Opent in nieuw tabblad" />
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 transition"
                  title="Omhoog"
                >
                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 transition"
                  title="Omlaag"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <button
                  onClick={() => startEdit(item)}
                  className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xs font-bold"
                  title="Bewerken"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Verwijderen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview hint */}
      {items.length > 0 && (
        <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Voorbeeld volgorde</p>
          <div className="flex flex-wrap gap-2">
            {items.map(item => (
              <span key={item.id} className="text-xs text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Edit / New modal */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEdit(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">
                {edit.id ? 'Item bewerken' : 'Item toevoegen'}
              </h3>
              <button onClick={() => setEdit(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Naam (zichtbaar in menu)</label>
                <input
                  type="text"
                  value={edit.label}
                  onChange={e => setEdit(s => s && ({ ...s, label: e.target.value }))}
                  placeholder="bijv. Over ons"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['external', 'page'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEdit(s => s && ({ ...s, type: t }))}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        edit.type === t
                          ? 'border-forest-500 bg-forest-50 text-forest-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t === 'page'
                        ? <><FileText className="w-4 h-4" /> Pagina</>
                        : <><Globe className="w-4 h-4" /> Externe link</>
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* Page selector */}
              {edit.type === 'page' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Pagina</label>
                  {pages.length === 0 ? (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2">Nog geen pagina's aangemaakt.</p>
                  ) : (
                    <select
                      value={edit.page_id}
                      onChange={e => setEdit(s => s && ({ ...s, page_id: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent bg-white"
                    >
                      <option value="">Kies een pagina...</option>
                      {pages.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* External URL */}
              {edit.type === 'external' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">URL of ankerpunt</label>
                  <input
                    type="text"
                    value={edit.href}
                    onChange={e => setEdit(s => s && ({ ...s, href: e.target.value }))}
                    placeholder="bijv. #contact of https://example.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Gebruik <code className="bg-gray-100 px-1 rounded">#sectie</code> voor ankerpunten op de homepage, of een volledige URL voor externe websites.
                  </p>
                </div>
              )}

              {/* Icon picker */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Icoon (optioneel)</label>
                <p className="text-[11px] text-gray-400 mb-2">Als je een icoon kiest, wordt dit getoond in de desktop navigatie i.p.v. de tekst.</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {NAV_ICONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEdit(s => s && ({ ...s, icon: value }))}
                      title={label}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-xs transition-all ${
                        edit.icon === value
                          ? 'border-forest-500 bg-forest-50 text-forest-700'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate w-full text-center leading-tight" style={{ fontSize: '9px' }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* New tab */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setEdit(s => s && ({ ...s, open_in_new_tab: !s.open_in_new_tab }))}
                  className={`w-9 h-5 rounded-full transition-colors shrink-0 ${edit.open_in_new_tab ? 'bg-forest-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mt-0.5 ${edit.open_in_new_tab ? 'translate-x-4.5 ml-0.5' : 'ml-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">Openen in nieuw tabblad</span>
              </label>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEdit(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={saveEdit}
                disabled={saving || !edit.label.trim() || (edit.type === 'external' && !edit.href.trim()) || (edit.type === 'page' && !edit.page_id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
