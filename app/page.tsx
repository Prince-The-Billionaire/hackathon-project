import FeaturesSection from '@/components/Features'
import IntegratedCtaFooter from '@/components/Footer'
import Hero from '@/components/Hero'
import Navbar from '@/components/Navbar'
import ProblemSection from '@/components/ProblemSection'
import Story from '@/components/Story'
import React from 'react'

const page = () => {
  return (
    <div className='min-h-screen w-screen font-sans flex flex-col items-center  gap-10 bg-slate-50 text-white'>
      <Navbar/>
      <Hero/>
      <ProblemSection/>
      <Story/>
      <FeaturesSection/>
      <IntegratedCtaFooter/>
    </div>
  )
}

export default page
