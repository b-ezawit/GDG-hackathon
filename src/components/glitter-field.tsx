"use client";

import { Sparkles, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

function Field() {
  return (
    <>
      <color attach="background" args={["#05040a"]} />
      <Stars radius={80} depth={40} count={3500} factor={3} saturation={0} fade speed={0.35} />
      <Sparkles count={220} scale={18} size={2.2} speed={0.35} opacity={0.85} color="#7dd3fc" />
      <Sparkles count={140} position={[4, -1, -3]} scale={10} size={1.6} speed={0.5} opacity={0.65} color="#e9d5ff" />
      <Sparkles count={90} position={[-5, 2, -2]} scale={8} size={1.4} speed={0.45} opacity={0.55} color="#fecdd3" />
    </>
  );
}

/** Full-viewport decorative WebGL layer — pointer-events none. */
export function GlitterField() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.55]">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 10], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Field />
        </Suspense>
      </Canvas>
    </div>
  );
}
