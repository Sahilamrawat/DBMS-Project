import React from 'react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  const features = [
    {
      title: "Patient Records",
      description: "Secure electronic health records management with easy access and updates",
      icon: "📋",
      color: "from-blue-50 to-blue-100"
    },
    {
      title: "Appointment Scheduling",
      description: "Smart scheduling system with automated reminders and calendar integration",
      icon: "📅",
      color: "from-green-50 to-green-100"
    },
    {
      title: "Prescription Management",
      description: "Digital prescription tracking and medication reminder system",
      icon: "💊",
      color: "from-purple-50 to-purple-100"
    },
    {
      title: "Billing & Insurance",
      description: "Streamlined billing process and insurance claim management",
      icon: "💳",
      color: "from-yellow-50 to-yellow-100"
    },
    {
      title: "Lab Results",
      description: "Quick access to laboratory results with historical tracking and analysis",
      icon: "🔬",
      color: "from-pink-50 to-pink-100"
    },
    {
      title: "Telemedicine",
      description: "Virtual consultations and remote patient monitoring capabilities",
      icon: "🖥️",
      color: "from-indigo-50 to-indigo-100"
    },
    {
      title: "Medical Reports",
      description: "Comprehensive medical reporting with customizable templates",
      icon: "📊",
      color: "from-red-50 to-red-100"
    },
    {
      title: "Emergency Services",
      description: "24/7 emergency contact and quick response system integration",
      icon: "🚑",
      color: "from-orange-50 to-orange-100"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <section id="features" className="relative py-20 px-4 bg-gradient-to-b from-white to-green-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[#77B254] font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-6">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our range of innovative healthcare management features designed to streamline your medical practice and enhance patient care.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`bg-gradient-to-br ${feature.color} p-6 rounded-2xl shadow-lg hover:shadow-xl 
                         transform hover:-translate-y-1 transition-all duration-300
                         cursor-pointer relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300" ></div>
              <div className="relative z-10">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center"
        >
          <button className="bg-[#77B254] text-white px-8 py-3 rounded-xl hover:bg-[#69a048] transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Learn More About Our Features
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;