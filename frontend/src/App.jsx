import { useState } from 'react'
import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Navheader from './Components/Navheader'
import HeroImg from './assets/Hero.svg'
import FeaturesSection from './Components/FeaturesSection'


import { motion } from "framer-motion";
import { FaHeartbeat } from "react-icons/fa";
 
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App


function Home() {
  return (
    <div className='w-[100vw] h-[100vh]  bg-white overflow-x-hidden '>
      <Navheader />
      <Hero />
      <FeaturesSection />
      
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center px-6">
      <motion.img 
        className='w-[850px] h-[800px]'
        src={HeroImg} 
        alt=""
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />
      <div className="max-w-3xl">
        
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <FaHeartbeat className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Empowering Healthcare, Simplifying Management
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Transform the way you manage healthcare with our intuitive and efficient platform.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-6 flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <button className='bg-[#77B254] rounded-xl px-3 py-3 cursor-pointer text-xl text-white hover:scale-110 duration-150'>
            Get Started
          </button>
        </motion.div>
      </div>
    </section>
  );
}
