'use client'

import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { FaGlobeAfrica } from 'react-icons/fa'
import { GiCargoShip } from 'react-icons/gi'
import { PiShippingContainerFill } from 'react-icons/pi'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const ProblemSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<HTMLImageElement>(null);
  const planesRef = useRef<HTMLImageElement>(null);
  const lineRef = useRef<HTMLImageElement>(null);
  const parachuteRef = useRef<HTMLImageElement>(null);
  const longLineRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Master sequence timeline entirely bound to ScrollTrigger with scrub enabled
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',    // Animation starts when the top of the section enters 80% from viewport top
          end: 'bottom 60%',   // Animation finishes completely by the time it reaches here
          scrub: 1,            // Smoothly links animation progress to scroll speed (1 second catch-up lag)
        }
      });

      // 1. First, the path.svg line grows from starting point to end point
      tl.fromTo(pathRef.current,
        { scaleX: 0, transformOrigin: 'left center', opacity: 0 },
        { scaleX: 1, opacity: 1, ease: 'none' }
      );

      // 2. Then, the long line grows at the bottom
      tl.fromTo(longLineRef.current,
        { scaleX: 0, transformOrigin: 'left center', opacity: 0 },
        { scaleX: 1, opacity: 0.6, ease: 'none' },
        '-=0.2'
      );

      // 3. After the long line, the parachute track (line.svg) grows down
      tl.fromTo(lineRef.current,
        { scaleY: 0, transformOrigin: 'top center', opacity: 0 },
        { scaleY: 1, opacity: 1, ease: 'none' }
      );

      // 4. Then the planes appear and animate on the downsized, compact path
      tl.fromTo(planesRef.current, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.1 });
      tl.to(planesRef.current, {
        motionPath: {
          // Shrunk/compacted path coordinates to keep movement localized over your smaller path
          path: [
            {x: -20, y: 180}, 
            {x: 30, y: 130}, 
            {x: 80, y: 70}, 
            {x: 150, y: 110}, 
            {x: 210, y: 80}, 
            {x: 250, y: -10}
          ],
          autoRotate: true
        },
        ease: 'none'
      }, '-=0.1');

      // 5. Then the parachute appears and translates down slowly on a smaller vertical track
      tl.fromTo(parachuteRef.current, { opacity: 0 }, { opacity: 1, duration: 0.1 });
      tl.to(parachuteRef.current, {
        motionPath: {
          // Shrunk vertical travel coordinates so it drops tightly within your bounds
          path: [
            {x: 0, y: -20},
            {x: 0, y: 60},
            {x: 0, y: 140},
            {x: 0, y: 220}
          ],
          autoRotate: false // keeps parachute upright
        },
        ease: 'none'
      }, '-=0.1');

      // 6. Parachute continuous side-to-side sway
      // This remains independent of scroll position so it loops naturally even if the user stops scrolling
      gsap.fromTo(parachuteRef.current,
        { rotation: -12, transformOrigin: '50% 15%' },
        { 
          rotation: 12, 
          repeat: -1, 
          yoyo: true, 
          duration: 1.1, 
          ease: 'sine.inOut' 
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className='bg-slate-50 px-6 md:px-16 lg:px-36 py-12 flex flex-col min-h-screen overflow-hidden'>
        
        <section className='flex flex-col lg:flex-row justify-center items-center lg:items-start gap-12 lg:gap-0 w-full my-auto'>
          
          {/* Copy Deck Area */}
          <div className='flex flex-col gap-6 w-full lg:w-1/2'>
              <h2 className='text-5xl md:text-6xl lg:text-7xl text-left font-bold italic text-gray-800 mb-4'>NO MORE MIDDLE MEN</h2>
              <p className='text-xl md:text-2xl text-left text-gray-500 mb-8 max-w-lg'>Say goodbye to the hassle of dealing with multiple intermediaries in your export process. With our platform, you can connect directly with buyers and sellers, streamlining your transactions and saving you time and money.</p>
              
              <section className='text-left text-gray-700 text-lg flex flex-col gap-4'>
                  <div className='flex flex-row gap-4 items-center'>
                      <GiCargoShip className='text-white rounded-full p-2 size-10 bg-black flex-shrink-0' />
                      <p>Shared Cargo System</p>
                  </div>

                  <div className='flex flex-row gap-4 items-center'>
                      <PiShippingContainerFill className='text-white rounded-full p-2 size-10 bg-black flex-shrink-0' />
                      <p>Export and Import with Real-Time Tracking</p>
                  </div>

                  <div className='flex flex-row gap-4 items-center'>
                      <FaGlobeAfrica className='text-white rounded-full p-2 size-10 bg-black flex-shrink-0' />
                      <p>Buy/Sell globally with less than #500,000</p>
                  </div>
              </section>
          </div>

          {/* Right Layout Canvas (Original layout styling entirely preserved) */}
          <div className='flex flex-row relative -gap-4 w-full lg:w-1/2 max-w-[500px] lg:max-w-none justify-center lg:justify-start'>
            
            <img 
              ref={pathRef}
              src={'/path.svg'} 
              className='absolute left-0 bottom-10 z-20 pointer-events-none'
              alt=""
            />
            
            <img 
              ref={planesRef}
              src={'/planes.png'} 
              className="absolute z-30 top-12 -left-9 pointer-events-none opacity-0"
              alt=""
            />
            
            <img 
              src={'/masked.png'}
              className='w-160 h-auto z-10'
              alt=""
            />
            
            <img 
              ref={lineRef}
              src={'/line.svg'} 
              className='absolute -right-24 top-4 w-full object-contain h-48 object-top z-20 pointer-events-none'
              alt=""
            />
            
            <img 
              ref={parachuteRef}
              src={'/drop_shipping.png'} 
              className='absolute -right-24 top-0 w-full object-contain h-10 object-top z-40 pointer-events-none opacity-0'
              alt=""
            />
          </div>
        
        </section>

        {/* Footer Alignment Row */}
        <aside className='flex flex-col sm:flex-row mt-10 items-center gap-8 w-full'>
          <div className='w-full overflow-hidden flex items-center'>
            <img 
              ref={longLineRef}
              src={'longline.svg'} 
              className='w-full opacity-60'
              alt=""
            />
          </div>
          <Link
            className="rounded-2xl px-4 sm:px-5 flex flex-row gap-2 py-2 text-center cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold items-center shadow-sm whitespace-nowrap self-stretch sm:self-auto justify-center"
            href="/sign-in"
          >
            <p className="text-nowrap text-xl">Start Exporting</p>
          </Link>
        </aside>
    </div>
  )
}

export default ProblemSection;