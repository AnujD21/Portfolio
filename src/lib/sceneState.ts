/**
 * Mutable bridge between the DOM (ScrollTrigger, pointer) and the WebGL loop.
 * Plain object on purpose: written every frame, never triggers React renders.
 */
export const sceneState = {
  /** Continuous formation index; 2.4 means 40% of the way from formation 2 to 3. */
  target: 0,
  /** 0 = particles scattered, 1 = assembled. Tweened once the preloader finishes. */
  intro: 0,
  pointer: { x: 0, y: 0 },
  pointerActive: false,
  ready: false,
};

export const SCENE_READY_EVENT = "scene:ready";

export function markSceneReady() {
  if (sceneState.ready) return;
  sceneState.ready = true;
  window.dispatchEvent(new Event(SCENE_READY_EVENT));
}
