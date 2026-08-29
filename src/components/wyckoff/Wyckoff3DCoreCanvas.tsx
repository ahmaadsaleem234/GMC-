import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import {
  WyckoffAnalysisResult,
  RawCandle,
  WyckoffEventDetail,
} from "../../services/wyckoffEngine";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Scan,
  Shield,
} from "lucide-react";

interface Wyckoff3DCoreCanvasProps {
  analysis: WyckoffAnalysisResult;
  candles: RawCandle[];
  currentPrice: number;
  timeframe: string;
}

export const Wyckoff3DCoreCanvas: React.FC<Wyckoff3DCoreCanvasProps> = ({
  analysis,
  candles,
  currentPrice,
  timeframe,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showVolumeTerrain, setShowVolumeTerrain] = useState(true);
  const [showRangeBounds, setShowRangeBounds] = useState(true);
  const [showEventBadges, setShowEventBadges] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewAngle, setViewAngle] = useState<"ISOMETRIC" | "SIDE" | "TOP">("ISOMETRIC");

  // Keep references to Three.js objects for smooth updates without recreating scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const candleGroupRef = useRef<THREE.Group | null>(null);
  const volumeGroupRef = useRef<THREE.Group | null>(null);
  const rangeGroupRef = useRef<THREE.Group | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const scanLineRef = useRef<THREE.Line | null>(null);
  const livePriceBeaconRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 120 });

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.0035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(50, 100, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.8);
    dirLight2.position.set(-50, 50, -50);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 200);
    pointLight.position.set(0, 40, 0);
    scene.add(pointLight);

    // 5. Holographic Floor Grid
    const gridHelper = new THREE.GridHelper(160, 32, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -25;
    scene.add(gridHelper);

    // Subtle Holographic Sub-grid
    const subGrid = new THREE.GridHelper(160, 64, 0x0369a1, 0x0f172a);
    subGrid.position.y = -25.1;
    scene.add(subGrid);

    // 6. Floating Particle Field (Data Streams)
    const particleCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 180;
      particlePositions[i + 1] = (Math.random() - 0.5) * 80;
      particlePositions[i + 2] = (Math.random() - 0.5) * 180;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // 7. Groups for dynamic content
    const candleGroup = new THREE.Group();
    scene.add(candleGroup);
    candleGroupRef.current = candleGroup;

    const volumeGroup = new THREE.Group();
    scene.add(volumeGroup);
    volumeGroupRef.current = volumeGroup;

    const rangeGroup = new THREE.Group();
    scene.add(rangeGroup);
    rangeGroupRef.current = rangeGroup;

    const markerGroup = new THREE.Group();
    scene.add(markerGroup);
    markerGroupRef.current = markerGroup;

    // 8. Scanning Laser Line
    const scanLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -25, -50),
      new THREE.Vector3(0, 45, -50),
      new THREE.Vector3(0, 45, 50),
      new THREE.Vector3(0, -25, 50),
    ]);
    const scanLineMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.85,
      linewidth: 2,
    });
    const scanLine = new THREE.Line(scanLineGeom, scanLineMat);
    scene.add(scanLine);
    scanLineRef.current = scanLine;

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 10. Animation Loop
    let scanPos = -60;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      // Auto-rotation
      if (autoRotate && !isDraggingRef.current) {
        cameraAngleRef.current.theta += 0.0025;
        updateCameraPosition();
      }

      // Scanner animation
      scanPos += 0.35;
      if (scanPos > 60) scanPos = -60;
      if (scanLineRef.current) {
        scanLineRef.current.position.x = scanPos;
      }

      // Particle float animation
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0008;
      }

      // Pulsing effect on markers
      if (markerGroupRef.current) {
        const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.08;
        markerGroupRef.current.children.forEach((child) => {
          if (child.userData?.isPulseRing) {
            child.scale.set(pulse, pulse, pulse);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Controls (Orbit / Pan)
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008)
      );

      updateCameraPosition();
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(
        40,
        Math.min(220, cameraAngleRef.current.radius + e.deltaY * 0.1)
      );
      updateCameraPosition();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("wheel", onWheel);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate]);

  // Helper to sync camera position from spherical coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 5, 0);
  };

  // Switch camera view angles
  const setCameraView = (angle: "ISOMETRIC" | "SIDE" | "TOP") => {
    setViewAngle(angle);
    if (angle === "ISOMETRIC") {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 120 };
    } else if (angle === "SIDE") {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.2, radius: 110 };
    } else if (angle === "TOP") {
      cameraAngleRef.current = { theta: 0, phi: 0.15, radius: 130 };
    }
    updateCameraPosition();
  };

  // Re-build 3D Candles, Volume Terrain, Range & Event Badges when data changes
  useEffect(() => {
    if (
      !candleGroupRef.current ||
      !volumeGroupRef.current ||
      !rangeGroupRef.current ||
      !markerGroupRef.current
    )
      return;

    const candleGroup = candleGroupRef.current;
    const volumeGroup = volumeGroupRef.current;
    const rangeGroup = rangeGroupRef.current;
    const markerGroup = markerGroupRef.current;

    // Clear previous children
    while (candleGroup.children.length > 0) candleGroup.remove(candleGroup.children[0]);
    while (volumeGroup.children.length > 0) volumeGroup.remove(volumeGroup.children[0]);
    while (rangeGroup.children.length > 0) rangeGroup.remove(rangeGroup.children[0]);
    while (markerGroup.children.length > 0) markerGroup.remove(markerGroup.children[0]);

    const n = candles.length;
    if (n < 5) return;

    const lookback = Math.min(n, 32);
    const activeCandles = candles.slice(n - lookback);

    // Calculate vertical scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    activeCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const priceSpan = Math.max(1, maxPrice - minPrice);
    const heightScale = 45 / priceSpan;
    const spacing = 3.6;
    const startX = -((activeCandles.length * spacing) / 2);

    const priceToY = (price: number) => (price - (minPrice + maxPrice) / 2) * heightScale + 10;

    // 1. Build 3D Holographic Candlesticks
    activeCandles.forEach((c, idx) => {
      const x = startX + idx * spacing;
      const isBull = c.close >= c.open;
      const bodyTop = Math.max(c.open, c.close);
      const bodyBottom = Math.min(c.open, c.close);

      const yTop = priceToY(bodyTop);
      const yBottom = priceToY(bodyBottom);
      const yHigh = priceToY(c.high);
      const yLow = priceToY(c.low);

      const bodyHeight = Math.max(0.4, yTop - yBottom);
      const bodyY = (yTop + yBottom) / 2;

      // Color scheme
      const candleColor = isBull ? 0x10b981 : 0xef4444; // Emerald vs Coral
      const emissiveColor = isBull ? 0x059669 : 0xb91c1c;

      // Candle 3D Body (Box)
      const bodyGeom = new THREE.BoxGeometry(2.2, bodyHeight, 2.2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: candleColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.9,
      });
      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
      bodyMesh.position.set(x, bodyY, 0);
      candleGroup.add(bodyMesh);

      // Inner Glowing Core Wireframe
      const wireGeom = new THREE.EdgesGeometry(bodyGeom);
      const wireMat = new THREE.LineBasicMaterial({
        color: isBull ? 0x34d399 : 0xf87171,
        linewidth: 2,
      });
      const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
      wireMesh.position.set(x, bodyY, 0);
      candleGroup.add(wireMesh);

      // Wicks (Cylinders for depth)
      const wickHeight = Math.max(0.2, yHigh - yLow);
      const wickY = (yHigh + yLow) / 2;
      const wickGeom = new THREE.CylinderGeometry(0.12, 0.12, wickHeight, 6);
      const wickMat = new THREE.MeshBasicMaterial({
        color: isBull ? 0x6ee7b7 : 0xfca5a5,
      });
      const wickMesh = new THREE.Mesh(wickGeom, wickMat);
      wickMesh.position.set(x, wickY, 0);
      candleGroup.add(wickMesh);

      // 2. 3D Volume Terrain Energy Pillars (under candles on floor)
      if (showVolumeTerrain) {
        const volRatio = maxVolume > 0 ? (c.volume || 100) / maxVolume : 0.5;
        const volHeight = Math.max(0.5, volRatio * 16);
        const volY = -25 + volHeight / 2;

        let volColor = isBull ? 0x06b6d4 : 0xf43f5e;
        if (volRatio > 0.85) {
          volColor = 0xf59e0b; // Gold for climactic/extreme volume
        }

        const volGeom = new THREE.BoxGeometry(2.0, volHeight, 2.0);
        const volMat = new THREE.MeshStandardMaterial({
          color: volColor,
          emissive: volColor,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.75,
        });
        const volMesh = new THREE.Mesh(volGeom, volMat);
        volMesh.position.set(x, volY, 0);
        volumeGroup.add(volMesh);

        // Ground Glow Ripple
        const ringGeom = new THREE.RingGeometry(1.2, 1.8, 12);
        const ringMat = new THREE.MeshBasicMaterial({
          color: volColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(x, -24.9, 0);
        volumeGroup.add(ringMesh);
      }
    });

    // 3. 3D Trading Range (Transparent Holographic Bounding Box & Creek/Ice Planes)
    if (showRangeBounds && analysis.tradingRange) {
      const range = analysis.tradingRange;
      const yCreek = priceToY(range.rangeHigh);
      const yIce = priceToY(range.rangeLow);
      const yMid = priceToY(range.midpoint);
      const rangeH = Math.max(1, yCreek - yIce);
      const totalWidth = activeCandles.length * spacing + 12;

      // Transparent Bounding Box
      const boxGeom = new THREE.BoxGeometry(totalWidth, rangeH, 20);
      const boxMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.06,
        wireframe: false,
      });
      const rangeBox = new THREE.Mesh(boxGeom, boxMat);
      rangeBox.position.set(0, (yCreek + yIce) / 2, 0);
      rangeGroup.add(rangeBox);

      // Creek Laser Plane (Upper Resistance)
      const creekPlaneGeom = new THREE.PlaneGeometry(totalWidth, 18);
      const creekMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
      });
      const creekPlane = new THREE.Mesh(creekPlaneGeom, creekMat);
      creekPlane.rotation.x = Math.PI / 2;
      creekPlane.position.set(0, yCreek, 0);
      rangeGroup.add(creekPlane);

      // Creek Border Laser Line
      const creekLineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-totalWidth / 2, yCreek, 0),
        new THREE.Vector3(totalWidth / 2, yCreek, 0),
      ]);
      const creekLineMat = new THREE.LineBasicMaterial({
        color: 0xf87171,
        linewidth: 3,
      });
      rangeGroup.add(new THREE.Line(creekLineGeom, creekLineMat));

      // Ice Laser Plane (Lower Support)
      const icePlaneGeom = new THREE.PlaneGeometry(totalWidth, 18);
      const iceMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
      });
      const icePlane = new THREE.Mesh(icePlaneGeom, iceMat);
      icePlane.rotation.x = Math.PI / 2;
      icePlane.position.set(0, yIce, 0);
      rangeGroup.add(icePlane);

      // Ice Border Laser Line
      const iceLineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-totalWidth / 2, yIce, 0),
        new THREE.Vector3(totalWidth / 2, yIce, 0),
      ]);
      const iceLineMat = new THREE.LineBasicMaterial({
        color: 0x34d399,
        linewidth: 3,
      });
      rangeGroup.add(new THREE.Line(iceLineGeom, iceLineMat));

      // Midpoint Laser Line
      const midLineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-totalWidth / 2, yMid, 0),
        new THREE.Vector3(totalWidth / 2, yMid, 0),
      ]);
      const midLineMat = new THREE.LineDashedMaterial({
        color: 0x94a3b8,
        dashSize: 2,
        gapSize: 1,
        transparent: true,
        opacity: 0.5,
      });
      const midLine = new THREE.Line(midLineGeom, midLineMat);
      midLine.computeLineDistances();
      rangeGroup.add(midLine);
    }

    // 4. 3D Event Badges & Pulsing Scanning Markers (SPRING, TEST, SC, UTAD, SOS, etc.)
    if (showEventBadges && analysis.detectedEvents) {
      analysis.detectedEvents.forEach((ev) => {
        // Find candle index relative to active slice
        const relIdx = ev.candleIndex - (n - lookback);
        if (relIdx < 0 || relIdx >= activeCandles.length) return;

        const x = startX + relIdx * spacing;
        const targetCandle = activeCandles[relIdx];
        const isAccumEvent = ev.category === "ACCUMULATION";
        const yBase = priceToY(isAccumEvent ? targetCandle.low : targetCandle.high);
        const yBadge = isAccumEvent ? yBase - 6.5 : yBase + 6.5;

        // Glowing 3D Floating Crystal / Hex Badge
        const badgeColor =
          ev.code === "SPRING"
            ? 0xf59e0b
            : ev.code === "TEST"
            ? 0x38bdf8
            : ev.code === "SOS"
            ? 0x10b981
            : ev.code === "UTAD" || ev.code === "UT"
            ? 0xf43f5e
            : ev.code === "SOW"
            ? 0xa855f7
            : 0xe2e8f0;

        const badgeGeom = new THREE.OctahedronGeometry(2.0, 0);
        const badgeMat = new THREE.MeshStandardMaterial({
          color: badgeColor,
          emissive: badgeColor,
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.8,
        });
        const badgeMesh = new THREE.Mesh(badgeGeom, badgeMat);
        badgeMesh.position.set(x, yBadge, 0);
        markerGroup.add(badgeMesh);

        // Animated Scanning Rings around Event
        const ringGeom = new THREE.TorusGeometry(3.2, 0.12, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: badgeColor,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.set(x, yBadge, 0);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.userData = { isPulseRing: true };
        markerGroup.add(ringMesh);

        // Vertical Laser Tether to candle wick
        const tetherGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, yBase, 0),
          new THREE.Vector3(x, yBadge, 0),
        ]);
        const tetherMat = new THREE.LineBasicMaterial({
          color: badgeColor,
          transparent: true,
          opacity: 0.8,
        });
        markerGroup.add(new THREE.Line(tetherGeom, tetherMat));
      });
    }

    // 5. Live Price Horizontal Laser Beam & Beacon
    const yLive = priceToY(currentPrice);
    const totalWidth = activeCandles.length * spacing + 14;
    const liveLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-totalWidth / 2, yLive, 0),
      new THREE.Vector3(totalWidth / 2, yLive, 0),
    ]);
    const liveLineMat = new THREE.LineBasicMaterial({
      color: 0xfacc15,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    rangeGroup.add(new THREE.Line(liveLineGeom, liveLineMat));

    // Live Beacon Sphere at latest candle
    const lastX = startX + (activeCandles.length - 1) * spacing;
    const beaconGeom = new THREE.SphereGeometry(1.2, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.95,
    });
    const beacon = new THREE.Mesh(beaconGeom, beaconMat);
    beacon.position.set(lastX, yLive, 0);
    rangeGroup.add(beacon);
  }, [candles, analysis, currentPrice, showVolumeTerrain, showRangeBounds, showEventBadges]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#06090e] shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[540px] md:h-[620px]"
      }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Holographic Overlay */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        {/* Left: Engine Identifier */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b1320]/85 border border-cyan-500/40 backdrop-blur-md pointer-events-auto shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-black text-cyan-300 tracking-wider">3D WYCKOFF CORE</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-700/50">
            XAUUSD • {timeframe}
          </span>
          <span className="text-xs font-mono font-bold text-amber-300">
            ${currentPrice.toFixed(2)}
          </span>
        </div>

        {/* Center: Live Wyckoff Active Phase & Event Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0b1320]/90 border border-amber-500/40 backdrop-blur-md shadow-lg pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span className="text-xs font-black text-white tracking-wider">
            PHASE: <span className="text-amber-400 uppercase">{analysis.phase}</span>
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {analysis.phaseStage}
          </span>
          {analysis.activeEvent && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
              EVENT: {analysis.activeEvent.code} ({analysis.activeEvent.state})
            </span>
          )}
        </div>

        {/* Right: 3D Camera Controls & Layer Toggles */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Angle Switcher */}
          <div className="flex rounded-lg bg-[#0b1320]/80 border border-slate-700/60 p-0.5 backdrop-blur-md">
            <button
              onClick={() => setCameraView("ISOMETRIC")}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                viewAngle === "ISOMETRIC"
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ISO 3D
            </button>
            <button
              onClick={() => setCameraView("SIDE")}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                viewAngle === "SIDE"
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              SIDE
            </button>
            <button
              onClick={() => setCameraView("TOP")}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                viewAngle === "TOP"
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              TOP
            </button>
          </div>

          {/* Auto-Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 3D Orbit Auto-Rotation"
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              autoRotate
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "bg-[#0b1320]/80 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
          </button>

          {/* Volume Terrain Toggle */}
          <button
            onClick={() => setShowVolumeTerrain(!showVolumeTerrain)}
            title="Toggle 3D Volume Terrain Pillars"
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              showVolumeTerrain
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-[#0b1320]/80 text-slate-500 border-slate-700 hover:text-slate-300"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* Range Bounding Box Toggle */}
          <button
            onClick={() => setShowRangeBounds(!showRangeBounds)}
            title="Toggle Trading Range Bounding Box"
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              showRangeBounds
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-[#0b1320]/80 text-slate-500 border-slate-700 hover:text-slate-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen Canvas"
            className="p-1.5 rounded-lg bg-[#0b1320]/80 text-slate-300 border border-slate-700 hover:text-white backdrop-blur-md cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend & Holographic Telemetry */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        {/* Trading Range Quick Gauge */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0b1320]/85 border border-slate-700/60 backdrop-blur-md text-[11px] font-mono pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-slate-400">CREEK:</span>
            <span className="text-red-300 font-bold">
              ${analysis.tradingRange.creekLevel.toFixed(2)}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">ICE:</span>
            <span className="text-emerald-300 font-bold">
              ${analysis.tradingRange.iceLevel.toFixed(2)}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">WIDTH:</span>
            <span className="text-cyan-300 font-bold">
              ${analysis.tradingRange.rangeWidth.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 3D Navigation Hint */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b1320]/75 border border-cyan-900/40 text-[10px] text-cyan-400/80 font-mono backdrop-blur-sm">
          <Compass className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>DRAG TO ORBIT 3D • SCROLL TO ZOOM • RIGHT-CLICK TO PAN</span>
        </div>
      </div>

      {/* Invalidation Glitch Alert Banner (if structure failed) */}
      {analysis.invalidationState.status === "INVALIDATED" && (
        <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none p-6 text-center animate-pulse">
          <div className="px-5 py-3 rounded-2xl bg-red-900/90 border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.7)] text-white">
            <h3 className="text-lg font-black tracking-widest uppercase flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-red-300" />
              WYCKOFF STRUCTURE INVALIDATED
            </h3>
            <p className="text-xs text-red-200 mt-1 max-w-md">
              {analysis.invalidationState.reason || "Price breached invalidation boundary. AI is re-analyzing market baseline."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
