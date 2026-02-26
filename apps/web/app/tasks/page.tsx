export default function TasksPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Maintenance Tasks</h2>
      <div className="bg-slate-900 p-4 rounded">
        <p>Weekly plan auto-generated from templates.</p>
        <ul className="mt-2 text-sm list-disc pl-4">
          <li>Water change - due Sunday</li>
          <li>Filter sock swap - due Tuesday</li>
          <li>Dosing pump calibration - due first of month</li>
        </ul>
      </div>
    </div>
  );
}
