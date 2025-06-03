// src/components/DataExporter.jsx
import React from 'react';
import { saveAs } from 'file-saver';

export default function DataExporter({ simulationData }) {
  // Convert simulationData array to CSV string
  const createCSV = () => {
    if (!simulationData || simulationData.length === 0) return '';
    const header = 'timestep,X,Y,Z\n';
    const rows = simulationData
      .map((d) => `${d.timestep},${d.X.toFixed(4)},${d.Y.toFixed(4)},${d.Z.toFixed(4)}`)
      .join('\n');
    return header + rows;
  };

  const downloadCSV = () => {
    const csvData = createCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'zxyt_simulation_data.csv');
  };

  return (
    <button
      onClick={downloadCSV}
      style={{
        margin: '10px',
        padding: '8px 16px',
        backgroundColor: '#444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Download CSV
    </button>
  );
}
