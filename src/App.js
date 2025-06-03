// src/App.js

import React, { useState, useEffect } from 'react';
import Visualization3D from './components/Visualization3d';  // Be sure the filename is exact (capital D)
import ChartWithWindow from './components/ChartWithWindow';
import DataExporter from './components/DataExporter';
import { runSimulation } from './utils/simulation';
import './styles.css';

function App() {
  const [params, setParams] = useState({
    observerStrength: 0.1,
    noiseIntensity:   0.05,
    timeRate:         0.5,   // Controls pulse + arc speed, not underlying math
  });

  // labelMode: "cycle" | "Z" | "all"
  const [labelMode, setLabelMode] = useState('cycle');

  const [simulationData, setSimulationData] = useState([]);
  const [showChart, setShowChart] = useState(true);

  // Re-run the simulation whenever observerStrength or noiseIntensity change
  useEffect(() => {
    const newSim = runSimulation({
      timesteps: 500,
      observerStrength: params.observerStrength,
      noiseIntensity:   params.noiseIntensity,
      initialX: 0.6,
      initialY: 0.4,
      timeRate: params.timeRate  // passed in, even though simulation ignores it
    });
    setSimulationData(newSim);
  }, [params.observerStrength, params.noiseIntensity]);

  return (
    <div className="App" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* ───── Control Panel ───── */}
      <div className="control-panel" style={{
          zIndex: 10,
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '6px'
        }}>
        {/* Observer Strength Slider */}
        <label style={{ marginRight: '20px', color: '#fff' }}>
          Observer Strength: {params.observerStrength.toFixed(2)}
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={params.observerStrength}
            onChange={(e) =>
              setParams({ ...params, observerStrength: parseFloat(e.target.value) })
            }
          />
        </label>

        {/* Noise Intensity Slider */}
        <label style={{ marginRight: '20px', color: '#fff' }}>
          Noise Intensity: {params.noiseIntensity.toFixed(2)}
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={params.noiseIntensity}
            onChange={(e) =>
              setParams({ ...params, noiseIntensity: parseFloat(e.target.value) })
            }
          />
        </label>

        {/* Time Rate Slider */}
        <label style={{ marginRight: '20px', color: '#fff' }}>
          Time Rate: {params.timeRate.toFixed(2)}
          <input
            type="range"
            min="0.01"
            max="2.0"
            step="0.01"
            value={params.timeRate}
            onChange={(e) =>
              setParams({ ...params, timeRate: parseFloat(e.target.value) })
            }
          />
        </label>

        {/* Label‐Mode Buttons */}
        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          <button
            onClick={() => setLabelMode('cycle')}
            style={{
              marginRight: '8px',
              padding: '4px 8px',
              backgroundColor: labelMode === 'cycle' ? '#00aaff' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cycle Labels
          </button>
          <button
            onClick={() => setLabelMode('Z')}
            style={{
              marginRight: '8px',
              padding: '4px 8px',
              backgroundColor: labelMode === 'Z' ? '#00aaff' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Z-Only Labels
          </button>
          <button
            onClick={() => setLabelMode('all')}
            style={{
              padding: '4px 8px',
              backgroundColor: labelMode === 'all' ? '#00aaff' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            All Labels
          </button>
        </div>

        <DataExporter simulationData={simulationData} />

        <label style={{ marginLeft: '20px', color: '#fff' }}>
          <input
            type="checkbox"
            checked={showChart}
            onChange={() => setShowChart(!showChart)}
            style={{ marginRight: '8px' }}
          />
          Show Chart
        </label>
      </div>

      {/* ───── Numeric HUD Overlay ───── */}
      <div
        id="numeric-hud"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'white',
          fontFamily: 'monospace',
          fontSize: 14,
          zIndex: 10,
          textAlign: 'right',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '6px 10px',
          borderRadius: '4px'
        }}
      >
        {simulationData.length > 0 ? (
          (() => {
            // Find the approximate “current frame index” by elapsed time
            const nowSec = performance.now() / 1000;
            const desiredFPS = 50; // Same as in Visualization3D
            const totalFrames = simulationData.length;
            const frameIndex = Math.floor(nowSec * desiredFPS) % totalFrames;
            const last = simulationData[frameIndex];
            return (
              <>
                X: {last.X.toFixed(2)}<br />
                Y: {last.Y.toFixed(2)}<br />
                Z: {last.Z.toFixed(2)} → {last.direction}
              </>
            );
          })()
        ) : (
          <>Simulating…</>
        )}
      </div>

      {/* ───── 3D Visualization ───── */}
      <div className="visualization-container" style={{ width: '100%', height: '100%' }}>
        <Visualization3D
          simulationData={simulationData}
          timeRate={params.timeRate}
          labelMode={labelMode} 
        />
      </div>

      {/* ───── Conditional Chart ───── */}
      {showChart && (
        <div className="chart-container" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px', background: '#111' }}>
          <ChartWithWindow simulationData={simulationData} />
        </div>
      )}
    </div>
  );
}

export default App;
