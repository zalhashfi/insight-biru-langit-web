import { useRef, useMemo } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import * as THREE from 'three';

const Network = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const particleCount = 80;
  const maxDistance = 2.5;

  // Initialize particles
  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;

      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      cols[i * 3] = 0.5 + Math.random() * 0.2;
      cols[i * 3 + 1] = 0.5 + Math.random() * 0.2;
      cols[i * 3 + 2] = 0.6 + Math.random() * 0.4;
    }

    return [pos, vel, cols];
  }, []);

  const linesPositions = useMemo(() => new Float32Array(particleCount * particleCount * 3), []);
  const linesColors = useMemo(() => new Float32Array(particleCount * particleCount * 3), []);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;
    
    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = positionsAttr.array as Float32Array;
    
    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      // Bounce off walls gently
      if (posArray[i * 3] > 10 || posArray[i * 3] < -10) velocities[i * 3] *= -1;
      if (posArray[i * 3 + 1] > 10 || posArray[i * 3 + 1] < -10) velocities[i * 3 + 1] *= -1;
      if (posArray[i * 3 + 2] > 2 || posArray[i * 3 + 2] < -12) velocities[i * 3 + 2] *= -1;
    }
    
    positionsAttr.needsUpdate = true;

    // Update lines
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = posArray[i * 3] - posArray[j * 3];
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          const alpha = 1.0 - dist / maxDistance;
          
          linesPositions[vertexpos++] = posArray[i * 3];
          linesPositions[vertexpos++] = posArray[i * 3 + 1];
          linesPositions[vertexpos++] = posArray[i * 3 + 2];

          linesPositions[vertexpos++] = posArray[j * 3];
          linesPositions[vertexpos++] = posArray[j * 3 + 1];
          linesPositions[vertexpos++] = posArray[j * 3 + 2];

          linesColors[colorpos++] = alpha;
          linesColors[colorpos++] = alpha;
          linesColors[colorpos++] = alpha;

          linesColors[colorpos++] = alpha;
          linesColors[colorpos++] = alpha;
          linesColors[colorpos++] = alpha;

          numConnected++;
        }
      }
    }

    const lineGeometry = linesRef.current.geometry;
    lineGeometry.setDrawRange(0, numConnected * 2);
    
    const linePosAttr = lineGeometry.attributes.position as THREE.BufferAttribute;
    const lineColorAttr = lineGeometry.attributes.color as THREE.BufferAttribute;
    
    linePosAttr.needsUpdate = true;
    lineColorAttr.needsUpdate = true;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linesPositions.length / 3}
            array={linesPositions}
            itemSize={3}
            args={[linesPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            count={linesColors.length / 3}
            array={linesColors}
            itemSize={3}
            args={[linesColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.15}
          color="#88aaff"
          depthWrite={false}
        />
      </lineSegments>
    </>
  );
};

export default function NetworkBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-40" aria-hidden="true">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 60 }} 
        dpr={[1, 2]}
      >
        <Network />
      </Canvas>
    </div>
  );
}
