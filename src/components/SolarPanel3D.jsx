import { useRef, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

// ─── Error Boundary ──────────────────────────────────────────────────────────
// Catches any WebGL / Three.js crash and shows the fallback image instead.
class ThreeDErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '20px',
        }}>
          <img
            src="/solar-panel-fallback.png"
            alt="Solar Panel"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '20px',
            }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── 3D Model ────────────────────────────────────────────────────────────────
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

// ─── Loading Spinner ─────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '20px',
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

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function SolarPanel3D() {
  return (
    <ThreeDErrorBoundary>
      <div style={{ width: '100%', height: '100%', position: 'relative', background: 'transparent' }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas
            camera={{ position: [3, 2, 5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{
              antialias: false,
              powerPreference: 'high-performance',
              alpha: true,
            }}
            onCreated={({ gl }) => {
              // Transparent background — eliminates the white flash on load
              gl.setClearColor(0x000000, 0);
            }}
          >
            {/* Strong ambient so model is visible without HDR environment */}
            <ambientLight intensity={1.2} />

            {/* Primary sunlight from upper-right */}
            <directionalLight
              position={[5, 4, 2]}
              intensity={3}
              color="#fff5e1"
            />

            {/* Cool fill light from left */}
            <directionalLight
              position={[-4, 3, -2]}
              intensity={1.5}
              color="#c8e0ff"
            />

            {/* Warm rim/accent from below */}
            <directionalLight
              position={[0, -2, 3]}
              intensity={0.6}
              color="#FFD700"
            />

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
    </ThreeDErrorBoundary>
  );
}

// Preload the 3D model so it is cached before the user scrolls to it
useGLTF.preload('/3dsolarpanel.glb');
