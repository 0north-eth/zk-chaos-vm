// src/utils/simulation.js

/**
 * runSimulation:
 *   - timesteps: number of frames to simulate (default 500).
 *   - observerStrength: the ± value that Z takes each step.
 *   - noiseIntensity: the standard‐deviation‐equivalent for the Gaussian noise term.
 *   - initialX, initialY: starting values for X and Y.
 *
 * Returns an array of length `timesteps`, where each entry is:
 *    { X: <float>, Y: <float>, Z: <float>, direction: 'X'|'Y' }
 *
 * `timeRate` is intentionally NOT used here, because `timeRate` only
 * affects how fast the rings/arc phase/ camera orbit move in the 3D view.
 */
export function runSimulation({
  timesteps = 500,
  observerStrength = 0.1,
  noiseIntensity = 0.05,
  initialX = 0.6,
  initialY = 0.4,
  // We accept timeRate here so that App.js can pass it in, 
  // but it does not change the underlying X/Y/Z values:
  timeRate = 1.0  
}) {
  const simData = new Array(timesteps);
  const x_vals = new Array(timesteps).fill(0);
  const y_vals = new Array(timesteps).fill(0);
  const z_vals = new Array(timesteps).fill(0);

  // Initialize X and Y:
  x_vals[0] = initialX;
  y_vals[0] = initialY;
  // For frame 0, Z = 0 (or you could set Z = ±observerStrength if you prefer).
  z_vals[0] = 0;

  // Frame 0 entry:
  simData[0] = {
    X: x_vals[0],
    Y: y_vals[0],
    Z: z_vals[0],
    direction: x_vals[0] - y_vals[0] > 0 ? 'Y' : 'X'
  };

  // Main feedback loop:
  for (let i = 1; i < timesteps; i++) {
    // Decide sign of Z:
    const imbalance = x_vals[i - 1] - y_vals[i - 1];
    z_vals[i] = imbalance > 0
      ? -observerStrength
      : observerStrength;

    // Update X and Y with Gaussian noise + Z‐term:
    x_vals[i] = x_vals[i - 1]
      + noiseIntensity * randomGaussian()
      + z_vals[i];
    y_vals[i] = y_vals[i - 1]
      + noiseIntensity * randomGaussian()
      - z_vals[i];

    // Which node does the observer point to? If X>Y, point to 'Y'; else point to 'X'.
    const direction = x_vals[i] - y_vals[i] > 0 ? 'Y' : 'X';

    // Record the frame:
    simData[i] = {
      X: x_vals[i],
      Y: y_vals[i],
      Z: z_vals[i],
      direction
    };
  }

  return simData;
}

/**
 * Returns a single draw from a standard normal (Gaussian) distribution
 * using the Box–Muller transform.
 */
function randomGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();  // Constrain u>0
  while (v === 0) v = Math.random();  // Constrain v>0
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
