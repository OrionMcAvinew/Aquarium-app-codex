export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Notifications Center</h2>
      <div className="bg-slate-900 p-4 rounded text-sm space-y-2">
        <p>[ALERT] PO4 above threshold for 3 days.</p>
        <p>[MAINTENANCE] Weekly plan generated.</p>
        <p>[DOSING] Additive inventory low. Forecast depletion in 5 days.</p>
      </div>
    </div>
  );
}
