import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-scroll';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaUserMd, FaHospital, FaNotesMedical, 
         FaFileMedical, FaHeartbeat, FaPills, FaAmbulance, FaArrowUp, FaSearch, FaFlask, FaBrain, FaSyringe, FaAppleAlt, FaPrescriptionBottleAlt, FaShieldAlt, FaStar, FaUserCircle } from 'react-icons/fa';
import { BsArrowRight } from 'react-icons/bs';
import Navheader from '../Components/Navheader';
import Footer from '../Components/Footer';

const FeaturesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
  };

  const features = [
    {
      id: 'appointments',
      icon: <FaCalendarCheck className="text-4xl" />,
      title: "Online Appointment Booking",
      description: "Schedule appointments with your preferred doctors at your convenience.",
      action: "Book Appointment",
      onClick: () => navigate('/appointment')
    },
    {
      id: 'doctors',
      icon: <FaUserMd className="text-4xl" />,
      title: "Find a Doctor",
      description: "Search and connect with specialized healthcare professionals.",
      action: "Search Doctors",
      onClick:()=>navigate('/doctors')
    },
    {
      id: 'consultations',
      icon: <FaHospital className="text-4xl" />,
      title: "Virtual Consultations",
      description: "Connect with doctors remotely through secure video consultations.",
      action: "Start Consultation",
      onClick:()=>navigate('/consultations')
    },
    {
      id: 'records',
      icon: <FaNotesMedical className="text-4xl" />,
      title: "Medical Records",
      description: "Access and manage your medical history and test results securely.",
      action: "View Records",
    },
    {
      id: 'prescriptions',
      icon: <FaFileMedical className="text-4xl" />,
      title: "Prescription Management",
      description: "Get and manage your prescriptions digitally with easy refill options.",
      action: "Manage Prescriptions",
    },
    {
      id: 'monitoring',
      icon: <FaHeartbeat className="text-4xl" />,
      title: "Health Monitoring",
      description: "Track your vital signs and health metrics over time.",
      action: "Monitor Health",
    },
    {
      id: 'medications',
      icon: <FaPills className="text-4xl" />,
      title: "Medication Reminders",
      description: "Set up personalized reminders for your medications.",
      action: "Set Reminders",
    },
    {
      id: 'emergency',
      icon: <FaAmbulance className="text-4xl" />,
      title: "Emergency Services",
      description: "Quick access to emergency services and nearby facilities.",
      action: "Emergency Help",
    }
  ];

  const additionalServices = [
    {
      id: 'lab-tests',
      icon: <FaFlask className="text-4xl" />,
      title: "Laboratory Tests",
      description: "Comprehensive range of diagnostic tests with quick and accurate results.",
      action: "Book Test"
    },
    {
      id: 'mental-health',
      icon: <FaBrain className="text-4xl" />,
      title: "Mental Health",
      description: "Professional mental health services and counseling support.",
      action: "Consult Now"
    },
    {
      id: 'vaccination',
      icon: <FaSyringe className="text-4xl" />,
      title: "Vaccination Services",
      description: "Stay protected with our complete vaccination programs.",
      action: "Schedule Vaccine"
    },
    {
      id: 'nutrition',
      icon: <FaAppleAlt className="text-4xl" />,
      title: "Nutrition Consulting",
      description: "Personalized nutrition plans and dietary consultations.",
      action: "Get Advice"
    },
    {
      id: 'pharmacy',
      icon: <FaPrescriptionBottleAlt className="text-4xl" />,
      title: "Online Pharmacy",
      description: "Order medications online with doorstep delivery.",
      action: "Order Now"
    },
    {
      id: 'insurance',
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Health Insurance",
      description: "Navigate healthcare insurance options with expert guidance.",
      action: "Learn More"
    }
  ];

  return (
    <>
    <Navheader/>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative min-h-[85vh] bg-gradient-to-br overflow-hidden">
        {/* Decorative Elements */}
        
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Primary Blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-green-100/80 to-green-200/60 
                            rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-100/80 to-green-100/60 
                            rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-tr from-yellow-100/80 to-green-100/60 
                            rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            {/* Secondary Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-white/30 to-green-100/20 
                            rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-green-200/30 to-white/20 
                            rounded-full blur-3xl animate-float animation-delay-2000"></div>

            {/* Additional Subtle Elements */}
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-100/40 to-transparent 
                            rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 animate-float animation-delay-4000"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-[#77B254]/10 to-transparent 
                            rounded-full blur-3xl animate-float animation-delay-6000"></div>

            {/* Dot Pattern Overlay */}
            <div className="absolute inset-0 opacity-10"
                 style={{
                   backgroundImage: 'radial-gradient(circle at 1px 1px, #77B254 1px, transparent 0)',
                   backgroundSize: '40px 40px'
                 }} />
          </div>
        </div>

        {/* Content Container */}
        <div className="relative container mx-auto px-4 pt-32 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white mb-12"
            >
              <h1 className="text-5xl text-gray-800 md:text-6xl font-bold mb-6 leading-tight">
                Find Your Healthcare 
                <span className="text-[#77B254]"> Services</span>
              </h1>
              <p className="text-xl text-gray-800 mb-12 leading-relaxed max-w-2xl mx-auto">
                Search through our comprehensive range of healthcare services designed for your well-being
              </p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative flex items-center ">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for healthcare services..."
                      className="w-full px-6 py-4 pr-12 text-gray-700 bg-white/95 
                               backdrop-blur-md rounded-full shadow-xl
                               focus:outline-none 
                               text-lg placeholder-gray-400 border-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-4 p-2 text-gray-600 hover:text-[#77B254]
                               transition-colors duration-300"
                    >
                      <FaSearch className="text-xl" />
                    </button>
                  </div>
                  
                  {/* Popular Searches */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2 ">
                    {['Appointments', 'Doctors', 'Emergency', 'Lab Tests'].map((term, index) => (
                      <motion.button
                        key={term}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        onClick={() => setSearchQuery(term)}
                        className="px-4 py-1 bg-[#77B254] hover:bg-white/30 hover:text-[#77B254]
                                 rounded-full text-sm text-white backdrop-blur-sm
                                 transition-colors duration-300"
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </form>
              </motion.div>

              {/* Stats Section */}
              <div className="grid grid-cols-3 gap-8 mt-16">
                {[
                  { number: "10K+", label: "Active Users" },
                  { number: "500+", label: "Doctors" },
                  { number: "24/7", label: "Support" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center text-gray-800"
                  >
                    <div className="text-3xl font-bold mb-1">{stat.number}</div>
                    <div className="text-gray-800 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave with softer color */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 fill-current text-[#77B254]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
      </div>

      {/* Features Grid Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Our Healthcare Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive healthcare solutions designed to provide you with the best medical care experience
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-1 hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(119, 178, 84, 0.1), rgba(119, 178, 84, 0.05))'
                }}
              >
                <div className="relative bg-white rounded-2xl p-8 h-full">
                  {/* Top Decorative Element */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#77B254]/10 to-transparent rounded-tr-2xl" />

                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#77B254] to-green-600 
                                  rounded-2xl flex items-center justify-center text-white
                                  transform group-hover:rotate-6 transition-transform duration-300
                                  shadow-lg">
                      {feature.icon}
                    </div>
                    <div className="absolute -inset-2 bg-[#77B254]/10 rounded-2xl blur-xl 
                                  opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-[#77B254] 
                                 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {feature.description}
                    </p>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <button 
                        onClick={() => navigate(feature.link || `/${feature.id}`)}
                        className="relative inline-flex items-center justify-center w-full
                                 px-6 py-3 text-base font-medium rounded-xl
                                 text-[#77B254] hover:text-white
                                 transition-all duration-300 ease-in-out
                                 bg-gradient-to-r from-[#77B254]/10 to-green-600/10
                                 hover:from-[#77B254] hover:to-green-600
                                 group overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center">
                          {feature.action}
                          <svg 
                            className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M13 7l5 5m0 0l-5 5m5-5H6" 
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Decorative Element */}
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#77B254]/10 to-transparent rounded-bl-2xl" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Services Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button 
              onClick={() => setShowAllServices(!showAllServices)}
              className="inline-flex items-center px-8 py-3 rounded-full
                         text-[#77B254] hover:text-white font-medium
                         bg-[#77B254]/10 hover:bg-[#77B254]
                         transition-all duration-300 group"
            >
              {showAllServices ? 'Show Less' : 'View All Services'}
              <svg 
                className={`ml-2 w-5 h-5 transition-transform duration-300 
                           ${showAllServices ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </button>
          </motion.div>

          {/* Additional Services */}
          <AnimatePresence>
            {showAllServices && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {additionalServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-white rounded-2xl p-1 hover:scale-105 transition-all duration-300"
                      style={{
                        background: 'linear-gradient(to bottom right, rgba(119, 178, 84, 0.1), rgba(119, 178, 84, 0.05))'
                      }}
                    >
                      <div className="relative bg-white rounded-2xl p-8 h-full">
                        {/* Top Decorative Element */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#77B254]/10 to-transparent rounded-tr-2xl" />

                        {/* Icon Container */}
                        <div className="relative mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#77B254] to-green-600 
                                        rounded-2xl flex items-center justify-center text-white
                                        transform group-hover:rotate-6 transition-transform duration-300
                                        shadow-lg">
                            {service.icon}
                          </div>
                          <div className="absolute -inset-2 bg-[#77B254]/10 rounded-2xl blur-xl 
                                        opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-[#77B254] 
                                       transition-colors duration-300">
                            {service.title}
                          </h3>
                          <p className="text-gray-600 mb-6 line-clamp-3">
                            {service.description}
                          </p>

                          {/* Action Button */}
                          <div className="mt-auto">
                            <button 
                              onClick={() => navigate(service.link || `/${service.id}`)}
                              className="relative inline-flex items-center justify-center w-full
                                       px-6 py-3 text-base font-medium rounded-xl
                                       text-[#77B254] hover:text-white
                                       transition-all duration-300 ease-in-out
                                       bg-gradient-to-r from-[#77B254]/10 to-green-600/10
                                       hover:from-[#77B254] hover:to-green-600
                                       group overflow-hidden"
                            >
                              <span className="relative z-10 flex items-center">
                                {service.action}
                                <svg 
                                  className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                                  />
                                </svg>
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Bottom Decorative Element */}
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#77B254]/10 to-transparent rounded-bl-2xl" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Read reviews from people who have experienced our healthcare services
            </p>
          </motion.div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                service: "Online Consultation",
                name: "Sarah Johnson",
                rating: 5,
                review: "Excellent service! The virtual consultation was very convenient and professional.",
                date: "2 days ago"
              },
              {
                service: "Emergency Care",
                name: "Michael Chen",
                rating: 5,
                review: "Quick response time and excellent care. Very satisfied with the service.",
                date: "1 week ago"
              },
              {
                service: "Lab Tests",
                name: "Emily Davis",
                rating: 4,
                review: "Easy booking process and quick results. Very efficient service.",
                date: "2 weeks ago"
              }
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#77B254]">
                    {review.service}
                  </span>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                
                <p className="text-gray-600 mb-4">"{review.review}"</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="w-10 h-10 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-800">{review.name}</h4>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                            } w-4 h-4`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Review Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button 
              onClick={() => {/* Add your review modal/form logic here */}}
              className="inline-flex items-center px-8 py-3 rounded-full
                       text-white font-medium bg-[#77B254] 
                       hover:bg-green-600 transition-all duration-300
                       shadow-lg hover:shadow-xl"
            >
              Write a Review
              <svg 
                className="ml-2 w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <div className=" bg-gradient-to-r from-[#77B254] to-[#200ba582] py-16">
     
        <div className="container mx-auto px-4">
          <div className="text-white grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "500+", label: "Doctors" },
              { number: "50K+", label: "Appointments" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollTop ? 1 : 0 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full
                   shadow-lg hover:bg-green-600 transition-all duration-300
                   ${showScrollTop ? 'visible' : 'invisible'}`}
      >
        <FaArrowUp className="text-xl" />
      </motion.button>

      {/* CTA Section */}
      <div className="bg-gradient-to-r  py-16">
        <div className="container mx-auto px-4 text-center text-[#77B254]">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their healthcare experience
          </p>
          <button className='px-6 py-2 font-medium transition-all duration-300 rounded-lg bg-gradient-to-r from-[#77B254] to-[#69a048] text-white hover:from-[#69a048] hover:to-[#77B254] hover:shadow-lg hover:' 
              >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default FeaturesPage;