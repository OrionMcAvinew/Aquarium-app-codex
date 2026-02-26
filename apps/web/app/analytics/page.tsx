export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Parameter Analytics</h2>
      <div className="rounded bg-slate-900 p-4 text-sm space-y-2">
        <p>Moving averages and trend analysis are available in API helpers.</p>
        <p>Alert evaluation endpoint: <code>/v1/alerts/evaluate</code>.</p>
        <p>Smart suggestions endpoint: <code>/v1/suggestions</code>.</p>
      </div>
    </div>
  );
}
