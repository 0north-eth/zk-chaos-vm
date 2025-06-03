// src/components/ChartWithWindow.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ChartWithWindow({ simulationData }) {
  // We’ll show only a subset [start, end] of the data
  const total = simulationData.length;
  const [startIndex, setStartIndex] = useState(0);
  const [windowSize, setWindowSize] = useState(Math.floor(total / 5) || 1);

  // Data slice to display
  const slice = simulationData.slice(startIndex, startIndex + windowSize);

  // Chart‐formatted data
  const chartData = slice.map(d => ({
    t: d.timestep,
    X: Number(d.X.toFixed(2)),
    Y: Number(d.Y.toFixed(2)),
    Z: Number(d.Z.toFixed(2)),
  }));

  // When user drags the window slider, update startIndex
  const onWindowChange = (e) => {
    const newStart = parseInt(e.target.value, 10);
    setStartIndex(newStart);
  };

  // When user changes window size, update windowSize
  const onSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setWindowSize(newSize);
  };

  return (
    <div style={{ width: '100%', padding: '10px', backgroundColor: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <label>
          Window Start: {startIndex}
          <input
            type="range"
            min="0"
            max={Math.max(0, total - windowSize)}
            value={startIndex}
            onChange={onWindowChange}
            style={{ marginLeft: '8px', width: '200px' }}
          />
        </label>
        <label>
          Window Size: {windowSize}
          <input
            type="range"
            min="1"
            max={total || 1}
            value={windowSize}
            onChange={onSizeChange}
            style={{ marginLeft: '8px', width: '200px' }}
          />
        </label>
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="t" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#555' }}
                     itemStyle={{ color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="X" stroke="#ff0000" dot={false} />
            <Line type="monotone" dataKey="Y" stroke="#0000ff" dot={false} />
            <Line type="monotone" dataKey="Z" stroke="#00ff00" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
