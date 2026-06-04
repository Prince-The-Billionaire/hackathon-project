"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const Story = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const leftProgress = useRef(0);
  const rightProgress = useRef(0);
  
  const leftSpeed = useRef(1);
  const rightSpeed = useRef(1);

  // Added dynamic titles to data structures
  const leftCards = [
    { id: 1, title: 'Bridge', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop' },
    { id: 2, title: 'Beach', img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=400&auto=format&fit=crop' },
    { id: 3, title: 'Ocean', img: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=400&auto=format&fit=crop' },
    { id: 4, title: 'Road', img: 'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?q=80&w=400&auto=format&fit=crop' },
    { id: 5, title: 'Forest', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop' },
    { id: 6, title: 'Valley', img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=400&auto=format&fit=crop' },
    { id: 7, title: 'Trees', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop' },
    { id: 8, title: 'Hills', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop' },
  ];

  const rightCards = [
    { id: 9, title: 'Coast', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop' },
    { id: 10, title: 'Meadow', img: 'https://images.unsplash.com/photo-1472214222541-d510753a8707?q=80&w=400&auto=format&fit=crop' },
    { id: 11, title: 'Space', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop' },
    { id: 12, title: 'Tech', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop' },
    { id: 13, title: 'Flora', img: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=400&auto=format&fit=crop' },
    { id: 14, title: 'Canyon', img: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=400&auto=format&fit=crop' },
    { id: 15, title: 'Stream', img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=400&auto=format&fit=crop' },
    { id: 16, title: 'Autumn', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400&auto=format&fit=crop' },
  ];

  useGSAP(() => {
    const cardElementsLeft = gsap.utils.toArray<HTMLElement>('.left-card');
    const cardElementsRight = gsap.utils.toArray<HTMLElement>('.right-card');

    const updateTick = () => {
      leftProgress.current += 0.0015 * leftSpeed.current;
      rightProgress.current -= 0.0015 * rightSpeed.current;

      // Render Left Side Loop
      cardElementsLeft.forEach((card, index) => {
        const total = cardElementsLeft.length;
        const baseNorm = index / total;
        let norm = (baseNorm + leftProgress.current) % 1;
        if (norm < 0) norm += 1;

        const shiftedNorm = norm - 0.5; 
        const posY = shiftedNorm * 115 * total; 
        const posX = Math.cos(shiftedNorm * Math.PI) * -55 + 40;
        const rotZ = shiftedNorm * -45;

        gsap.set(card, { yPercent: posY, x: posX, rotationZ: rotZ });
      });

      // Render Right Side Loop
      cardElementsRight.forEach((card, index) => {
        const total = cardElementsRight.length;
        const baseNorm = index / total;
        let norm = (baseNorm + rightProgress.current) % 1;
        if (norm < 0) norm += 1;

        const shiftedNorm = norm - 0.5;
        const posY = shiftedNorm * 115 * total;
        const posX = Math.cos(shiftedNorm * Math.PI) * 55 - 40;
        const rotZ = shiftedNorm * 45;

        gsap.set(card, { yPercent: posY, x: posX, rotationZ: rotZ });
      });
    };

    gsap.ticker.add(updateTick);
    return () => gsap.ticker.remove(updateTick);
  }, { scope: containerRef });

  const handleWheelSpeed = (side: 'left' | 'right', decelerate: boolean) => {
    const targetSpeed = decelerate ? 0.08 : 1;
    if (side === 'left') {
      gsap.to(leftSpeed, { current: targetSpeed, duration: 0.6, ease: 'power2.out' });
    } else {
      gsap.to(rightSpeed, { current: targetSpeed, duration: 0.6, ease: 'power2.out' });
    }
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>, isEnter: boolean) => {
    const card = e.currentTarget;
    const preview = card.querySelector<HTMLElement>('.preview-overlay');
    const playIcon = card.querySelector<HTMLElement>('.play-icon');

    if (isEnter) {
      gsap.to(card, {
        z: 80,
        scale: 1.12,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      if (preview) gsap.to(preview, { opacity: 1, duration: 0.25 });
      if (playIcon) gsap.to(playIcon, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
    } else {
      gsap.to(card, {
        z: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      if (preview) gsap.to(preview, { opacity: 0, duration: 0.25 });
      if (playIcon) gsap.to(playIcon, { scale: 0.5, opacity: 0, duration: 0.25, ease: 'power2.in' });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="bg-slate-50 relative flex flex-col min-h-screen w-full overflow-hidden perspective-distant"
    >
      <img 
        className="h-screen z-5 absolute inset-0 w-full object-cover pointer-events-none" 
        src="/storybg.webp" 
        alt="Buyer Persona" 
      />

      {/* INFINITE LEFT CORRIDOR EDGE STRIP */}
      <div 
        className="absolute top-0 left-0 w-36 h-full z-10 flex items-center justify-center pointer-events-none"
        onMouseEnter={() => handleWheelSpeed('left', true)}
        onMouseLeave={() => handleWheelSpeed('left', false)}
      >
        {leftCards.map((card) => (
          <div
            key={card.id}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
            className="left-card absolute w-24 sm:w-28 aspect-9/16 rounded-xl overflow-hidden shadow-2xl border border-white/20 cursor-pointer pointer-events-auto transform-3d"
          >
            <img src={card.img} alt={card.title} className="w-full h-full object-cover select-none pointer-events-none" />
            
            {/* Top Right Static Title */}
            <div className="absolute top-2 right-2 z-20 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md max-w-[80%] truncate shadow-md">
              <span className="text-[10px] text-white font-medium tracking-wide block truncate">{card.title}</span>
            </div>

            {/* Centered Preview Play overlay with Pop-up Icon */}
            <div className="preview-overlay absolute inset-0 z-30 bg-black/40 opacity-0 flex items-center justify-center pointer-events-none">
              <div className="play-icon opacity-0 transform-[scale(0.5)] bg-white/90 text-slate-900 rounded-full p-2.5 shadow-xl flex flex-col items-center justify-center">
                {/* SVG Play Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
                <span className="text-[7px] tracking-widest font-black uppercase mt-0.5">PLAY</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INFINITE RIGHT CORRIDOR EDGE STRIP */}
      <div 
        className="absolute top-0 right-0 w-36 h-full z-10 flex items-center justify-center pointer-events-none"
        onMouseEnter={() => handleWheelSpeed('right', true)}
        onMouseLeave={() => handleWheelSpeed('right', false)}
      >
        {rightCards.map((card) => (
          <div
            key={card.id}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
            className="right-card absolute w-24 sm:w-28 aspect-9/16 rounded-xl overflow-hidden shadow-2xl border border-white/20 cursor-pointer pointer-events-auto transform-3d"
          >
            <img src={card.img} alt={card.title} className="w-full h-full object-cover select-none pointer-events-none" />
            
            {/* Top Right Static Title */}
            <div className="absolute top-2 right-2 z-20 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md max-w-[80%] truncate shadow-md">
              <span className="text-[10px] text-white font-medium tracking-wide block truncate">{card.title}</span>
            </div>

            {/* Centered Preview Play overlay with Pop-up Icon */}
            <div className="preview-overlay absolute inset-0 z-30 bg-black/40 opacity-0 flex items-center justify-center pointer-events-none">
              <div className="play-icon opacity-0 transform-[scale(0.5)] bg-white/90 text-slate-900 rounded-full p-2.5 shadow-xl flex flex-col items-center justify-center">
                {/* SVG Play Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
                <span className="text-[7px] tracking-widest font-black uppercase mt-0.5">PLAY</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Story;