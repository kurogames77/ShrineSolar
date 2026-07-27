import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

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
                {/* 
                  Only mount WebGL when nearby to save mobile GPU memory & prevent context loss.
                  We mount at 0.15 (well before 0.22 fade-in) so it has time to compile shaders without stuttering.
                */}
                {scrollProgress > 0.15 && scrollProgress < 0.50 && (
                  <SolarPanel3D />
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
                    Imagine opening your electricity bill and actually smiling. With solar power, you stop renting energy from the grid and start owning it. Every ray of sunlight that hits your roof becomes money saved instead of money spent. Homes and businesses across Dapitan City are already cutting their power costs dramatically, and yours could be next.
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

      {/* Back to Top Button — standalone fixed element */}
      {isLoaded && scrollProgress >= 0.05 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            ...(isMobile
              ? { right: '20px', left: 'auto', transform: 'none' }
              : { left: '50%', transform: 'translateX(-50%)' }),
            zIndex: 9999,
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
    </div>
  );
}
