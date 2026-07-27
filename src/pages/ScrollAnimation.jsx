import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SolarPanel3D from '../components/SolarPanel3D';

const FRAME_COUNT = 280;

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
  const [endSlideIndex, setEndSlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const navigate = useNavigate();
  const [cursorLabel, setCursorLabel] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const slideshowImages = [
    '/highqual1.jpg',
    '/highqual2.jpg',
    '/highqual3.jpg',
    '/highqual4.jpg',
  ];

  const endPageImages = [
    '/endpage1.jpg',
    '/endpage2.jpg',
    '/endpage3.jpg',
    '/endpage4.jpg',
  ];

  // Auto-advance main slideshow every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slideshowImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance end-page slideshow every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEndSlideIndex(prev => (prev + 1) % endPageImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Track mobile breakpoint
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    <>
      <div
      ref={containerRef}
      style={{
        /* The tall container creates the scroll distance that drives the animation.
           300 frames × 20px per frame = 6000vh worth of "scrubbing room". 
           We use a more moderate height for smoothness. 
           Extended to 700vh to accommodate the 3D showcase section. */
        height: '1200vh',
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

      {/* 3D Solar Panel Showcase Overlay — always mounted to pre-warm WebGL */}
      {(() => {
        // Show between scroll progress 0.22 and 0.43 (around frame 88)
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
              // Never use visibility:hidden — it causes WebGL context loss
              pointerEvents: opacity > 0.3 ? 'auto' : 'none',
              transition: 'opacity 0.15s ease-out',
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
              className="solar3d-container"
            >
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
                {isMobile ? (
                  /* Static transparent image on mobile */
                  <img
                    src="/solar-panel-fallback.png"
                    alt="Solar Panel"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '20px',
                      animation: 'floating 4s ease-in-out infinite',
                    }}
                  />
                ) : (
                  /* 
                    Desktop only: Mount WebGL when nearby to save memory & prevent context loss.
                  */
                  scrollProgress > 0.15 && scrollProgress < 0.50 && (
                    <SolarPanel3D />
                  )
                )}
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
                    Imagine opening your electricity bill and actually smiling. With solar power, you stop renting energy from the grid and start owning it. Homes and businesses across Dapitan City are already cutting their power costs dramatically, and yours could be next.
                  </p>

                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Consultation Showcase Overlay */}
      {isLoaded && (() => {
        // Show around frame 180 (scrollProgress ~0.60)
        const showStart = 0.53;
        const fadeInEnd = 0.58;
        const fadeOutStart = 0.68;
        const showEnd = 0.73;

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
        const fadeOutStart = 0.90;  // start fading out before end-page slideshow at 0.95
        const showEnd = 0.96;       // fully gone before end-page slideshow fades in

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

      {/* ── End-Page Slideshow ── fades in after the last frame */}
      {isLoaded && (() => {
        // Fades in 0.95→1.0, and stays visible
        const showStart = 0.95;
        const fadeInEnd  = 1.0;

        let opacity = 0;
        if (scrollProgress >= showStart) {
          opacity = Math.min((scrollProgress - showStart) / (fadeInEnd - showStart), 1);
        }

        return (
          <div
            style={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              width: '100%',
              left: 0,
              zIndex: 30,           // sits above all existing overlays
              opacity,
              visibility: opacity <= 0 ? 'hidden' : 'visible',
              transition: 'opacity 0.4s ease-out, visibility 0.4s ease-out',
              pointerEvents: opacity > 0.5 ? 'auto' : 'none',
              overflow: 'hidden',
            }}
          >
            {/* Fullscreen background slideshow */}
            {endPageImages.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`End page ${i + 1}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: i === endSlideIndex ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                }}
              />
            ))}

            {/* Dark overlay — subtle tint so images remain clearly visible */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.25)',
              zIndex: 1,
            }} />

            {/* Circular logo and Text — centered */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-6 sm:px-16 lg:px-24"
              style={{ top: '-5%' }}
            >
              <img
                src="/apple-touch-icon.png"
                alt="Shrine Solar Icon"
                style={{
                  width: '130px',
                  height: '130px',
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))',
                  marginBottom: '24px',
                }}
              />
              <h1
                className="text-white text-lg sm:text-xl lg:text-3xl font-bold leading-snug sm:leading-tight max-w-4xl"
                style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
              >
                Ready to make the switch to smart, sustainable power?<br />
                Message us today for a free consultation and assessment!
              </h1>
              <p
                className="text-gray-300 text-[10px] sm:text-xs lg:text-sm mt-2 sm:mt-3 max-w-2xl font-light mb-4 sm:mb-6"
                style={{ textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}
              >
                #ShrineSolar
              </p>

              {/* Contact Cards */}
              <div className="flex flex-col md:flex-row gap-2 sm:gap-4 w-full items-center justify-center">
                <a href="https://www.facebook.com/shrinesolarservices" target="_blank" rel="noopener noreferrer" className="contact-card-anim w-full max-w-[150px] sm:max-w-none sm:w-40 h-20 sm:h-32 flex flex-col items-center justify-center shadow-lg p-2 sm:p-4 transition-all flex-shrink-0 bg-gradient-to-br from-[#FFF9C4] to-[#FFFFFF] border-4 border-yellow-300 rounded-2xl" onMouseEnter={() => setCursorLabel('Click to see the Facebook Page')} onMouseLeave={() => setCursorLabel(null)} onMouseMove={handleMouseMove}>
                  <img src="/fblogo.png" alt="Facebook" className="relative z-10 w-6 h-6 sm:w-10 sm:h-10 object-contain pointer-events-none mb-1" />
                  <span className="relative z-10 text-base sm:text-lg font-bold text-yellow-900 pointer-events-none">Facebook</span>
                  <span className="relative z-10 text-[10px] sm:text-xs text-yellow-700 mt-1 text-center pointer-events-none">ShrineSolar</span>
                </a>
                <button onClick={() => navigator.clipboard.writeText('09171842499')} className="contact-card-anim w-full max-w-[150px] sm:max-w-none sm:w-40 h-20 sm:h-32 flex flex-col items-center justify-center shadow-lg p-2 sm:p-4 transition-all flex-shrink-0 bg-gradient-to-br from-[#FFF9C4] to-[#FFFFFF] border-4 border-yellow-300 rounded-2xl" onMouseEnter={() => setCursorLabel('Click to copy to Clipboard')} onMouseLeave={() => setCursorLabel(null)} onMouseMove={handleMouseMove}>
                  <img src="/phonelogo.png" alt="Phone" className="relative z-10 w-6 h-6 sm:w-10 sm:h-10 object-contain pointer-events-none mb-1" />
                  <span className="relative z-10 text-base sm:text-lg font-bold text-yellow-900 pointer-events-none">Mobile No.</span>
                  <span className="relative z-10 text-[10px] sm:text-xs text-yellow-700 mt-1 text-center pointer-events-none">09171842499</span>
                </button>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Shrinesolar2022@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-card-anim w-full max-w-[150px] sm:max-w-none sm:w-40 h-20 sm:h-32 flex flex-col items-center justify-center shadow-lg p-2 sm:p-4 transition-all flex-shrink-0 bg-gradient-to-br from-[#FFF9C4] to-[#FFFFFF] border-4 border-yellow-300 rounded-2xl" onMouseEnter={() => setCursorLabel('Click to message us in Gmail')} onMouseLeave={() => setCursorLabel(null)} onMouseMove={handleMouseMove}>
                  <img src="/gmaillogo.png" alt="Gmail" className="relative z-10 w-6 h-6 sm:w-10 sm:h-10 object-contain pointer-events-none mb-1" />
                  <span className="relative z-10 text-base sm:text-lg font-bold text-yellow-900 pointer-events-none">Gmail</span>
                  <span className="relative z-10 text-[9px] sm:text-[10px] text-yellow-700 mt-1 text-center break-all pointer-events-none">Shrinesolar2022@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Close the 1200vh scroll container */}
      </div>

      {/* ── Footer ── flows naturally after the 1200vh scroll container */}
      <footer
        style={{
          position: 'relative',
          width: '100%',
          zIndex: 5,
          background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
          borderTop: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        {/* Gold accent line at top */}
        <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)' }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px 40px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '40px',
          justifyContent: 'space-between',
        }}>
          {/* Column 1: Logo & Description */}
          <div style={{ flex: '1 1 280px', minWidth: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img src="/apple-touch-icon.png" alt="Shrine Solar" style={{ width: '50px', height: '50px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }} />
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.4rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>SHRINE SOLAR</span>
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.55)',
              maxWidth: '300px',
            }}>
              Empowering homes and businesses in Dapitan City with reliable, affordable solar energy solutions. Your trusted partner for panel installation and electrical maintenance.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div style={{ flex: '0 1 160px' }}>
            <h4 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#FFD700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFD700'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >Home</span>
              </li>
              <li>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFD700'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                  onClick={() => { Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Shop'))?.click(); }}
                >Shop</span>
              </li>
              <li>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFD700'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                  onClick={() => { navigate('/my-cart'); }}
                >My Carts</span>
              </li>
              <li>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFD700'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                  onClick={() => { Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Inquiry'))?.click(); }}
                >Inquiry</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div style={{ flex: '0 1 250px' }}>
            <h4 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#FFD700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://www.facebook.com/shrinesolarservices" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'color 0.2s',
              }} onMouseOver={(e) => e.currentTarget.style.color = '#FFD700'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                <img src="/fblogo.png" alt="FB" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                ShrineSolar
              </a>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <img src="/phonelogo.png" alt="Phone" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                09171842499
              </span>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Shrinesolar2022@gmail.com" target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'color 0.2s',
              }} onMouseOver={(e) => e.currentTarget.style.color = '#FFD700'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
                <img src="/gmaillogo.png" alt="Gmail" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                Shrinesolar2022@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 40px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
          }}>
            © {new Date().getFullYear()} Shrine Solar. All rights reserved. · #1 Panel & Electrical Installations in Dapitan City
          </p>
        </div>
      </footer>

      {/* Back to Top Button — standalone fixed element */}
      {isLoaded && scrollProgress >= 0.05 && (
        <div
          style={{
            position: 'fixed',
            bottom: isMobile ? '24px' : '50px',
            ...(isMobile
              ? { right: '20px', left: 'auto', transform: 'none' }
              : { left: '50%', transform: 'translateX(-50%)' }),
            zIndex: 40,
          }}
        >
          {isMobile ? (
            /* Mobile: solid yellow circle with arrow */
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'transparent',
                border: '2px solid #FFD700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                color: '#FFD700',
                fontWeight: 900,
                boxShadow: '0 0 12px rgba(255, 215, 0, 0.25)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease',
              }}
            >
              ↑
            </button>
          ) : (
            /* Desktop: transparent with yellow oval border */
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                padding: '12px 32px',
                background: 'transparent',
                color: '#FFD700',
                border: '2px solid #FFD700',
                borderRadius: '30px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(255, 215, 0, 0.25)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 215, 0, 0.25)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ↑ Back to Top
            </button>
          )}
        </div>
      )}
      {/* Global Custom Cursor Label */}
      {cursorLabel && (
        <div 
          className="fixed pointer-events-none z-[9999] bg-yellow-100 border-2 border-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-semibold shadow-xl whitespace-nowrap transition-opacity duration-200"
          style={{ 
            left: cursorPos.x + 15, 
            top: cursorPos.y + 15
          }}
        >
          {cursorLabel}
        </div>
      )}
    </>
  );
}
