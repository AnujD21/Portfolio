// 3D simplex noise by Ian McEwan, Ashima Arts (MIT). https://github.com/ashima/webgl-noise
const simplex = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMix;
uniform float uIntro;
uniform float uSize;
uniform float uPixelRatio;
uniform float uNoiseA;
uniform float uNoiseB;
uniform vec3 uScanA; // axis, strength, speed
uniform vec3 uScanB;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uAspect;

attribute vec3 aTo;
attribute float aHeatFrom;
attribute float aHeatTo;
attribute float aRand;
attribute vec3 aScatter;

varying float vHeat;
varying float vScan;
varying float vTwinkle;

${simplex}

float scanValue(vec3 p, vec3 cfg) {
  if (cfg.y <= 0.0) return 0.0;
  float coord = cfg.x < 1.5 ? p.x : -p.y;
  float span = 6.5;
  float head = mod(uTime * cfg.z, span) - span * 0.5;
  float d = coord - head;
  // Bright leading edge with a short fading tail behind it.
  float band = smoothstep(0.32, 0.0, abs(d)) + smoothstep(-0.9, 0.0, d) * step(d, 0.0) * 0.35;
  return band * cfg.y;
}

void main() {
  float delay = aRand * 0.35;
  float m = smoothstep(delay, delay + 0.65, uMix);
  vec3 p = mix(position, aTo, m);

  // Particles arc through space mid-morph instead of sliding in straight lines.
  float arc = sin(m * 3.14159265);
  p += arc * vec3(
    snoise(position * 0.5 + 1.7),
    snoise(aTo * 0.5 + 4.2),
    snoise(position * 0.3 + aTo * 0.3 + 9.1)
  ) * 1.1;

  float amp = mix(uNoiseA, uNoiseB, m);
  float t = uTime * 0.22;
  p += amp * vec3(
    snoise(p * 0.65 + vec3(t, 0.0, 0.0)),
    snoise(p * 0.65 + vec3(0.0, t, 7.3)),
    snoise(p * 0.65 + vec3(3.1, 0.0, t))
  );

  float ie = smoothstep(aRand * 0.45, aRand * 0.45 + 0.55, uIntro);
  ie = 1.0 - pow(1.0 - ie, 3.0);
  p = mix(aScatter, p, ie);

  float heat = mix(aHeatFrom, aHeatTo, m);
  float scan = mix(scanValue(p, uScanA), scanValue(p, uScanB), m);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;

  // Push particles away from the cursor in screen space.
  vec2 ndc = clip.xy / clip.w;
  vec2 diff = ndc - uMouse;
  diff.x *= uAspect;
  float dist = length(diff);
  float push = smoothstep(0.3, 0.0, dist) * uMouseStrength;
  vec2 dir = dist > 0.0001 ? diff / dist : vec2(0.0);
  ndc += vec2(dir.x / uAspect, dir.y) * push * 0.085;
  clip.xy = ndc * clip.w;
  gl_Position = clip;

  float size = uSize * (0.55 + aRand * 0.9) * (1.0 + heat * 0.5 + scan * 0.9);
  gl_PointSize = size * uPixelRatio / -mv.z;

  vHeat = clamp(heat + scan * 0.3, 0.0, 1.0);
  vScan = scan;
  vTwinkle = 0.78 + 0.22 * sin(uTime * (1.4 + aRand * 2.6) + aRand * 50.0);
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uCool;
uniform vec3 uWarm;
uniform vec3 uHot;
uniform float uBrightness;

varying float vHeat;
varying float vScan;
varying float vTwinkle;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.0, r);
  a *= a;

  // Thermal-camera ramp: steel, heat orange, white-hot.
  vec3 col = mix(uCool, uWarm, smoothstep(0.1, 0.6, vHeat));
  col = mix(col, uHot, smoothstep(0.65, 1.0, vHeat));

  float alpha = a * uBrightness * vTwinkle * (0.5 + vHeat * 0.55 + vScan * 0.5);
  gl_FragColor = vec4(col, alpha);
}
`;
