import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Constants ──────────────────────────────────────────────
const THEME_COLORS = {
  purple: new THREE.Color("#8B5CF6"),
  indigo: new THREE.Color("#6366F1"),
  blue: new THREE.Color("#818CF8"),
  pink: new THREE.Color("#EC4899"),
  lavender: new THREE.Color("#C4B5FD"),
};

const NODE_COUNT = 28;
const PARTICLE_COUNT = 60;
const STREAM_COUNT = 18;

// ─── Mouse Tracker (shared state) ───────────────────────────
const mouseState = { x: 0, y: 0 };

function useMouseParallax() {
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseState.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseState.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);
}

// ─── Parallax Camera Rig ────────────────────────────────────
function ParallaxCameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    target.current.set(mouseState.x * 0.8, mouseState.y * 0.5, 5);
    camera.position.lerp(target.current, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Neural Network Nodes ───────────────────────────────────
function NeuralNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      arr.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8
        ),
        speed: 0.15 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        scale: 0.04 + Math.random() * 0.06,
        colorIdx: Math.floor(Math.random() * 5),
      });
    }
    return arr;
  }, []);

  const colorKeys = useMemo(() => Object.keys(THEME_COLORS) as (keyof typeof THEME_COLORS)[], []);

  // Build edges between close nodes
  const edgeGeometry = useMemo(() => {
    const positions: number[] = [];
    const CONNECTION_DIST = 4.5;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].pos.distanceTo(nodes[j].pos) < CONNECTION_DIST) {
          positions.push(
            nodes[i].pos.x, nodes[i].pos.y, nodes[i].pos.z,
            nodes[j].pos.x, nodes[j].pos.y, nodes[j].pos.z
          );
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [nodes]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!meshRef.current) return;

    nodes.forEach((node, i) => {
      dummy.position.copy(node.pos);
      dummy.position.x += Math.sin(t * node.speed + node.phase) * 0.5;
      dummy.position.y += Math.cos(t * node.speed * 0.7 + node.phase) * 0.4;
      dummy.position.z += Math.sin(t * node.speed * 0.5 + node.phase * 2) * 0.3;
      dummy.scale.setScalar(node.scale * (1 + Math.sin(t * 2 + node.phase) * 0.3));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, THEME_COLORS[colorKeys[node.colorIdx]]);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    // Update edge positions to follow animated nodes
    if (linesRef.current) {
      const posAttr = linesRef.current.geometry.getAttribute("position");
      if (posAttr) {
        let idx = 0;
        for (let i = 0; i < nodes.length && idx < posAttr.count; i++) {
          for (let j = i + 1; j < nodes.length && idx < posAttr.count; j++) {
            if (nodes[i].pos.distanceTo(nodes[j].pos) < 4.5) {
              const ni = nodes[i];
              const nj = nodes[j];
              const px1 = ni.pos.x + Math.sin(t * ni.speed + ni.phase) * 0.5;
              const py1 = ni.pos.y + Math.cos(t * ni.speed * 0.7 + ni.phase) * 0.4;
              const pz1 = ni.pos.z + Math.sin(t * ni.speed * 0.5 + ni.phase * 2) * 0.3;
              const px2 = nj.pos.x + Math.sin(t * nj.speed + nj.phase) * 0.5;
              const py2 = nj.pos.y + Math.cos(t * nj.speed * 0.7 + nj.phase) * 0.4;
              const pz2 = nj.pos.z + Math.sin(t * nj.speed * 0.5 + nj.phase * 2) * 0.3;
              posAttr.setXYZ(idx, px1, py1, pz1);
              posAttr.setXYZ(idx + 1, px2, py2, pz2);
              idx += 2;
            }
          }
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0.35} toneMapped={false} />
      </instancedMesh>
      <lineSegments ref={linesRef} geometry={edgeGeometry}>
        <lineBasicMaterial color="#8B5CF6" transparent opacity={0.18} />
      </lineSegments>
    </group>
  );
}

// ─── Circuit Particles ──────────────────────────────────────
function CircuitParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Pick a random axis for circuit-like movement
      const axis = Math.floor(Math.random() * 3);
      arr.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 10
        ),
        axis,
        speed: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        turnInterval: 2 + Math.random() * 3,
        scale: 0.015 + Math.random() * 0.025,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!meshRef.current) return;

    particles.forEach((p, i) => {
      // Circuit-like movement: primarily travel along one axis, with periodic turns
      const segment = Math.floor(t / p.turnInterval + p.phase) % 3;
      const moveAxis = (p.axis + segment) % 3;
      const progress = ((t * p.speed + p.phase) % 20) - 10;

      dummy.position.copy(p.pos);
      if (moveAxis === 0) dummy.position.x += progress * 0.3;
      else if (moveAxis === 1) dummy.position.y += progress * 0.3;
      else dummy.position.z += progress * 0.2;

      // Wrap around
      if (dummy.position.x > 8) dummy.position.x -= 16;
      if (dummy.position.x < -8) dummy.position.x += 16;
      if (dummy.position.y > 6) dummy.position.y -= 12;
      if (dummy.position.y < -6) dummy.position.y += 12;

      dummy.scale.setScalar(p.scale);
      dummy.rotation.set(t * 0.5, t * 0.3, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#818CF8" transparent opacity={0.2} toneMapped={false} />
    </instancedMesh>
  );
}

// ─── Tech Entities (Orbiting Geometric Shapes) ──────────────
function TechEntities() {
  const groupRef = useRef<THREE.Group>(null);

  const entities = useMemo(() => [
    { type: "torus", pos: [5, 3, -2], speed: 0.2, scale: 0.4, color: THEME_COLORS.purple },
    { type: "octahedron", pos: [-6, -2, -3], speed: 0.15, scale: 0.3, color: THEME_COLORS.indigo },
    { type: "torus", pos: [-3, 4, -4], speed: 0.25, scale: 0.35, color: THEME_COLORS.blue },
    { type: "octahedron", pos: [4, -4, -1], speed: 0.18, scale: 0.25, color: THEME_COLORS.lavender },
    { type: "torus", pos: [0, -3, -5], speed: 0.22, scale: 0.3, color: THEME_COLORS.pink },
    { type: "octahedron", pos: [-5, 1, -2], speed: 0.12, scale: 0.35, color: THEME_COLORS.purple },
  ] as const, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const entity = entities[i];
      if (!entity) return;
      child.rotation.x = t * entity.speed * 0.5;
      child.rotation.y = t * entity.speed;
      child.rotation.z = t * entity.speed * 0.3;

      child.position.x = entity.pos[0] + Math.sin(t * entity.speed + i) * 0.8;
      child.position.y = entity.pos[1] + Math.cos(t * entity.speed * 0.7 + i) * 0.6;
    });
  });

  return (
    <group ref={groupRef}>
      {entities.map((entity, i) => (
        <mesh key={i} position={entity.pos as unknown as [number, number, number]} scale={entity.scale}>
          {entity.type === "torus" ? (
            <torusGeometry args={[1, 0.3, 8, 24]} />
          ) : (
            <octahedronGeometry args={[1, 0]} />
          )}
          <meshBasicMaterial
            color={entity.color}
            transparent
            opacity={0.22}
            wireframe
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Data Streams (Falling Code Rain) ───────────────────────
function DataStreams() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, opacities, speeds } = useMemo(() => {
    const pos = new Float32Array(STREAM_COUNT * 30 * 3); // 30 chars per stream
    const opa = new Float32Array(STREAM_COUNT * 30);
    const spd = new Float32Array(STREAM_COUNT * 30);

    for (let s = 0; s < STREAM_COUNT; s++) {
      const baseX = (Math.random() - 0.5) * 16;
      const baseZ = -2 - Math.random() * 6;
      const streamSpeed = 0.5 + Math.random() * 1.5;

      for (let c = 0; c < 30; c++) {
        const idx = (s * 30 + c) * 3;
        pos[idx] = baseX + (Math.random() - 0.5) * 0.15;
        pos[idx + 1] = 8 - c * 0.4 + Math.random() * 0.2;
        pos[idx + 2] = baseZ;
        opa[s * 30 + c] = Math.max(0, 1 - c / 30) * 0.4;
        spd[s * 30 + c] = streamSpeed;
      }
    }

    return { positions: pos, opacities: opa, speeds: spd };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const t = clock.getElapsedTime();

    for (let i = 0; i < posAttr.count; i++) {
      let y = posAttr.getY(i);
      y -= speeds[i] * 0.02;
      if (y < -8) y = 8 + Math.random() * 2;
      posAttr.setY(i, y);

      // Subtle flicker
      const opaAttr = pointsRef.current!.geometry.getAttribute("opacity") as THREE.BufferAttribute;
      if (opaAttr) {
        const baseOpa = opacities[i];
        opaAttr.setX(i, baseOpa * (0.5 + Math.sin(t * 8 + i * 0.5) * 0.5));
      }
    }
    posAttr.needsUpdate = true;
    const opaAttr = pointsRef.current.geometry.getAttribute("opacity") as THREE.BufferAttribute;
    if (opaAttr) opaAttr.needsUpdate = true;
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#8B5CF6") },
      },
      vertexShader: `
        attribute float opacity;
        varying float vOpacity;
        void main() {
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 3.0 * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vOpacity;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = vOpacity * smoothstep(0.5, 0.1, d);
          gl_FragColor = vec4(uColor, alpha * 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  return (
    <points ref={pointsRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-opacity"
          args={[opacities, 1]}
        />
      </bufferGeometry>
    </points>
  );
}

// ─── Ambient Glow Particles ─────────────────────────────────
function AmbientGlow() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.008) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#C4B5FD"
        size={0.05}
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Scene (all entities composed) ──────────────────────────
function Scene() {
  return (
    <>
      <ParallaxCameraRig />
      <ambientLight intensity={0.15} />
      <NeuralNodes />
      <CircuitParticles />
      <TechEntities />
      <DataStreams />
      <AmbientGlow />
    </>
  );
}

// ─── Main Overlay Component ─────────────────────────────────
export function CinematicOverlay() {
  useMouseParallax();
  const [isVisible, setIsVisible] = useState(false);

  // Fade in after mount for smooth appearance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Skip on touch-only devices for performance
  const [isTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window && !window.matchMedia("(pointer: fine)").matches;
  });

  if (isTouch) return null;

  return (
    <div
      className="cinematic-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 1.5s ease-in-out",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
