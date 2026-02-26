import { ParametersChart } from '../components/chart';
import { SocketTelemetry } from '../components/socket-telemetry';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001';

type Tank = { id: string; name: string; volumeGallons: number; tankType: string };
type TanksResponse = { data?: Tank[] };
type StockingRiskResponse = { riskScore?: number; explanations?: string[] };

async function safeFetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${apiBaseUrl}${path}`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function getTanks() {
  return safeFetchJson<TanksResponse>('/v1/tanks?orgId=demo-org&page=1&pageSize=10&sortBy=createdAt&sortOrder=desc', {
    data: [],
  });
}

async function getStockingRisk() {
  return safeFetchJson<StockingRiskResponse>('/v1/tanks/demo-tank/stocking-risk', {
    riskScore: 0,
    explanations: ['API is unreachable. Start services with `pnpm dev` or `make dev`.'],
  });
}

export default async function Page() {
  const [tanksResult, risk] = await Promise.all([getTanks(), getStockingRisk()]);
  const tanks = tanksResult.data ?? [];
  const riskScore = risk.riskScore ?? 0;

  const chartData = [
    { date: 'Mon', no3: 8, po4: 0.08 },
    { date: 'Tue', no3: 9, po4: 0.1 },
    { date: 'Wed', no3: 10, po4: 0.12 },
    { date: 'Thu', no3: 11, po4: 0.21 },
    { date: 'Fri', no3: 12, po4: 0.24 },
    { date: 'Sat', no3: 11, po4: 0.2 },
    { date: 'Sun', no3: 9, po4: 0.16 },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">ReefOps Command Center</p>
            <h2 className="mt-2 text-3xl font-semibold">Operations Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Multi-tenant monitoring for tanks, livestock health, water chemistry, and equipment telemetry.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-xs text-slate-300">
            API endpoint: <span className="font-mono text-cyan-300">{apiBaseUrl}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Managed Tanks" value={String(tanks.length)} hint="Across demo organization" />
        <MetricCard label="Open Alerts" value={riskScore > 60 ? '3' : '1'} hint="Deterministic alert rules" />
        <MetricCard label="Tasks Due Today" value="3" hint="Weekly plan + recurring templates" />
        <MetricCard label="Stocking Risk" value={`${riskScore}/100`} hint="Compatibility and bioload score" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-cyan-900/10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Water Parameter Trends</h3>
            <span className="text-xs text-slate-400">NO3 / PO4 rolling week</span>
          </div>
          <ParametersChart data={chartData} />
        </div>
        <SocketTelemetry />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="mb-2 text-lg font-semibold">Tank Inventory</h3>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-slate-400">
              <tr>
                <th className="px-3 py-2">Tank</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Volume</th>
              </tr>
            </thead>
            <tbody>
              {tanks.length ? (
                tanks.map((tank) => (
                  <tr key={tank.id} className="border-t border-slate-800/90">
                    <td className="px-3 py-2">{tank.name}</td>
                    <td className="px-3 py-2">{tank.tankType}</td>
                    <td className="px-3 py-2">{tank.volumeGallons} gal</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-3 text-slate-400" colSpan={3}>
                    No tank records returned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="mb-2 text-lg font-semibold">Stocking Risk Explanations</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {(risk.explanations ?? []).map((item) => (
            <li key={item} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/20">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-cyan-300">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
