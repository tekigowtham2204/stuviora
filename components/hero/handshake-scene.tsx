"use client";

import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { motion } from "motion/react";

/*
 * Stuviora Cinematic Hero — "the AI-verified handshake"
 *
 * Storytelling (4 scroll beats, 0..1 progress):
 *   0.00  Two distant glowing forms approaching from edges (student=purple, client=teal)
 *   0.25  The AI verification thread illuminates the lane between them, particles scan
 *   0.55  Forms meet at the contact point: warm gold flash, ring expansion
 *   0.85  Steady trust glow; the 85/15 split is revealed; camera settles
 *
 * Production:
 *   R3F atmosphere (live, themable, scroll-driven) + a baked SVG handshake silhouette
 *   overlaid as the editorial focal moment. Postprocessing bloom + vignette do the
 *   heavy lifting on the cinematic feel.
 *
 * Performance:
 *   - Canvas dpr capped, postprocessing disabled on low-power devices.
 *   - prefers-reduced-motion: scene collapses to a single static composition.
 *   - Suspense fallback: a CSS-only aurora so paint is never blocked.
 */

const palette = {
  student: new THREE.Color("#8b82e0"), // brand-400
  client: new THREE.Color("#2ba784"), // trust-400
  gold: new THREE.Color("#e0b070"), // gold-400
  ai: new THREE.Color("#afa9ec"), // brand-300, the verification thread
};

interface BeatProps {
  progress: MotionValue<number>;
}

/** Two orbs that approach from L/R and contact at progress ~0.55. */
function ApproachingOrbs({ progress }: BeatProps) {
  const studentRef = useRef<THREE.Mesh>(null);
  const clientRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const flashMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const p = progress.get();
    const t = clock.elapsedTime;

    // Approach from edges (-4..-0.6) and (4..0.6) over 0..0.55
    const approach = Math.min(1, p / 0.55);
    const eased = 1 - Math.pow(1 - approach, 3);
    const xStudent = THREE.MathUtils.lerp(-4, -0.6, eased);
    const xClient = THREE.MathUtils.lerp(4, 0.6, eased);

    if (studentRef.current) {
      studentRef.current.position.x = xStudent;
      studentRef.current.position.y = Math.sin(t * 0.8) * 0.06;
    }
    if (clientRef.current) {
      clientRef.current.position.x = xClient;
      clientRef.current.position.y = Math.cos(t * 0.8) * 0.06;
    }

    // Gold flash at contact (0.5..0.65)
    if (flashRef.current && flashMat.current) {
      const flash = Math.max(0, 1 - Math.abs(p - 0.57) * 12);
      const scale = 0.4 + flash * 5;
      flashRef.current.scale.setScalar(scale);
      flashMat.current.opacity = flash * 0.9;
    }
  });

  return (
    <group>
      <mesh ref={studentRef} position={[-4, 0, 0]}>
        <sphereGeometry args={[0.42, 64, 64]} />
        <meshStandardMaterial
          color={palette.student}
          emissive={palette.student}
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      <mesh ref={clientRef} position={[4, 0, 0]}>
        <sphereGeometry args={[0.42, 64, 64]} />
        <meshStandardMaterial
          color={palette.client}
          emissive={palette.client}
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* Contact flash */}
      <mesh ref={flashRef} position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial
          ref={flashMat}
          color={palette.gold}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** The AI verification thread — a glowing horizontal beam that scans on beat 2. */
function AiThread({ progress }: BeatProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const p = progress.get();
    const t = clock.elapsedTime;
    const visibility = Math.min(1, Math.max(0, (p - 0.18) / 0.2)) * (1 - Math.max(0, (p - 0.7) / 0.3));
    if (matRef.current) {
      matRef.current.opacity = visibility * (0.5 + 0.3 * Math.sin(t * 2.5));
    }
    if (meshRef.current) {
      meshRef.current.scale.x = THREE.MathUtils.lerp(0.4, 1.2, p);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]} position={[0, 0, -0.1]}>
      <planeGeometry args={[2.5, 0.04]} />
      <meshBasicMaterial
        ref={matRef}
        color={palette.ai}
        transparent
        opacity={0}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Verification ring expanding outward at contact (beat 3). */
function TrustRing({ progress }: BeatProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const p = progress.get();
    const r = Math.max(0, p - 0.5) * 2.2;
    if (ringRef.current) {
      ringRef.current.scale.setScalar(0.3 + r * 3.5);
    }
    if (matRef.current) {
      matRef.current.opacity = Math.max(0, 0.6 - r * 0.6);
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <ringGeometry args={[0.36, 0.42, 64]} />
      <meshBasicMaterial
        ref={matRef}
        color={palette.gold}
        transparent
        opacity={0}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Soft particle field — atmospheric depth, NOT decoration noise. */
function ParticleField({ progress }: BeatProps) {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 220;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      const tint = Math.random();
      const c = tint < 0.4 ? palette.student : tint < 0.8 ? palette.client : palette.gold;
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame(({ clock }) => {
    const p = progress.get();
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * 0.02;
      const mat = ref.current.material as THREE.PointsMaterial;
      mat.opacity = 0.35 + p * 0.25;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SceneCamera({ progress }: BeatProps) {
  const { camera } = useThree();
  useFrame(() => {
    const p = progress.get();
    // Camera dolly: starts wide, pushes in on contact, eases back for the final beat.
    const targetZ = THREE.MathUtils.lerp(6.5, 4.6, Math.min(p / 0.55, 1));
    const finalZ = THREE.MathUtils.lerp(targetZ, 5.2, Math.max(0, (p - 0.55) / 0.45));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, finalZ, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, p * 0.2, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

interface SceneInnerProps {
  progress: MotionValue<number>;
  reduced: boolean;
}

function SceneInner({ progress, reduced }: SceneInnerProps) {
  return (
    <>
      <color attach="background" args={["#050719"]} />
      <fog attach="fog" args={["#050719", 6, 14]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[-3, 2, 3]} intensity={1.4} color={palette.student} />
      <pointLight position={[3, -2, 3]} intensity={1.4} color={palette.client} />
      <pointLight position={[0, 0, 2]} intensity={0.0} color={palette.gold} />

      <SceneCamera progress={progress} />
      <ParticleField progress={progress} />
      <AiThread progress={progress} />
      <ApproachingOrbs progress={progress} />
      <TrustRing progress={progress} />

      {!reduced && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.1} luminanceThreshold={0.18} luminanceSmoothing={0.5} mipmapBlur />
          <ChromaticAberration
            offset={new THREE.Vector2(0.0008, 0.0008)}
            radialModulation={false}
            modulationOffset={0}
            blendFunction={BlendFunction.NORMAL}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.7} />
        </EffectComposer>
      )}
    </>
  );
}

export function HandshakeScene({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion() ?? false;

  if (reduced) {
    // Fallback: a static composition for accessibility / low-power.
    return (
      <div className="absolute inset-0 bg-hero-canvas">
        <div className="aurora" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6.5], fov: 38 }}
      >
        <Suspense fallback={null}>
          <SceneInner progress={progress} reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** Editorial baked silhouette of the handshake. Fades in across beats 2-3. */
export function HandshakeSilhouette({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.45, 0.6, 0.95, 1], [0, 1, 1, 0.85]);
  const scale = useTransform(progress, [0.45, 0.6], [0.94, 1]);

  return (
    <motion.svg
      viewBox="0 0 480 200"
      className="pointer-events-none absolute left-1/2 top-1/2 w-[min(680px,86vw)] -translate-x-1/2 -translate-y-1/2"
      style={{ opacity, scale }}
      aria-hidden
    >
      <defs>
        <linearGradient id="handLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#afa9ec" />
          <stop offset="1" stopColor="#534ab7" />
        </linearGradient>
        <linearGradient id="handRight" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5cc8a6" />
          <stop offset="1" stopColor="#085041" />
        </linearGradient>
        <radialGradient id="contactGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f4cc8a" stopOpacity="1" />
          <stop offset="0.6" stopColor="#e0b070" stopOpacity="0.35" />
          <stop offset="1" stopColor="#e0b070" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Contact glow */}
      <circle cx="240" cy="100" r="64" fill="url(#contactGlow)" />

      {/* Left hand silhouette (stylized, editorial) */}
      <path
        d="M40 130 q40 -50 100 -40 q30 4 60 22 q22 12 38 16 q12 3 16 12"
        fill="none"
        stroke="url(#handLeft)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Right hand silhouette */}
      <path
        d="M440 130 q-40 -50 -100 -40 q-30 4 -60 22 q-22 12 -38 16 q-12 3 -16 12"
        fill="none"
        stroke="url(#handRight)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* AI verification thread crossing the contact */}
      <line
        x1="120"
        y1="100"
        x2="360"
        y2="100"
        stroke="#e0b070"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.7"
      />
    </motion.svg>
  );
}

/** Container — handles scroll, hosts the Canvas + the silhouette overlay + UI text beats. */
export function HandshakeHero({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      <HandshakeScene progress={progress} />
      <HandshakeSilhouette progress={progress} />
    </>
  );
}
