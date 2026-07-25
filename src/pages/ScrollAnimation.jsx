import { useEffect, useRef, useState, useCallback } from 'react';

const FRAME_COUNT = 300;

// Build the frame source path for a given index (1-based)
const frameSrc = (index) =>
  `/frames/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;

export default function ScrollAnimation() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Draw a specific frame onto the canvas
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[frameIndex];
    if (!canvas || !ctx || !img) return;

    // Size canvas to fill the viewport
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // Cover-fit the image (like background-size: cover)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let drawW, drawH, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawH = h;
      drawW = h * imgRatio;
      offsetX = (w - drawW) / 2;
      offsetY = 0;
    } else {
      drawW = w;
      drawH = w / imgRatio;
      offsetX = 0;
      offsetY = (h - drawH) / 2;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }, []);

  // Preload all frames
  useEffect(() => {
    let loaded = 0;
    const images = new Array(FRAME_COUNT);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameSrc(i + 1);
      img.onload = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
        if (loaded === FRAME_COUNT) {
          setIsLoaded(true);
          // Draw first frame immediately
          drawFrame(0);
        }
      };
      img.onerror = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
      };
      images[i] = img;
    }

    imagesRef.current = images;
  }, [drawFrame]);

  // Scroll-driven frame update
  useEffect(() => {
    if (!isLoaded) return;

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const scrollableHeight = container.scrollHeight - window.innerHeight;

        // How far we've scrolled through the container (0 → 1)
        const scrollTop = -rect.top;
        const progress = Math.min(Math.max(scrollTop / scrollableHeight, 0), 1);

        const frameIndex = Math.min(
          Math.floor(progress * (FRAME_COUNT - 1)),
          FRAME_COUNT - 1
        );

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Draw initial frame based on current scroll
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isLoaded, drawFrame]);

  // Redraw on resize
  useEffect(() => {
    if (!isLoaded) return;

    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded, drawFrame]);

  return (
    <div
      ref={containerRef}
      style={{
        /* The tall container creates the scroll distance that drives the animation.
           300 frames × 20px per frame = 6000vh worth of "scrubbing room". 
           We use a more moderate height for smoothness. */
        height: '500vh',
        position: 'relative',
      }}
    >
      {/* Loading overlay */}
      {!isLoaded && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#a8a8a8',
          }}
        >
          <div
            style={{
              width: '200px',
              height: '4px',
              background: '#d1d5db',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${loadProgress}%`,
                background: '#374151',
                borderRadius: '9999px',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <span
            style={{
              marginTop: '12px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            {loadProgress}%
          </span>
        </div>
      )}

      {/* Canvas — pinned to viewport while scrolling */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          display: 'block',
        }}
      />
    </div>
  );
}
