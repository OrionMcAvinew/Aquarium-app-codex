'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

type Reading = {
  tankId: string;
  equipment: string;
  temperature: number;
  powerDraw: number;
  state: string;
  ts: string;
};

type AlertPayload = {
  tankId: string;
  severity: string;
  message: string;
  ts: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001';

export function SocketTelemetry() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [alert, setAlert] = useState<AlertPayload | null>(null);

  useEffect(() => {
    const socket = io(`${apiBaseUrl}/telemetry`, {
      transports: ['websocket'],
    });

    socket.on('telemetry', (payload: Reading) => setReading(payload));
    socket.on('telemetry-alert', (payload: AlertPayload) => setAlert(payload));

    return () => socket.disconnect();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-cyan-900/10">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Realtime Telemetry</h3>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">Live</span>
      </div>

      {!reading ? (
        <p className="text-sm text-slate-400">Waiting for telemetry stream...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <TelemetryStat label="Equipment" value={reading.equipment.toUpperCase()} />
          <TelemetryStat label="Tank" value={reading.tankId} />
          <TelemetryStat label="Temperature" value={`${reading.temperature}°F`} />
          <TelemetryStat label="Power Draw" value={`${reading.powerDraw} W`} />
          <TelemetryStat label="State" value={reading.state} />
          <TelemetryStat label="Timestamp" value={new Date(reading.ts).toLocaleTimeString()} />
        </div>
      )}

      {alert && <div className="mt-4 rounded-lg bg-red-900/50 p-3 text-xs text-red-100">{alert.message}</div>}
    </div>
  );
}

function TelemetryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}
