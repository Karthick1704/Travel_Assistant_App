import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type FlightPhase = 'cruise' | 'takeoff' | 'landing';

interface AircraftSceneProps {
  /** Flight phase drives pitch, gear, cloud speed and sky. */
  phase?: FlightPhase;
  /** Enables orbit/zoom interaction. When false the camera gently auto-orbits. */
  interactive?: boolean;
  /** Increment to snap the camera back to the hero angle. */
  resetSignal?: number;
  /** Hero framing pulls the camera in tighter; 'wide' shows contrails + clouds. */
  framing?: 'hero' | 'wide' | 'banner';
  /** Lower quality skips the environment map & halves particle count. */
  quality?: 'high' | 'low';
  className?: string;
  onInteractionChange?: (dragging: boolean) => void;
}

/* ------------------------------------------------------------------ */
/* Textures                                                            */
/* ------------------------------------------------------------------ */

function makeFuselageTexture(): THREE.CanvasTexture {
  // Canvas x = circumference (u), canvas y = fuselage length (v; nose at top).
  // Lathe UV after rotateX(90°): u=0 belly, u=0.25 starboard, u=0.5 crown, u=0.75 port.
  const W = 1024;
  const H = 2048;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#f7f9fb';
  ctx.fillRect(0, 0, W, H);

  // Belly shading + jade cheat stripe (u = 0 / 1 wrap seam)
  for (const bx of [0, W]) {
    const g = ctx.createLinearGradient(bx - W * 0.16, 0, bx + W * 0.16, 0);
    g.addColorStop(0, 'rgba(203,213,225,0)');
    g.addColorStop(0.5, 'rgba(148,163,184,0.5)');
    g.addColorStop(1, 'rgba(203,213,225,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx - W * 0.16, 0, W * 0.32, H);
    ctx.fillStyle = 'rgba(0,101,100,0.9)';
    ctx.fillRect(bx - 16, H * 0.16, 32, H * 0.6);
  }

  // Window rows: slightly above the equator on each side
  const sides = [W * 0.28, W * 0.72];
  const winW = 18; // circumference extent
  const winH = 13; // length extent
  const pitch = 30;
  const vStart = 0.3;
  const vEnd = 0.87;
  for (const cx of sides) {
    ctx.fillStyle = '#0f172a';
    for (let y = (1 - vEnd) * H; y < (1 - vStart) * H; y += pitch) {
      roundRect(ctx, cx - winW / 2, y, winW, winH, 5);
      ctx.fill();
    }
    // Doors (front, over-wing, rear) — vertical rectangles interrupting the window row
    ctx.strokeStyle = 'rgba(71,85,105,0.5)';
    ctx.lineWidth = 3;
    for (const v of [0.84, 0.6, 0.33]) {
      const y = (1 - v) * H;
      ctx.fillStyle = '#f7f9fb';
      roundRect(ctx, cx - 50, y - 27, 100, 55, 8);
      ctx.fill();
      ctx.stroke();
    }
    // Emergency exit marking above the over-wing door
    ctx.fillStyle = 'rgba(230,57,70,0.9)';
    ctx.fillRect(cx - 40, (1 - 0.6) * H - 40, 80, 6);
  }

  // Cockpit visor windows near the nose, both sides wrapping toward the front
  ctx.fillStyle = '#0b1324';
  for (const cx of [W * 0.2, W * 0.8]) {
    const y = (1 - 0.935) * H;
    ctx.beginPath();
    ctx.moveTo(cx - 80, y);
    ctx.lineTo(cx + 80, y);
    ctx.lineTo(cx + 55, y + 40);
    ctx.lineTo(cx - 55, y + 40);
    ctx.closePath();
    ctx.fill();
  }

  // Fine panel lines around the circumference
  ctx.strokeStyle = 'rgba(148,163,184,0.28)';
  ctx.lineWidth = 2;
  for (const v of [0.26, 0.46, 0.68, 0.9]) {
    const y = (1 - v) * H;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function makeFanTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, S, S);
  ctx.translate(S / 2, S / 2);
  const blades = 22;
  for (let i = 0; i < blades; i++) {
    ctx.rotate((Math.PI * 2) / blades);
    ctx.fillStyle = i % 2 === 0 ? '#cbd5e1' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(S * 0.18, -S * 0.08, S * 0.48, -S * 0.02);
    ctx.lineTo(S * 0.48, S * 0.04);
    ctx.quadraticCurveTo(S * 0.18, S * 0.02, 0, 0);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCloudTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ------------------------------------------------------------------ */
/* Aircraft builder                                                    */
/* ------------------------------------------------------------------ */

interface AircraftParts {
  group: THREE.Group;
  fans: THREE.Mesh[];
  gear: THREE.Group[];
  exhausts: THREE.Object3D[];
  navLeft: THREE.Mesh;
  navRight: THREE.Mesh;
  strobe: THREE.Mesh;
  beacon: THREE.Mesh;
  disposables: Array<{ dispose: () => void }>;
}

function buildAircraft(): AircraftParts {
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(o: T): T => {
    disposables.push(o);
    return o;
  };

  const group = new THREE.Group();

  // ---- Materials
  const fuselageTex = track(makeFuselageTexture());
  const bodyMat = track(
    new THREE.MeshPhysicalMaterial({
      map: fuselageTex,
      color: 0xffffff,
      metalness: 0.12,
      roughness: 0.32,
      clearcoat: 0.8,
      clearcoatRoughness: 0.18,
    })
  );
  const whiteMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf7f9fb,
      metalness: 0.12,
      roughness: 0.34,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
    })
  );
  const jadeMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x006564,
      metalness: 0.2,
      roughness: 0.3,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
    })
  );
  const darkMetal = track(new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.85, roughness: 0.35 }));
  const tyreMat = track(new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.95 }));
  const glowRed = track(new THREE.MeshBasicMaterial({ color: 0xff3b3b }));
  const glowGreen = track(new THREE.MeshBasicMaterial({ color: 0x34d399 }));
  const glowWhite = track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const fanTex = track(makeFanTexture());
  const fanMat = track(new THREE.MeshStandardMaterial({ map: fanTex, metalness: 0.7, roughness: 0.4 }));

  // ---- Fuselage (lathe along Y, then rotated so nose points +Z)
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.001, -3.05),
    new THREE.Vector2(0.07, -2.8),
    new THREE.Vector2(0.17, -2.35),
    new THREE.Vector2(0.3, -1.8),
    new THREE.Vector2(0.4, -1.2),
    new THREE.Vector2(0.44, -0.6),
    new THREE.Vector2(0.45, 0.4),
    new THREE.Vector2(0.45, 1.3),
    new THREE.Vector2(0.43, 1.85),
    new THREE.Vector2(0.38, 2.3),
    new THREE.Vector2(0.28, 2.66),
    new THREE.Vector2(0.14, 2.9),
    new THREE.Vector2(0.001, 3.0),
  ];
  const fuselageGeo = track(new THREE.LatheGeometry(profile, 72));
  fuselageGeo.rotateX(Math.PI / 2);
  // Tail-cone upsweep: lift the aft section so it looks like an airliner, not a tube
  {
    const pos = fuselageGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      if (z < -1.0) {
        const t = THREE.MathUtils.smoothstep(-z, 1.0, 3.05);
        pos.setY(i, pos.getY(i) + t * 0.32);
      }
    }
    pos.needsUpdate = true;
    fuselageGeo.computeVertexNormals();
  }
  const fuselage = new THREE.Mesh(fuselageGeo, bodyMat);
  group.add(fuselage);

  // ---- Wings
  const makeWingShape = (dir: 1 | -1) => {
    const s = new THREE.Shape();
    // root chord (x = 0) from leading edge (y = +0.55) to trailing edge (y = -0.75)
    s.moveTo(0, 0.55);
    s.lineTo(dir * 3.2, -0.95); // tip leading edge (swept back)
    s.lineTo(dir * 3.25, -1.25); // tip trailing edge
    s.lineTo(dir * 1.1, -0.95); // kink (yehudi)
    s.lineTo(0, -0.75);
    s.closePath();
    return s;
  };
  const wingExtrude = { depth: 0.07, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.03, bevelThickness: 0.025 };
  const wings: THREE.Mesh[] = [];
  for (const dir of [1, -1] as const) {
    const geo = track(new THREE.ExtrudeGeometry(makeWingShape(dir), wingExtrude));
    geo.rotateX(Math.PI / 2); // lie flat: X span, Z chord
    const wing = new THREE.Mesh(geo, whiteMat);
    wing.position.set(0, -0.2, 0.2);
    wing.rotation.z = dir * 0.09; // dihedral
    group.add(wing);
    wings.push(wing);
  }
  // Wing-body fairing
  const fairingGeo = track(new THREE.SphereGeometry(0.62, 24, 16));
  const fairing = new THREE.Mesh(fairingGeo, whiteMat);
  fairing.scale.set(0.95, 0.45, 1.5);
  fairing.position.set(0, -0.22, 0.05);
  group.add(fairing);

  // ---- Winglets (blended, jade). Shape: x = chord, y = height; baked to stand at the tip.
  for (const dir of [1, -1] as const) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.22, 0.62);
    s.lineTo(0.3, 0.62);
    s.lineTo(0.3, 0);
    s.closePath();
    const geo = track(new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: false }));
    geo.rotateY(Math.PI / 2); // chord now runs along -z, thickness along +x
    if (dir === -1) geo.scale(-1, 1, 1);
    const winglet = new THREE.Mesh(geo, jadeMat);
    winglet.rotation.z = dir * -0.3; // cant outward
    winglet.position.set(dir * 3.22, 0.1, -0.95);
    group.add(winglet);
  }

  // ---- Engines (nacelle, fan, spinner, exhaust, pylon)
  const fans: THREE.Mesh[] = [];
  const exhausts: THREE.Object3D[] = [];
  for (const dir of [1, -1] as const) {
    const eng = new THREE.Group();
    const nacelleGeo = track(new THREE.CylinderGeometry(0.29, 0.26, 1.15, 40, 1, true));
    nacelleGeo.rotateX(Math.PI / 2);
    const nacelle = new THREE.Mesh(nacelleGeo, jadeMat);
    eng.add(nacelle);

    // inner lip ring
    const lipGeo = track(new THREE.TorusGeometry(0.285, 0.022, 12, 40));
    const lip = new THREE.Mesh(lipGeo, darkMetal);
    lip.position.z = 0.575;
    eng.add(lip);

    // intake darkness
    const innerGeo = track(new THREE.CylinderGeometry(0.265, 0.24, 1.1, 40, 1, true));
    innerGeo.rotateX(Math.PI / 2);
    const inner = new THREE.Mesh(innerGeo, track(new THREE.MeshStandardMaterial({ color: 0x0b1324, side: THREE.BackSide, roughness: 0.9 })));
    eng.add(inner);

    // fan disc
    const fanGeo = track(new THREE.CircleGeometry(0.255, 48));
    const fan = new THREE.Mesh(fanGeo, fanMat);
    fan.position.z = 0.4;
    eng.add(fan);
    fans.push(fan);

    // spinner cone
    const spinnerGeo = track(new THREE.ConeGeometry(0.06, 0.16, 20));
    spinnerGeo.rotateX(Math.PI / 2);
    const spinner = new THREE.Mesh(spinnerGeo, whiteMat);
    spinner.position.z = 0.5;
    eng.add(spinner);

    // exhaust core
    const coreGeo = track(new THREE.CylinderGeometry(0.11, 0.16, 0.42, 24));
    coreGeo.rotateX(Math.PI / 2);
    const core = new THREE.Mesh(coreGeo, darkMetal);
    core.position.z = -0.72;
    eng.add(core);

    const exhaustAnchor = new THREE.Object3D();
    exhaustAnchor.position.set(0, 0, -0.98);
    eng.add(exhaustAnchor);
    exhausts.push(exhaustAnchor);

    // pylon (tall enough to bury into the wing underside)
    const pylonGeo = track(new THREE.BoxGeometry(0.08, 0.45, 0.6));
    const pylon = new THREE.Mesh(pylonGeo, whiteMat);
    pylon.position.set(0, 0.38, -0.05);
    eng.add(pylon);

    eng.position.set(dir * 1.3, -0.62, -0.05);
    group.add(eng);
  }

  // ---- Vertical fin (jade) with white brushwing stroke
  {
    const s = new THREE.Shape();
    s.moveTo(-1.55, 0.2);
    s.lineTo(-2.85, 1.55);
    s.lineTo(-3.25, 1.55);
    s.lineTo(-2.55, 0.2);
    s.closePath();
    const geo = track(new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }));
    geo.rotateY(-Math.PI / 2); // shape x → world z (negative x is aft), thickness → -x
    const fin = new THREE.Mesh(geo, jadeMat);
    fin.position.set(0.035, 0.1, 0); // centre the 0.07 thickness on the spine
    group.add(fin);

    // Brushwing: a swooping white stroke on both faces of the fin
    for (const side of [1, -1] as const) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.045, 0.45, -2.45),
        new THREE.Vector3(side * 0.045, 0.75, -2.35),
        new THREE.Vector3(side * 0.045, 1.15, -2.6),
        new THREE.Vector3(side * 0.045, 1.5, -3.05),
      ]);
      const tubeGeo = track(new THREE.TubeGeometry(curve, 32, 0.045, 8, false));
      const stroke = new THREE.Mesh(tubeGeo, whiteMat);
      // taper the stroke by scaling radius along the curve (approximate with two tubes)
      group.add(stroke);
    }
  }

  // ---- Horizontal stabilisers
  for (const dir of [1, -1] as const) {
    const s = new THREE.Shape();
    s.moveTo(0, 0.25);
    s.lineTo(dir * 1.25, -0.4);
    s.lineTo(dir * 1.3, -0.62);
    s.lineTo(0, -0.35);
    s.closePath();
    const geo = track(new THREE.ExtrudeGeometry(s, { depth: 0.045, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.01, bevelSegments: 2 }));
    geo.rotateX(Math.PI / 2);
    const stab = new THREE.Mesh(geo, whiteMat);
    stab.position.set(0, 0.42, -2.35);
    stab.rotation.z = dir * 0.12;
    group.add(stab);
  }

  // ---- Landing gear (retractable)
  const gear: THREE.Group[] = [];
  const makeGear = (x: number, z: number, twin: boolean) => {
    const g = new THREE.Group();
    const strutGeo = track(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 12));
    const strut = new THREE.Mesh(strutGeo, darkMetal);
    strut.position.y = -0.275;
    g.add(strut);
    const wheelGeo = track(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 24));
    wheelGeo.rotateZ(Math.PI / 2);
    const hubGeo = track(new THREE.CylinderGeometry(0.05, 0.05, 0.075, 16));
    hubGeo.rotateZ(Math.PI / 2);
    const offsets = twin ? [-0.09, 0.09] : [0];
    for (const off of offsets) {
      const w = new THREE.Mesh(wheelGeo, tyreMat);
      w.position.set(off, -0.55, 0);
      g.add(w);
      const hub = new THREE.Mesh(hubGeo, glowWhite);
      hub.position.set(off, -0.55, 0);
      g.add(hub);
    }
    g.position.set(x, -0.35, z);
    group.add(g);
    gear.push(g);
  };
  makeGear(0, 2.0, false);
  makeGear(0.55, -0.15, true);
  makeGear(-0.55, -0.15, true);

  // ---- Navigation & anti-collision lights
  const lightGeo = track(new THREE.SphereGeometry(0.045, 12, 12));
  const navLeft = new THREE.Mesh(lightGeo, glowRed);
  navLeft.position.set(3.3, 0.05, -1.05);
  const navRight = new THREE.Mesh(lightGeo, glowGreen);
  navRight.position.set(-3.3, 0.05, -1.05);
  const strobe = new THREE.Mesh(lightGeo, glowWhite);
  strobe.position.set(0, 0.32, -3.0);
  const beacon = new THREE.Mesh(lightGeo, glowRed);
  beacon.position.set(0, 0.5, 0.4);
  group.add(navLeft, navRight, strobe, beacon);

  return { group, fans, gear, exhausts, navLeft, navRight, strobe, beacon, disposables };
}

/* ------------------------------------------------------------------ */
/* Contrail particle system                                            */
/* ------------------------------------------------------------------ */

class Contrail {
  points: THREE.Points;
  private positions: Float32Array;
  private ages: Float32Array;
  private seeds: Float32Array;
  private count: number;
  private head = 0;
  material: THREE.ShaderMaterial;

  constructor(count: number, color: THREE.Color) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.ages = new Float32Array(count).fill(2); // start dead
    this.seeds = new Float32Array(count).map(() => Math.random());
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('aAge', new THREE.BufferAttribute(this.ages, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(this.seeds, 1));
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: color }, uOpacity: { value: 0.55 } },
      vertexShader: `
        attribute float aAge;
        attribute float aSeed;
        varying float vAge;
        void main() {
          vAge = aAge;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float size = (6.0 + aAge * 26.0 + aSeed * 6.0);
          gl_PointSize = size * (220.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vAge;
        void main() {
          if (vAge > 1.0) discard;
          float d = distance(gl_PointCoord, vec2(0.5));
          float soft = smoothstep(0.5, 0.05, d);
          float life = (1.0 - vAge) * smoothstep(0.0, 0.08, vAge);
          gl_FragColor = vec4(uColor, soft * life * uOpacity);
        }
      `,
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
  }

  emit(origin: THREE.Vector3, jitter: number) {
    const i = this.head;
    this.positions[i * 3] = origin.x + (Math.random() - 0.5) * jitter;
    this.positions[i * 3 + 1] = origin.y + (Math.random() - 0.5) * jitter;
    this.positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * jitter;
    this.ages[i] = 0;
    this.head = (i + 1) % this.count;
  }

  update(dt: number, drift: number, lifetime: number) {
    for (let i = 0; i < this.count; i++) {
      if (this.ages[i] > 1) continue;
      this.ages[i] += dt / lifetime;
      this.positions[i * 3 + 2] -= drift * dt;
      this.positions[i * 3 + 1] += 0.08 * dt;
    }
    (this.points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.points.geometry.attributes.aAge as THREE.BufferAttribute).needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    this.material.dispose();
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const PHASE_TARGETS: Record<FlightPhase, { pitch: number; y: number; gear: number; cloudSpeed: number; starAlpha: number; drift: number }> = {
  cruise: { pitch: 0.02, y: 0.1, gear: 0, cloudSpeed: 1.6, starAlpha: 0.9, drift: 2.2 },
  takeoff: { pitch: 0.3, y: 0.35, gear: 1, cloudSpeed: 3.4, starAlpha: 0.25, drift: 3.6 },
  landing: { pitch: -0.14, y: -0.25, gear: 1, cloudSpeed: 1.1, starAlpha: 0.45, drift: 1.4 },
};

const HERO_CAMERA: Record<NonNullable<AircraftSceneProps['framing']>, THREE.Vector3> = {
  hero: new THREE.Vector3(5.6, 2.1, 6.4),
  wide: new THREE.Vector3(7.2, 2.6, 8.6),
  banner: new THREE.Vector3(4.8, 1.2, 7.4),
};

export const AircraftScene: React.FC<AircraftSceneProps> = ({
  phase = 'cruise',
  interactive = true,
  resetSignal = 0,
  framing = 'hero',
  quality = 'high',
  className = '',
  onInteractionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<FlightPhase>(phase);
  const resetRef = useRef<(() => void) | null>(null);
  const interactionCb = useRef(onInteractionChange);
  interactionCb.current = onInteractionChange;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (resetSignal > 0) resetRef.current?.();
  }, [resetSignal]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.25));
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1324, 0.028);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 200);
    camera.position.copy(HERO_CAMERA[framing]);
    camera.lookAt(0, 0, 0);

    // Environment reflections — makes the clearcoat pop without a HDRI download
    let pmrem: THREE.PMREMGenerator | null = null;
    if (quality === 'high') {
      pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new RoomEnvironment();
      scene.environment = pmrem.fromScene(envScene, 0.04).texture;
      scene.environmentIntensity = 0.75;
    }

    // Lights
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.9);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff4e0, 2.4);
    key.position.set(6, 9, 7);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    fill.position.set(-7, 3, -4);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xe63946, 0.55);
    rim.position.set(-3, -4, -8);
    scene.add(rim);

    // Aircraft
    const aircraft = buildAircraft();
    const rig = new THREE.Group(); // rig handles hover/bank; group handles pitch
    rig.add(aircraft.group);
    scene.add(rig);

    // Contrails
    const contrails = aircraft.exhausts.map(() => new Contrail(quality === 'high' ? 420 : 180, new THREE.Color(0xdbeafe)));
    contrails.forEach((c) => scene.add(c.points));

    // Clouds
    const cloudTex = makeCloudTexture();
    const clouds: THREE.Sprite[] = [];
    const cloudCount = quality === 'high' ? 18 : 8;
    for (let i = 0; i < cloudCount; i++) {
      const mat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.25 + Math.random() * 0.35, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      const s = 2.5 + Math.random() * 4;
      sp.scale.set(s * (1.4 + Math.random()), s * 0.6, 1);
      sp.position.set((Math.random() - 0.5) * 22, -2.2 - Math.random() * 2.5, (Math.random() - 0.5) * 30);
      clouds.push(sp);
      scene.add(sp);
    }

    // Stars
    const starCount = 700;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 60 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.8 + 2;
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xe2e8f0, size: 0.35, transparent: true, opacity: 0.9, sizeAttenuation: true, depthWrite: false, fog: false });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = interactive;
    controls.enableRotate = interactive;
    controls.minDistance = 4.2;
    controls.maxDistance = 16;
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = Math.PI * 0.64;
    controls.autoRotate = true;
    controls.autoRotateSpeed = interactive ? 0.55 : 0.9;
    controls.target.set(0, 0, 0);

    let idleTimer: number | null = null;
    const onStart = () => {
      controls.autoRotate = false;
      interactionCb.current?.(true);
      if (idleTimer) window.clearTimeout(idleTimer);
    };
    const onEnd = () => {
      interactionCb.current?.(false);
      idleTimer = window.setTimeout(() => {
        controls.autoRotate = true;
      }, 3200);
    };
    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);

    resetRef.current = () => {
      camera.position.copy(HERO_CAMERA[framing]);
      controls.target.set(0, 0, 0);
      controls.autoRotate = true;
      controls.update();
    };

    // Animation state
    const clock = new THREE.Clock();
    let raf: number | null = null;
    let running = true;
    const state = { pitch: 0, y: 0, gear: 0, starAlpha: 0.9 };
    const tmp = new THREE.Vector3();
    let emitAcc = 0;

    const animate = () => {
      if (!running) return;
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const target = PHASE_TARGETS[phaseRef.current];

      // Smooth toward phase targets
      state.pitch += (target.pitch - state.pitch) * 0.04;
      state.y += (target.y - state.y) * 0.04;
      state.gear += (target.gear - state.gear) * 0.05;
      state.starAlpha += (target.starAlpha - state.starAlpha) * 0.04;

      // Hover + bank + pitch
      rig.position.y = state.y + Math.sin(t * 1.4) * 0.06;
      rig.rotation.z = Math.sin(t * 0.9) * 0.045;
      rig.rotation.y = Math.sin(t * 0.55) * 0.03;
      aircraft.group.rotation.x = -state.pitch + Math.sin(t * 1.1) * 0.008;

      // Engines
      const fanSpeed = phaseRef.current === 'takeoff' ? 0.9 : 0.55;
      for (const fan of aircraft.fans) fan.rotation.z += fanSpeed;

      // Gear extension
      for (const g of aircraft.gear) {
        g.scale.setScalar(Math.max(0.001, state.gear));
        g.visible = state.gear > 0.02;
      }

      // Lights: strobe double-flash, beacon slow pulse
      const strobeOn = (t % 1.4) < 0.06 || ((t + 0.15) % 1.4) < 0.06;
      aircraft.strobe.scale.setScalar(strobeOn ? 2.2 : 0.6);
      const beaconPulse = 0.7 + Math.max(0, Math.sin(t * 3.2)) * 1.2;
      aircraft.beacon.scale.setScalar(beaconPulse);
      aircraft.navLeft.scale.setScalar(1 + Math.sin(t * 6) * 0.15);
      aircraft.navRight.scale.setScalar(1 + Math.cos(t * 6) * 0.15);

      // Contrails
      emitAcc += dt;
      const emitEvery = phaseRef.current === 'takeoff' ? 0.008 : 0.014;
      while (emitAcc > emitEvery) {
        emitAcc -= emitEvery;
        aircraft.exhausts.forEach((ex, i) => {
          ex.getWorldPosition(tmp);
          contrails[i].emit(tmp, 0.05);
        });
      }
      contrails.forEach((c) => c.update(dt, target.drift, phaseRef.current === 'takeoff' ? 1.6 : 2.4));

      // Clouds stream aft (the aircraft flies toward +z) & wrap
      for (const c of clouds) {
        c.position.z -= target.cloudSpeed * dt;
        if (c.position.z < -16) {
          c.position.z = 16;
          c.position.x = (Math.random() - 0.5) * 22;
        }
      }

      // Stars fade with phase
      starMat.opacity = state.starAlpha;
      stars.rotation.y += dt * 0.004;

      controls.update();
      renderer.render(scene, camera);
    };

    // Pause when off-screen / tab hidden
    const start = () => {
      if (!running) {
        running = true;
        clock.getDelta();
        animate();
      }
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? start() : stop();
    }, { threshold: 0.05 });
    io.observe(container);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        const h = e.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        }
      }
    });
    ro.observe(container);

    animate();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end', onEnd);
      if (idleTimer) window.clearTimeout(idleTimer);
      controls.dispose();
      contrails.forEach((c) => c.dispose());
      clouds.forEach((c) => c.material.dispose());
      cloudTex.dispose();
      starGeo.dispose();
      starMat.dispose();
      aircraft.disposables.forEach((d) => d.dispose());
      pmrem?.dispose();
      scene.environment?.dispose();
      renderer.dispose();
      resetRef.current = null;
    };
  }, [framing, quality, interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none ${interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'} ${className}`}
    >
      <canvas ref={canvasRef} className={`w-full h-full block ${interactive ? 'touch-none' : ''}`} />
    </div>
  );
};
