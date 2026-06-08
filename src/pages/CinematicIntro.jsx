import { useState, useEffect, useRef, useMemo } from 'react';

/*
  Asset order (all same dimensions, designed to be stacked):
  bg01.jpg  → Background gradient (orange-white)
  bg02.png  → Orange circle arc + roof lines
  bg03.png  → Lightning bolt
  bg04.png  → Blue panel 1 (top-left, small)
  bg05.png  → Blue panel 2
  bg06.png  → Blue panel 3
  bg07.png  → Blue panel 4
  bg08.png  → Blue panel 5
  bg09.png  → Blue panel 6
  bg10.png  → Blue panel 7
  bg11.png  → Blue panel 8
  bg12.png  → Blue panel 9
*/

// Animation timing constants (ms) — ~3s total animation
const TIMINGS = {
    // Phase 1: Background pops up
    bgDelay: 100,
    bgDuration: 350,

    // Phase 2: Circle arc + bolt spin-pop
    circleDelay: 400,
    circleDuration: 500,
    boltDelay: 700,
    boltDuration: 350,

    // Phase 3: Blue panels fade in one by one
    panelsStart: 1100,
    panelInterval: 80,
    panelFadeDuration: 250,

    // Phase 4: Text reveal
    textDelay: 2000,
    textLetterInterval: 35,
    subtitleDelay: 2500,
    subtitleDuration: 400,

    // Hold + fade out
    holdAfterComplete: 1500,
};

const PANEL_ASSETS = [
    '/bg04.png', '/bg05.png', '/bg06.png',
    '/bg07.png', '/bg08.png', '/bg09.png',
    '/bg10.png', '/bg11.png', '/bg12.png',
];

export default function CinematicIntro({ onComplete }) {
    // Animation state
    const [bgVisible, setBgVisible] = useState(false);
    const [bgScale, setBgScale] = useState(1.15);
    const [circleVisible, setCircleVisible] = useState(false);
    const [circleScale, setCircleScale] = useState(0);
    const [circleRotation, setCircleRotation] = useState(-180);
    const [boltVisible, setBoltVisible] = useState(false);
    const [boltScale, setBoltScale] = useState(0);
    const [boltFlash, setBoltFlash] = useState(0);
    const [panelStates, setPanelStates] = useState(
        PANEL_ASSETS.map(() => ({ visible: false, opacity: 0, scale: 0.3 }))
    );
    const [titleLetters, setTitleLetters] = useState(0);
    const [subtitleOpacity, setSubtitleOpacity] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    const [particlesActive, setParticlesActive] = useState(false);

    const animFrameRef = useRef(null);
    const startTimeRef = useRef(null);
    const hasCompletedRef = useRef(false);

    const titleText = "SHRINE SOLAR";
    const subtitleText = "Panel & Electrical Installations and Maintenance Services";

    // Memoize particles
    const particles = useMemo(() =>
        Array.from({ length: 25 }, (_, i) => ({
            id: i,
            x: 25 + Math.random() * 50,
            y: 15 + Math.random() * 60,
            size: 2 + Math.random() * 5,
            delay: Math.random() * 3,
            duration: 2 + Math.random() * 3.5,
        })), []
    );

    useEffect(() => {
        startTimeRef.current = performance.now();

        const animate = (timestamp) => {
            const elapsed = timestamp - startTimeRef.current;

            // Phase 1: Background pop
            if (elapsed >= TIMINGS.bgDelay) {
                const bgProgress = Math.min((elapsed - TIMINGS.bgDelay) / TIMINGS.bgDuration, 1);
                setBgVisible(true);
                setBgScale(1.15 - easeOutCubic(bgProgress) * 0.15);
            }

            // Phase 2: Circle arc spin-pop
            if (elapsed >= TIMINGS.circleDelay) {
                const circProg = Math.min((elapsed - TIMINGS.circleDelay) / TIMINGS.circleDuration, 1);
                setCircleVisible(true);
                setCircleScale(easeOutBack(circProg));
                setCircleRotation(-180 + easeOutExpo(circProg) * 180);
            }

            // Phase 2b: Lightning bolt pop
            if (elapsed >= TIMINGS.boltDelay) {
                const boltProg = Math.min((elapsed - TIMINGS.boltDelay) / TIMINGS.boltDuration, 1);
                setBoltVisible(true);
                setBoltScale(easeOutBack(boltProg));
                // Flash effect when bolt appears
                if (boltProg < 0.3) {
                    setBoltFlash(easeOutExpo(boltProg / 0.3) * 0.5);
                } else {
                    setBoltFlash(Math.max(0, 0.5 * (1 - (boltProg - 0.3) / 0.4)));
                }
                if (boltProg > 0.2) setParticlesActive(true);
            }

            // Phase 3: Panels one by one
            if (elapsed >= TIMINGS.panelsStart) {
                const panelElapsed = elapsed - TIMINGS.panelsStart;
                setPanelStates(prev => {
                    const next = [...prev];
                    for (let i = 0; i < PANEL_ASSETS.length; i++) {
                        const panelStart = i * TIMINGS.panelInterval;
                        if (panelElapsed >= panelStart) {
                            const pProg = Math.min((panelElapsed - panelStart) / TIMINGS.panelFadeDuration, 1);
                            next[i] = {
                                visible: true,
                                opacity: easeOutCubic(pProg),
                                scale: easeOutBack(Math.min(pProg * 1.2, 1)),
                            };
                        }
                    }
                    return next;
                });
            }

            // Phase 4: Title letters
            if (elapsed >= TIMINGS.textDelay) {
                const textElapsed = elapsed - TIMINGS.textDelay;
                const letterIdx = Math.floor(textElapsed / TIMINGS.textLetterInterval);
                setTitleLetters(Math.min(letterIdx + 1, titleText.length));
            }

            // Subtitle
            if (elapsed >= TIMINGS.subtitleDelay) {
                const subProg = Math.min((elapsed - TIMINGS.subtitleDelay) / TIMINGS.subtitleDuration, 1);
                setSubtitleOpacity(easeOutCubic(subProg));
            }

            // Completion
            const allPanelsDone = TIMINGS.panelsStart + PANEL_ASSETS.length * TIMINGS.panelInterval + TIMINGS.panelFadeDuration;
            const textDone = TIMINGS.subtitleDelay + TIMINGS.subtitleDuration;
            const totalEnd = Math.max(allPanelsDone, textDone) + TIMINGS.holdAfterComplete;

            if (elapsed >= totalEnd && !hasCompletedRef.current) {
                hasCompletedRef.current = true;
                setFadeOut(true);
                setTimeout(() => onComplete?.(), 1200);
                return;
            }

            if (!hasCompletedRef.current) {
                animFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    return (
        <div
            className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-opacity duration-[1200ms] ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{ background: '#0a0a0a' }}
        >
            {/* ====== LAYER 1: Background (bg01.jpg) ====== */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    opacity: bgVisible ? 1 : 0,
                    transform: `scale(${bgScale})`,
                    transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                <img
                    src="/bg01.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                />
            </div>

            {/* Flash overlay when bolt appears */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: 'radial-gradient(circle at 55% 42%, rgba(255,255,255,0.9) 0%, rgba(255,220,100,0.4) 30%, transparent 70%)',
                    opacity: boltFlash,
                }}
            />

            {/* ====== LOGO CONTAINER (all layers stacked) ====== */}
            <div className="relative z-20" style={{ width: '480px', height: '480px' }}>
                {/* ====== LAYER 2: Circle arc + roof (bg02.png) ====== */}
                <img
                    src="/bg02.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable={false}
                    style={{
                        opacity: circleVisible ? 1 : 0,
                        transform: `scale(${circleScale}) rotate(${circleRotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'opacity 0.15s ease-out',
                        filter: circleScale < 1 ? 'drop-shadow(0 0 20px rgba(255,180,0,0.6))' : 'drop-shadow(0 0 8px rgba(255,180,0,0.3))',
                    }}
                />

                {/* ====== LAYER 3: Lightning bolt (bg03.png) ====== */}
                <img
                    src="/bg03.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable={false}
                    style={{
                        opacity: boltVisible ? 1 : 0,
                        transform: `scale(${boltScale})`,
                        transformOrigin: 'center center',
                        transition: 'opacity 0.1s ease-out',
                        filter: boltScale < 1 ? 'drop-shadow(0 0 15px rgba(255,200,0,0.7))' : 'drop-shadow(0 0 5px rgba(255,200,0,0.3))',
                    }}
                />

                {/* ====== LAYERS 4-12: Blue solar panels (bg04-bg12.png) ====== */}
                {PANEL_ASSETS.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt=""
                        className="absolute inset-0 w-full h-full object-contain"
                        draggable={false}
                        style={{
                            opacity: panelStates[i].opacity,
                            transform: `scale(${panelStates[i].scale})`,
                            transformOrigin: 'center center',
                            filter: panelStates[i].opacity < 1
                                ? 'drop-shadow(0 0 12px rgba(43,45,123,0.5))'
                                : 'drop-shadow(0 0 3px rgba(43,45,123,0.2))',
                        }}
                    />
                ))}
            </div>

            {/* ====== TEXT BELOW LOGO ====== */}
            <div className="absolute z-20" style={{ bottom: 'calc(50% - 280px)' }}>
                <div className="text-center">
                    <h1
                        className="font-black tracking-[0.15em] text-3xl sm:text-4xl md:text-5xl leading-tight"
                        style={{
                            fontFamily: "'Outfit', sans-serif",
                            minHeight: '56px',
                        }}
                    >
                        {titleText.split('').map((char, i) => (
                            <span
                                key={i}
                                className="inline-block"
                                style={{
                                    color: i < titleLetters ? '#1a1a5e' : 'transparent',
                                    textShadow: i < titleLetters
                                        ? '0 2px 8px rgba(26,26,94,0.15)'
                                        : 'none',
                                    transform: i < titleLetters
                                        ? 'translateY(0) scale(1)'
                                        : 'translateY(25px) scale(0.3)',
                                    opacity: i < titleLetters ? 1 : 0,
                                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                    transitionDelay: `${i * 0.025}s`,
                                    width: char === ' ' ? '0.35em' : 'auto',
                                }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </h1>


                    {/* Subtitle */}
                    <p
                        className="text-xs sm:text-sm md:text-base tracking-wide max-w-md mx-auto"
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            color: '#2B2D7B',
                            opacity: subtitleOpacity * 0.85,
                            transform: `translateY(${(1 - subtitleOpacity) * 20}px)`,
                            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    >
                        {subtitleText}
                    </p>
                </div>
            </div>

            {/* ====== PARTICLES ====== */}
            {particlesActive && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
                    {particles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute rounded-full"
                            style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                background: p.id % 3 === 0
                                    ? 'radial-gradient(circle, rgba(255,200,50,0.9), transparent)'
                                    : p.id % 3 === 1
                                        ? 'radial-gradient(circle, rgba(100,120,255,0.7), transparent)'
                                        : 'radial-gradient(circle, rgba(255,255,255,0.6), transparent)',
                                animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
                                opacity: 0,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Subtle vignette */}
            <div
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)',
                    opacity: bgVisible ? 1 : 0,
                    transition: 'opacity 1s ease',
                }}
            />

            {/* Keyframes */}
            <style>{`
        @keyframes particleFloat {
          0% { opacity: 0; transform: translateY(0px) scale(0); }
          15% { opacity: 0.7; transform: translateY(-8px) scale(1); }
          70% { opacity: 0.3; transform: translateY(-50px) scale(0.5); }
          100% { opacity: 0; transform: translateY(-90px) scale(0); }
        }
      `}</style>
        </div>
    );
}

// Easing functions
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
