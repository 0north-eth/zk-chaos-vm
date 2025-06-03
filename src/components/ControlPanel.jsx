// src/components/ControlPanel.jsx

import React from 'react';

export default function ControlPanel({ params, setParams }) {
  const updateParams = (e) => {
    setParams({ ...params, [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div>
      Observer Strength: <input name="observerStrength" type="range" min="0.01" max="1" step="0.01" value={params.observerStrength} onChange={updateParams} />
      Noise Intensity: <input name="noiseIntensity" type="range" min="0.01" max="0.5" step="0.01" value={params.noiseIntensity} onChange={updateParams} />
    </div>
  );
}
