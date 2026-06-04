'use client';

import React, { useRef } from 'react';
import Link from 'next/link'; // Added Next.js Link
import { Fingerprint, LogIn, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard icon
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useAuth } from '@clerk/nextjs'; // Added Clerk auth hook

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLImageElement>(null);
  const shipRef = useRef<HTMLImageElement>(null);
  
  const { isSignedIn } = useAuth(); // Monitor auth state

  // Helper component to wrap every single character in an individual gradient block
  const GradientText = ({ text }: { text: string }) => {
    return (
      <>
        {text.split('').map((char, index) => {
          if (char === ' ') return <span key={index}>&nbsp;</span>;
          return (
            <span
              key={index}
              className="inline-block px-[0.05em] mx-[-0.05em] bg-gradient-to-t from-black via-slate-600 to-blue-600 text-transparent bg-clip-text"
            >
              {char}
            </span>
          );
        })}
      </>
    );
  };

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Plane shrinks and moves inwards
    tl.to(planeRef.current, {
      scale: 0.6,
      y: -60,
      opacity: 0.85,
    }, 0);

    // Ship scales up slightly to look like it's sailing out of the viewport screen
    tl.to(shipRef.current, {
      scale: 1.15,
    }, 0);

  }, { scope: containerRef });

  const handleButtonHover = (e: React.MouseEvent<HTMLAnchorElement>, enter: boolean) => {
    gsap.to(e.currentTarget, {
      scale: enter ? 1.06 : 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="relative bg-blue-100 w-screen h-screen overflow-hidden flex flex-col justify-between pt-24 md:pt-0"
    >
      {/* Plane Element */}
      <div className="absolute top-5 md:-top-6 left-0 w-full flex justify-center z-10 pointer-events-none">
        <img
          ref={planeRef}
          src="/plane_t.webp"
          className="w-[75%] max-w-[36rem] h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)]"
          alt="plane"
        />
      </div>

      {/* Main Responsive Grid Layout Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex-grow flex flex-col justify-center md:block mt-8 md:mt-36">
        
        <div className="flex flex-col md:flex-row md:justify-center md:-ml-48 items-start md:items-center gap-6 md:gap-0">
          
          {/* Main Title Headings with Letter-by-Letter Gradient Mapping */}
          <h1 className="text-5xl sm:text-7xl md:text-[8.5rem] z-5 font-black italic tracking-tight leading-[0.85] uppercase select-none w-full md:w-auto">
            <GradientText text="EXPORT" />
            <br />
            <span className="pl-8 sm:pl-12 md:ml-16">
              <GradientText text="& IMPORT" />
            </span>
          </h1>

          {/* Subcopy Context Frame */}
          <div className="flex flex-col self-end md:self-auto md:mt-36 md:ml-24 max-w-sm">
            <p className="text-black text-2xl sm:text-3xl font-bold italic tracking-tight leading-tight">
              @ Your <br />
              <span className="pl-6 md:ml-12 flex flex-row items-center gap-3 mt-1">
                Fingertips 
                <Fingerprint className="text-blue-500 rounded-full p-2.5 shadow-md bg-white size-12 stroke-[1.5]" />
              </span>
            </p>
            
            {/* Desktop Navigation Link Actions */}
            <div className="hidden md:flex flex-row ml-12 mt-8 gap-4">
              {isSignedIn ? (
                <Link 
                  href="/dashboard"
                  onMouseEnter={(e) => handleButtonHover(e, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false)}
                  className="rounded-2xl px-5 py-2.5 flex flex-row items-center gap-2 text-center cursor-pointer text-white font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors duration-200 text-sm"
                >
                  <span>Go to Dashboard</span>
                  <LayoutDashboard className="size-4" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/sign-up"
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    className="rounded-2xl px-5 py-2.5 text-center text-black font-semibold cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition-colors duration-200 text-sm"
                  >
                    Sign Up
                  </Link>

                  <Link 
                    href="/sign-in"
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    className="rounded-2xl px-5 py-2.5 flex flex-row items-center gap-2 text-center cursor-pointer text-white font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors duration-200 text-sm"
                  >
                    <span>Log In</span>
                    <LogIn className="size-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Link Actions */}
      <div className="md:hidden flex flex-row w-full justify-center gap-4 px-6 pb-8 relative z-30 mt-auto">
        {isSignedIn ? (
          <Link 
            href="/dashboard"
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
            className="flex-1 rounded-2xl py-3 flex flex-row justify-center items-center gap-2 text-center text-white font-bold bg-blue-600 shadow-md text-base active:bg-blue-700"
          >
            <span>Go to Dashboard</span>
            <LayoutDashboard className="size-5" />
          </Link>
        ) : (
          <>
            <Link 
              href="/sign-up"
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonHover(e, false)}
              className="flex-1 rounded-2xl py-3 text-center text-black font-bold border border-gray-300 bg-white shadow-md text-base active:bg-gray-100 flex items-center justify-center"
            >
              Sign Up
            </Link>

            <Link 
              href="/sign-in"
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonHover(e, false)}
              className="flex-1 rounded-2xl py-3 flex flex-row justify-center items-center gap-2 text-center text-white font-bold bg-blue-600 shadow-md text-base active:bg-blue-700"
            >
              <span>Log In</span>
              <LogIn className="size-5" />
            </Link>
          </>
        )}
      </div>

      {/* Background Graphics */}
      <img
        src="cloud.webp"
        className="absolute top-0 right-2 w-90 brightness-100 h-auto object-cover object-top opacity-70 pointer-events-none select-none z-0"
        alt="cloud background"
      />
      <img
        src="cloud.webp"
        className="absolute top-40 z-40 left-2 w-90 brightness-1000 white h-auto object-cover object-top opacity-70 pointer-events-none select-none"
        alt="cloud background"
      />

      {/* Background/Base Image Container: Fixed to screen bottom */}
      <img
        ref={shipRef}
        src="/shipwater.webp"
        className="absolute bottom-0 left-0 w-full h-[35vh] sm:h-[40vh] md:h-[45vh] object-cover object-top origin-bottom z-20 pointer-events-none select-none"
        alt="cargo ship horizon"
      />
    </div>
  );
};

export default Hero;