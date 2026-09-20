import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";

type SculptureProps = {
  reducedMotion: boolean;
  routeSeed: number;
};

function Sculpture({ reducedMotion, routeSeed }: SculptureProps) {
  const group = useRef<THREE.Group>(null);
  const knot = useRef<THREE.Mesh>(null);
  const points = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2;
        const radius = 3.2 + (index % 4) * 0.26;
        return [Math.cos(angle) * radius, Math.sin(angle * 1.7) * 1.7, Math.sin(angle) * radius] as const;
      }),
    [],
  );

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y += delta * 0.055;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * 0.08, 0.025);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -state.pointer.x * 0.06, 0.025);
    if (knot.current) knot.current.rotation.z -= delta * 0.09;
  });

  return (
    <group ref={group} rotation={[0.08, routeSeed * 0.11, -0.08]}>
      <Float speed={reducedMotion ? 0 : 1.15} rotationIntensity={0.18} floatIntensity={0.35}>
        <mesh ref={knot} position={[2.65, 0.4, -1.2]} scale={1.35}>
          <torusKnotGeometry args={[1.18, 0.24, 160, 20, 2, 5]} />
          <MeshTransmissionMaterial
            color="#f2f2ee"
            thickness={0.8}
            roughness={0.2}
            transmission={0.92}
            chromaticAberration={0.035}
            anisotropy={0.2}
          />
        </mesh>
      </Float>

      <mesh position={[-3.1, -0.65, -1.8]} rotation={[0.55, 0.2, 0.5]}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial color="#ff5c35" roughness={0.38} metalness={0.42} wireframe />
      </mesh>

      <mesh position={[0.2, 2.65, -3]} rotation={[1.2, 0.2, 0.1]}>
        <torusGeometry args={[1.45, 0.035, 8, 96]} />
        <meshBasicMaterial color="#63e6be" transparent opacity={0.62} />
      </mesh>

      {points.map((point, index) => (
        <mesh key={index} position={point} scale={index % 5 === 0 ? 0.055 : 0.025}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={index % 3 === 0 ? "#ff5c35" : "#f2f2ee"} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function GalleryScene() {
  const { pathname } = useLocation();
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const routeSeed = pathname.split("").reduce((total, character) => total + character.charCodeAt(0), 0) % 9;

  if (!supportsWebGL()) return <div className="gallery-fallback" aria-hidden="true" />;

  return (
    <div className="gallery-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 6, 7]} intensity={2.4} color="#f2f2ee" />
        <pointLight position={[-5, -2, 3]} intensity={18} color="#ff5c35" distance={12} />
        <pointLight position={[4, 3, 2]} intensity={10} color="#63e6be" distance={10} />
        <Sculpture reducedMotion={reducedMotion} routeSeed={routeSeed} />
      </Canvas>
      <div className="gallery-scene-vignette" />
    </div>
  );
}