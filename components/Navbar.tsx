'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/dist/client/link';
import { LogIn, User, Menu } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const linkContainerRef = useRef<HTMLDivElement>(null);

  // Monitor scroll positioning to switch state targets
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Scroll Animation Handler
  useGSAP(() => {
    if (isScrolled) {
      // 1. Morph Outer Container to become the unified Plain Glassmorphic frame
      gsap.to(containerRef.current, {
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Pure white glass
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(255, 255, 255, 0.25)', 
        borderRadius: '1.5rem', 
        paddingTop: '0.6rem',
        paddingBottom: '0.6rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        duration: 0.45,
        ease: 'power2.out',
      });

      // 2. Clear inner links container frame so it blends seamlessly
      gsap.to(linkContainerRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderColor: 'rgba(255, 255, 255, 0)',
        backdropFilter: 'blur(0px)',
        padding: '0rem',
        duration: 0.45,
        ease: 'power2.out',
      });
    } else {
      // Revert Layout back to transparent outer wrapper
      gsap.to(containerRef.current, {
        width: '90%',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(0px)',
        borderColor: 'transparent',
        paddingTop: '0rem',
        paddingBottom: '0rem',
        paddingLeft: '0rem',
        paddingRight: '0rem',
        boxShadow: 'none',
        duration: 0.45,
        ease: 'power2.inOut',
      });

      // Revert Links container to plain glass frame
      gsap.to(linkContainerRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        paddingTop: '0.75rem',
        paddingBottom: '0.75rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        duration: 0.45,
        ease: 'power2.inOut',
      });
    }
  }, { dependencies: [isScrolled], scope: containerRef });

  // Generic Micro-interaction Handlers using GSAP
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, scaleValue = 1.05) => {
    gsap.to(e.currentTarget, {
      scale: scaleValue,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const router = useRouter()

  return (
    <nav
      ref={containerRef}
      className="text-black flex flex-row items-center z-50 fixed top-5 left-1/2 -translate-x-1/2 justify-between border border-transparent"
    >
      {/* Logo Section */}
      <div 
        className="flex-shrink-0 cursor-pointer"
        onMouseEnter={(e) => handleMouseEnter(e, 1.04)}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={"/zeon-logo.jpg"}
          width={70}
          height={70}
          loading="eager"
          className="rounded-full shadow-sm"
          alt="logo"
        />
      </div>

      {/* Nav Links Container */}
      <div
        ref={linkContainerRef}
        className="hidden md:flex flex-row items-center rounded-full gap-12 text-sm font-semibold border border-transparent bg-transparent"
      >
        <Link href={'/about'} className="hover:text-blue-600 transition-colors duration-200">
          About
        </Link>
        <Link href={'/services'} className="hover:text-blue-600 transition-colors duration-200">
          Services
        </Link>
        <Link href={'/contact'} className="hover:text-blue-600 transition-colors duration-200">
          Contact
        </Link>
      </div>

      {/* Actions Section */}
      <div className="flex flex-row items-center gap-2 sm:gap-4">
        {/* User Profile Trigger */}
        <div 
          className="p-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
          onMouseEnter={(e) => handleMouseEnter(e, 1.15)}
          onMouseLeave={handleMouseLeave}
        >
          <User className="w-5 h-5" />
        </div>

        {/* Sign Up Action */}
        <Link
          className="hidden md:block rounded-full px-5 py-2 text-center cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-semibold shadow-sm"
          onMouseEnter={(e) => handleMouseEnter(e, 1.05)}
          onMouseLeave={handleMouseLeave}
          href="/sign-up"
        >
          Sign Up
        </Link>

        {/* Log In Action */}
        <Link
          className="rounded-full px-4 sm:px-5 flex flex-row gap-2 py-2 text-center cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold items-center shadow-sm"
          onMouseEnter={(e) => handleMouseEnter(e, 1.05)}
          onMouseLeave={handleMouseLeave}
          href="/sign-in"
        >
          <p className="hidden sm:inline">Log In</p>
          <LogIn className="w-4 h-4" />
        </Link>

        {/* Hamburger Trigger */}
        <button 
          className="md:hidden block p-2 text-black hover:text-blue-600 transition-colors duration-200"
          onMouseEnter={(e) => handleMouseEnter(e, 1.1)}
          onMouseLeave={handleMouseLeave}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;