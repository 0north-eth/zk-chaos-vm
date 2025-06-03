// src/components/DataChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DataChart({ simulationData }) {
  // Convert simulationData to chart‐friendly array:
  // e.g. [{t:0, X:..., Y:..., Z:...}, {t:1, X:..., Y:..., Z:...}, ...]
  const chartData = simulationData.map((d) => ({
    t: d.timestep,
    X: Number(d.X.toFixed(2)),
    Y: Number(d.Y.toFixed(2)),
    Z: Number(d.Z.toFixed(2)),
  }));

  return (
    <div style={{ width: '100%', height: 200, backgroundColor: '#111', padding: '10px', marginTop: '10px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="t" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#555' }} itemStyle={{ color: '#fff' }} />
          <Legend wrapperStyle={{ color: '#fff' }} />
          <Line type="monotone" dataKey="X" stroke="#ff0000" dot={false} />
          <Line type="monotone" dataKey="Y" stroke="#0000ff" dot={false} />
          <Line type="monotone" dataKey="Z" stroke="#00ff00" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
