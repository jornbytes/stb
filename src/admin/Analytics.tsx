import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  TrendingUp, Users, Eye, MousePointerClick,
  Globe, Monitor, Smartphone, Tablet,
  ArrowUpRight, ArrowDownRight, Minus,
  ChevronDown,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type PageView = {
  id: string;
  path: string;
  page_title: string;
  referrer: string | null;
  user_agent: string | null;
  session_id: string;
  created_at: string;
};

type Range = '7d' | '30d' | '90d' | 'all';

const RANGE_LABELS: Record<Range, string> = {
  '7d': 'Afgelopen 7 dagen',
  '30d': 'Afgelopen 30 dagen',
  '90d': 'Afgelopen 90 dagen',
  'all': 'Alle tijd',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rangeStart(range: Range): Date | null {
  if (range === 'all') return null;
  const d = new Date();
  d.setDate(d.getDate() - parseInt(range));
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(iso: string, short = false): string {
  const d = new Date(iso);
  if (short) return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function groupByDay(views: PageView[]): { date: string; views: number; sessions: Set<string> }[] {
  const map = new Map<string, { views: number; sessions: Set<string> }>();
  for (const v of views) {
    const day = v.created_at.slice(0, 10);
    if (!map.has(day)) map.set(day, { views: 0, sessions: new Set() });
    const entry = map.get(day)!;
    entry.views++;
    entry.sessions.add(v.session_id);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, views: d.views, sessions: d.sessions }));
}

function detectDevice(ua: string | null): 'mobile' | 'tablet' | 'desktop' {
  if (!ua) return 'desktop';
  const u = ua.toLowerCase();
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(u)) return 'tablet';
  if (/(mobi|android|touch|mini|opera mini|iphone)/.test(u)) return 'mobile';
  return 'desktop';
}

function parseReferrer(ref: string | null): string {
  if (!ref) return 'Direct';
  try {
    const u = new URL(ref);
    const host = u.hostname.replace(/^www\./, '');
    if (host === window.location.hostname) return 'Intern';
    if (host.includes('google')) return 'Google';
    if (host.includes('facebook') || host.includes('fb.com')) return 'Facebook';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('twitter') || host.includes('x.com')) return 'X / Twitter';
    return host;
  } catch {
    return 'Direct';
  }
}

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#15803d' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 120;
  const h = 36;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  const fill = pts.map((p, i) => {
    if (i === 0) return `M${p}`;
    return `L${p}`;
  }).join(' ');
  const area = `${fill} L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={area} fill={color} fillOpacity={0.1} />
      <path d={fill} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({ days }: { days: { date: string; views: number; visitors: number }[] }) {
  const maxV = Math.max(...days.map((d) => d.views), 1);
  const shown = days.slice(-30);

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-40">
        {shown.map((d) => (
          <div key={d.date} className="group flex-1 flex flex-col items-center gap-0.5 relative" title={`${formatDate(d.date, true)}: ${d.views} bezoeken, ${d.visitors} bezoekers`}>
            <div
              className="w-full bg-forest-600 hover:bg-forest-500 rounded-t-sm transition-colors cursor-default relative"
              style={{ height: `${Math.max((d.views / maxV) * 100, 2)}%` }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {d.views}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400">
        {shown.length > 0 && (
          <>
            <span>{formatDate(shown[0].date, true)}</span>
            {shown.length > 2 && <span>{formatDate(shown[Math.floor(shown.length / 2)].date, true)}</span>}
            <span>{formatDate(shown[shown.length - 1].date, true)}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  icon, label, value, sub, trend, sparkData, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  sparkData?: number[];
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {trend > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : trend < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
        {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
      {sparkData && sparkData.length > 1 && (
        <div className="mt-auto">
          <Sparkline data={sparkData} />
        </div>
      )}
    </div>
  );
}

// ─── Top pages table ──────────────────────────────────────────────────────────

function TopPagesTable({ pages }: { pages: { path: string; title: string; views: number; visitors: number }[] }) {
  const max = Math.max(...pages.map((p) => p.views), 1);
  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pagina</th>
            <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Bezoeken</th>
            <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Bezoekers</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.path} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
              <td className="py-2.5 px-3">
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-forest-50 rounded transition-all"
                    style={{ width: `${(p.views / max) * 100}%` }}
                  />
                  <div className="relative flex items-center gap-2">
                    <span className="font-medium text-gray-800 truncate max-w-[280px]" title={p.title}>{p.title || p.path}</span>
                    <span className="text-[11px] text-gray-400 font-mono shrink-0">{p.path}</span>
                  </div>
                </div>
              </td>
              <td className="py-2.5 px-3 text-right font-semibold text-gray-700">{p.views.toLocaleString('nl-NL')}</td>
              <td className="py-2.5 px-3 text-right text-gray-500">{p.visitors.toLocaleString('nl-NL')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-10">Nog geen gegevens</div>
      )}
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="text-sm text-gray-400 py-4 text-center">Geen data</div>;

  let cumAngle = -90;
  const r = 50;
  const cx = 60;
  const cy = 60;

  function polarToCart(angle: number, radius: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const slices = segments.map((seg) => {
    const angle = (seg.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { ...seg, startAngle: start, sweepAngle: angle };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={120} height={120} viewBox="0 0 120 120">
        {slices.map((s, i) => {
          if (s.sweepAngle < 0.5) return null;
          const large = s.sweepAngle > 180 ? 1 : 0;
          const p1 = polarToCart(s.startAngle, r);
          const p2 = polarToCart(s.startAngle + s.sweepAngle, r);
          const d = `M${cx},${cy} L${p1.x},${p1.y} A${r},${r} 0 ${large},1 ${p2.x},${p2.y} Z`;
          return <path key={i} d={d} fill={s.color} className="hover:opacity-80 transition-opacity cursor-default" />;
        })}
        <circle cx={cx} cy={cy} r={32} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="text-sm font-bold fill-gray-800" fontSize={14} fontWeight={700}>{total.toLocaleString('nl-NL')}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-400" fontSize={9}>totaal</text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-600">{s.label}</span>
            <span className="text-xs font-semibold text-gray-800 ml-auto pl-3">{total > 0 ? Math.round((s.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Analytics component ─────────────────────────────────────────────────

export default function Analytics() {
  const [range, setRange] = useState<Range>('30d');
  const [views, setViews] = useState<PageView[]>([]);
  const [prevViews, setPrevViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeOpen, setRangeOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const start = rangeStart(range);
      const prevStart = start ? new Date(start.getTime() - (new Date().getTime() - start.getTime())) : null;

      const DEV_HOSTS = ['localhost', '127.0.0.1', 'bolt.new', 'webcontainer-api.io'];

      let q = supabase.from('page_views').select('*').order('created_at', { ascending: true });
      if (start) q = q.gte('created_at', start.toISOString());
      // exclude dev hostnames (stored or null = old records before hostname column)
      for (const h of DEV_HOSTS) q = q.not('hostname', 'ilike', `%${h}%`);
      const { data } = await q;
      setViews(data ?? []);

      if (prevStart && start) {
        let pq = supabase.from('page_views').select('*')
          .gte('created_at', prevStart.toISOString())
          .lt('created_at', start.toISOString());
        for (const h of DEV_HOSTS) pq = pq.not('hostname', 'ilike', `%${h}%`);
        const { data: prev } = await pq;
        setPrevViews(prev ?? []);
      } else {
        setPrevViews([]);
      }

      setLoading(false);
    }
    load();
  }, [range]);

  // ── Derived stats ──
  const totalViews = views.length;
  const uniqueVisitors = new Set(views.map((v) => v.session_id)).size;
  const prevTotalViews = prevViews.length;
  const prevUniqueVisitors = new Set(prevViews.map((v) => v.session_id)).size;

  function trend(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }

  const pagesPerVisit = uniqueVisitors > 0 ? (totalViews / uniqueVisitors).toFixed(1) : '0';

  // ── Daily data for chart ──
  const daily = groupByDay(views).map((d) => ({
    date: d.date,
    views: d.views,
    visitors: d.sessions.size,
  }));

  const sparkViews = daily.map((d) => d.views);
  const sparkVisitors = daily.map((d) => d.visitors);

  // ── Top pages ──
  const pageMap = new Map<string, { title: string; views: number; sessions: Set<string> }>();
  for (const v of views) {
    const key = v.path;
    if (!pageMap.has(key)) pageMap.set(key, { title: v.page_title, views: 0, sessions: new Set() });
    const e = pageMap.get(key)!;
    e.views++;
    e.sessions.add(v.session_id);
    if (!e.title && v.page_title) e.title = v.page_title;
  }
  const topPages = Array.from(pageMap.entries())
    .map(([path, d]) => ({ path, title: d.title, views: d.views, visitors: d.sessions.size }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  // ── Referrers ──
  const refMap = new Map<string, number>();
  for (const v of views) {
    const ref = parseReferrer(v.referrer);
    refMap.set(ref, (refMap.get(ref) ?? 0) + 1);
  }
  const topRefs = Array.from(refMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const refMax = topRefs[0]?.count ?? 1;

  // ── Devices ──
  const devices = { mobile: 0, tablet: 0, desktop: 0 };
  for (const v of views) {
    devices[detectDevice(v.user_agent)]++;
  }
  const deviceSegments = [
    { label: 'Desktop', value: devices.desktop, color: '#166534' },
    { label: 'Mobiel', value: devices.mobile, color: '#16a34a' },
    { label: 'Tablet', value: devices.tablet, color: '#86efac' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-400 mt-0.5">Bezoekersstatistieken van de website</p>
        </div>
        {/* Range picker */}
        <div className="relative">
          <button
            onClick={() => setRangeOpen((v) => !v)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            {RANGE_LABELS[range]}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {rangeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setRangeOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[180px]">
                {(Object.entries(RANGE_LABELS) as [Range, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => { setRange(val); setRangeOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition ${range === val ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              icon={<Eye className="w-4 h-4 text-forest-700" />}
              label="Paginabezoeken"
              value={totalViews.toLocaleString('nl-NL')}
              trend={prevTotalViews > 0 || totalViews > 0 ? trend(totalViews, prevTotalViews) : undefined}
              sparkData={sparkViews}
              color="bg-green-50"
            />
            <StatTile
              icon={<Users className="w-4 h-4 text-blue-700" />}
              label="Unieke bezoekers"
              value={uniqueVisitors.toLocaleString('nl-NL')}
              trend={prevUniqueVisitors > 0 || uniqueVisitors > 0 ? trend(uniqueVisitors, prevUniqueVisitors) : undefined}
              sparkData={sparkVisitors}
              color="bg-blue-50"
            />
            <StatTile
              icon={<MousePointerClick className="w-4 h-4 text-amber-700" />}
              label="Pagina's per bezoek"
              value={pagesPerVisit}
              color="bg-amber-50"
            />
            <StatTile
              icon={<TrendingUp className="w-4 h-4 text-rose-700" />}
              label="Drukste dag"
              value={daily.length > 0 ? Math.max(...daily.map((d) => d.views)).toLocaleString('nl-NL') : '—'}
              sub={daily.length > 0 ? formatDate(daily.reduce((a, b) => a.views >= b.views ? a : b, daily[0]).date, true) : undefined}
              color="bg-rose-50"
            />
          </div>

          {/* Daily chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900">Bezoeken per dag</h3>
                <p className="text-xs text-gray-400 mt-0.5">Paginabezoeken — {RANGE_LABELS[range]}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 bg-forest-600 rounded-sm" /> Bezoeken</span>
              </div>
            </div>
            {daily.length > 0 ? (
              <BarChart days={daily} />
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400">Nog geen bezoekersdata</div>
            )}
          </div>

          {/* Two-column: top pages + referrers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top pages */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Meest bezochte pagina's</h3>
              <p className="text-xs text-gray-400 mb-5">Per pagina, gesorteerd op bezoeken</p>
              <TopPagesTable pages={topPages} />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              {/* Devices */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-1">Apparaten</h3>
                <p className="text-xs text-gray-400 mb-4">Desktop, mobiel & tablet</p>
                <DonutChart segments={deviceSegments} />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Desktop', value: devices.desktop, icon: <Monitor className="w-4 h-4" /> },
                    { label: 'Mobiel', value: devices.mobile, icon: <Smartphone className="w-4 h-4" /> },
                    { label: 'Tablet', value: devices.tablet, icon: <Tablet className="w-4 h-4" /> },
                  ].map((d) => (
                    <div key={d.label} className="text-center p-2 bg-gray-50 rounded-xl">
                      <div className="flex justify-center text-gray-400 mb-1">{d.icon}</div>
                      <div className="text-sm font-bold text-gray-800">{d.value}</div>
                      <div className="text-[10px] text-gray-400">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Referrers */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Verkeersbronnen</h3>
            </div>
            <p className="text-xs text-gray-400 mb-5">Waar komen bezoekers vandaan</p>
            {topRefs.length > 0 ? (
              <div className="space-y-2.5">
                {topRefs.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 text-sm text-gray-700 font-medium truncate">{r.label}</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-500 rounded-full transition-all duration-500"
                        style={{ width: `${(r.count / refMax) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-semibold text-gray-700">{r.count.toLocaleString('nl-NL')}</div>
                    <div className="w-10 text-right text-xs text-gray-400">
                      {totalViews > 0 ? Math.round((r.count / totalViews) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 py-6 text-center">Nog geen data over verkeersbronnen</div>
            )}
          </div>

          {/* Recent visits */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Recente bezoeken</h3>
            <p className="text-xs text-gray-400 mb-5">Laatste 50 paginabezoeken</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pagina</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Bron</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Apparaat</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tijdstip</th>
                  </tr>
                </thead>
                <tbody>
                  {[...views].reverse().slice(0, 50).map((v) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-800 truncate max-w-[200px]">{v.page_title || v.path}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{v.path}</div>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs hidden md:table-cell">{parseReferrer(v.referrer)}</td>
                      <td className="py-2 px-3 text-gray-500 text-xs hidden lg:table-cell capitalize">{detectDevice(v.user_agent)}</td>
                      <td className="py-2 px-3 text-right text-xs text-gray-400 whitespace-nowrap">
                        {new Date(v.created_at).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {views.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-10">Nog geen bezoeken geregistreerd</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
