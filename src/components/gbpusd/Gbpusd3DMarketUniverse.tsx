import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import {
  GbpusdCandle,
  GbpusdSniperSetup,
  DerivedLiquidityZone,
  AiModelScenario,
  SessionName,
  VolatilityState,
} from "../../services/gbpusdSniperEngine";
import {
  RotateCcw,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Compass,
  Maximize2,
  Minimize2,
  Crosshair,
  Shield,
  Clock,
  Eye,
  Radio,
} from "lucide-react";

interface Gbpusd3DMarketUniverseProps {
  candles: GbpusdCandle[];
  currentPrice: number;
  bid: number;
  ask: number;
  spreadPips: number;
  timeframe: string;
  setup: GbpusdSniperSetup | null;
  liquidityZones: DerivedLiquidityZone[];
  scenarios: AiModelScenario[];
  session: SessionName;
  volatility: VolatilityState;
  isLive: boolean;
}

export const Gbpusd3DMarketUniverse: React.FC<Gbpusd3DMarketUniverseProps> = ({
  candles,
  currentPrice,
  bid,
  ask,
  spreadPips,
  timeframe,
  setup,
  liquidityZones,
  scenarios,
  session,
  volatility,
  isLive,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showTerrain, setShowTerrain] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);
  const [showVolCloud, setShowVolCloud] = useState(true);
  const [showSniperZones, setShowSniperZones] = useState(true);
  const [showScenarios, setShowScenarios] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewPreset, setViewPreset] = useState<"ISO" | "SIDE" | "TOP" | "SNIPER" | "PRICE">("ISO");

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const candleGroupRef = useRef<THREE.Group | null>(null);
  const terrainGroupRef = useRef<THREE.Group | null>(null);
  const liquidityGroupRef = useRef<THREE.Group | null>(null);
  const volatilityGroupRef = useRef<THREE.Group | null>(null);
  const sniperGroupRef = useRef<THREE.Group | null>(null);
  const scenarioGroupRef = useRef<THREE.Group | null>(null);
  const sessionGroupRef = useRef<THREE.Group | null>(null);
  const priceBeamRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);

  // Orbit angles
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAnglesRef = useRef({ theta: Math.PI / 3.8, phi: Math.PI / 3.2, radius: 135, targetY: 10 });

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070b);
    scene.fog = new THREE.FogExp2(0x05070b, 0.003);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    syncCamera();

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight1.position.set(60, 120, 60);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 0.9);
    dirLight2.position.set(-60, 80, -60);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.8, 250);
    pointLight.position.set(0, 35, 0);
    scene.add(pointLight);

    // 5. Floor Grid
    const mainGrid = new THREE.GridHelper(200, 40, 0x0284c7, 0x1e293b);
    mainGrid.position.y = -30;
    scene.add(mainGrid);

    const subGrid = new THREE.GridHelper(200, 80, 0x0369a1, 0x0f172a);
    subGrid.position.y = -30.1;
    scene.add(subGrid);

    // 6. Particle Field (Market Energy Stream)
    const pCount = 350;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 220;
      pPos[i + 1] = (Math.random() - 0.5) * 90;
      pPos[i + 2] = (Math.random() - 0.5) * 220;
    }
    pGeom.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.3,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 7. Dynamic Groups
    const candleGroup = new THREE.Group();
    scene.add(candleGroup);
    candleGroupRef.current = candleGroup;

    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);
    terrainGroupRef.current = terrainGroup;

    const liquidityGroup = new THREE.Group();
    scene.add(liquidityGroup);
    liquidityGroupRef.current = liquidityGroup;

    const volatilityGroup = new THREE.Group();
    scene.add(volatilityGroup);
    volatilityGroupRef.current = volatilityGroup;

    const sniperGroup = new THREE.Group();
    scene.add(sniperGroup);
    sniperGroupRef.current = sniperGroup;

    const scenarioGroup = new THREE.Group();
    scene.add(scenarioGroup);
    scenarioGroupRef.current = scenarioGroup;

    const sessionGroup = new THREE.Group();
    scene.add(sessionGroup);
    sessionGroupRef.current = sessionGroup;

    const priceBeam = new THREE.Group();
    scene.add(priceBeam);
    priceBeamRef.current = priceBeam;

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 9. Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current) {
        cameraAnglesRef.current.theta += 0.002;
        syncCamera();
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0006;
      }

      // Pulse sniper target objects
      if (sniperGroupRef.current) {
        const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.06;
        sniperGroupRef.current.children.forEach((child) => {
          if (child.userData?.isPulse) {
            child.scale.set(pulse, pulse, pulse);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse / Touch Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;

      cameraAnglesRef.current.theta -= deltaX * 0.007;
      cameraAnglesRef.current.phi = Math.max(
        0.08,
        Math.min(Math.PI / 2 - 0.04, cameraAnglesRef.current.phi - deltaY * 0.007)
      );

      syncCamera();
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAnglesRef.current.radius = Math.max(
        35,
        Math.min(260, cameraAnglesRef.current.radius + e.deltaY * 0.12)
      );
      syncCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("wheel", onWheel);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
    };
  }, [autoRotate]);

  // Sync Camera Spherical Coordinates
  const syncCamera = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius, targetY } = cameraAnglesRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, targetY || 10, 0);
  };

  // Camera Presets
  const applyPreset = (preset: "ISO" | "SIDE" | "TOP" | "SNIPER" | "PRICE") => {
    setViewPreset(preset);
    if (preset === "ISO") {
      cameraAnglesRef.current = { theta: Math.PI / 3.8, phi: Math.PI / 3.2, radius: 135, targetY: 10 };
    } else if (preset === "SIDE") {
      cameraAnglesRef.current = { theta: 0, phi: Math.PI / 2.15, radius: 120, targetY: 10 };
    } else if (preset === "TOP") {
      cameraAnglesRef.current = { theta: 0, phi: 0.12, radius: 145, targetY: 5 };
    } else if (preset === "SNIPER") {
      cameraAnglesRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.6, radius: 85, targetY: 12 };
    } else if (preset === "PRICE") {
      cameraAnglesRef.current = { theta: Math.PI / 6, phi: Math.PI / 2.8, radius: 70, targetY: 15 };
    }
    syncCamera();
  };

  // Rebuild 3D Objects when data updates
  useEffect(() => {
    if (
      !candleGroupRef.current ||
      !terrainGroupRef.current ||
      !liquidityGroupRef.current ||
      !volatilityGroupRef.current ||
      !sniperGroupRef.current ||
      !scenarioGroupRef.current ||
      !sessionGroupRef.current ||
      !priceBeamRef.current
    )
      return;

    const candleGroup = candleGroupRef.current;
    const terrainGroup = terrainGroupRef.current;
    const liquidityGroup = liquidityGroupRef.current;
    const volatilityGroup = volatilityGroupRef.current;
    const sniperGroup = sniperGroupRef.current;
    const scenarioGroup = scenarioGroupRef.current;
    const sessionGroup = sessionGroupRef.current;
    const priceBeam = priceBeamRef.current;

    // Clear previous children
    while (candleGroup.children.length > 0) candleGroup.remove(candleGroup.children[0]);
    while (terrainGroup.children.length > 0) terrainGroup.remove(terrainGroup.children[0]);
    while (liquidityGroup.children.length > 0) liquidityGroup.remove(liquidityGroup.children[0]);
    while (volatilityGroup.children.length > 0) volatilityGroup.remove(volatilityGroup.children[0]);
    while (sniperGroup.children.length > 0) sniperGroup.remove(sniperGroup.children[0]);
    while (scenarioGroup.children.length > 0) scenarioGroup.remove(scenarioGroup.children[0]);
    while (sessionGroup.children.length > 0) sessionGroup.remove(sessionGroup.children[0]);
    while (priceBeam.children.length > 0) priceBeam.remove(priceBeam.children[0]);

    const n = candles.length;
    if (n < 5) return;

    const lookback = Math.min(n, 36);
    const activeCandles = candles.slice(n - lookback);

    // Compute Price Bounds
    let minP = Infinity;
    let maxP = -Infinity;
    let maxVol = 0;
    activeCandles.forEach((c) => {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const priceSpan = Math.max(0.0020, maxP - minP);
    const heightScale = 55 / priceSpan;
    const spacing = 3.8;
    const startX = -((activeCandles.length * spacing) / 2);

    const priceToY = (price: number) => (price - (minP + maxP) / 2) * heightScale + 12;

    // 1. Build 3D Holographic Candlesticks (X = Time, Y = Price, Z = Derived Depth)
    activeCandles.forEach((c, idx) => {
      const x = startX + idx * spacing;
      const isBull = c.close >= c.open;
      const top = Math.max(c.open, c.close);
      const bot = Math.min(c.open, c.close);

      const yTop = priceToY(top);
      const yBot = priceToY(bot);
      const yHigh = priceToY(c.high);
      const yLow = priceToY(c.low);

      const bodyHeight = Math.max(0.4, yTop - yBot);
      const bodyY = (yTop + yBot) / 2;

      const bodyColor = isBull ? 0x10b981 : 0xef4444;
      const emissiveColor = isBull ? 0x059669 : 0xb91c1c;

      // 3D Box Body
      const bodyGeom = new THREE.BoxGeometry(2.3, bodyHeight, 2.3);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.7,
        transparent: true,
        opacity: 0.92,
      });
      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
      bodyMesh.position.set(x, bodyY, 0);
      candleGroup.add(bodyMesh);

      // Glowing Wireframe
      const wireGeom = new THREE.EdgesGeometry(bodyGeom);
      const wireMat = new THREE.LineBasicMaterial({
        color: isBull ? 0x34d399 : 0xf87171,
        linewidth: 2,
      });
      const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
      wireMesh.position.set(x, bodyY, 0);
      candleGroup.add(wireMesh);

      // Wicks (3D Cylinder)
      const wickHeight = Math.max(0.2, yHigh - yLow);
      const wickY = (yHigh + yLow) / 2;
      const wickGeom = new THREE.CylinderGeometry(0.1, 0.1, wickHeight, 6);
      const wickMat = new THREE.MeshBasicMaterial({
        color: isBull ? 0x6ee7b7 : 0xfca5a5,
      });
      const wickMesh = new THREE.Mesh(wickGeom, wickMat);
      wickMesh.position.set(x, wickY, 0);
      candleGroup.add(wickMesh);
    });

    // 2. 3D Price Terrain (Price × Time × Market Activity)
    if (showTerrain) {
      const terrainWidth = activeCandles.length * spacing + 10;
      activeCandles.forEach((c, idx) => {
        const x = startX + idx * spacing;
        const volRatio = maxVol > 0 ? (c.volume || 1000) / maxVol : 0.5;
        const pHeight = Math.max(0.6, volRatio * 18);
        const yBase = -30 + pHeight / 2;

        const isBull = c.close >= c.open;
        const terrainColor = isBull ? 0x06b6d4 : 0x8b5cf6;

        const tGeom = new THREE.BoxGeometry(2.1, pHeight, 8);
        const tMat = new THREE.MeshStandardMaterial({
          color: terrainColor,
          emissive: terrainColor,
          emissiveIntensity: 0.35,
          roughness: 0.3,
          metalness: 0.5,
          transparent: true,
          opacity: 0.65,
        });
        const tMesh = new THREE.Mesh(tGeom, tMat);
        tMesh.position.set(x, yBase, -6);
        terrainGroup.add(tMesh);
      });
    }

    // 3. 3D Derived Liquidity Structures
    if (showLiquidity && liquidityZones.length > 0) {
      const totalWidth = activeCandles.length * spacing + 16;
      liquidityZones.forEach((zone) => {
        const yZone = priceToY(zone.price);
        const isHigh = zone.type.includes("HIGH");
        const color = isHigh ? 0xef4444 : 0x10b981;

        // 3D Horizontal Laser Plane
        const planeGeom = new THREE.PlaneGeometry(totalWidth, 14);
        const planeMat = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.16,
        });
        const plane = new THREE.Mesh(planeGeom, planeMat);
        plane.rotation.x = Math.PI / 2;
        plane.position.set(0, yZone, 0);
        liquidityGroup.add(plane);

        // Border Laser Line
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-totalWidth / 2, yZone, 0),
          new THREE.Vector3(totalWidth / 2, yZone, 0),
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: isHigh ? 0xf87171 : 0x34d399,
          linewidth: 2,
        });
        liquidityGroup.add(new THREE.Line(lineGeom, lineMat));

        // Floating 3D Crystal Marker
        const crystalGeom = new THREE.OctahedronGeometry(1.6, 0);
        const crystalMat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.7,
        });
        const crystal = new THREE.Mesh(crystalGeom, crystalMat);
        crystal.position.set(-totalWidth / 2 + 2, yZone, 0);
        liquidityGroup.add(crystal);
      });
    }

    // 4. 3D Volatility Cloud Layer
    if (showVolCloud) {
      const cloudCount = 140;
      const cloudGeom = new THREE.BufferGeometry();
      const cloudPos = new Float32Array(cloudCount * 3);
      for (let i = 0; i < cloudCount * 3; i += 3) {
        cloudPos[i] = (Math.random() - 0.5) * (activeCandles.length * spacing);
        cloudPos[i + 1] = 12 + (Math.random() - 0.5) * 25;
        cloudPos[i + 2] = (Math.random() - 0.5) * 35;
      }
      cloudGeom.setAttribute("position", new THREE.BufferAttribute(cloudPos, 3));
      const cloudMat = new THREE.PointsMaterial({
        color: volatility === "EXPANDING" ? 0xf59e0b : 0x06b6d4,
        size: 2.2,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const cloud = new THREE.Points(cloudGeom, cloudMat);
      volatilityGroup.add(cloud);
    }

    // 5. 3D Session Boundaries (Asian, London, New York)
    const sessionPlaneGeom = new THREE.PlaneGeometry(16, 60);
    const sessionPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.08,
    });
    const sPlane = new THREE.Mesh(sessionPlaneGeom, sessionPlaneMat);
    sPlane.position.set(0, 10, -12);
    sessionGroup.add(sPlane);

    // 6. 3D Sniper Target Zones & Projected Paths (When A+ Setup is Active)
    if (showSniperZones && setup) {
      const totalW = activeCandles.length * spacing + 18;
      const yEntry = priceToY(setup.bestEntry);
      const ySL = priceToY(setup.stopLoss);
      const yTP1 = priceToY(setup.tp1);
      const yTP2 = priceToY(setup.tp2);
      const yTP3 = priceToY(setup.tp3);

      const isBuy = setup.direction === "BUY";

      // A. Entry Zone (Cyan Ribbon)
      const entryPlaneGeom = new THREE.PlaneGeometry(totalW, 20);
      const entryPlaneMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.28,
      });
      const entryPlane = new THREE.Mesh(entryPlaneGeom, entryPlaneMat);
      entryPlane.rotation.x = Math.PI / 2;
      entryPlane.position.set(0, yEntry, 0);
      sniperGroup.add(entryPlane);

      // B. Stop Loss Invalidation Plane (Red)
      const slPlaneGeom = new THREE.PlaneGeometry(totalW, 20);
      const slPlaneMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.32,
      });
      const slPlane = new THREE.Mesh(slPlaneGeom, slPlaneMat);
      slPlane.rotation.x = Math.PI / 2;
      slPlane.position.set(0, ySL, 0);
      sniperGroup.add(slPlane);

      // C. TP1 / TP2 / TP3 Target Planes (Emerald)
      [
        { y: yTP1, label: "TP1", color: 0x10b981, op: 0.25 },
        { y: yTP2, label: "TP2", color: 0x34d399, op: 0.32 },
        { y: yTP3, label: "TP3", color: 0x6ee7b7, op: 0.4 },
      ].forEach((tp) => {
        const tpGeom = new THREE.PlaneGeometry(totalW, 20);
        const tpMat = new THREE.MeshBasicMaterial({
          color: tp.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: tp.op,
        });
        const tpPlane = new THREE.Mesh(tpGeom, tpMat);
        tpPlane.rotation.x = Math.PI / 2;
        tpPlane.position.set(0, tp.y, 0);
        sniperGroup.add(tpPlane);
      });

      // D. Spatial 3D Trade Path (Entry → TP1 → TP2 → TP3 / Entry → SL)
      const lastX = startX + (activeCandles.length - 1) * spacing;
      const pathPts = [
        new THREE.Vector3(lastX, yEntry, 0),
        new THREE.Vector3(lastX + 12, yTP1, 0),
        new THREE.Vector3(lastX + 22, yTP2, 0),
        new THREE.Vector3(lastX + 32, yTP3, 0),
      ];
      const pathGeom = new THREE.BufferGeometry().setFromPoints(pathPts);
      const pathMat = new THREE.LineDashedMaterial({
        color: 0x10b981,
        dashSize: 2,
        gapSize: 1,
        linewidth: 3,
      });
      const pathLine = new THREE.Line(pathGeom, pathMat);
      pathLine.computeLineDistances();
      sniperGroup.add(pathLine);

      // Invalidation path to SL
      const slPts = [new THREE.Vector3(lastX, yEntry, 0), new THREE.Vector3(lastX + 10, ySL, 0)];
      const slGeom = new THREE.BufferGeometry().setFromPoints(slPts);
      const slMat = new THREE.LineDashedMaterial({
        color: 0xef4444,
        dashSize: 2,
        gapSize: 1,
        linewidth: 2,
      });
      const slLine = new THREE.Line(slGeom, slMat);
      slLine.computeLineDistances();
      sniperGroup.add(slLine);

      // Target Pulsing Beacon
      const targetBeaconGeom = new THREE.OctahedronGeometry(2.4, 0);
      const targetBeaconMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
      });
      const targetBeacon = new THREE.Mesh(targetBeaconGeom, targetBeaconMat);
      targetBeacon.position.set(lastX + 22, yTP2, 0);
      targetBeacon.userData = { isPulse: true };
      sniperGroup.add(targetBeacon);
    }

    // 7. Live Price Floating Holographic Beam & Beacon
    const yLive = priceToY(currentPrice);
    const totalWidth = activeCandles.length * spacing + 18;

    const liveLaserGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-totalWidth / 2, yLive, 0),
      new THREE.Vector3(totalWidth / 2, yLive, 0),
    ]);
    const liveLaserMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.95,
    });
    priceBeam.add(new THREE.Line(liveLaserGeom, liveLaserMat));

    // Live Beacon Sphere at current candle
    const lastCandleX = startX + (activeCandles.length - 1) * spacing;
    const beaconGeom = new THREE.SphereGeometry(1.3, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
    });
    const beacon = new THREE.Mesh(beaconGeom, beaconMat);
    beacon.position.set(lastCandleX, yLive, 0);
    priceBeam.add(beacon);
  }, [
    candles,
    currentPrice,
    setup,
    liquidityZones,
    scenarios,
    showTerrain,
    showLiquidity,
    showVolCloud,
    showSniperZones,
    showScenarios,
    volatility,
  ]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#05070b] shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[540px] md:h-[620px]"
      }`}
    >
      {/* Three.js 3D Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top 3D Holographic HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        {/* Left: Universe Header */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080d17]/85 border border-cyan-500/40 backdrop-blur-md pointer-events-auto shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-black text-white tracking-wider">GBPUSD 3D UNIVERSE</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-700/50">
            {timeframe}
          </span>
          <span className="text-xs font-mono font-bold text-amber-300">
            {currentPrice.toFixed(5)}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            SPREAD: <b className="text-white">{spreadPips.toFixed(1)}p</b>
          </span>
        </div>

        {/* Center: Live Mode & Session */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080d17]/90 border border-amber-500/40 backdrop-blur-md shadow-lg pointer-events-auto">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span className="text-xs font-black text-slate-300">SESSION:</span>
          <span className="text-xs font-black font-mono text-amber-300 uppercase">
            {session.replace(/_/g, " ")}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] font-mono text-cyan-300">
            VOL: <b>{volatility}</b>
          </span>
        </div>

        {/* Right: Camera Presets & Layer Toggles */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Preset Switcher */}
          <div className="flex rounded-lg bg-[#080d17]/80 border border-slate-700/60 p-0.5 backdrop-blur-md">
            {(["ISO", "SIDE", "TOP", "SNIPER", "PRICE"] as const).map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                  viewPreset === p
                    ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/60"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Auto-Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 3D Orbit Auto-Rotation"
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              autoRotate
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "bg-[#080d17]/80 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
          </button>

          {/* Terrain Toggle */}
          <button
            onClick={() => setShowTerrain(!showTerrain)}
            title="Toggle 3D Price Terrain"
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              showTerrain
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-[#080d17]/80 text-slate-500 border-slate-700 hover:text-slate-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Liquidity Toggle */}
          <button
            onClick={() => setShowLiquidity(!showLiquidity)}
            title="Toggle 3D Derived Liquidity Map"
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              showLiquidity
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-[#080d17]/80 text-slate-500 border-slate-700 hover:text-slate-300"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* Sniper Target Toggle */}
          <button
            onClick={() => setShowSniperZones(!showSniperZones)}
            title="Toggle 3D Sniper Target Zones"
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
              showSniperZones
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-[#080d17]/80 text-slate-500 border-slate-700 hover:text-slate-300"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen 3D Stage"
            className="p-1.5 rounded-lg bg-[#080d17]/80 text-slate-300 border border-slate-700 hover:text-white backdrop-blur-md cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Spatial Navigation Info */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        {/* Spatial Axis Legend */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#080d17]/85 border border-slate-800 backdrop-blur-md text-[11px] font-mono pointer-events-auto">
          <span className="text-slate-400">
            <b className="text-cyan-400">X:</b> Time
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            <b className="text-amber-400">Y:</b> Price
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            <b className="text-emerald-400">Z:</b> Pressure / Depth
          </span>
        </div>

        {/* 3D Orbit Tip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080d17]/75 border border-cyan-900/40 text-[10px] text-cyan-400/80 font-mono backdrop-blur-sm">
          <Compass className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>DRAG TO ORBIT 3D • SCROLL TO ZOOM • PRESETS TO FOCUS</span>
        </div>
      </div>
    </div>
  );
};
