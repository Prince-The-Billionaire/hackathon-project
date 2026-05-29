import Hero from '@/components/Hero'
import Navbar from '@/components/Navbar'
import React from 'react'

const page = () => {
  return (
    <div className='min-h-screen w-screen flex flex-col items-center  gap-10 bg-slate-50 text-white'>
      <Navbar/>
      <Hero/>
    </div>
  )
}

export default page
