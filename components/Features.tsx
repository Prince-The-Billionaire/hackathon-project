"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FiLayers, 
  FiGlobe, 
  FiTrendingDown, 
  FiShield, 
  FiCheckCircle, 
  FiPlus, 
  FiMinus,
  FiArrowUpRight
} from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ==========================================================================
   1. PARSING & GRADIENT MATH UTILITIES
   ========================================================================== */

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 220, s: 80, l: 50 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

type GlowVars = { [key: string]: string | number };

function buildGlowVars(glowColor: string, intensity: number): GlowVars {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars: GlowVars = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }
  return vars;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]): GlowVars {
  const vars: GlowVars = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x: number) { return x * x * x; }

interface AnimateProps {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (v: number) => void;
  onEnd?: () => void;
}

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: AnimateProps) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

/* ==========================================================================
   2. TAILWIND BORDER GLOW COMPONENT (NO EXTERNAL CSS STYLESHEET REQUIRED)
   ========================================================================== */

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '220 90 45',
  backgroundColor = '#ffffff',
  borderRadius = 24,
  glowRadius = 50,
  glowIntensity = 1.0,
  coneSpread = 35,
  animated = false,
  colors = ['#3b82f6', '#60a5fa', '#93c5fd'],
  fillOpacity = 0.04,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cursorAngle, setCursorAngle] = useState(0);
  const [edgeProximity, setEdgeProximity] = useState(50);

  const getCenterOfElement = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [getCenterOfElement]);

  const getCursorAngle = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }, [getCenterOfElement]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setEdgeProximity(parseFloat((getEdgeProximity(card, x, y) * 100).toFixed(3)));
    setCursorAngle(parseFloat(getCursorAngle(card, x, y).toFixed(3)));
  }, [getEdgeProximity, getCursorAngle]);

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const angleStart = 110;
    const angleEnd = 465;

    animateValue({ duration: 600, onUpdate: v => setEdgeProximity(v) });
    animateValue({
      ease: easeInCubic,
      duration: 1200,
      end: 50,
      onUpdate: v => setCursorAngle((angleEnd - angleStart) * (v / 100) + angleStart)
    });
    animateValue({
      ease: easeOutCubic,
      delay: 1200,
      duration: 1800,
      start: 50,
      end: 100,
      onUpdate: v => setCursorAngle((angleEnd - angleStart) * (v / 100) + angleStart)
    });
    animateValue({
      ease: easeInCubic,
      delay: 2200,
      duration: 1200,
      start: 100,
      end: 0,
      onUpdate: v => setEdgeProximity(v)
    });
  }, [animated]);

  const glowVars = buildGlowVars(glowColor, glowIntensity);
  const glowHslString = glowVars['--glow-color'] as string || 'hsl(220deg 90% 45%)';

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`relative group/glow overflow-hidden transition-all duration-300 ${className}`}
      style={{
        backgroundColor: backgroundColor,
        borderRadius: `${borderRadius}px`,
        ...glowVars,
        ...buildGradientVars(colors),
      } as React.CSSProperties}
    >
      {/* 1px Border Overlay Mock powered directly via Tailwind styles using conics */}
      <span 
        className="absolute inset-0 pointer-events-none z-10 opacity-40 group-hover/glow:opacity-100 transition-opacity duration-300"
        style={{
          borderRadius: `${borderRadius}px`,
          padding: '1.5px',
          background: `conic-gradient(from ${cursorAngle}deg, ${glowHslString} 0deg, transparent ${coneSpread}deg, transparent ${360 - coneSpread}deg, ${glowHslString} 360deg)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      
      {/* Background Interactive Radial Fill Core */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover/glow:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle ${glowRadius * 2}px at ${edgeProximity}% ${cursorAngle / 3.6}%, ${glowVars['--glow-color-10'] || 'rgba(59,130,246,0.05)'}, transparent)`
        }}
      />

      <div className="h-full w-full relative z-20">
        {children}
      </div>
    </div>
  );
};


/* ==========================================================================
   3. RESPONSIVE LIGHT MODE LANDING PAGE LAYOUT
   ========================================================================== */

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const coreFeatures = [
    {
      icon: <FiLayers className="w-5 h-5 text-blue-600" />,
      title: "Shared Logistics Framework",
      description: "Stop funding entire shipping containers solo. Partner instantly with neighboring retailers to pool resources, optimize volume fill metrics, and access wholesale freight pricing."
    },
    {
      icon: <FiTrendingDown className="w-5 h-5 text-emerald-600" />,
      title: "Direct Supplier Pipeline",
      description: "Cut out domestic brokers and secondary marketplace markups. Connect your checkout direct to factory production lines abroad with automated cross-border tracking."
    },
    {
      icon: <FiGlobe className="w-5 h-5 text-indigo-600" />,
      title: "Bilateral Trade Routing",
      description: "Not just an import terminal. Open up reverse freight infrastructure to easily pack, coordinate, and export premium agricultural or retail cargo back to global storefront networks."
    }
  ];

  const appProofStats = [
    { value: "₦1,500,000", label: "Baseline Freight Limit", sub: "Standard direct-to-factory tier threshold" },
    { value: "99.4%", label: "Container Space Densities", sub: "Calculated continuously across automated lanes" },
    { value: "0%", label: "Middlemen Retained", sub: "100% direct-to-merchant clearing pipeline" }
  ];

  const faqs = [
    {
      question: "How does the shared cargo pooling mechanism work?",
      answer: "When booking cargo through Zeon Systems, your shipment is indexed by volume and destination. Our matching logic algorithmically pairs your batch with peer merchants sourcing along identical channels, locking in bulk container discount thresholds dynamically."
    },
    {
      question: "How is security handled inside the Escrow Holding Pool?",
      answer: "Landed cost funds are held securely in neutral staging environments. Disbursal protocols trigger payouts to foreign vendor profiles exclusively after custom regulatory logs clear destination entry checkpoints successfully."
    },
    {
      question: "Can I manage decentralized export workflows?",
      answer: "Absolutely. The portal features native toolsets configured specifically for outbound trade routes, enabling local producers to dispatch premium agricultural loads directly to verify storefront groups across global distribution hubs."
    }
  ];

  useGSAP(() => {
    gsap.fromTo(".reveal-text-node", 
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".reveal-text-node", start: "top 85%" }
      }
    );

    gsap.fromTo(".card-stagger-node",
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out",
        scrollTrigger: { trigger: ".features-grid-trigger", start: "top 80%" }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-slate-50 text-slate-900 py-16 sm:py-24 lg:py-32 overflow-hidden font-sans relative w-full selection:bg-blue-500/10">
      
      {/* TECHNICAL CANVASS GRID PATTERN */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none opacity-50 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- SECTION 1: HEADER TYPOGRAPHY --- */}
        <div className="max-w-3xl mb-12 sm:mb-16 lg:mb-20">
          <div className="reveal-text-node inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block animate-pulse"></span>
            Logistics Re-Engineered
          </div>
          <h2 className="reveal-text-node text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
            Share container footprints.<br className="hidden sm:inline" />Bypass excessive middlemen.
          </h2>
          <p className="reveal-text-node text-sm sm:text-base lg:text-lg text-slate-500 leading-relaxed font-normal">
            Zeon Systems breaks down complex international shipping barriers by letting cross-border local businesses aggregate supply volumes directly into shared freight allocations.
          </p>
        </div>

        {/* --- SECTION 2: RESPONSIVE FEATURE CARD GRID --- */}
        <div className="features-grid-trigger grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 sm:mb-28 lg:mb-36">
          {coreFeatures.map((feat, idx) => (
            <div key={idx} className="card-stagger-node h-full">
              <BorderGlow
                borderRadius={16}
                glowRadius={60}
                backgroundColor="#ffffff"
                glowColor={idx === 0 ? "217 90 50" : idx === 1 ? "142 75 45" : "260 80 50"}
                colors={idx === 0 ? ['#3b82f6', '#60a5fa'] : idx === 1 ? ['#10b981', '#34d399'] : ['#6366f1', '#818cf8']}
                fillOpacity={0.03}
                className="h-full border border-slate-200/60 shadow-sm hover:shadow-md"
              >
                <div className="p-6 sm:p-8 flex flex-col justify-between h-full min-h-[260px] sm:min-h-[290px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 sm:mb-6 shadow-sm">
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 tracking-wide">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">{feat.description}</p>
                  </div>
                  <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-400 group-hover/glow:text-blue-600 transition-colors duration-200 cursor-pointer">
                    View interface specs
                    <FiArrowUpRight className="ml-1 text-slate-400 group-hover/glow:text-blue-600 transition-transform duration-200 transform group-hover/glow:translate-x-0.5 group-hover/glow:-translate-y-0.5" />
                  </div>
                </div>
              </BorderGlow>
            </div>
          ))}
        </div>

        {/* --- SECTION 3: RESPONSIVE DATA VALIDATION & GRAPHIC LAYER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20 sm:mb-28 lg:mb-36">
          
          {/* Left Metrics Column */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-6 sm:space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">
                Empirical Ledger Validation
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
                Designed around capital performance efficiencies.
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-slate-500 leading-relaxed">
                By optimizing continuous container space metrics dynamically along shared shipping routes, our networks execute transactions on identical competitive terms with major distribution houses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {appProofStats.map((stat, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-xl shadow-sm flex items-start gap-4">
                  <div className="mt-1 bg-blue-50 p-1.5 rounded-lg border border-blue-100 flex-shrink-0">
                    <FiCheckCircle className="text-blue-600 w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-600 mt-0.5">{stat.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Interface Dashboard Graphics Column */}
          <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col gap-6 w-full">
            
            {/* Map Dashboard Box */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-5 relative overflow-hidden w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-200 block"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-200 block"></span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider font-mono">PIPELINE MONITOR: GLOBAL SPACE ROUTING MAP</span>
                </div>
                <span className="self-start sm:self-auto text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold px-2 py-0.5 rounded">Active Network Live</span>
              </div>
              <div className="aspect-video object-center bg-[url(/image.webp)] rounded-xl border border-slate-100 relative overflow-hidden flex items-center justify-center p-4 text-center">
                {/* <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40" /> */}
                {/* <img src={'/image.webp'} width="100%" height="100%" className="object-contain rounded-2xl"  /> */}
                
              </div>
            </div>

            {/* Financial Ledger Overlay Box */}
            <div className="w-full sm:max-w-md sm:ml-auto -mt-6 sm:-mt-10 lg:-mt-16 shadow-2xl relative z-20">
              <BorderGlow
                borderRadius={20}
                glowRadius={60}
                backgroundColor="#ffffff"
                glowColor="215 95 40"
                colors={['#2563eb', '#38bdf8', '#10b981']}
                animated={true}
                glowIntensity={1.1}
                fillOpacity={0.01}
                className="border border-slate-200/60 shadow-xl"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Escrow Holding Matrix</span>
                    <FiShield className="text-blue-600 w-4 h-4" />
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs pb-1 border-b border-slate-50">
                      <span className="text-slate-400">Base Freight Cargo Value:</span>
                      <span className="font-mono font-bold text-slate-900">₦1,500,000</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1 border-b border-slate-50">
                      <span className="text-slate-400">Duties & Shared Handling Logistics:</span>
                      <span className="font-mono font-bold text-slate-900">₦125,000</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm pt-2 font-bold items-baseline">
                      <span className="text-slate-800 text-[11px] font-bold">TOTAL LANDED BALANCE:</span>
                      <span className="font-mono text-sm sm:text-base text-blue-600 tracking-tight">₦1,746,875</span>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-200 rounded-xl p-3 sm:p-3.5 text-[10px] sm:text-[11px] text-amber-800 leading-relaxed mt-4">
                      <strong>Escrow Lock System:</strong> Funds remain completely staged inside secure multi-sig validation accounts. Financial releases execute when custom logs verify clearance.
                    </div>
                  </div>
                </div>
              </BorderGlow>
            </div>

          </div>
        </div>

        {/* --- SECTION 4: RESPONSIVE FAQ ACCORDION PIPELINE --- */}
        <div className="border-t border-slate-200/80 pt-16 sm:pt-20 lg:pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="lg:col-span-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-400 rounded-full block"></span> Knowledge Base
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
                Frequently Asked Inquiries
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Looking for structural specifics on freight pooling variables, legal custom logs clearances, or supported corridors? Get in touch with clearing workflows directly.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-3 w-full">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm transition-all duration-200 w-full"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left focus:outline-none group/btn gap-2"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover/btn:text-slate-900 transition-colors duration-150">{faq.question}</span>
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/btn:text-slate-600 flex-shrink-0 border border-slate-200">
                        {isOpen ? <FiMinus className="w-3 h-3" /> : <FiPlus className="w-3 h-3" />}
                      </span>
                    </button>
                    
                    <div 
                      className={`px-4 sm:px-6 transition-all duration-300 ease-in-out border-slate-100 ${
                        isOpen ? "max-h-[200px] sm:max-h-40 pb-4 sm:pb-5 pt-1 opacity-100 border-t" : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <p className="text-[11px] sm:text-xs lg:text-sm text-slate-500 leading-relaxed font-normal">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}