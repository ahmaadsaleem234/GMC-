import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Crosshair,
  Shield,
  Clock,
  Radio,
  Zap,
  Activity,
  Compass,
  AlertTriangle,
} from "lucide-react";
import { RetestXCandle, RetestXDojiReference, RetestXSetup, RetestXState } from "../services/retestXEngine";

interface RetestX3DCommandCenterProps {
  candles?: RetestXCandle[];
  referenceDoji: RetestXDojiReference | null;
  activeSetup: RetestXSetup | null;
  engineState: RetestXState;
  livePrice: number;
  symbol: string;
}

export const RetestX3DCommandCenter: React.FC<RetestX3DCommandCenterProps> = ({
  candles = [],
  referenceDoji,
  activeSetup,
  engineState,
  livePrice,
  symbol = "XAUUSD",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [viewPreset, setViewPreset] = useState<"ISO" | "SIDE" | "TOP" | "FOCUS">("ISO");

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coreMeshGroupRef = useRef<THREE.Group | null>(null);
  const livePriceRingGroupRef = useRef<THREE.Group | null>(null);
  const eventSpikesGroupRef = useRef<THREE.Group | null>(null);
  const calloutsGroupRef = useRef<THREE.Group | null>(null);
  const ambientParticlesRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAnglesRef = useRef({
    theta: Math.PI / 4,
    phi: Math.PI / 3.2,
    radius: 95,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
  });

  // Calculate Price Range Mapping
  const priceRange = useMemo(() => {
    const prices: number[] = [];
    if (candles && candles.length > 0) {
      candles.forEach((c) => prices.push(c.high, c.low, c.open, c.close));
    }
    if (referenceDoji) {
      prices.push(referenceDoji.dojiHigh, referenceDoji.dojiLow);
    }
    if (activeSetup) {
      prices.push(activeSetup.entryPrice, activeSetup.stopLoss, activeSetup.tp1, activeSetup.tp2, activeSetup.tp3);
    }
    if (livePrice > 0) {
      prices.push(livePrice);
    }

    if (prices.length === 0) {
      const p = livePrice > 0 ? livePrice : 4380;
      return { minP: p - 10, maxP: p + 10, centerP: p, span: 20 };
    }

    let minP = Math.min(...prices);
    let maxP = Math.max(...prices);
    const span = Math.max(maxP - minP, 4);
    const padding = span * 0.1;
    minP -= padding;
    maxP += padding;
    const centerP = (minP + maxP) / 2;

    return { minP, maxP, centerP, span: maxP - minP };
  }, [candles, referenceDoji, activeSetup, livePrice]);

  // Map price to Ellipsoid Y elevation [-24, 24]
  const ELLIPSOID_RADIUS_Y = 24;
  const ELLIPSOID_RADIUS_XZ = 32;

  const priceToY = (price: number): number => {
    if (priceRange.span <= 0) return 0;
    const normalized = (price - priceRange.minP) / priceRange.span; // 0 to 1
    return (normalized - 0.5) * (ELLIPSOID_RADIUS_Y * 2); // -24 to +24
  };

  // Get Ellipsoid Radius at specific Y elevation
  const getRadiusAtY = (y: number): number => {
    const clampedY = Math.max(-ELLIPSOID_RADIUS_Y, Math.min(ELLIPSOID_RADIUS_Y, y));
    const factor = Math.sqrt(Math.max(0, 1 - (clampedY * clampedY) / (ELLIPSOID_RADIUS_Y * ELLIPSOID_RADIUS_Y)));
    return ELLIPSOID_RADIUS_XZ * factor;
  };

  // Compute Confidence score
  const confidence = useMemo(() => {
    if (!referenceDoji) return { score: 0, grade: "STANDBY" };
    let score = 70;
    if (referenceDoji.bodySize <= referenceDoji.referenceRange * 0.10) score += 15;
    else if (referenceDoji.bodySize <= referenceDoji.referenceRange * 0.15) score += 10;
    else score += 5;

    const wickDiff = Math.abs(referenceDoji.upperWick - referenceDoji.lowerWick);
    if (wickDiff <= referenceDoji.referenceRange * 0.08) score += 10;
    else if (wickDiff <= referenceDoji.referenceRange * 0.12) score += 5;

    if (engineState === "BUY_CONFIRMED" || engineState === "SELL_CONFIRMED") score += 5;
    const grade = score >= 90 ? "A+ CONVICTION" : score >= 80 ? "A INSTITUTIONAL" : "STANDARD";
    return { score: Math.min(score, 98), grade };
  }, [referenceDoji, engineState]);

  // Sync Camera
  const syncCamera = () => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { theta, phi, radius, targetX, targetY, targetZ } = cameraAnglesRef.current;
    const x = targetX + radius * Math.sin(phi) * Math.sin(theta);
    const y = targetY + radius * Math.cos(phi);
    const z = targetZ + radius * Math.sin(phi) * Math.cos(theta);
    camera.position.set(x, y, z);
    camera.lookAt(targetX, targetY, targetZ);
  };

  // Helper to create sharp Canvas Text Sprite
  const createTextSprite = (
    text: string,
    subText?: string,
    color = "#38bdf8",
    bgColor = "rgba(6, 10, 18, 0.92)",
    borderColor = "#0284c7"
  ): THREE.Sprite => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Glow background
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(10, 10, 492, 120, 20);
      ctx.fill();
      ctx.stroke();

      // Main Text
      ctx.fillStyle = color;
      ctx.font = "bold 38px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 256, subText ? 52 : 70);

      // Optional Subtext
      if (subText) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 22px monospace";
        ctx.fillText(subText, 256, 94);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(13, 3.6, 1);
    return sprite;
  };

  // -------------------------------------------------------------
  // Initial Scene Setup
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 520;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x020306);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      cameraRef.current = camera;
      syncCamera();

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Clean Ambient Space Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
      dirLight1.position.set(40, 60, 40);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.8);
      dirLight2.position.set(-40, -50, -40);
      scene.add(dirLight2);

      // Groups
      const coreGroup = new THREE.Group();
      scene.add(coreGroup);
      coreMeshGroupRef.current = coreGroup;

      const liveRingGroup = new THREE.Group();
      scene.add(liveRingGroup);
      livePriceRingGroupRef.current = liveRingGroup;

      const spikesGroup = new THREE.Group();
      scene.add(spikesGroup);
      eventSpikesGroupRef.current = spikesGroup;

      const calloutsGroup = new THREE.Group();
      scene.add(calloutsGroup);
      calloutsGroupRef.current = calloutsGroup;

      // Background Subtle Ambient Stardust Particles
      const particleCount = 180;
      const pGeom = new THREE.BufferGeometry();
      const pPositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        pPositions[i] = (Math.random() - 0.5) * 220;
        pPositions[i + 1] = (Math.random() - 0.5) * 160;
        pPositions[i + 2] = (Math.random() - 0.5) * 220;
      }
      pGeom.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
      const pMat = new THREE.PointsMaterial({ size: 1.2, color: 0x38bdf8, transparent: true, opacity: 0.35 });
      const particles = new THREE.Points(pGeom, pMat);
      scene.add(particles);
      ambientParticlesRef.current = particles;

      // Animation Loop
      let clock = new THREE.Clock();
      const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        if (autoRotate) {
          cameraAnglesRef.current.theta += 0.004;
          syncCamera();
        }

        if (coreMeshGroupRef.current) {
          coreMeshGroupRef.current.rotation.y = elapsedTime * 0.08;
        }

        if (livePriceRingGroupRef.current) {
          livePriceRingGroupRef.current.rotation.z = Math.sin(elapsedTime * 1.5) * 0.04;
        }

        renderer.render(scene, camera);
      };
      animate();
    } catch (err) {
      console.error("[RETEST X 3D] Failed to initialize WebGL context:", err);
      setHasWebGLError(true);
    }

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
    };
  }, []);

  // -------------------------------------------------------------
  // Mouse & Touch Controls
  // -------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      isRightDraggingRef.current = true;
    } else {
      isDraggingRef.current = true;
    }
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current && !isRightDraggingRef.current) return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      cameraAnglesRef.current.theta -= dx * 0.008;
      cameraAnglesRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, cameraAnglesRef.current.phi - dy * 0.008));
    } else if (isRightDraggingRef.current) {
      // Pan
      cameraAnglesRef.current.targetX -= dx * 0.12;
      cameraAnglesRef.current.targetY += dy * 0.12;
    }
    syncCamera();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isRightDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraAnglesRef.current.radius = Math.max(25, Math.min(220, cameraAnglesRef.current.radius + e.deltaY * 0.07));
    syncCamera();
  };

  // View Preset Handler
  const setPreset = (preset: "ISO" | "SIDE" | "TOP" | "FOCUS") => {
    setViewPreset(preset);
    if (preset === "ISO") {
      cameraAnglesRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 95, targetX: 0, targetY: 0, targetZ: 0 };
    } else if (preset === "SIDE") {
      cameraAnglesRef.current = { theta: 0, phi: Math.PI / 2.02, radius: 90, targetX: 0, targetY: 0, targetZ: 0 };
    } else if (preset === "TOP") {
      cameraAnglesRef.current = { theta: 0, phi: 0.05, radius: 100, targetX: 0, targetY: 0, targetZ: 0 };
    } else if (preset === "FOCUS") {
      const targetY = referenceDoji ? priceToY((referenceDoji.dojiHigh + referenceDoji.dojiLow) / 2) : 0;
      cameraAnglesRef.current = { theta: Math.PI / 4.5, phi: Math.PI / 2.8, radius: 65, targetX: 0, targetY, targetZ: 0 };
    }
    syncCamera();
  };

  // -------------------------------------------------------------
  // DYNAMIC 3D RENDER LAYER (Heatmap Ellipsoid, Ring, Spikes, Callouts)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current || !coreMeshGroupRef.current || !livePriceRingGroupRef.current || !eventSpikesGroupRef.current || !calloutsGroupRef.current) {
      return;
    }

    // Clear previous dynamic meshes
    while (coreMeshGroupRef.current.children.length > 0) {
      const obj = coreMeshGroupRef.current.children[0];
      coreMeshGroupRef.current.remove(obj);
    }
    while (livePriceRingGroupRef.current.children.length > 0) {
      const obj = livePriceRingGroupRef.current.children[0];
      livePriceRingGroupRef.current.remove(obj);
    }
    while (eventSpikesGroupRef.current.children.length > 0) {
      const obj = eventSpikesGroupRef.current.children[0];
      eventSpikesGroupRef.current.remove(obj);
    }
    while (calloutsGroupRef.current.children.length > 0) {
      const obj = calloutsGroupRef.current.children[0];
      calloutsGroupRef.current.remove(obj);
    }

    const direction = activeSetup?.direction || (engineState === "SELL_CONFIRMED" ? "SELL" : "BUY");
    const isSellDirection = direction === "SELL";

    // 1. BUILD WIREFRAME MESH ELLIPSOID WITH HEATMAP VERTEX GRADIENT
    const uSegments = 48;
    const vSegments = 32;
    const sphereGeom = new THREE.SphereGeometry(1, uSegments, vSegments);
    const posAttr = sphereGeom.attributes.position;
    const colors: number[] = [];

    // Color definitions
    const colorRed = new THREE.Color(0xef4444); // Deep Red (SL / Risk Zone)
    const colorAmber = new THREE.Color(0xf59e0b); // Amber / Yellow (Neutral / Retest Zone)
    const colorCyan = new THREE.Color(0x06b6d4); // Cyan / Blue (Entry Pivot)
    const colorGreen = new THREE.Color(0x10b981); // Emerald Green (Take Profit Target Zone)

    // Deform sphere into an ellipsoid and compute heatmap vertex colors
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const py = posAttr.getY(i);
      const pz = posAttr.getZ(i);

      // Organic wave / deformation harmonics
      const angle = Math.atan2(pz, px);
      const harmonic = 1 + 0.05 * Math.sin(angle * 4) * Math.cos(py * Math.PI);

      const x = px * ELLIPSOID_RADIUS_XZ * harmonic;
      const y = py * ELLIPSOID_RADIUS_Y;
      const z = pz * ELLIPSOID_RADIUS_XZ * harmonic;
      posAttr.setXYZ(i, x, y, z);

      // Heatmap gradient mapping based on Y elevation [-1 to 1]
      // Top (+1) vs Bottom (-1) mapped to SL vs TP depending on trade direction
      const normalizedY = (py + 1) / 2; // 0 (bottom) to 1 (top)

      let vertColor = new THREE.Color();
      if (isSellDirection) {
        // For SELL: Top is SL (Red), Middle is Amber, Bottom is TP (Green)
        if (normalizedY > 0.5) {
          const t = (normalizedY - 0.5) * 2;
          vertColor.copy(colorAmber).lerp(colorRed, t);
        } else {
          const t = (0.5 - normalizedY) * 2;
          vertColor.copy(colorAmber).lerp(colorGreen, t);
        }
      } else {
        // For BUY: Top is TP (Green), Middle is Amber, Bottom is SL (Red)
        if (normalizedY > 0.5) {
          const t = (normalizedY - 0.5) * 2;
          vertColor.copy(colorAmber).lerp(colorGreen, t);
        } else {
          const t = (0.5 - normalizedY) * 2;
          vertColor.copy(colorAmber).lerp(colorRed, t);
        }
      }

      colors.push(vertColor.r, vertColor.g, vertColor.b);
    }

    sphereGeom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    sphereGeom.computeVertexNormals();

    // Solid Semi-Transparent Inner Core
    const innerMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const innerMesh = new THREE.Mesh(sphereGeom, innerMat);
    coreMeshGroupRef.current?.add(innerMesh);

    // Glowing Wireframe Mesh Layer (Grid of Quads)
    const wireframeMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const wireframeMesh = new THREE.Mesh(sphereGeom, wireframeMat);
    coreMeshGroupRef.current?.add(wireframeMesh);

    // Subtle Internal Core Torus Glow Ring
    const innerRingGeom = new THREE.TorusGeometry(ELLIPSOID_RADIUS_XZ * 0.7, 0.4, 16, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3, wireframe: true });
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    coreMeshGroupRef.current?.add(innerRing);

    // 2. CENTER GLOW RING (Live Price Level wrapped horizontally around mesh)
    const liveY = priceToY(livePrice > 0 ? livePrice : priceRange.centerP);
    const ringRadius = getRadiusAtY(liveY) + 1.2;

    const ringGeom = new THREE.TorusGeometry(ringRadius, 0.6, 16, 80);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    });
    const liveRingMesh = new THREE.Mesh(ringGeom, ringMat);
    liveRingMesh.rotation.x = Math.PI / 2;
    liveRingMesh.position.y = liveY;
    livePriceRingGroupRef.current?.add(liveRingMesh);

    // Outer Neon Pulse Halo around Live Ring
    const haloGeom = new THREE.TorusGeometry(ringRadius + 0.8, 0.2, 8, 80);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.6 });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    haloMesh.position.y = liveY;
    livePriceRingGroupRef.current?.add(haloMesh);

    // 3. EVENT SPIKE MARKER (Alert Flare rising outward on Doji / Breakout / Retest)
    const showEventSpike = engineState !== "WAITING" || referenceDoji !== null;
    if (showEventSpike && referenceDoji) {
      const isBreakout = engineState === "BREAKOUT_CONFIRMED" || engineState === "BUY_CONFIRMED" || engineState === "SELL_CONFIRMED";
      const spikeLevel = isBreakout && activeSetup ? activeSetup.entryPrice : referenceDoji.dojiHigh;
      const spikeY = priceToY(spikeLevel);
      const spikeR = getRadiusAtY(spikeY);

      // Position on the perimeter of the ellipsoid
      const spikeAngle = Math.PI / 3.5;
      const spikeX = Math.cos(spikeAngle) * spikeR;
      const spikeZ = Math.sin(spikeAngle) * spikeR;

      // Triangular Cone Flare
      const coneGeom = new THREE.ConeGeometry(2.0, 7.5, 6);
      const coneMat = new THREE.MeshBasicMaterial({
        color: isBreakout ? 0x10b981 : 0xef4444,
        wireframe: false,
      });
      const spikeCone = new THREE.Mesh(coneGeom, coneMat);
      spikeCone.position.set(spikeX, spikeY + 3.5, spikeZ);
      spikeCone.rotation.x = isSellDirection ? Math.PI : 0;
      eventSpikesGroupRef.current?.add(spikeCone);

      // Wireframe aura around flare
      const auraGeom = new THREE.ConeGeometry(2.8, 9.0, 6);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const auraCone = new THREE.Mesh(auraGeom, auraMat);
      auraCone.position.set(spikeX, spikeY + 3.5, spikeZ);
      eventSpikesGroupRef.current?.add(auraCone);

      // Flare Beacon Label
      const flareLabel = createTextSprite(
        `⚡ EVENT: ${engineState}`,
        `15M SIGNAL FLUID`,
        isBreakout ? "#34d399" : "#fca5a5",
        "rgba(15, 8, 12, 0.95)",
        isBreakout ? "#10b981" : "#ef4444"
      );
      flareLabel.position.set(spikeX + 8, spikeY + 8, spikeZ);
      eventSpikesGroupRef.current?.add(flareLabel);
    }

    // 4. ANNOTATION CALLOUTS (Lines + Floating Text Sprites)
    const addAnnotationCallout = (
      price: number,
      title: string,
      sub: string,
      colorHex: string,
      borderHex: string,
      angleRad: number,
      offsetLen = 14
    ) => {
      const y = priceToY(price);
      const r = getRadiusAtY(y);
      const surfaceX = Math.cos(angleRad) * r;
      const surfaceZ = Math.sin(angleRad) * r;

      const calloutX = Math.cos(angleRad) * (r + offsetLen);
      const calloutZ = Math.sin(angleRad) * (r + offsetLen);

      // Directional Callout Leader Line
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(surfaceX, y, surfaceZ),
        new THREE.Vector3(calloutX - Math.cos(angleRad) * 2, y, calloutZ - Math.sin(angleRad) * 2),
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(borderHex), transparent: true, opacity: 0.85 });
      const line = new THREE.Line(lineGeom, lineMat);
      calloutsGroupRef.current?.add(line);

      // Anchor Point Sphere on Mesh Surface
      const dotGeom = new THREE.SphereGeometry(0.6, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(borderHex) });
      const dot = new THREE.Mesh(dotGeom, dotMat);
      dot.position.set(surfaceX, y, surfaceZ);
      calloutsGroupRef.current?.add(dot);

      // Text Sprite
      const sprite = createTextSprite(title, sub, colorHex, "rgba(5, 8, 14, 0.94)", borderHex);
      sprite.position.set(calloutX, y, calloutZ);
      calloutsGroupRef.current?.add(sprite);
    };

    // (A) Live Price Callout
    if (livePrice > 0) {
      addAnnotationCallout(
        livePrice,
        `LIVE: ${livePrice.toFixed(2)}`,
        `15M SPOT TICK`,
        "#fbbf24",
        "#f59e0b",
        -Math.PI / 4,
        15
      );
    }

    // (B) Reference Doji High Callout
    if (referenceDoji) {
      addAnnotationCallout(
        referenceDoji.dojiHigh,
        `DOJI HIGH: ${referenceDoji.dojiHigh.toFixed(2)}`,
        `FIXED BOUNDARY (H)`,
        "#fb7185",
        "#f43f5e",
        Math.PI / 2,
        15
      );

      // (C) Reference Doji Low Callout
      addAnnotationCallout(
        referenceDoji.dojiLow,
        `DOJI LOW: ${referenceDoji.dojiLow.toFixed(2)}`,
        `FIXED BOUNDARY (L)`,
        "#34d399",
        "#10b981",
        -Math.PI / 2,
        15
      );
    }

    // (D) Active Setup Generated Levels: Entry, SL, TP1, TP2, TP3
    if (activeSetup) {
      // Entry Level
      addAnnotationCallout(
        activeSetup.entryPrice,
        `ENTRY: ${activeSetup.entryPrice.toFixed(2)}`,
        `CONFIRMED ${activeSetup.direction}`,
        "#38bdf8",
        "#0284c7",
        Math.PI * 0.9,
        16
      );

      // Stop Loss (SL)
      addAnnotationCallout(
        activeSetup.stopLoss,
        `SL: ${activeSetup.stopLoss.toFixed(2)}`,
        `INVALIDATION LIMIT`,
        "#f87171",
        "#ef4444",
        Math.PI * 0.7,
        16
      );

      // TP1 (1:2 R:R)
      addAnnotationCallout(
        activeSetup.tp1,
        `TP1: ${activeSetup.tp1.toFixed(2)}`,
        `1:2 R:R (50% EXIT)`,
        "#34d399",
        "#10b981",
        -Math.PI * 0.8,
        16
      );

      // TP2 (1:3 R:R)
      addAnnotationCallout(
        activeSetup.tp2,
        `TP2: ${activeSetup.tp2.toFixed(2)}`,
        `1:3 R:R RUNNER`,
        "#6ee7b7",
        "#059669",
        -Math.PI * 0.65,
        17
      );

      // TP3 (1:4 R:R)
      addAnnotationCallout(
        activeSetup.tp3,
        `TP3: ${activeSetup.tp3.toFixed(2)}`,
        `1:4 R:R EXTENSION`,
        "#a7f3d0",
        "#047857",
        -Math.PI * 0.5,
        18
      );
    }

    // (E) Confidence Score Callout (Top Center Badge)
    if (referenceDoji) {
      const confSprite = createTextSprite(
        `CONFIDENCE: ${confidence.score}%`,
        `${confidence.grade} CONVICTION`,
        "#a855f7",
        "rgba(15, 10, 25, 0.95)",
        "#9333ea"
      );
      confSprite.position.set(0, ELLIPSOID_RADIUS_Y + 5, 0);
      calloutsGroupRef.current?.add(confSprite);
    }
  }, [candles, referenceDoji, activeSetup, engineState, livePrice, priceRange, confidence]);

  if (hasWebGLError) {
    return (
      <div className="bg-[#0B0E14] border border-[#232B38] rounded-2xl p-6 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 mx-auto text-amber-400 mb-2" />
        <p className="text-sm font-bold text-slate-200">3D WebGL Acceleration Unavailable</p>
        <p className="text-xs text-slate-500 mt-1">
          The 2D Retest X dashboard continues running with live real-time telemetry below.
        </p>
      </div>
    );
  }

  return (
    <div
      id="retest-x-3d-command-center"
      className={`relative bg-[#020306] border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 shadow-[0_0_50px_rgba(0,0,0,0.9)]" : "w-full h-[520px]"
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* TOP LEFT HUD: LIVE UNIVERSE TELEMETRY */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#060A12]/90 backdrop-blur-md border border-[#1E293B] px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              HEATMAP ELLIPSOID UNIVERSE • {symbol}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-black text-amber-400">
                LIVE: {livePrice ? livePrice.toFixed(2) : "---"}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                15M MATRIX
              </span>
            </div>
          </div>
        </div>

        {referenceDoji && (
          <div className="bg-[#060A12]/85 backdrop-blur-md border border-[#1E293B] px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <span className="text-amber-400 font-bold">REF DOJI:</span>
            <span className="text-rose-400">H: {referenceDoji.dojiHigh.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">L: {referenceDoji.dojiLow.toFixed(2)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300">CONF: {confidence.score}%</span>
          </div>
        )}
      </div>

      {/* TOP RIGHT: CAMERA CONTROLS & PRESET BUTTONS */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Preset View Switcher */}
        <div className="bg-[#060A12]/90 backdrop-blur-md border border-[#1E293B] p-1 rounded-xl flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setPreset("ISO")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewPreset === "ISO" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
            title="Isometric 3D Perspective"
          >
            ISO
          </button>
          <button
            onClick={() => setPreset("SIDE")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewPreset === "SIDE" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
            title="Horizon Side View"
          >
            SIDE
          </button>
          <button
            onClick={() => setPreset("TOP")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              viewPreset === "TOP" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            }`}
            title="Top-Down Structure View"
          >
            TOP
          </button>
          <button
            onClick={() => setPreset("FOCUS")}
            disabled={!referenceDoji}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 ${
              viewPreset === "FOCUS" ? "bg-amber-400 text-slate-950 shadow" : "text-amber-400 hover:bg-amber-400/20"
            }`}
            title="Focus Reference Doji & Retest Setup"
          >
            <Crosshair className="w-3 h-3" />
            <span>Focus Setup</span>
          </button>
        </div>

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
            autoRotate
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              : "bg-[#060A12]/90 border-[#1E293B] text-slate-400 hover:text-white"
          }`}
          title="Toggle Auto Rotation Orbit"
        >
          <RotateCcw className={`w-4 h-4 ${autoRotate ? "animate-spin" : ""}`} />
        </button>

        {/* Reset Camera Position */}
        <button
          onClick={() => setPreset("ISO")}
          className="p-2 rounded-xl bg-[#060A12]/90 border border-[#1E293B] text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer"
          title="Reset Camera View"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Fullscreen Expand Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl bg-[#060A12]/90 border border-[#1E293B] text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* BOTTOM CENTER: MOUSE INTERACTION GUIDE */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-[#060A12]/75 backdrop-blur-md border border-[#1E293B] px-3.5 py-1 rounded-full text-[10px] text-slate-400 font-mono flex items-center gap-3">
          <span>🖱️ Left-Click: Rotate</span>
          <span>•</span>
          <span>Right-Click: Pan</span>
          <span>•</span>
          <span>Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
};
