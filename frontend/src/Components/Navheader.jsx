import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../index.css';
import { useNavigate } from 'react-router-dom';

function Navheader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

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

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg py-2' 
          : 'bg-white/0 py-4'
      }`}
    >
      <div className={`absolute inset-0 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm' : ''
      }`} />

      <nav className='max-w-7xl mx-auto flex items-center justify-between px-6 relative z-10'>
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex items-center'
        >
          <a href='/' className='flex items-center space-x-2'>
            <span className={`text-3xl font-bold transition-all duration-300 ${
              isScrolled 
                ? 'bg-gradient-to-r from-[#77B254] to-[#69a048] bg-clip-text text-transparent'
                : 'text-gray-800'
            }`}>
              HealthCare
            </span>
          </a>         
        </motion.div>

        {/* Navigation Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block"
        >
          <ul className='flex items-center space-x-8'>
            {navItems.map((item, index) => (
              <motion.li 
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className='relative group'
              >
                <button 
                  onClick={() => handleNavigation(item.path)}
                  className={`font-medium transition-all duration-300 py-2 px-3 rounded-lg
                    ${isScrolled 
                      ? 'text-gray-700 hover:text-[#77B254] hover:bg-gray-50' 
                      : 'text-gray-800 hover:text-[#77B254] hover:bg-white/10'
                    }`}
                >
                  {item.name}
                </button>
                <span className={`absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300
                  ${isScrolled ? 'bg-[#77B254]' : 'bg-white'}`} />
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Auth Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='flex items-center space-x-4'
        >
          <button className={`px-6 py-2 font-medium transition-all duration-300 rounded-lg
            ${isScrolled 
              ? 'text-gray-700 hover:text-[#77B254] hover:bg-gray-50' 
              : 'text-gray-800 hover:text-[#77B254] hover:bg-white/10'
            }`}>
            Sign In
          </button>
          <button className={`px-6 py-2 font-medium transition-all duration-300 rounded-lg
            ${isScrolled 
              ? 'bg-gradient-to-r from-[#77B254] to-[#69a048] text-white hover:from-[#69a048] hover:to-[#77B254]' 
              : 'bg-white text-gray-800 hover:bg-gray-100'
            } transform hover:scale-105 shadow-md hover:shadow-lg active:scale-95`}>
            Sign Up
          </button>
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className={`p-2 rounded-lg transition-colors duration-300 ${
            isScrolled ? 'hover:bg-gray-50' : 'hover:bg-white/10'
          }`}>
            <svg className={`w-6 h-6 ${isScrolled ? 'text-gray-700' : 'text-gray-800'}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </motion.div>
  );
}

export default Navheader;