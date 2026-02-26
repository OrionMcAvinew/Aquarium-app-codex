export default function WaterTestsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Water Tests</h2>
      <form className="grid md:grid-cols-3 gap-3 bg-slate-900 p-4 rounded">
        <input className="bg-slate-800 p-2 rounded" placeholder="NO3" />
        <input className="bg-slate-800 p-2 rounded" placeholder="PO4" />
        <input className="bg-slate-800 p-2 rounded" placeholder="Alk" />
        <button className="bg-cyan-600 rounded p-2">Log Test</button>
      </form>
      <div className="bg-slate-900 p-4 rounded text-sm">CSV import is available via API endpoint: <code>/v1/tanks/:tankId/water-tests/import</code>.</div>
    </div>
  );
}
