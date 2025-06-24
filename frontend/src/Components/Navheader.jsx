import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { FaUserCircle } from 'react-icons/fa';

function Navheader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check if user is logged in and get user type
    const token = localStorage.getItem(ACCESS_TOKEN);
    const storedUserType = localStorage.getItem('user_type');
    setIsLoggedIn(!!token);
    setUserType(storedUserType);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add a listener for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const storedUserType = localStorage.getItem('user_type');
      setIsLoggedIn(!!token);
      setUserType(storedUserType);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem('user_type');
    setIsLoggedIn(false);
    setUserType(null);
    navigate('/login');
  };

  const handleProfileClick = () => {
    if (userType === 'DOCTOR') {
      navigate('/doctor-profile');
    } else if (userType === 'PATIENT') {
      navigate('/profile');
    } else {
      // Default to regular profile if user type is not set
      navigate('/profile');
    }
    setShowProfileMenu(false);
  };

  const getNavItems = () => {
    const baseItems = [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' }
    ];

    

    return baseItems;
  };

  const navItems = getNavItems();

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
              MediTrack
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

        {/* Auth Buttons or Profile */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='flex items-center space-x-4'
        >
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isScrolled 
                    ? 'hover:bg-gray-50' 
                    : 'hover:bg-white/10'
                }`}
              >
                <FaUserCircle className={`w-8 h-8 ${
                  isScrolled ? 'text-gray-700' : 'text-gray-800'
                }`} />
              </button>
              
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className={`px-6 py-2 font-medium transition-all duration-300 rounded-lg
                  ${isScrolled 
                    ? 'text-gray-700 hover:text-[#77B254] hover:bg-gray-50' 
                    : 'text-gray-800 hover:text-[#77B254] hover:bg-white/10'
                  }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className={`px-6 py-2 font-medium transition-all duration-300 rounded-lg
                  ${isScrolled 
                    ? 'bg-gradient-to-r from-[#77B254] to-[#69a048] text-white hover:from-[#69a048] hover:to-[#77B254]' 
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                  } transform hover:scale-105 shadow-md hover:shadow-lg active:scale-95`}
              >
                Sign Up
              </button>
            </>
          )}
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