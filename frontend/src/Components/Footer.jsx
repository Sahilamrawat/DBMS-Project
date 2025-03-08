import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white pt-16 pb-8 border-t-4 border-blue-500/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">HealthCare Plus</h3>
            <p className="text-gray-300 leading-relaxed hover:text-white transition-colors duration-300">
              Providing quality healthcare services and management solutions for a healthier tomorrow.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="transform group-hover:translate-x-2 transition-transform duration-300">Home</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="transform group-hover:translate-x-2 transition-transform duration-300">Services</span>
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="transform group-hover:translate-x-2 transition-transform duration-300">Appointments</span>
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span className="transform group-hover:translate-x-2 transition-transform duration-300">Our Doctors</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Contact Us</h3>
            <ul className="text-gray-300 space-y-3">
              <li className="flex items-center hover:text-white transition-colors duration-300">
                <span className="hover:translate-x-2 transition-transform duration-300">123 Healthcare Avenue</span>
              </li>
              <li className="flex items-center hover:text-white transition-colors duration-300">
                <span className="hover:translate-x-2 transition-transform duration-300">New York, NY 10001</span>
              </li>
              <li className="flex items-center hover:text-white transition-colors duration-300">
                <span className="hover:translate-x-2 transition-transform duration-300">Phone: (555) 123-4567</span>
              </li>
              <li className="flex items-center hover:text-white transition-colors duration-300">
                <span className="hover:translate-x-2 transition-transform duration-300">Email: info@healthcareplus.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Follow Us</h3>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-blue-400 transform hover:scale-125 transition-all duration-300">
                <FaFacebook size={28} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transform hover:scale-125 transition-all duration-300">
                <FaTwitter size={28} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transform hover:scale-125 transition-all duration-300">
                <FaLinkedin size={28} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transform hover:scale-125 transition-all duration-300">
                <FaInstagram size={28} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 hover:text-white transition-colors duration-300">
            &copy; {new Date().getFullYear()} HealthCare Plus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
