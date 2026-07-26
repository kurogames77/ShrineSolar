import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function SolarPanelModel() {
  const { scene } = useGLTF('/3dsolarpanel.glb');
  const modelRef = useRef();

  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={1.5}
      position={[0, -0.5, 0]}
    />
  );
}

function LoadingSpinner() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid rgba(255,215,0,0.3)',
        borderTop: '3px solid #FFD700',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  );
}

export default function SolarPanel3D() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={<LoadingSpinner />}>
        <Canvas
          camera={{ position: [3, 2, 5], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Ambient fill */}
          <ambientLight intensity={0.4} />

          {/* Sunlight from the right */}
          <directionalLight
            position={[5, 4, 2]}
            intensity={2.5}
            color="#fff5e1"
            castShadow
          />

          {/* Accent rim light */}
          <directionalLight
            position={[-3, 2, -2]}
            intensity={0.8}
            color="#87CEEB"
          />

          {/* Environment for realistic reflections */}
          <Environment preset="sunset" />

          <SolarPanelModel />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            dampingFactor={0.05}
            enableDamping
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
