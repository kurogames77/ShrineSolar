import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import SolarPanel3D from '../components/SolarPanel3D';

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  const slideshowImages = [
    '/highqual1.jpg',
    '/highqual2.jpg',
    '/highqual3.jpg',
    '/highqual4.jpg',
  ];

  // Auto-advance slideshow every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slideshowImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
        setScrollProgress(progress);

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

  const carouselRef = useRef(null);
  const carouselRotationRef = useRef(0);
  const isDraggingCarouselRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartRotationRef = useRef(0);

  // Rotate and drag logic for the consultation 3D carousel
  useEffect(() => {
    let animationFrameId;
    const rotateCarousel = () => {
      if (carouselRef.current && !isDraggingCarouselRef.current) {
        carouselRotationRef.current -= 0.3; // Base rotation speed
        carouselRef.current.style.transform = `perspective(800px) rotateY(${carouselRotationRef.current}deg)`;
      }
      animationFrameId = requestAnimationFrame(rotateCarousel);
    };
    rotateCarousel();

    const handleMouseMove = (e) => {
      if (isDraggingCarouselRef.current && carouselRef.current) {
        const deltaX = e.clientX - dragStartXRef.current;
        carouselRotationRef.current = dragStartRotationRef.current + deltaX * 0.5;
        carouselRef.current.style.transform = `perspective(800px) rotateY(${carouselRotationRef.current}deg)`;
      }
    };
    
    const handleMouseUp = () => {
      isDraggingCarouselRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        /* The tall container creates the scroll distance that drives the animation.
           300 frames × 20px per frame = 6000vh worth of "scrubbing room". 
           We use a more moderate height for smoothness. 
           Extended to 700vh to accommodate the 3D showcase section. */
        height: '900vh',
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

      {/* 3D Solar Panel Showcase Overlay */}
      {isLoaded && (() => {
        // Show between scroll progress 0.25 and 0.40 (around frame 88)
        const showStart = 0.22;
        const fadeInEnd = 0.27;
        const fadeOutStart = 0.38;
        const showEnd = 0.43;
        
        let opacity = 0;
        if (scrollProgress >= showStart && scrollProgress <= showEnd) {
          if (scrollProgress < fadeInEnd) {
            opacity = (scrollProgress - showStart) / (fadeInEnd - showStart);
          } else if (scrollProgress > fadeOutStart) {
            opacity = 1 - (scrollProgress - fadeOutStart) / (showEnd - fadeOutStart);
          } else {
            opacity = 1;
          }
        }
        
        if (opacity < 0) opacity = 0;
        
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity,
              visibility: opacity <= 0 ? 'hidden' : 'visible',
              transition: 'opacity 0.15s ease-out, visibility 0.15s ease-out',
              pointerEvents: opacity > 0.3 ? 'auto' : 'none',
            }}
          >
            {/* Removed dark cinematic overlay */}

            {/* Content container */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3rem',
                width: '90%',
                maxWidth: '1200px',
                padding: '2rem',
              }}
              className="solar3d-container"
            >
              {/* 3D Viewer - Left Side */}
              <div
                className="solar3d-viewer"
                style={{
                  flex: '0 0 45%',
                  height: '400px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%)',
                  animation: opacity >= 0.9 ? 'fadeSlideInLeft 0.8s ease-out both' : 'none',
                }}
              >
                <Suspense fallback={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#FFD700', fontFamily: 'Inter, sans-serif' }}>Loading 3D Model...</span></div>}>
                  <SolarPanel3D />
                </Suspense>
              </div>

              {/* Info Card - Right Side */}
              <div
                className="solar3d-rotating-card-wrapper"
                style={{
                  flex: '0 0 45%',
                  position: 'relative',
                  animation: opacity >= 0.9 ? 'fadeSlideInRight 0.8s ease-out 0.2s both' : 'none',
                }}
              >
                {/* Spinning Border Layer (Masked to act strictly as a 2px border outside) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-2px',
                    borderRadius: '22px',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    overflow: 'hidden',
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 15px rgba(255,215,0,0.5))',
                    zIndex: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-75%',
                      left: '50%',
                      width: '250px',
                      height: '250%',
                      marginLeft: '-125px',
                      background: 'linear-gradient(180deg, #ffffff, #FFD700)',
                      animation: 'rotBGimg 4s linear infinite',
                      transformOrigin: 'center center',
                    }}
                  />
                </div>

                {/* Glassmorphism Card (Restored original blur effect) */}
                <div 
                  className="solar3d-glass-card"
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Golden accent line */}
                  <div style={{
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    borderRadius: '2px',
                    marginBottom: '1.5rem',
                  }} />

                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      marginBottom: '1.25rem',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Save up to 80% on your power bills
                  </h2>

                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 'clamp(0.85rem, 1.2vw, 1.05rem)',
                      fontWeight: 400,
                      lineHeight: 1.8,
                      color: '#ffffff',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Imagine opening your electricity bill and actually smiling. With solar power, you stop renting energy from the grid and start owning it. Every ray of sunlight that hits your roof becomes money saved instead of money spent. Homes and businesses across Dapitan City are already cutting their power costs dramatically, and yours could be next.
                  </p>

                  {/* Subtle interaction hint */}
                  <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#FFD700',
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      color: 'rgba(255,215,0,0.7)',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}>
                      Drag the panel to interact
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Consultation Showcase Overlay */}
      {isLoaded && (() => {
        // Show around frame 210 (scrollProgress ~0.70)
        const showStart = 0.63;
        const fadeInEnd = 0.68;
        const fadeOutStart = 0.78;
        const showEnd = 0.83;

        let opacity = 0;
        if (scrollProgress >= showStart && scrollProgress <= showEnd) {
          if (scrollProgress < fadeInEnd) {
            opacity = (scrollProgress - showStart) / (fadeInEnd - showStart);
          } else if (scrollProgress > fadeOutStart) {
            opacity = 1 - (scrollProgress - fadeOutStart) / (showEnd - fadeOutStart);
          } else {
            opacity = 1;
          }
        }

        if (opacity < 0) opacity = 0;

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity,
              visibility: opacity <= 0 ? 'hidden' : 'visible',
              transition: 'opacity 0.15s ease-out, visibility 0.15s ease-out',
              pointerEvents: opacity > 0.3 ? 'auto' : 'none',
            }}
          >
            {/* Content container */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3rem',
                width: '90%',
                maxWidth: '1200px',
                padding: '2rem',
              }}
              className="consultation-container"
            >
              {/* 3D Image Carousel - Left Side */}
              <div
                className="card-3d-wrapper"
                style={{
                  animation: opacity >= 0.9 ? 'fadeSlideInLeft 0.8s ease-out both' : 'none',
                }}
                onMouseDown={(e) => {
                  isDraggingCarouselRef.current = true;
                  dragStartXRef.current = e.clientX;
                  dragStartRotationRef.current = carouselRotationRef.current;
                }}
              >
                <div className="card-3d" ref={carouselRef}>
                  <div><img src="/consultation1.jpg" alt="Consultation 1" /></div>
                  <div><img src="/consultation2.jpg" alt="Consultation 2" /></div>
                  <div><img src="/consultation3.jpg" alt="Consultation 3" /></div>
                  <div><img src="/consultation4.jpg" alt="Consultation 4" /></div>
                  <div><img src="/consultation5.jpg" alt="Consultation 5" /></div>
                </div>
              </div>

              {/* Info Card - Right Side */}
              <div
                className="consultation-glass-card"
                style={{
                  flex: '0 0 45%',
                  position: 'relative',
                  animation: opacity >= 0.9 ? 'fadeSlideInRight 0.8s ease-out 0.2s both' : 'none',
                }}
              >
                {/* Spinning Border Layer */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-2px',
                    borderRadius: '22px',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    overflow: 'hidden',
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 15px rgba(255,215,0,0.5))',
                    zIndex: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-75%',
                      left: '50%',
                      width: '250px',
                      height: '250%',
                      marginLeft: '-125px',
                      background: 'linear-gradient(180deg, #ffffff, #FFD700)',
                      animation: 'rotBGimg 4s linear infinite',
                      transformOrigin: 'center center',
                    }}
                  />
                </div>

                {/* Glassmorphism Card */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Golden accent line */}
                  <div style={{
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    borderRadius: '2px',
                    marginBottom: '1.5rem',
                  }} />

                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      marginBottom: '1.25rem',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Free consultation available
                  </h2>

                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 'clamp(0.85rem, 1.2vw, 1.05rem)',
                      fontWeight: 400,
                      lineHeight: 1.8,
                      color: '#ffffff',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Not sure if solar is right for you? Let's find out together, with zero cost and zero pressure. Our experts will visit your property, assess your energy needs, and design a system that fits your budget and lifestyle. You'll walk away with real numbers and real answers, so you can make a decision with total confidence.
                  </p>

                  {/* Subtle interaction hint */}
                  <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#FFD700',
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      color: 'rgba(255,215,0,0.7)',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}>
                      Drag the carousel to explore
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* High-Quality Installation Showcase Overlay */}
      {isLoaded && (() => {
        // Show near the end of frames and stay visible until the bottom
        const showStart = 0.83;
        const fadeInEnd = 0.87;
        const fadeOutStart = 1.0;
        const showEnd = 1.1;

        let opacity = 0;
        if (scrollProgress >= showStart && scrollProgress <= showEnd) {
          if (scrollProgress < fadeInEnd) {
            opacity = (scrollProgress - showStart) / (fadeInEnd - showStart);
          } else if (scrollProgress > fadeOutStart) {
            opacity = 1 - (scrollProgress - fadeOutStart) / (showEnd - fadeOutStart);
          } else {
            opacity = 1;
          }
        }

        if (opacity < 0) opacity = 0;

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity,
              visibility: opacity <= 0 ? 'hidden' : 'visible',
              transition: 'opacity 0.15s ease-out, visibility 0.15s ease-out',
              pointerEvents: opacity > 0.3 ? 'auto' : 'none',
            }}
          >
            {/* Content container */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3rem',
                width: '90%',
                maxWidth: '1200px',
                padding: '2rem',
              }}
              className="highqual-container"
            >
              {/* Image Slideshow - Left Side */}
              <div
                className="slideshow-card"
                style={{
                  animation: opacity >= 0.9 ? 'fadeSlideInLeft 0.8s ease-out both' : 'none',
                }}
              >
                {slideshowImages.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`High quality installation ${i + 1}`}
                    className={i === slideIndex ? 'active' : ''}
                  />
                ))}
                <div className="slideshow-dots">
                  {slideshowImages.map((_, i) => (
                    <span
                      key={i}
                      className={i === slideIndex ? 'active' : ''}
                      onClick={() => setSlideIndex(i)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>

              {/* Info Card - Right Side */}
              <div
                className="highqual-glass-card"
                style={{
                  flex: '0 0 45%',
                  position: 'relative',
                  animation: opacity >= 0.9 ? 'fadeSlideInRight 0.8s ease-out 0.2s both' : 'none',
                }}
              >
                {/* Spinning Border Layer */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-2px',
                    borderRadius: '22px',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    overflow: 'hidden',
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 15px rgba(255,215,0,0.5))',
                    zIndex: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-75%',
                      left: '50%',
                      width: '250px',
                      height: '250%',
                      marginLeft: '-125px',
                      background: 'linear-gradient(180deg, #ffffff, #FFD700)',
                      animation: 'rotBGimg 4s linear infinite',
                      transformOrigin: 'center center',
                    }}
                  />
                </div>

                {/* Glassmorphism Card */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Golden accent line */}
                  <div style={{
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    borderRadius: '2px',
                    marginBottom: '1.5rem',
                  }} />

                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      marginBottom: '1.25rem',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Trusted, high-quality installation
                  </h2>

                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 'clamp(0.85rem, 1.2vw, 1.05rem)',
                      fontWeight: 400,
                      lineHeight: 1.8,
                      color: '#ffffff',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Solar is a long-term investment, and it deserves a team that treats it that way. Our installers use premium materials and proven techniques to make sure your system performs beautifully for years to come. From the first wire to the final switch, you can relax knowing your home is in skilled, reliable hands.
                  </p>


                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
