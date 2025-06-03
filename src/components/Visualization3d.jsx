// src/components/Visualization3D.jsx

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Visualization3D({ simulationData, timeRate, labelMode }) {
  const mountRef = useRef(null);

  useEffect(() => {
    // ------------------- 1) Scene / Camera / Renderer -------------------
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();

    // Camera: fov=75, aspect=width/height, near=0.1, far=1000
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    // Position camera at (0, -5, 1.82) so that elevation ~20°
    const cameraRadius = 5;
    const cameraElevation = 5 * Math.tan(THREE.MathUtils.degToRad(20)); // ≈1.82
    camera.position.set(0, -cameraRadius, cameraElevation);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // OrbitControls so user can manually rotate/zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;

    // ------------------- 2) Node Positions & Colors -------------------
    const nodeInfo = {
      Z: { pos: [0,  0,  1], colorHex: 0x00ff00 }, // lime
      X: { pos: [1,  0,  0], colorHex: 0xff0000 }, // crimson
      Y: { pos: [0,  1,  0], colorHex: 0x0000ff }, // dodgerblue
      T: { pos: [0,  0, -1], colorHex: 0x808080 }, // gray
    };

    // ------------------- 3) Sphere‐meshes for Z, X, Y, T -------------------
    const nodes = {};
    Object.entries(nodeInfo).forEach(([key, { pos, colorHex }]) => {
      const sphereGeo = new THREE.SphereGeometry(0.1, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(...pos);
      scene.add(sphere);
      nodes[key] = sphere;
    });

    // ------------------- 4) Tetrahedron Edges (dashed lines) -------------------
    const edges = [
      ['Z','X'], ['Z','Y'], ['Z','T'],
      ['X','Y'], ['X','T'], ['Y','T']
    ];
    edges.forEach(([a, b]) => {
      const pA = new THREE.Vector3(...nodeInfo[a].pos);
      const pB = new THREE.Vector3(...nodeInfo[b].pos);
      const geometry = new THREE.BufferGeometry().setFromPoints([pA, pB]);
      const mat = new THREE.LineDashedMaterial({
        color: 0xffffff,
        dashSize: 0.1,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Line(geometry, mat);
      line.computeLineDistances();
      scene.add(line);
    });

    // ------------------- 5) Pulsing Rings under each node -------------------
    const pulseRadii = [0.2, 0.35, 0.5];
    const ringSegments = 100;
    const phiArray = Array.from({ length: ringSegments }, (_, i) =>
      (i / ringSegments) * 2 * Math.PI
    );

    // We’ll keep a reference so we can update positions every frame
    const ringsByNode = { X: [], Y: [], Z: [], T: [] };
    Object.entries(nodeInfo).forEach(([key, { pos, colorHex }]) => {
      const [cx, cy, cz] = pos;
      pulseRadii.forEach((r) => {
        const positions = new Float32Array(ringSegments * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.15,
        });
        const lineLoop = new THREE.LineLoop(geometry, mat);
        scene.add(lineLoop);
        ringsByNode[key].push({ lineLoop, radius: r, baseZ: cz, centerXYZ: [cx, cy, cz] });
      });
    });

    // ------------------- 6) Translucent Hexagram under each node -------------------
    const hexagramByNode = { X: [], Y: [], Z: [], T: [] };
    const starRadius = 0.6;
    const sixAngles = Array.from({ length: 6 }, (_, j) => (j / 6) * 2 * Math.PI);

    Object.entries(nodeInfo).forEach(([key, { pos, colorHex }]) => {
      const [cx, cy, cz] = pos;
      const verts = sixAngles.map((phi) => {
        return new THREE.Vector3(
          cx + starRadius * Math.cos(phi),
          cy + starRadius * Math.sin(phi),
          cz
        );
      });
      // Triangle A: [0,2,4]
      {
        const triGeo = new THREE.BufferGeometry();
        const triVerts = new Float32Array([
          verts[0].x, verts[0].y, verts[0].z,
          verts[2].x, verts[2].y, verts[2].z,
          verts[4].x, verts[4].y, verts[4].z,
        ]);
        triGeo.setAttribute('position', new THREE.BufferAttribute(triVerts, 3));
        triGeo.setIndex([0, 1, 2]);
        triGeo.computeVertexNormals();
        const triMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide
        });
        const triMesh = new THREE.Mesh(triGeo, triMat);
        scene.add(triMesh);
        hexagramByNode[key].push(triMesh);
      }
      // Triangle B: [1,3,5]
      {
        const triGeo = new THREE.BufferGeometry();
        const triVerts = new Float32Array([
          verts[1].x, verts[1].y, verts[1].z,
          verts[3].x, verts[3].y, verts[3].z,
          verts[5].x, verts[5].y, verts[5].z,
        ]);
        triGeo.setAttribute('position', new THREE.BufferAttribute(triVerts, 3));
        triGeo.setIndex([0, 1, 2]);
        triGeo.computeVertexNormals();
        const triMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide
        });
        const triMesh = new THREE.Mesh(triGeo, triMat);
        scene.add(triMesh);
        hexagramByNode[key].push(triMesh);
      }
    });

    // ------------------- 7) Temporal Arc (200 vertices, radius=1.6) -------------------
    const arcSegments = 200;
    const arcPhi = Array.from({ length: arcSegments }, (_, i) =>
      (i / arcSegments) * 2 * Math.PI
    );
    const arcRadius = 1.6;
    const arcPositions = new Float32Array(arcSegments * 3);
    const arcGeometry = new THREE.BufferGeometry();
    arcGeometry.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    const arcMat = new THREE.LineDashedMaterial({
      color: 0xffffff,
      dashSize: 0.1,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.1,
    });
    const arcLine = new THREE.Line(arcGeometry, arcMat);
    arcLine.computeLineDistances();
    scene.add(arcLine);

    // ------------------- 8) History Trace (up to 50 points) -------------------
    const tracePoints = [];
    const traceGeo = new THREE.BufferGeometry().setFromPoints(tracePoints);
    const traceMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });
    const traceLine = new THREE.Line(traceGeo, traceMat);
    scene.add(traceLine);

    // ------------------- 9) Build Sprites According to labelMode -------------------
    // We will branch here:
    //   (a) cycle: six dynamic sprites that get relabeled each frame
    //   (b) Z: six static “Z→…” sprites
    //   (c) all: twenty‐four static sprites
    //
    // We collect references in spritePool so that we can update or leave them alone.

    const sixAnglesZ = Array.from({ length: 6 }, (_, j) => (j / 6) * 2 * Math.PI);
    const zCenter = new THREE.Vector3(...nodeInfo['Z'].pos);
    const staticSprites = []; // for modes 'Z' or 'all'
    const dynamicSprites = []; // for mode 'cycle'

    // Helper: create one sprite with given text, then add to scene:
    function createSpriteAt(text, worldX, worldY, worldZ, color = '#ffffff') {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.font = '32px monospace';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1, 0.25, 1);
      sprite.position.set(worldX, worldY, worldZ);
      scene.add(sprite);
      return { sprite, canvas, ctx, texture };
    }

    if (labelMode === 'Z') {
      // (b) Z‐Only labels: create 6 static sprites (Z→T, Z↗X, Z→Y, Z↘X, Z↓T, Z↙Y)
      const zLabels = ['Z→T', 'Z↗X', 'Z→Y', 'Z↘X', 'Z↓T', 'Z↙Y'];
      sixAnglesZ.forEach((phi, idx) => {
        const xTip = zCenter.x + 0.8 * Math.cos(phi);
        const yTip = zCenter.y + 0.8 * Math.sin(phi);
        const zTip = zCenter.z;
        const sp = createSpriteAt(zLabels[idx], xTip, yTip, zTip, '#00ff00');
        staticSprites.push(sp);
      });
    } else if (labelMode === 'all') {
      // (c) All 24 labels
      // We'll define each label, its center, and angleIndex. Then create once.
      const allLabels = [
        // Z’s 6
        { text: 'Z→T', centerKey: 'Z', angleIndex: 0 },
        { text: 'Z↗X', centerKey: 'Z', angleIndex: 1 },
        { text: 'Z→Y', centerKey: 'Z', angleIndex: 2 },
        { text: 'Z↘X', centerKey: 'Z', angleIndex: 3 },
        { text: 'Z↓T', centerKey: 'Z', angleIndex: 4 },
        { text: 'Z↙Y', centerKey: 'Z', angleIndex: 5 },
        // X’s 6
        { text: 'X→Y', centerKey: 'X', angleIndex: 0 },
        { text: 'X↗T', centerKey: 'X', angleIndex: 1 },
        { text: 'X→Z', centerKey: 'X', angleIndex: 2 },
        { text: 'X↘T', centerKey: 'X', angleIndex: 3 },
        { text: 'X↓Y', centerKey: 'X', angleIndex: 4 },
        { text: 'X↙Z', centerKey: 'X', angleIndex: 5 },
        // Y’s 6
        { text: 'Y→X', centerKey: 'Y', angleIndex: 0 },
        { text: 'Y↗Z', centerKey: 'Y', angleIndex: 1 },
        { text: 'Y→T', centerKey: 'Y', angleIndex: 2 },
        { text: 'Y↘Z', centerKey: 'Y', angleIndex: 3 },
        { text: 'Y↓X', centerKey: 'Y', angleIndex: 4 },
        { text: 'Y↙T', centerKey: 'Y', angleIndex: 5 },
        // T’s 6
        { text: 'T→Z', centerKey: 'T', angleIndex: 0 },
        { text: 'T↗Y', centerKey: 'T', angleIndex: 1 },
        { text: 'T→X', centerKey: 'T', angleIndex: 2 },
        { text: 'T↘Y', centerKey: 'T', angleIndex: 3 },
        { text: 'T↓Z', centerKey: 'T', angleIndex: 4 },
        { text: 'T↙X', centerKey: 'T', angleIndex: 5 },
      ];

      allLabels.forEach(({ text, centerKey, angleIndex }) => {
        const [cx, cy, cz] = nodeInfo[centerKey].pos;
        const rayRadius = 0.8;
        const phi = (angleIndex / 6) * 2 * Math.PI;
        const xTip = cx + rayRadius * Math.cos(phi);
        const yTip = cy + rayRadius * Math.sin(phi);
        const zTip = cz;
        const colorHex = nodeInfo[centerKey].colorHex;
        // Convert hex to CSS string like "#rrggbb":
        const colorStr = '#' + colorHex.toString(16).padStart(6, '0');
        const sp = createSpriteAt(text, xTip, yTip, zTip, colorStr);
        staticSprites.push(sp);
      });
    } else {
      // (a) cycle: create 6 “empty” sprites that we will relabel each frame
      for (let i = 0; i < 6; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.font = '24px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1, 0.25, 1);
        // We'll position them dynamically each frame
        scene.add(sprite);
        dynamicSprites.push({ sprite, canvas, ctx, texture });
      }
    }

    // ------------------- 10) Animation Loop -------------------
    const clock = new THREE.Clock();
    const totalFrames = simulationData.length || 1;
    const desiredFPS = 50; // How many simulation steps per second
    const framesPerPerspective = Math.max(1, Math.floor(totalFrames / 4));
    const perspectives = ['Z', 'X', 'Y', 'T'];
    const allPerspectiveLabels = {
      Z: ['Z→T', 'Z↗X', 'Z→Y', 'Z↘X', 'Z↓T', 'Z↙Y'],
      X: ['X→Y', 'X↗T', 'X→Z', 'X↘T', 'X↓Y', 'X↙Z'],
      Y: ['Y→X', 'Y↗Z', 'Y→T', 'Y↘Z', 'Y↓X', 'Y↙T'],
      T: ['T→Z', 'T↗Y', 'T→X', 'T↘Y', 'T↓Z', 'T↙X'],
    };

    // Helper: get six ray tips for a given node key
    function getSixRayTips(key) {
      const [cx, cy, cz] = nodeInfo[key].pos;
      const rayRadius = 0.8;
      const sixAngles = Array.from({ length: 6 }, (_, j) => (j / 6) * 2 * Math.PI);
      return sixAngles.map((phi) => new THREE.Vector3(
        cx + rayRadius * Math.cos(phi),
        cy + rayRadius * Math.sin(phi),
        cz
      ));
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // If no simulation data yet, just render black
      if (!simulationData || simulationData.length === 0) {
        renderer.render(scene, camera);
        return;
      }

      // Continuous elapsed time (seconds)
      const t = clock.getElapsedTime();

      // Which discrete frame index?
      const frameIndex = Math.floor(t * desiredFPS) % totalFrames;
      const { X, Y, Z, direction } = simulationData[frameIndex];
      const targetPos = new THREE.Vector3(...nodeInfo[direction].pos);

      // 10a) Update the nodes’ scales (energy)
      nodes.X.scale.setScalar(Math.abs(X));
      nodes.Y.scale.setScalar(Math.abs(Y));
      nodes.Z.scale.setScalar(Math.abs(Z));
      nodes.T.scale.setScalar(0.3);

      // 10b) Update pulsing rings (smooth)
      const phase = t * timeRate * 0.1; // same functional form as Python’s i * 0.1
      Object.entries(ringsByNode).forEach(([key, ringArray]) => {
        ringArray.forEach(({ lineLoop, radius, baseZ, centerXYZ }) => {
          const [cx, cy, cz] = centerXYZ;
          const posAttr = lineLoop.geometry.attributes.position.array;
          phiArray.forEach((phi, idx) => {
            const worldZ = baseZ + 0.03 * Math.sin(phi + phase);
            const x = cx + radius * Math.cos(phi);
            const y = cy + radius * Math.sin(phi);
            const z = worldZ;
            const baseIdx = idx * 3;
            posAttr[baseIdx + 0] = x;
            posAttr[baseIdx + 1] = y;
            posAttr[baseIdx + 2] = z;
          });
          lineLoop.geometry.attributes.position.needsUpdate = true;
        });
      });

      // 10c) Update temporal arc
      arcPhi.forEach((phi, idx) => {
        const x = arcRadius * Math.cos(phi);
        const y = arcRadius * Math.sin(phi);
        const z = 0.4 * Math.sin(2 * phi + t * 0.05);
        const baseIdx = idx * 3;
        arcPositions[baseIdx + 0] = x;
        arcPositions[baseIdx + 1] = y;
        arcPositions[baseIdx + 2] = z;
      });
      arcGeometry.attributes.position.needsUpdate = true;

      // 10d) Update history trace (last 50 points of targetPos)
      tracePoints.push(targetPos.clone());
      if (tracePoints.length > 50) tracePoints.shift();
      traceGeo.setFromPoints(tracePoints);

      // 10e) Observer line: remove old, add new
      const oldLine = scene.getObjectByName('observerLine');
      if (oldLine) scene.remove(oldLine);
      const observerGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        targetPos,
      ]);
      const observerMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
      });
      const observerLine = new THREE.Line(observerGeo, observerMat);
      observerLine.name = 'observerLine';
      scene.add(observerLine);

      // 10f) Label logic based on labelMode
      if (labelMode === 'cycle') {
        // (a) dynamic cycling – update positions & text of the 6 dynamicSprites
        // Determine which perspective we are on:
        const perspIndex = Math.floor(frameIndex / framesPerPerspective) % 4;
        const perspective = perspectives[perspIndex];
        const labels = allPerspectiveLabels[perspective];
        // Compute the six tip positions under that node:
        const rayTips = getSixRayTips(perspective);
        dynamicSprites.forEach(({ sprite, canvas, ctx, texture }, idx) => {
          // 1) redraw the text onto the canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = '24px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labels[idx], canvas.width / 2, canvas.height / 2);
          texture.needsUpdate = true;
          // 2) reposition the sprite at rayTips[idx]
          const tipPos = rayTips[idx];
          sprite.position.set(tipPos.x, tipPos.y, tipPos.z);
        });
      } else if (labelMode === 'Z') {
        // (b) Z-only: do nothing here (the 6 staticSprites are already in place, never update)
      } else {
        // (c) all: do nothing here (the 24 staticSprites are already in place, never update)
      }

      // 10g) finally, render
      renderer.render(scene, camera);
    };

    animate();

    // ------------------- 11) Handle resize & cleanup -------------------
    const handleResize = () => {
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      renderer.setSize(newW, newH);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, [simulationData, timeRate, labelMode]);

  // Fill the parent div with the WebGL canvas
  return <div style={{ width: '100%', height: '100%' }} ref={mountRef} />;
}
