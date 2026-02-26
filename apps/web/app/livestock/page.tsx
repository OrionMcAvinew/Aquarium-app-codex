export default function LivestockPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Livestock</h2>
      <div className="bg-slate-900 p-4 rounded">
        <p>Lifecycle timeline includes acquisition, transfers, and mortality events.</p>
        <ul className="mt-2 text-sm list-disc pl-4">
          <li>ACQUIRED - Reef Fish 1 added from quarantine</li>
          <li>TRANSFER - Coral frag moved to display</li>
        </ul>
      </div>
    </div>
  );
}
