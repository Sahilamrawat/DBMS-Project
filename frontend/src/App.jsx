import { useState } from 'react'
import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Navheader from './Components/Navheader'
import HeroImg from './assets/Hero.svg'
import FeaturesSection from './Components/FeaturesSection'
import Footer from './Components/Footer'

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
    <div className="w-full min-h-screen">
      <Navheader />
      <Hero />
      <div id="features">
        <FeaturesSection />
      </div>
      <Footer />
    </div>
  )
}

export function Hero() {
  const [showSearch, setShowSearch] = useState(false);

  const scrollToFeatures = () => {
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-green-50 to-white">
      {showSearch && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowSearch(false)}
        >
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-[70%] max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for healthcare services..."
                className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-[#77B254] focus:outline-none shadow-lg bg-white/90 backdrop-blur-md"
                autoFocus
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#77B254] text-white p-2 rounded-full hover:bg-[#69a048] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-20">
          {/* Left Content */}
          <div className="flex-1 text-left">
            <motion.div 
              initial={{ opacity: 0, y: -50 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaHeartbeat className="text-red-500 text-4xl" />
                <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-1 rounded-full">Healthcare Solutions</span>
              </div>
              
              <h1 className="text-6xl font-bold text-gray-800 leading-tight mb-6">
                Empowering <span className="text-[#77B254]">Healthcare</span>, Simplifying Management
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transform the way you manage healthcare with our intuitive and efficient platform. Experience seamless integration and enhanced patient care.
              </p>

              <div className="flex gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#77B254]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#77B254]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Secure Platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#77B254]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Easy Integration</span>
                </div>
              </div>

              <motion.div 
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <button 
                  onClick={() => setShowSearch(true)}
                  className='bg-[#77B254] rounded-xl px-6 py-4 cursor-pointer text-xl text-white hover:scale-105 duration-150 flex items-center gap-2 shadow-lg'
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Services
                </button>
                <button 
                  onClick={scrollToFeatures}
                  className='border-2 border-[#77B254] rounded-xl px-6 py-4 cursor-pointer text-xl text-[#77B254] hover:bg-[#77B254] hover:text-white duration-150 flex items-center gap-2'
                >
                  Get Started
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.img 
                className='w-full max-w-2xl mx-auto'
                src={HeroImg} 
                alt="Healthcare Management"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">Join 2000+ healthcare professionals</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Add these styles to your CSS
const styles = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
`;
