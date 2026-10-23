import { createNoise2D, createNoise3D } from "simplex-noise";

/**
 * Every formation is the same N particles rearranged. Heat (0..1) maps onto a
 * thermal-camera ramp in the shader: steel, then heat orange, then white-hot.
 */
export interface Formation {
  pos: Float32Array;
  heat: Float32Array;
}

export interface FormationConfig {
  name: string;
  x: number;
  y: number;
  scale: number;
  rotX: number;
  rotY: number;
  /** Radians per second around the formation's own up axis. */
  spin: number;
  noise: number;
  /** 0 none, 1 sweeps along x, 2 sweeps along y. */
  scanAxis: 0 | 1 | 2;
  scanStrength: number;
  scanSpeed: number;
  brightness: number;
  /** Overrides on narrow screens, where the formation sits behind the text. */
  narrow?: Partial<Pick<FormationConfig, "x" | "y" | "scale" | "brightness">>;
}

type V3 = [number, number, number];
type Rand = () => number;
type HeatFn = number | ((t: number) => number);

function mulberry32(seed: number): Rand {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const heatAt = (h: HeatFn, t: number) => (typeof h === "number" ? h : h(t));

class Cloud {
  readonly pos: Float32Array;
  readonly heat: Float32Array;
  i = 0;

  constructor(
    readonly n: number,
    readonly rand: Rand,
  ) {
    this.pos = new Float32Array(n * 3);
    this.heat = new Float32Array(n);
  }

  share(fraction: number) {
    return Math.floor(this.n * fraction);
  }

  gauss() {
    const u = 1 - this.rand();
    const v = this.rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  add(x: number, y: number, z: number, h: number) {
    if (this.i >= this.n) return;
    const k = this.i * 3;
    this.pos[k] = x;
    this.pos[k + 1] = y;
    this.pos[k + 2] = z;
    this.heat[this.i] = h;
    this.i++;
  }

  /** Pads any unused budget with jittered copies, then shuffles so morphs swirl instead of sliding. */
  finish(): Formation {
    const filled = Math.max(1, this.i);
    while (this.i < this.n) {
      const j = Math.floor(this.rand() * filled) * 3;
      this.add(
        this.pos[j] + this.gauss() * 0.01,
        this.pos[j + 1] + this.gauss() * 0.01,
        this.pos[j + 2] + this.gauss() * 0.01,
        this.heat[j / 3],
      );
    }
    for (let a = this.n - 1; a > 0; a--) {
      const b = Math.floor(this.rand() * (a + 1));
      for (let c = 0; c < 3; c++) {
        const t = this.pos[a * 3 + c];
        this.pos[a * 3 + c] = this.pos[b * 3 + c];
        this.pos[b * 3 + c] = t;
      }
      const h = this.heat[a];
      this.heat[a] = this.heat[b];
      this.heat[b] = h;
    }
    return { pos: this.pos, heat: this.heat };
  }
}

/* ---------- primitives ---------- */

function basis(d: V3): [V3, V3] {
  const len = Math.hypot(d[0], d[1], d[2]) || 1;
  const n: V3 = [d[0] / len, d[1] / len, d[2] / len];
  const helper: V3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u: V3 = [
    n[1] * helper[2] - n[2] * helper[1],
    n[2] * helper[0] - n[0] * helper[2],
    n[0] * helper[1] - n[1] * helper[0],
  ];
  const ul = Math.hypot(u[0], u[1], u[2]) || 1;
  u[0] /= ul;
  u[1] /= ul;
  u[2] /= ul;
  const v: V3 = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
  return [u, v];
}

/** Points along a segment, optionally on a tube surface of the given radius. */
function line(c: Cloud, a: V3, b: V3, count: number, heat: HeatFn, radius = 0) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const [u, v] = basis(d);
  for (let k = 0; k < count; k++) {
    const t = c.rand();
    let x = a[0] + d[0] * t;
    let y = a[1] + d[1] * t;
    let z = a[2] + d[2] * t;
    if (radius > 0) {
      const ang = c.rand() * Math.PI * 2;
      const r = radius * (0.8 + c.rand() * 0.2);
      const cs = Math.cos(ang) * r;
      const sn = Math.sin(ang) * r;
      x += u[0] * cs + v[0] * sn;
      y += u[1] * cs + v[1] * sn;
      z += u[2] * cs + v[2] * sn;
    }
    c.add(x, y, z, heatAt(heat, t));
  }
}

/** Quadratic bezier from a to b bending through control point m. */
function arc(c: Cloud, a: V3, m: V3, b: V3, count: number, heat: HeatFn, jitter = 0.006) {
  for (let k = 0; k < count; k++) {
    const t = c.rand();
    const it = 1 - t;
    c.add(
      it * it * a[0] + 2 * it * t * m[0] + t * t * b[0] + c.gauss() * jitter,
      it * it * a[1] + 2 * it * t * m[1] + t * t * b[1] + c.gauss() * jitter,
      it * it * a[2] + 2 * it * t * m[2] + t * t * b[2] + c.gauss() * jitter,
      heatAt(heat, t),
    );
  }
}

function randomDir(c: Cloud): V3 {
  const x = c.gauss();
  const y = c.gauss();
  const z = c.gauss();
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

function shell(c: Cloud, center: V3, r: number, count: number, heat: HeatFn) {
  for (let k = 0; k < count; k++) {
    const d = randomDir(c);
    const rr = r * (0.92 + c.rand() * 0.08);
    c.add(center[0] + d[0] * rr, center[1] + d[1] * rr, center[2] + d[2] * rr, heatAt(heat, rr / r));
  }
}

function blob(c: Cloud, center: V3, r: number, count: number, heat: HeatFn) {
  for (let k = 0; k < count; k++) {
    const d = randomDir(c);
    const t = Math.cbrt(c.rand());
    c.add(center[0] + d[0] * r * t, center[1] + d[1] * r * t, center[2] + d[2] * r * t, heatAt(heat, t));
  }
}

function boxEdges(c: Cloud, center: V3, size: V3, count: number, heat: HeatFn) {
  const [hx, hy, hz] = [size[0] / 2, size[1] / 2, size[2] / 2];
  const corners: V3[] = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) corners.push([sx, sy, sz]);
  const edges: [V3, V3][] = [];
  for (let i = 0; i < 8; i++)
    for (let j = i + 1; j < 8; j++) {
      const diff = corners[i].reduce((acc, v, k) => acc + (v !== corners[j][k] ? 1 : 0), 0);
      if (diff === 1) edges.push([corners[i], corners[j]]);
    }
  const lengths = edges.map(([a, b]) => Math.abs(a[0] - b[0]) * hx + Math.abs(a[1] - b[1]) * hy + Math.abs(a[2] - b[2]) * hz);
  const total = lengths.reduce((a, b) => a + b, 0);
  edges.forEach(([a, b], i) => {
    const p = (v: V3): V3 => [center[0] + v[0] * hx, center[1] + v[1] * hy, center[2] + v[2] * hz];
    line(c, p(a), p(b), Math.round((count * lengths[i]) / total), heat);
  });
}

/* ---------- formations ---------- */

function sphere(c: Cloud) {
  const noise = createNoise3D(c.rand);
  const surface = c.share(0.8);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < surface; i++) {
    const y = 1 - (i / (surface - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const R = 1.55 + noise(x * 1.25, y * 1.25, z * 1.25) * 0.1 + (c.rand() - 0.5) * 0.02;
    const h = noise(x * 0.9 + 4.2, y * 0.9 - 1.3, z * 0.9 + 2.7);
    c.add(x * R, y * R, z * R, Math.pow(clamp01((h - 0.15) / 0.62), 1.5));
  }
  shell(c, [0, 0, 0], 0.95, c.share(0.05), 0.12);
  const halo = c.n - c.i;
  for (let k = 0; k < halo; k++) {
    const d = randomDir(c);
    const R = 1.95 + Math.pow(c.rand(), 2) * 1.9;
    c.add(d[0] * R, d[1] * R, d[2] * R, Math.pow(c.rand(), 3) * 0.25);
  }
}

function wave(c: Cloud) {
  const noise = createNoise2D(c.rand);
  const cols = 210;
  const rows = Math.floor(c.share(0.93) / cols);
  for (let r = 0; r < rows; r++)
    for (let k = 0; k < cols; k++) {
      const x = -5.4 + (k / (cols - 1)) * 10.8 + (c.rand() - 0.5) * 0.02;
      const z = -3 + (r / (rows - 1)) * 6 + (c.rand() - 0.5) * 0.02;
      const y = Math.sin(x * 0.85 + z * 0.5) * 0.3 + noise(x * 0.3, z * 0.3) * 0.38;
      c.add(x, y, z, clamp01((y - 0.3) / 0.32));
    }
  while (c.i < c.n) c.add((c.rand() - 0.5) * 10, 0.4 + c.rand() * 1.8, (c.rand() - 0.5) * 6, 0.05);
}

function terrain(c: Cloud) {
  const noise = createNoise2D(c.rand);
  const h = (x: number, z: number) =>
    (noise(x * 0.55, z * 0.55) * 0.5 + noise(x * 1.3 + 7, z * 1.3 + 3) * 0.22 + noise(x * 3, z * 3) * 0.06) * 0.9;
  const survivors: { p: V3; angle: number }[] = [
    { p: [0.7, 0, 0.35], angle: 0.6 },
    { p: [-0.65, 0, -0.5], angle: -0.9 },
  ];
  survivors.forEach((s) => (s.p[1] = h(s.p[0], s.p[2])));

  const cols = 170;
  const rows = Math.floor(c.share(0.62) / cols);
  for (let r = 0; r < rows; r++)
    for (let k = 0; k < cols; k++) {
      const x = -2.6 + (k / (cols - 1)) * 5.2 + (c.rand() - 0.5) * 0.015;
      const z = -1.9 + (r / (rows - 1)) * 3.8 + (c.rand() - 0.5) * 0.015;
      let warm = 0;
      for (const s of survivors) {
        const d2 = (x - s.p[0]) ** 2 + (z - s.p[2]) ** 2;
        warm = Math.max(warm, Math.exp(-d2 / 0.1));
      }
      c.add(x, h(x, z), z, 0.02 + warm * 0.38);
    }

  // Two heat signatures, elongated like bodies lying in debris.
  for (const s of survivors) {
    const n = c.share(0.07);
    const ca = Math.cos(s.angle);
    const sa = Math.sin(s.angle);
    for (let k = 0; k < n; k++) {
      const u = Math.max(-0.26, Math.min(0.26, c.gauss() * 0.12));
      const v = Math.max(-0.1, Math.min(0.1, c.gauss() * 0.045));
      const w = Math.abs(c.gauss()) * 0.03;
      const core = Math.hypot(u / 0.26, v / 0.1);
      c.add(s.p[0] + u * ca - v * sa, s.p[1] + 0.05 + w, s.p[2] + u * sa + v * ca, clamp01(1 - core * 0.55));
    }
  }

  // Radar rings hugging the terrain around the first signature.
  const ringCount = c.share(0.1);
  const radii = [0.32, 0.56, 0.82];
  for (let k = 0; k < ringCount; k++) {
    const r = radii[k % radii.length];
    const th = c.rand() * Math.PI * 2;
    const x = survivors[0].p[0] + Math.cos(th) * r;
    const z = survivors[0].p[2] + Math.sin(th) * r;
    c.add(x, h(x, z) + 0.03, z, 0.3);
  }

  // The drone hovering above, with its sensor cone.
  const D: V3 = [survivors[0].p[0], 1.35, survivors[0].p[2]];
  const arm = c.share(0.006);
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const tip: V3 = [D[0] + dx * 0.17, D[1], D[2] + dz * 0.17];
    line(c, D, tip, arm, 0.35, 0.008);
    shell(c, tip, 0.075, arm, 0.25);
  }
  const rays = 28;
  const cone = c.share(0.05);
  for (let k = 0; k < cone; k++) {
    const th = (Math.floor(c.rand() * rays) / rays) * Math.PI * 2;
    const bx = survivors[0].p[0] + Math.cos(th) * 0.82;
    const bz = survivors[0].p[2] + Math.sin(th) * 0.82;
    const t = c.rand();
    c.add(D[0] + (bx - D[0]) * t, D[1] + (h(bx, bz) - D[1]) * t, D[2] + (bz - D[2]) * t, 0.1 + (1 - t) * 0.15);
  }
}

function pipes(c: Cloud) {
  const HOT = 0.95;
  const COLD = 0.04;
  const zf = 0.35;
  const zb = -0.55;
  line(c, [-2.3, 0.95, zf], [2.3, 0.95, zf], c.share(0.09), HOT, 0.045);
  line(c, [-2.3, -0.95, zf], [2.3, -0.95, zf], c.share(0.09), COLD, 0.045);
  line(c, [-2.3, 0.95, zb], [2.3, 0.95, zb], c.share(0.05), HOT * 0.85, 0.04);
  line(c, [-2.3, -0.95, zb], [2.3, -0.95, zb], c.share(0.05), COLD, 0.04);

  const risers = 10;
  for (let i = 0; i < risers; i++) {
    const x = -2 + i * (4 / (risers - 1));
    line(c, [x, -0.95, zf], [x, 0.95, zf], c.share(0.03), (t) => COLD + (HOT - COLD) * Math.pow(t, 1.4), 0.026);
    if (i % 2 === 0) {
      line(c, [x, 0.95, zf], [x, 0.95, zb], c.share(0.006), HOT, 0.03);
      line(c, [x, -0.95, zf], [x, -0.95, zb], c.share(0.006), COLD, 0.03);
    }
    // Two valves per riser: 20 in all, matching the real plant.
    for (const vy of [-0.42, 0.42]) {
      const vh = vy > 0 ? 0.62 : 0.45;
      shell(c, [x, vy, zf], 0.085, c.share(0.006), vh);
      line(c, [x, vy, zf], [x, vy, zf + 0.17], c.share(0.0015), vh);
    }
  }
  boxEdges(c, [-2.85, 0, -0.1], [0.55, 2.2, 1.15], c.share(0.07), 0.08);
  boxEdges(c, [2.85, 0, -0.1], [0.55, 2.2, 1.15], c.share(0.07), 0.7);
}

function documentScan(c: Cloud) {
  const L = -1.42;
  const R = 0.52;
  const T = 1.3;
  const B = -1.3;
  const per = c.share(0.06);
  for (let k = 0; k < per; k++) {
    const t = c.rand() * 2 * (R - L + T - B);
    const w = R - L;
    const hgt = T - B;
    let x: number;
    let y: number;
    if (t < w) [x, y] = [L + t, T];
    else if (t < w + hgt) [x, y] = [R, T - (t - w)];
    else if (t < 2 * w + hgt) [x, y] = [R - (t - w - hgt), B];
    else [x, y] = [L, B + (t - 2 * w - hgt)];
    c.add(x, y, 0, 0.12);
  }

  const fill = (x0: number, x1: number, y0: number, y1: number, count: number, heat: number) => {
    for (let k = 0; k < count; k++)
      c.add(x0 + c.rand() * (x1 - x0), y0 + c.rand() * (y1 - y0), (c.rand() - 0.5) * 0.01, heat);
  };
  const frame = (x0: number, x1: number, y0: number, y1: number, count: number, heat: number) => {
    line(c, [x0, y0, 0.01], [x1, y0, 0.01], Math.round(count * 0.35), heat);
    line(c, [x0, y1, 0.01], [x1, y1, 0.01], Math.round(count * 0.35), heat);
    line(c, [x0, y0, 0.01], [x0, y1, 0.01], Math.round(count * 0.15), heat);
    line(c, [x1, y0, 0.01], [x1, y1, 0.01], Math.round(count * 0.15), heat);
  };

  fill(L + 0.14, L + 0.42, T - 0.44, T - 0.16, c.share(0.025), 0.3);
  fill(L + 0.6, R - 0.2, T - 0.3, T - 0.22, c.share(0.025), 0.15);

  // Body text as rows of words.
  type Word = { x0: number; x1: number; y: number };
  const words: Word[] = [];
  for (let row = 0; row < 12; row++) {
    const y = 0.82 - row * 0.085;
    const end = Math.min(R - 0.14, L + 0.14 + 0.9 + c.rand() * 0.8);
    let x = L + 0.14;
    while (x < end) {
      const w = Math.min(0.06 + c.rand() * 0.24, end - x);
      if (w > 0.03) words.push({ x0: x, x1: x + w, y });
      x += w + 0.045;
    }
  }
  // Table rows and columns.
  const tTop = -0.3;
  const tBot = -1.12;
  const tL = L + 0.14;
  const tR = R - 0.14;
  for (let r = 0; r <= 5; r++) {
    const y = tTop - ((tTop - tBot) / 5) * r;
    line(c, [tL, y, 0], [tR, y, 0], c.share(0.011), 0.1);
  }
  for (let k = 0; k <= 4; k++) {
    const x = tL + ((tR - tL) / 4) * k;
    line(c, [x, tTop, 0], [x, tBot, 0], c.share(0.008), 0.1);
  }
  for (let r = 0; r < 5; r++)
    for (let k = 0; k < 4; k++) {
      const x0 = tL + ((tR - tL) / 4) * k + 0.04;
      const y = tTop - ((tTop - tBot) / 5) * (r + 0.5);
      words.push({ x0, x1: x0 + 0.08 + c.rand() * 0.14, y });
    }

  // Fields the pipeline extracted: highlighted, boxed, and streamed to structured output.
  const picks = new Set<number>();
  const bodyWords = words.length - 20;
  while (picks.size < 6) picks.add(Math.floor(c.rand() * bodyWords));
  picks.add(words.length - 1);
  // Sorted top to bottom so each stream lands on its matching output row without crossing.
  const fields = [...picks].map((i) => words[i]).sort((a, b) => b.y - a.y);

  const totalLen = words.reduce((a, w) => a + (w.x1 - w.x0), 0);
  const textBudget = c.share(0.36);
  for (const w of words) {
    const isField = fields.includes(w);
    const n = Math.round((textBudget * (w.x1 - w.x0)) / totalLen);
    for (let k = 0; k < n; k++)
      c.add(w.x0 + c.rand() * (w.x1 - w.x0), w.y + c.gauss() * 0.009, c.gauss() * 0.004, isField ? 0.92 : 0.05);
  }
  const boxBudget = Math.floor(c.share(0.06) / fields.length);
  for (const f of fields) frame(f.x0 - 0.025, f.x1 + 0.025, f.y - 0.035, f.y + 0.035, boxBudget, 1);

  const jx = 0.95;
  const rowsOut = fields.length + 2;
  line(c, [jx - 0.1, 1.12, 0], [jx - 0.1, -1.12, 0], c.share(0.012), 0.2);
  const outBudget = Math.floor(c.share(0.1) / rowsOut);
  const valueStarts: V3[] = [];
  for (let r = 0; r < rowsOut; r++) {
    const y = 0.98 - r * (1.96 / (rowsOut - 1));
    const keyEnd = jx + 0.22 + c.rand() * 0.18;
    const valEnd = keyEnd + 0.08 + 0.28 + c.rand() * 0.3;
    fill(jx, keyEnd, y - 0.012, y + 0.012, Math.round(outBudget * 0.4), 0.12);
    fill(keyEnd + 0.08, valEnd, y - 0.012, y + 0.012, Math.round(outBudget * 0.6), 0.88);
    valueStarts.push([keyEnd + 0.08, y, 0]);
  }
  const streamBudget = Math.floor(c.share(0.07) / fields.length);
  fields.forEach((f, i) => {
    const a: V3 = [f.x1 + 0.03, f.y, 0.01];
    const b = valueStarts[i + 1];
    const m: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.55];
    arc(c, a, m, b, streamBudget, (t) => 0.55 + 0.35 * t, 0.004);
  });
}

function graph(c: Cloud) {
  const noise = createNoise3D(c.rand);
  const P: V3 = [-1.85, 0.05, 0.25];
  shell(c, P, 0.24, c.share(0.04), 1);
  blob(c, P, 0.14, c.share(0.02), 1);
  const orbit = c.share(0.03);
  for (let k = 0; k < orbit; k++) {
    const th = c.rand() * Math.PI * 2;
    c.add(P[0] + Math.cos(th) * 0.42, P[1] + Math.sin(th) * 0.42 * 0.35, P[2] + Math.sin(th) * 0.42 * 0.94, 0.6);
  }

  const C: V3 = [0.85, 0, -0.1];
  const count = 56;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes: V3[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const R = 1.4 + noise(i * 0.7, 1, 2) * 0.18;
    nodes.push([C[0] + Math.cos(th) * r * R, C[1] + y * R, C[2] + Math.sin(th) * r * R]);
  }
  const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const matched = new Set(
    nodes
      .map((n, i) => ({ i, d: dist(n, P) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 9)
      .map((o) => o.i),
  );
  const weightTotal = count + matched.size * 1.4;
  const nodeBudget = c.share(0.36);
  nodes.forEach((n, i) => {
    const m = matched.has(i);
    const k = Math.round((nodeBudget * (m ? 2.4 : 1)) / weightTotal);
    shell(c, n, m ? 0.085 : 0.05, k, m ? 0.88 : 0.08);
  });

  const edgeBudget = Math.floor(c.share(0.22) / matched.size);
  for (const i of matched) {
    const b = nodes[i];
    const m: V3 = [(P[0] + b[0]) / 2, (P[1] + b[1]) / 2 + (c.rand() - 0.5) * 0.7, (P[2] + b[2]) / 2 + 0.3];
    arc(c, P, m, b, edgeBudget, (t) => 1 - 0.15 * t);
  }

  const pairs = new Set<string>();
  nodes.forEach((n, i) => {
    nodes
      .map((o, j) => ({ j, d: dist(n, o) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => pairs.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  const meshBudget = Math.floor(c.share(0.17) / pairs.size);
  for (const key of pairs) {
    const [i, j] = key.split("-").map(Number);
    line(c, nodes[i], nodes[j], meshBudget, 0.05);
  }
  while (c.i < c.n) {
    const d = randomDir(c);
    const R = 2 + c.rand() * 1.2;
    c.add(C[0] + d[0] * R, C[1] + d[1] * R, C[2] + d[2] * R, 0.03);
  }
}

function devices(c: Cloud) {
  const cols = 6;
  const rows = 3;
  const layers = 2;
  const sx = 0.74;
  const sy = 0.72;
  const sz = 0.9;
  const ox = 0.35;
  const colX = (k: number) => ox + (k - (cols - 1) / 2) * sx;
  const rowY = (r: number) => (r - (rows - 1) / 2) * sy;
  const layerZ = (l: number) => (l - (layers - 1) / 2) * sz;
  const state = (k: number) => (k <= 2 ? 0.82 : k === 3 ? 0.55 : 0.06);
  const coreHeat = (k: number) => (k <= 2 ? 0.9 : k === 3 ? 1 : 0);

  const cubeBudget = Math.floor(c.share(0.5) / (cols * rows * layers));
  const coreBudget = Math.floor(c.share(0.08) / (cols * rows * layers));
  for (let k = 0; k < cols; k++)
    for (let r = 0; r < rows; r++)
      for (let l = 0; l < layers; l++) {
        const center: V3 = [colX(k), rowY(r), layerZ(l)];
        boxEdges(c, center, [0.34, 0.34, 0.34], cubeBudget, state(k));
        blob(c, center, 0.07, coreBudget, coreHeat(k));
      }

  const hubX = -2.75;
  boxEdges(c, [hubX, 0, 0], [0.6, 1.7, 1.0], c.share(0.07), 0.85);
  blob(c, [hubX, 0, 0], 0.18, c.share(0.02), 1);

  // Rollout lines: lit up to the column currently updating.
  const linkBudget = Math.floor(c.share(0.2) / (rows * layers));
  const x3 = colX(3);
  for (let r = 0; r < rows; r++)
    for (let l = 0; l < layers; l++)
      line(c, [hubX + 0.3, rowY(r), layerZ(l)], [colX(cols - 1), rowY(r), layerZ(l)], linkBudget, (t) => {
        const x = hubX + 0.3 + t * (colX(cols - 1) - hubX - 0.3);
        return x <= x3 ? 0.7 : 0.04;
      });
}

function dust(c: Cloud) {
  while (c.i < c.n)
    c.add((c.rand() - 0.5) * 14, (c.rand() - 0.5) * 8.5, -5 + c.rand() * 7, Math.pow(c.rand(), 7) * 0.8);
}

function ring(c: Cloud) {
  const heat = (th: number, k: number) => Math.pow(0.5 + 0.5 * Math.cos(th - 0.6), 2.5) * k;
  const main = c.share(0.6);
  for (let i = 0; i < main; i++) {
    const th = c.rand() * Math.PI * 2;
    const R = 1.8 + c.gauss() * 0.06;
    c.add(Math.cos(th) * R, c.gauss() * 0.035, Math.sin(th) * R, 0.03 + heat(th, 0.95));
  }
  const outer = c.share(0.1);
  for (let i = 0; i < outer; i++) {
    const th = c.rand() * Math.PI * 2;
    const R = 2.35 + c.gauss() * 0.015;
    c.add(Math.cos(th) * R, c.gauss() * 0.01, Math.sin(th) * R, 0.06);
  }
  while (c.i < c.n) {
    const th = c.rand() * Math.PI * 2;
    const R = 1.8 + c.gauss() * 0.32;
    c.add(Math.cos(th) * R, c.gauss() * 0.12, Math.sin(th) * R, heat(th, 0.4));
  }
}

/* ---------- registry ---------- */

const generators = [sphere, wave, terrain, pipes, documentScan, graph, devices, dust, ring];

export const formationConfigs: FormationConfig[] = [
  { name: "hero", x: 1.75, y: 0.3, scale: 1, rotX: 0.3, rotY: 0, spin: 0.07, noise: 0.09, scanAxis: 0, scanStrength: 0, scanSpeed: 0, brightness: 1, narrow: { x: 0, y: 0.5, scale: 0.7, brightness: 0.85 } },
  { name: "about", x: 0, y: -1.3, scale: 1, rotX: 0.38, rotY: 0, spin: 0, noise: 0.06, scanAxis: 1, scanStrength: 0.5, scanSpeed: 0.9, brightness: 0.7, narrow: { y: -1.7, scale: 0.7, brightness: 0.5 } },
  // On narrow screens project formations sit in the top band; the project text starts below them.
  { name: "skynetics", x: 1.9, y: -0.1, scale: 1, rotX: 0.62, rotY: -0.45, spin: 0, noise: 0.015, scanAxis: 1, scanStrength: 0.9, scanSpeed: 0.75, brightness: 1, narrow: { x: 0, y: 1.05, scale: 0.5, brightness: 0.75 } },
  { name: "chiller", x: 1.75, y: 0, scale: 0.7, rotX: 0.2, rotY: -0.55, spin: 0, noise: 0.012, scanAxis: 1, scanStrength: 0.5, scanSpeed: 1.1, brightness: 1, narrow: { x: 0, y: 1.05, scale: 0.38, brightness: 0.75 } },
  { name: "smartinvoice", x: 1.7, y: 0, scale: 0.95, rotX: 0.06, rotY: -0.3, spin: 0, noise: 0.008, scanAxis: 2, scanStrength: 1, scanSpeed: 0.6, brightness: 1, narrow: { x: -0.15, y: 1.05, scale: 0.55, brightness: 0.75 } },
  { name: "shigotai", x: 1.9, y: 0, scale: 0.95, rotX: 0.15, rotY: 0.25, spin: 0, noise: 0.025, scanAxis: 0, scanStrength: 0, scanSpeed: 0, brightness: 1, narrow: { x: 0, y: 1.05, scale: 0.52, brightness: 0.75 } },
  { name: "edgegrid", x: 1.85, y: 0, scale: 0.76, rotX: 0.35, rotY: 0.6, spin: 0, noise: 0.01, scanAxis: 1, scanStrength: 0.6, scanSpeed: 0.8, brightness: 1, narrow: { x: 0.1, y: 1.05, scale: 0.44, brightness: 0.75 } },
  { name: "dust", x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, spin: 0.02, noise: 0.18, scanAxis: 0, scanStrength: 0, scanSpeed: 0, brightness: 0.4 },
  { name: "contact", x: 0, y: 0.15, scale: 1.05, rotX: 1.1, rotY: 0, spin: 0.12, noise: 0.04, scanAxis: 0, scanStrength: 0, scanSpeed: 0, brightness: 1, narrow: { scale: 0.62, brightness: 0.8 } },
];

export function buildFormations(n: number): Formation[] {
  return generators.map((gen, i) => {
    const cloud = new Cloud(n, mulberry32(1337 + i * 7919));
    gen(cloud);
    return cloud.finish();
  });
}

/** Random start positions far outside the frame; the intro pulls particles in from here. */
export function buildScatter(n: number): Float32Array {
  const rand = mulberry32(42);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = rand() * 2 - 1;
    const th = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const R = 7 + rand() * 7;
    out[i * 3] = Math.cos(th) * r * R;
    out[i * 3 + 1] = u * R;
    out[i * 3 + 2] = Math.sin(th) * r * R - 2;
  }
  return out;
}
