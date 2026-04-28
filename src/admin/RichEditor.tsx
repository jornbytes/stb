import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, Link, Quote, Minus,
  Heading1, Heading2, Heading3, Columns2, Columns3, Image,
  Type, ChevronUp, ChevronDown, Trash2, Plus,
  AlignLeft, AlignCenter, AlignRight, PanelLeftOpen, PanelRightOpen,
  GripVertical,
} from 'lucide-react';
import { ImagePickerModal } from './ImagePicker';

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'columns2'
  | 'columns3'
  | 'media_left'   // image left, text right
  | 'media_right'  // text left, image right
  | 'image'
  | 'quote'
  | 'divider';

interface Block {
  id: string;
  type: BlockType;
  content?: string;
  columns?: string[];
  mediaSrc?: string;
  mediaAlt?: string;
  mediaPosition?: string;
  mediaFit?: 'cover' | 'contain';
  align?: 'left' | 'center' | 'right';
}

function uid() { return Math.random().toString(36).slice(2, 10); }

function makeBlock(type: BlockType): Block {
  if (type === 'columns2') return { id: uid(), type, columns: ['', ''] };
  if (type === 'columns3') return { id: uid(), type, columns: ['', '', ''] };
  if (type === 'media_left' || type === 'media_right') return { id: uid(), type, mediaSrc: '', mediaAlt: '', content: '' };
  if (type === 'image') return { id: uid(), type, mediaSrc: '', mediaAlt: '' };
  if (type === 'divider') return { id: uid(), type };
  return { id: uid(), type, content: '', align: 'left' };
}

// ─── Serialisation ────────────────────────────────────────────────────────────

function serialise(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

function deserialise(value: string): Block[] {
  if (!value) return [makeBlock('paragraph')];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Legacy HTML fallback
    return [{ id: uid(), type: 'paragraph', content: value, align: 'left' }];
  }
  return [makeBlock('paragraph')];
}

// ─── Uncontrolled rich-text cell ──────────────────────────────────────────────
// Uses the DOM as source of truth. We only set innerHTML on mount or when the
// block ID changes (i.e. a brand-new block). This prevents cursor jumps.

interface CellProps {
  blockId: string;
  html: string;
  placeholder?: string;
  onChange: (html: string) => void;
  className?: string;
  singleLine?: boolean;
}

function Cell({ blockId, html, placeholder, onChange, className = '', singleLine }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mountedId = useRef<string>('');

  // Only set innerHTML when it's a brand-new block (new id), not on every render
  useEffect(() => {
    if (!ref.current) return;
    if (mountedId.current === blockId) return;
    mountedId.current = blockId;
    ref.current.innerHTML = html;
  }, [blockId, html]);

  function flush() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function exec(cmd: string, value?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, value ?? undefined);
    flush();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (singleLine && e.key === 'Enter') { e.preventDefault(); return; }
    // Bold/italic shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); exec('bold'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); exec('italic'); }
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={flush}
      onBlur={flush}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      className={`focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none
        [&_strong]:font-bold [&_em]:italic [&_u]:underline
        [&_a]:text-forest-600 [&_a]:underline
        ${className}`}
    />
  );
}

// ─── Inline format toolbar ────────────────────────────────────────────────────

function execFormat(cmd: string, val?: string) {
  document.execCommand(cmd, false, val ?? undefined);
}

function InlineBar() {
  function link() {
    const url = prompt('URL:');
    if (url) execFormat('createLink', url);
  }
  return (
    <div className="flex items-center gap-0.5">
      {[
        { title: 'Vet (Ctrl+B)', icon: <Bold className="w-3.5 h-3.5" />, cmd: 'bold' },
        { title: 'Cursief (Ctrl+I)', icon: <Italic className="w-3.5 h-3.5" />, cmd: 'italic' },
        { title: 'Onderstrepen', icon: <Underline className="w-3.5 h-3.5" />, cmd: 'underline' },
      ].map((t) => (
        <button key={t.cmd} type="button" title={t.title}
          onMouseDown={(e) => { e.preventDefault(); execFormat(t.cmd); }}
          className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition">
          {t.icon}
        </button>
      ))}
      <div className="w-px h-4 bg-gray-200 mx-0.5" />
      <button type="button" title="Link" onMouseDown={(e) => { e.preventDefault(); link(); }}
        className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition">
        <Link className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Block picker modal ───────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'paragraph', label: 'Alinea', icon: <Type className="w-4 h-4" />, desc: 'Gewone tekst' },
  { type: 'heading1', label: 'Kop 1', icon: <Heading1 className="w-4 h-4" />, desc: 'Paginatitel kop' },
  { type: 'heading2', label: 'Kop 2', icon: <Heading2 className="w-4 h-4" />, desc: 'Grote kop' },
  { type: 'heading3', label: 'Kop 3', icon: <Heading3 className="w-4 h-4" />, desc: 'Middelgrote kop' },
  { type: 'columns2', label: '2 kolommen', icon: <Columns2 className="w-4 h-4" />, desc: 'Twee tekstvakken naast elkaar' },
  { type: 'columns3', label: '3 kolommen', icon: <Columns3 className="w-4 h-4" />, desc: 'Drie tekstvakken' },
  { type: 'media_left', label: 'Afbeelding links', icon: <PanelLeftOpen className="w-4 h-4" />, desc: 'Foto links, tekst rechts' },
  { type: 'media_right', label: 'Afbeelding rechts', icon: <PanelRightOpen className="w-4 h-4" />, desc: 'Tekst links, foto rechts' },
  { type: 'image', label: 'Afbeelding', icon: <Image className="w-4 h-4" />, desc: 'Volledige breedte foto' },
  { type: 'quote', label: 'Citaat', icon: <Quote className="w-4 h-4" />, desc: 'Opvallend citaat' },
  { type: 'divider', label: 'Scheidingslijn', icon: <Minus className="w-4 h-4" />, desc: 'Horizontale lijn' },
];

function BlockPicker({ onPick, onClose }: { onPick: (t: BlockType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[420px] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold text-gray-900 mb-3">Blok invoegen</div>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_TYPES.map((bt) => (
            <button key={bt.type} onClick={() => { onPick(bt.type); onClose(); }}
              className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-forest-400 hover:bg-forest-50 text-left transition group">
              <span className="text-gray-400 group-hover:text-forest-600 transition mt-0.5 shrink-0">{bt.icon}</span>
              <div>
                <div className="text-xs font-semibold text-gray-800">{bt.label}</div>
                <div className="text-[11px] text-gray-400 leading-tight">{bt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Focal point grid ─────────────────────────────────────────────────────────

const FOCAL_POINTS = [
  { label: 'Links boven',   value: 'left top' },
  { label: 'Midden boven',  value: 'center top' },
  { label: 'Rechts boven',  value: 'right top' },
  { label: 'Links midden',  value: 'left center' },
  { label: 'Midden',        value: 'center' },
  { label: 'Rechts midden', value: 'right center' },
  { label: 'Links onder',   value: 'left bottom' },
  { label: 'Midden onder',  value: 'center bottom' },
  { label: 'Rechts onder',  value: 'right bottom' },
];

function ImageFocalPicker({ src, position, onChange }: {
  src: string; position: string; onChange: (v: string) => void;
}) {
  const current = FOCAL_POINTS.find(p => p.value === position) ?? FOCAL_POINTS[4];
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
      <div
        className="w-full h-16 bg-cover transition-all duration-300"
        style={{ backgroundImage: `url(${src})`, backgroundPosition: position || 'center' }}
      />
      <div className="grid grid-cols-3 gap-px bg-gray-200 border-t border-gray-200">
        {FOCAL_POINTS.map((pt) => (
          <button
            key={pt.value}
            type="button"
            title={pt.label}
            onClick={() => onChange(pt.value)}
            className={`h-7 flex items-center justify-center transition-colors ${
              pt.value === position ? 'bg-forest-700' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${pt.value === position ? 'bg-white' : 'bg-gray-300'}`} />
          </button>
        ))}
      </div>
      <div className="px-2 py-1 text-[10px] text-gray-400">{current.label}</div>
    </div>
  );
}

// ─── Image input (uses shared ImagePicker) ───────────────────────────────────

function ImageInput({ src, alt, position, fit, onSrcChange, onAltChange, onPositionChange, onFitChange }: {
  src: string; alt: string; position: string; fit: 'cover' | 'contain';
  onSrcChange: (v: string) => void;
  onAltChange: (v: string) => void;
  onPositionChange: (v: string) => void;
  onFitChange: (v: 'cover' | 'contain') => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-2">
      {src ? (
        <>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img src={src} alt={alt}
              className={`w-full ${fit === 'contain' ? 'object-contain max-h-96 bg-gray-50' : 'object-cover max-h-48'}`}
              style={fit === 'cover' ? { objectPosition: position || 'center' } : undefined}
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
            <div className="flex gap-2 px-3 py-2 bg-gray-50 border-t border-gray-100">
              <button type="button" onClick={() => setShowPicker(true)}
                className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition">
                Wijzigen
              </button>
              <button type="button" onClick={() => onSrcChange('')}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition">
                Verwijderen
              </button>
            </div>
          </div>
          {/* Fit toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            <button type="button" onClick={() => onFitChange('contain')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition ${fit === 'contain' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              Volledig tonen
            </button>
            <button type="button" onClick={() => onFitChange('cover')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition border-l border-gray-200 ${fit === 'cover' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              Uitsnede
            </button>
          </div>
          {fit === 'cover' && (
            <ImageFocalPicker src={src} position={position || 'center'} onChange={onPositionChange} />
          )}
        </>
      ) : (
        <button type="button" onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-6 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition">
          <Image className="w-5 h-5" />
          Afbeelding kiezen
        </button>
      )}
      <input type="text" value={alt} onChange={(e) => onAltChange(e.target.value)}
        placeholder="Alt-tekst (optioneel)"
        className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 transition" />
      {showPicker && <ImagePickerModal onSelect={onSrcChange} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

// ─── Single block row ─────────────────────────────────────────────────────────

interface BlockRowProps {
  block: Block;
  index: number;
  total: number;
  onChange: (b: Block) => void;
  onMove: (from: number, to: number) => void;
  onDelete: (id: string) => void;
  onInsertAfter: (index: number) => void;
}

// Types that can be quickly switched between in the block header
const TEXT_BLOCK_TYPES: BlockType[] = ['paragraph', 'heading1', 'heading2', 'heading3', 'quote'];

function BlockRow({ block, index, total, onChange, onMove, onDelete, onInsertAfter }: BlockRowProps) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  function upd(patch: Partial<Block>) { onChange({ ...block, ...patch }); }
  function updCol(i: number, html: string) {
    const cols = [...(block.columns ?? [])];
    cols[i] = html;
    upd({ columns: cols });
  }

  // ── per-block content ──

  let body: React.ReactNode;

  if (block.type === 'divider') {
    body = <hr className="border-gray-200 my-2" />;

  } else if (block.type === 'image') {
    body = (
      <ImageInput
        src={block.mediaSrc ?? ''} alt={block.mediaAlt ?? ''} position={block.mediaPosition ?? 'center'} fit={block.mediaFit ?? 'cover'}
        onSrcChange={(v) => upd({ mediaSrc: v })}
        onAltChange={(v) => upd({ mediaAlt: v })}
        onPositionChange={(v) => upd({ mediaPosition: v })}
        onFitChange={(v) => upd({ mediaFit: v })}
      />
    );

  } else if (block.type === 'media_left' || block.type === 'media_right') {
    const imgBox = (
      <div className="shrink-0 w-2/5">
        <ImageInput
          src={block.mediaSrc ?? ''} alt={block.mediaAlt ?? ''} position={block.mediaPosition ?? 'center'} fit={block.mediaFit ?? 'cover'}
          onSrcChange={(v) => upd({ mediaSrc: v })}
          onAltChange={(v) => upd({ mediaAlt: v })}
          onPositionChange={(v) => upd({ mediaPosition: v })}
          onFitChange={(v) => upd({ mediaFit: v })}
        />
      </div>
    );
    const textBox = (
      <div className="flex-1 min-w-0 border border-dashed border-gray-200 rounded-xl p-3">
        <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Tekst</div>
        <Cell
          blockId={block.id} html={block.content ?? ''} placeholder="Typ hier..."
          onChange={(v) => upd({ content: v })}
          className="text-sm text-gray-700 leading-relaxed min-h-[80px]"
        />
      </div>
    );
    body = (
      <div className="flex gap-4">
        {block.type === 'media_left' ? <>{imgBox}{textBox}</> : <>{textBox}{imgBox}</>}
      </div>
    );

  } else if (block.type === 'quote') {
    body = (
      <div className="border-l-4 border-forest-400 pl-4 py-2 bg-forest-50/50 rounded-r-xl">
        <Cell
          blockId={block.id} html={block.content ?? ''} placeholder="Citaat..."
          onChange={(v) => upd({ content: v })}
          className="text-forest-800 italic text-sm leading-relaxed min-h-[40px]"
        />
      </div>
    );

  } else if (block.type === 'columns2') {
    body = (
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((ci) => (
          <div key={ci} className="border border-dashed border-gray-200 rounded-xl p-3 hover:border-gray-300 transition">
            <div className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Kolom {ci + 1}</div>
            <Cell
              blockId={`${block.id}-${ci}`}
              html={(block.columns ?? ['', ''])[ci]}
              placeholder="Typ hier..."
              onChange={(h) => updCol(ci, h)}
              className="text-sm text-gray-700 leading-relaxed min-h-[60px]"
            />
          </div>
        ))}
      </div>
    );

  } else if (block.type === 'columns3') {
    body = (
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((ci) => (
          <div key={ci} className="border border-dashed border-gray-200 rounded-xl p-3 hover:border-gray-300 transition">
            <div className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Kolom {ci + 1}</div>
            <Cell
              blockId={`${block.id}-${ci}`}
              html={(block.columns ?? ['', '', ''])[ci]}
              placeholder="Typ hier..."
              onChange={(h) => updCol(ci, h)}
              className="text-sm text-gray-700 leading-relaxed min-h-[60px]"
            />
          </div>
        ))}
      </div>
    );

  } else {
    // paragraph / heading1 / heading2 / heading3
    const textCls = block.type === 'heading1'
      ? 'text-3xl font-bold text-gray-900 min-h-[40px]'
      : block.type === 'heading2'
      ? 'text-xl font-bold text-gray-900 min-h-[36px]'
      : block.type === 'heading3'
      ? 'text-base font-semibold text-gray-800 min-h-[32px]'
      : 'text-sm text-gray-700 leading-relaxed min-h-[48px]';
    const ph = block.type === 'heading1' ? 'Kop 1...' : block.type === 'heading2' ? 'Kop 2...' : block.type === 'heading3' ? 'Kop 3...' : 'Typ hier...';

    body = (
      <div>
        {/* Inline format bar — only for paragraph/headings */}
        <div className="flex items-center justify-between mb-1.5">
          <InlineBar />
          {block.type === 'paragraph' && (
            <div className="flex items-center gap-0.5">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button key={a} type="button" title={`Uitlijnen ${a}`}
                  onMouseDown={(e) => { e.preventDefault(); upd({ align: a }); }}
                  className={`p-1 rounded transition ${block.align === a ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:bg-gray-100'}`}>
                  {a === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : a === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <Cell
          blockId={block.id} html={block.content ?? ''} placeholder={ph}
          onChange={(v) => upd({ content: v })}
          className={`${textCls} text-${block.align ?? 'left'}`}
        />
      </div>
    );
  }

  const canSwitchType = TEXT_BLOCK_TYPES.includes(block.type);

  return (
    <div className="relative group/block">
      {/* Block body — controls live inside so no hover gap */}
      <div className="bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition shadow-sm">

        {/* Block header bar */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-gray-50">
          {/* Left: type label / switcher */}
          <div className="relative">
            {canSwitchType ? (
              <>
                <button
                  type="button"
                  onClick={() => setTypeMenuOpen((v) => !v)}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 uppercase tracking-wider font-medium transition rounded px-1 py-0.5 hover:bg-gray-100"
                >
                  <GripVertical className="w-3 h-3" />
                  {BLOCK_TYPES.find((b) => b.type === block.type)?.label ?? block.type}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {typeMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setTypeMenuOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                      {TEXT_BLOCK_TYPES.map((t) => {
                        const bt = BLOCK_TYPES.find((b) => b.type === t)!;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => { upd({ type: t }); setTypeMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition ${block.type === t ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            <span className="text-gray-400">{bt.icon}</span>
                            {bt.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-wider font-medium px-1">
                <GripVertical className="w-3 h-3" />
                {BLOCK_TYPES.find((b) => b.type === block.type)?.label ?? block.type}
              </span>
            )}
          </div>

          {/* Right: move + delete controls — always visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity">
            <button
              disabled={index === 0}
              onClick={() => onMove(index, index - 1)}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 transition"
              title="Omhoog"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={index === total - 1}
              onClick={() => onMove(index, index + 1)}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 transition"
              title="Omlaag"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-gray-200 mx-0.5" />
            <button
              onClick={() => onDelete(block.id)}
              className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Verwijderen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Block content */}
        <div className="p-3">
          {body}
        </div>
      </div>

      {/* Insert below button */}
      <button
        onClick={() => onInsertAfter(index)}
        className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-400 hover:text-gray-700 hover:border-gray-500 shadow-sm opacity-0 group-hover/block:opacity-100 transition-opacity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

interface EditorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function RichEditor({ value, onChange }: EditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => deserialise(value));
  const [pickerAt, setPickerAt] = useState<number | null>(null);

  // Only re-deserialise when the editor is first mounted (value from DB).
  // After that the component owns the state.
  const initialised = useRef(false);
  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      setBlocks(deserialise(value));
    }
  }, [value]);

  const commit = useCallback((next: Block[]) => {
    setBlocks(next);
    onChange(serialise(next));
  }, [onChange]);

  function change(i: number, b: Block) { const n = [...blocks]; n[i] = b; commit(n); }
  function move(from: number, to: number) {
    const n = [...blocks];
    const [item] = n.splice(from, 1);
    n.splice(to, 0, item);
    commit(n);
  }
  function del(id: string) {
    const n = blocks.filter((b) => b.id !== id);
    commit(n.length ? n : [makeBlock('paragraph')]);
  }
  function insert(type: BlockType, afterIndex: number) {
    const n = [...blocks];
    n.splice(afterIndex + 1, 0, makeBlock(type));
    commit(n);
    setPickerAt(null);
  }
  function addTop(type: BlockType) { insert(type, blocks.length - 1); }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider mr-1.5">Invoegen</span>
        {BLOCK_TYPES.map((bt) => (
          <button key={bt.type} type="button" title={bt.label}
            onMouseDown={(e) => { e.preventDefault(); addTop(bt.type); }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 text-xs transition">
            {bt.icon}
            <span className="hidden md:inline">{bt.label}</span>
          </button>
        ))}
      </div>

      {/* Blocks */}
      <div className="border border-gray-200 rounded-b-xl bg-[#f8f9fa] p-4 pl-12 space-y-4 min-h-64">
        {blocks.map((block, i) => (
          <BlockRow
            key={block.id}
            block={block}
            index={i}
            total={blocks.length}
            onChange={(b) => change(i, b)}
            onMove={move}
            onDelete={del}
            onInsertAfter={(idx) => setPickerAt(idx)}
          />
        ))}
      </div>

      {pickerAt !== null && (
        <BlockPicker onPick={(t) => insert(t, pickerAt)} onClose={() => setPickerAt(null)} />
      )}
    </div>
  );
}

// ─── Public renderer ──────────────────────────────────────────────────────────

export function renderBlocks(value: string): React.ReactNode {
  const blocks = deserialise(value);
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        if (block.type === 'divider') return <hr key={block.id} className="border-gray-200" />;

        if (block.type === 'image') {
          return block.mediaSrc ? (
            <figure key={block.id}>
              <img
                src={block.mediaSrc}
                alt={block.mediaAlt ?? ''}
                className={`w-full rounded-2xl ${block.mediaFit === 'contain' ? 'object-contain' : 'object-cover max-h-[480px]'}`}
                style={block.mediaFit !== 'contain' ? { objectPosition: block.mediaPosition || 'center' } : undefined}
              />
              {block.mediaAlt && <figcaption className="text-center text-xs text-gray-400 mt-2">{block.mediaAlt}</figcaption>}
            </figure>
          ) : null;
        }

        if (block.type === 'media_left' || block.type === 'media_right') {
          const img = block.mediaSrc ? (
            <img
              src={block.mediaSrc}
              alt={block.mediaAlt ?? ''}
              className={`w-full rounded-xl ${block.mediaFit === 'contain' ? 'object-contain' : 'object-cover h-full max-h-72'}`}
              style={block.mediaFit !== 'contain' ? { objectPosition: block.mediaPosition || 'center' } : undefined}
            />
          ) : null;
          const txt = <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: block.content ?? '' }} />;
          return (
            <div key={block.id} className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              {block.type === 'media_left' ? <>{img}{txt}</> : <>{txt}{img}</>}
            </div>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={block.id} className="border-l-4 border-forest-400 pl-5 py-2 bg-forest-50 rounded-r-2xl italic text-forest-800">
              <div dangerouslySetInnerHTML={{ __html: block.content ?? '' }} />
            </blockquote>
          );
        }

        if (block.type === 'columns2') {
          return (
            <div key={block.id} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {(block.columns ?? ['', '']).map((col, i) => (
                <div key={i} className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: col }} />
              ))}
            </div>
          );
        }

        if (block.type === 'columns3') {
          return (
            <div key={block.id} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(block.columns ?? ['', '', '']).map((col, i) => (
                <div key={i} className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: col }} />
              ))}
            </div>
          );
        }

        if (block.type === 'heading1') {
          return <h1 key={block.id} className="text-4xl font-bold text-gray-900 mt-10 mb-3 font-display uppercase tracking-tight" dangerouslySetInnerHTML={{ __html: block.content ?? '' }} />;
        }
        if (block.type === 'heading2') {
          return <h2 key={block.id} className="text-2xl font-bold text-gray-900 mt-8 mb-2" dangerouslySetInnerHTML={{ __html: block.content ?? '' }} />;
        }
        if (block.type === 'heading3') {
          return <h3 key={block.id} className="text-lg font-semibold text-gray-800 mt-5 mb-1" dangerouslySetInnerHTML={{ __html: block.content ?? '' }} />;
        }
        return (
          <div key={block.id} className={`prose prose-sm max-w-none text-${block.align ?? 'left'}`} dangerouslySetInnerHTML={{ __html: block.content ?? '' }} />
        );
      })}
    </div>
  );
}
