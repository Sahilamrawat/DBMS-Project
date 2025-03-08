import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaStar, FaUserCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Review = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Patient",
      image: "/path/to/image.jpg", // Add actual image path
      rating: 5,
      review: "Outstanding healthcare service! The online appointment booking was seamless, and the doctors were extremely professional and caring.",
      date: "March 2024"
    },
    // Add more reviews...
  ];

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            What Our Patients Say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real experiences from our valued patients
          </p>
        </motion.div>

        {/* Reviews Carousel */}
        <div className="max-w-6xl mx-auto relative">
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 z-10">
            <button
              onClick={prevReview}
              className="p-3 rounded-full bg-white shadow-lg hover:bg-[#77B254] 
                       hover:text-white transition-all duration-300"
            >
              <FaChevronLeft className="text-xl" />
            </button>
          </div>
          <div className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 z-10">
            <button
              onClick={nextReview}
              className="p-3 rounded-full bg-white shadow-lg hover:bg-[#77B254] 
                       hover:text-white transition-all duration-300"
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>

          {/* Reviews Display */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 md:p-12 shadow-xl"
              >
                <div className="grid md:grid-cols-5 gap-8">
                  {/* Review Content */}
                  <div className="md:col-span-3 relative">
                    <FaQuoteLeft className="text-4xl text-[#77B254]/20 absolute -top-2 -left-2" />
                    <div className="mt-8">
                      <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        {reviews[currentIndex].review}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`${
                              i < reviews[currentIndex].rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } text-xl`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        {reviews[currentIndex].image ? (
                          <img
                            src={reviews[currentIndex].image}
                            alt={reviews[currentIndex].name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <FaUserCircle className="w-12 h-12 text-gray-400" />
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {reviews[currentIndex].name}
                          </h4>
                          <p className="text-gray-500 text-sm">
                            {reviews[currentIndex].role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Element */}
                  <div className="md:col-span-2 hidden md:block">
                    <div className="h-full bg-gradient-to-br from-[#77B254]/10 to-green-100 
                                  rounded-xl p-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-[#77B254]">
                          {reviews[currentIndex].rating}.0
                        </div>
                        <div className="text-green-600 mt-2">
                          Overall Rating
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Review Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 
                           ${currentIndex === index 
                             ? 'w-8 bg-[#77B254]' 
                             : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Review; 