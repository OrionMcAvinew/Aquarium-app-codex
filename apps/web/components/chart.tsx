'use client';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ParametersChart({ data }: { data: { date: string; no3: number; po4: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="no3" stroke="#06b6d4" />
          <Line type="monotone" dataKey="po4" stroke="#f97316" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
