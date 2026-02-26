import { ParametersChart } from '../components/chart';
import { SocketTelemetry } from '../components/socket-telemetry';

async function getTanks() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/tanks?orgId=demo-org&page=1&pageSize=10&sortBy=createdAt&sortOrder=desc`,
    { cache: 'no-store' },
  );
  if (!res.ok) return { data: [] };
  return res.json();
}

async function getStockingRisk() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/tanks/demo-tank/stocking-risk`, {
    cache: 'no-store',
  });
  if (!res.ok) return { riskScore: 0, explanations: [] };
  return res.json();
}

export default async function Page() {
  const tanksResult = await getTanks();
  const tanks = tanksResult.data ?? [];
  const risk = await getStockingRisk();
  const chartData = [
    { date: 'Mon', no3: 8, po4: 0.08 },
    { date: 'Tue', no3: 9, po4: 0.1 },
    { date: 'Wed', no3: 10, po4: 0.12 },
    { date: 'Thu', no3: 11, po4: 0.21 },
    { date: 'Fri', no3: 12, po4: 0.24 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Operations Dashboard</h2>
        <span className="text-xs text-slate-400">Correlation IDs + structured APIs enabled</span>
      </div>
      <section className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded">Tanks: {tanks.length}</div>
        <div className="bg-slate-900 p-4 rounded">Open alerts: 1</div>
        <div className="bg-slate-900 p-4 rounded">Tasks due today: 3</div>
        <div className="bg-slate-900 p-4 rounded">Stocking risk: {risk.riskScore}</div>
      </section>
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 p-4 rounded">
          <h3 className="mb-3">Parameter Trends</h3>
          <ParametersChart data={chartData} />
        </div>
        <SocketTelemetry />
      </section>
      <section className="rounded bg-slate-900 p-4 text-sm">
        <h3 className="font-semibold mb-2">Risk Explanations</h3>
        <ul className="list-disc pl-5 space-y-1">
          {(risk.explanations ?? []).map((e: string) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
