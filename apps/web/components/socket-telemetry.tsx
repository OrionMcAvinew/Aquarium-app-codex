'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

type Reading = {
  tankId: string;
  temperature: number;
  heaterOn: boolean;
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

export function SocketTelemetry() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [alert, setAlert] = useState<AlertPayload | null>(null);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/telemetry`, {
      transports: ['websocket'],
    });
    socket.on('telemetry', (payload: Reading) => setReading(payload));
    socket.on('telemetry-alert', (payload: AlertPayload) => setAlert(payload));
    return () => socket.disconnect();
  }, []);

  return (
    <div className="bg-slate-900 rounded p-4 space-y-2">
      <h3 className="font-semibold mb-2">Realtime Telemetry</h3>
      {!reading ? (
        <p className="text-sm text-slate-400">Waiting for telemetry...</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>Temp: {reading.temperature}°F</p>
          <p>Power: {reading.powerDraw}W</p>
          <p>Heater: {reading.heaterOn ? 'ON' : 'OFF'}</p>
          <p>State: {reading.state}</p>
          <p className="col-span-2">Timestamp: {new Date(reading.ts).toLocaleTimeString()}</p>
        </div>
      )}
      {alert && (
        <div className="rounded bg-red-900/60 p-2 text-xs text-red-100">{alert.message}</div>
      )}
    </div>
  );
}
