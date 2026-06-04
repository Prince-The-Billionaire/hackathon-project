"use client";

import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { 
  FiArrowRight, 
  FiShield, 
  FiGlobe, 
  FiMail, 
  FiLinkedin, 
  FiTwitter, 
  FiArrowUpRight 
} from 'react-icons/fi';

/* ==========================================================================
   1. FIXED HIGH-PERFORMANCE WEBGL SHADER STACK
   ========================================================================== */

const hexToRgb = (hex: string): [number, number, number] => {
  const cleanHex = hex.replace('#', '');
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  if (!result) return [0.94, 0.96, 0.98]; // Fallback to premium slate light tints
  return [
    parseInt(result[1], 16) / 255, 
    parseInt(result[2], 16) / 255, 
    parseInt(result[3], 16) / 255
  ];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);} 
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);} 
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);} 
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

const ctxMap = new WeakMap();

interface GrainientProps {
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  className?: string;
}

const Grainient: React.FC<GrainientProps> = ({
  timeSpeed = 0.22,
  colorBalance = -0.1,
  warpStrength = 2.0,
  warpFrequency = 3.5,
  warpSpeed = 1.8,
  warpAmplitude = 35.0,
  blendAngle = 25.0,
  blendSoftness = 0.3,
  rotationAmount = 40.0,
  noiseScale = 1.5,
  grainAmount = 0.05,
  grainScale = 1.5,
  grainAnimated = true,
  contrast = 1.05,
  gamma = 1.0,
  saturation = 1.1,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 1.1,
  color1 = '#BAE6FD', // Sky highlight
  color2 = '#BBF7D0', // Fresh Mint green vector
  color3 = '#F3E8FF', // Soft Light Lavender
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime:           { value: 0 },
        iResolution:     { value: new Float32Array([1, 1]) },
        uTimeSpeed:      { value: timeSpeed },
        uColorBalance:   { value: colorBalance },
        uWarpStrength:   { value: warpStrength },
        uWarpFrequency:  { value: warpFrequency },
        uWarpSpeed:      { value: warpSpeed },
        uWarpAmplitude:  { value: warpAmplitude },
        uBlendAngle:     { value: blendAngle },
        uBlendSoftness:  { value: blendSoftness },
        uRotationAmount: { value: rotationAmount },
        uNoiseScale:     { value: noiseScale },
        uGrainAmount:    { value: grainAmount },
        uGrainScale:     { value: grainScale },
        uGrainAnimated:  { value: grainAnimated ? 1.0 : 0.0 },
        uContrast:       { value: contrast },
        uGamma:          { value: gamma },
        uSaturation:     { value: saturation },
        uCenterOffset:   { value: new Float32Array([centerX, centerY]) },
        uZoom:           { value: zoom },
        uColor1:         { value: new Float32Array(hexToRgb(color1)) },
        uColor2:         { value: new Float32Array(hexToRgb(color2)) },
        uColor3:         { value: new Float32Array(hexToRgb(color3)) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);
      const res = program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = (t: number) => {
      program.uniforms.iTime.value = (t - t0) * 0.001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) { cancelAnimationFrame(raf); raf = 0; }
    };

    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; isVisible ? tryStart() : tryStop(); },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      ctxMap.delete(container);
      try { container.removeChild(canvas); } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const { program } = ctx;
    const u = program.uniforms;

    u.uTimeSpeed.value      = timeSpeed;
    u.uColorBalance.value   = colorBalance;
    u.uWarpStrength.value   = warpStrength;
    u.uWarpFrequency.value  = warpFrequency;
    u.uWarpSpeed.value      = warpSpeed;
    u.uWarpAmplitude.value  = warpAmplitude;
    u.uBlendAngle.value     = blendAngle;
    u.uBlendSoftness.value  = blendSoftness;
    u.uRotationAmount.value = rotationAmount;
    u.uNoiseScale.value     = noiseScale;
    u.uGrainAmount.value    = grainAmount;
    u.uGrainScale.value     = grainScale;
    u.uGrainAnimated.value  = grainAnimated ? 1.0 : 0.0;
    u.uContrast.value       = contrast;
    u.uGamma.value          = gamma;
    u.uSaturation.value     = saturation;
    u.uCenterOffset.value   = new Float32Array([centerX, centerY]);
    u.uZoom.value           = zoom;
    u.uColor1.value         = new Float32Array(hexToRgb(color1));
    u.uColor2.value         = new Float32Array(hexToRgb(color2));
    u.uColor3.value         = new Float32Array(hexToRgb(color3));
  }, [
    timeSpeed, colorBalance, warpStrength, warpFrequency, warpSpeed,
    warpAmplitude, blendAngle, blendSoftness, rotationAmount, noiseScale,
    grainAmount, grainScale, grainAnimated, contrast, gamma, saturation,
    centerX, centerY, zoom, color1, color2, color3
  ]);

  return <div ref={containerRef} className={`absolute inset-0 w-full h-full ${className}`} />;
};

/* ==========================================================================
   2. UNIFIED RESPONSIVE SECTION WRAPPER
   ========================================================================== */

export default function IntegratedCtaFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full bg-slate-50 border-t border-slate-200/80 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Mesh Container */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-90 mix-blend-multiply">
        <Grainient 
          timeSpeed={0.15}
          colorBalance={-0.05}
          warpStrength={2.2}
          warpFrequency={4.0}
          warpSpeed={1.5}
          warpAmplitude={40.0}
          blendAngle={35.0}
          blendSoftness={0.25}
          rotationAmount={60.0}
          noiseScale={1.8}
          grainAmount={0.05}
          grainScale={1.5}
          grainAnimated={true}
          color1="#E0F2FE" // Sky highlight
          color2="#DCFCE7" // Fresh Mint
          color3="#F3E8FF" // Soft Lavender
          zoom={1.0}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 z-1 pointer-events-none" />

      {/* --- RESPONSIVE INTERFACE LAYERS --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- CTA CONTAINER --- */}
        <div className="pt-20 sm:pt-28 pb-16 sm:pb-24 border-b border-slate-200/60">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/80 p-6 sm:p-12 lg:p-16 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-100/60 border border-blue-200/80 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-blue-700 w-fit shadow-sm">
                <FiShield className="w-3 h-3 animate-pulse text-blue-600" /> Direct Supply Route Node
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Ready to secure tier-one logistics rates?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl font-normal">
                Join the platform ledger today. Establish verified corridors, optimize spatial load metrics with regional peers, and unlock direct factory clearance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-shrink-0 w-full lg:w-auto">
              <button className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 group/btn">
                Initiate Portal Setup
                <FiArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/80 hover:bg-white text-slate-700 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-150 flex items-center justify-center gap-2">
                Contact Terminal Direct
              </button>
            </div>
          </div>
        </div>

        {/* --- FOOTER GRID --- */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-10 lg:gap-8">
          
          <div className="col-span-2 md:col-span-4 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono text-xs font-black shadow-sm">
                Z
              </div>
              <span className="text-sm font-black tracking-tight text-slate-900">ZEON SYSTEMS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-normal">
              Transdisciplinary shipping orchestration infrastructure optimizing international trade channels down to micro-retail capacity parameters.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="hover:text-slate-900 transition-colors"><FiTwitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-slate-900 transition-colors"><FiLinkedin className="w-4 h-4" /></a>
              <a href="#" className="hover:text-slate-900 transition-colors"><FiMail className="w-4 h-4" /></a>
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Freight Hubs</h4>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Apapa Routing (NG)</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Shenzhen Gateway (CN)</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Shared Capacity Pool</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors flex items-center gap-1">Custom Status <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span></a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Compliance</h4>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Escrow Handshakes</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Multi-Sig Audit</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Volumetric Verification</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Regulatory Ledger</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Organization</h4>
            <ul className="space-y-2 text-xs text-slate-500 font-medium">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Terminal APIs</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">White Zexon Corp</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">System Metrics</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Sub-Terminal</h4>
            <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-xl p-3 shadow-sm space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                <FiGlobe className="text-blue-500 animate-spin [animation-duration:12s]" /> Regional Node
              </div>
              <div className="text-xs font-black text-slate-800 tracking-tight">Port Harcourt, NG</div>
              <div className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 inline-block font-bold">
                LATENCY: 14ms
              </div>
            </div>
          </div>

        </div>

        {/* --- FOOTER BASE --- */}
        <div className="border-t border-slate-200/60 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
          <div>
            &copy; {currentYear} Zeon Systems. Protected under multi-sig deployment licenses.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Infrastructure</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terminal Usage Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors flex items-center gap-0.5">
              White Zexon Corp <FiArrowUpRight className="text-slate-300" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}