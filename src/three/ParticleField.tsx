import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildFormations, buildScatter, formationConfigs, type FormationConfig } from "./formations";
import { fragmentShader, vertexShader } from "./shaders";
import { markSceneReady, sceneState } from "../lib/sceneState";
import { coarsePointer, reducedMotion } from "../lib/env";

/** sRGB hex straight into a vec3: the shader writes final display colors, no color management. */
const rgb = (hex: string) =>
  new THREE.Vector3(
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  );

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const wrapPi = (a: number) => {
  const m = (a + Math.PI) % (Math.PI * 2);
  return (m < 0 ? m + Math.PI * 2 : m) - Math.PI;
};
const resolve = (cfg: FormationConfig, narrow: boolean) =>
  narrow && cfg.narrow ? { ...cfg, ...cfg.narrow } : cfg;

function Particles({ count }: { count: number }) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const group = useRef<THREE.Group>(null);

  const formations = useMemo(() => buildFormations(count), [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const dynamic = (arr: Float32Array, itemSize: number) =>
      new THREE.BufferAttribute(arr.slice(), itemSize).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", dynamic(formations[0].pos, 3));
    g.setAttribute("aTo", dynamic(formations[1].pos, 3));
    g.setAttribute("aHeatFrom", dynamic(formations[0].heat, 1));
    g.setAttribute("aHeatTo", dynamic(formations[1].heat, 1));
    const rand = new Float32Array(count);
    let seed = 7;
    for (let i = 0; i < count; i++) {
      seed = (seed * 16807) % 2147483647;
      rand[i] = seed / 2147483647;
    }
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    g.setAttribute("aScatter", new THREE.BufferAttribute(buildScatter(count), 3));
    return g;
  }, [formations, count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMix: { value: 0 },
          uIntro: { value: reducedMotion ? 1 : 0 },
          uSize: { value: 24 },
          uPixelRatio: { value: 1 },
          uNoiseA: { value: 0 },
          uNoiseB: { value: 0 },
          uScanA: { value: new THREE.Vector3() },
          uScanB: { value: new THREE.Vector3() },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uMouseStrength: { value: 0 },
          uAspect: { value: 1 },
          uCool: { value: rgb("#7d8798") },
          uWarm: { value: rgb("#ec6a42") },
          uHot: { value: rgb("#ffe3d3") },
          uBrightness: { value: 1 },
        },
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const live = useRef({ current: 0, base: 0, time: 0, px: 0, py: 0, mx: 9, my: 9, strength: 0, frames: 0 });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const L = live.current;
    const u = material.uniforms;
    const F = formations.length;
    if (!reducedMotion) L.time += dt;

    // Ease toward the scroll-driven formation index.
    const target = Math.min(Math.max(sceneState.target, 0), F - 1);
    L.current += (target - L.current) * (1 - Math.exp(-dt * 3.2));
    if (Math.abs(target - L.current) < 1e-4) L.current = target;
    const base = Math.min(Math.floor(L.current), F - 2);
    const mix = L.current - base;

    // Only two formations live on the GPU at a time; swap when crossing a boundary.
    if (base !== L.base) {
      L.base = base;
      const set = (name: string, data: Float32Array) => {
        const attr = geometry.getAttribute(name) as THREE.BufferAttribute;
        (attr.array as Float32Array).set(data);
        attr.needsUpdate = true;
      };
      set("position", formations[base].pos);
      set("aTo", formations[base + 1].pos);
      set("aHeatFrom", formations[base].heat);
      set("aHeatTo", formations[base + 1].heat);
    }

    const narrow = size.width < 768 || size.width / size.height < 0.85;
    const A = resolve(formationConfigs[base], narrow);
    const B = resolve(formationConfigs[base + 1], narrow);
    const k = smooth(mix);

    const follow = 1 - Math.exp(-dt * 2.5);
    const pointerOn = !reducedMotion && !coarsePointer;
    L.px += ((pointerOn ? sceneState.pointer.x : 0) - L.px) * follow;
    L.py += ((pointerOn ? sceneState.pointer.y : 0) - L.py) * follow;

    const g = group.current;
    if (g) {
      g.position.set(lerp(A.x, B.x, k), lerp(A.y, B.y, k), 0);
      g.scale.setScalar(lerp(A.scale, B.scale, k));
      const angA = A.rotY + wrapPi(L.time * A.spin);
      const angB = B.rotY + wrapPi(L.time * B.spin);
      g.rotation.set(lerp(A.rotX, B.rotX, k) - L.py * 0.12, angA + wrapPi(angB - angA) * k + L.px * 0.2, 0);
    }

    u.uTime.value = L.time;
    u.uMix.value = mix;
    u.uIntro.value = reducedMotion ? 1 : sceneState.intro;
    u.uNoiseA.value = A.noise;
    u.uNoiseB.value = B.noise;
    (u.uScanA.value as THREE.Vector3).set(A.scanAxis, A.scanStrength, A.scanSpeed);
    (u.uScanB.value as THREE.Vector3).set(B.scanAxis, B.scanStrength, B.scanSpeed);
    u.uBrightness.value = lerp(A.brightness, B.brightness, k);
    u.uAspect.value = size.width / size.height;
    u.uPixelRatio.value = gl.getPixelRatio();

    const ms = 1 - Math.exp(-dt * 8);
    L.mx += (sceneState.pointer.x - L.mx) * ms;
    L.my += (sceneState.pointer.y - L.my) * ms;
    (u.uMouse.value as THREE.Vector2).set(L.mx, L.my);
    const wanted = pointerOn && sceneState.pointerActive ? 1 : 0;
    L.strength += (wanted - L.strength) * (1 - Math.exp(-dt * 3));
    u.uMouseStrength.value = L.strength;

    if (++L.frames === 2) markSceneReady();
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

export default function ParticleField() {
  const count = useMemo(() => (window.innerWidth < 768 ? 11000 : 22000), []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      sceneState.pointerActive = e.pointerType === "mouse";
    };
    const leave = () => (sceneState.pointerActive = false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        flat
        dpr={[1, count > 12000 ? 1.75 : 1.5]}
        gl={{ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 9], fov: 35, near: 0.1, far: 60 }}
        onCreated={({ gl }) => gl.setClearColor("#08090b", 1)}
      >
        <Particles count={count} />
      </Canvas>
    </div>
  );
}
