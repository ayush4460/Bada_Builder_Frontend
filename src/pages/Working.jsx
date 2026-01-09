import React from 'react';
import { motion } from 'framer-motion';
import { Search, Home, Handshake, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-8 h-8" />,
    title: 'Search & Explore',
    description: 'Discover premium properties, curated REITs, and exclusive real estate opportunities with our intelligent search.',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: <Home className="w-8 h-8" />,
    title: 'Shortlist & Analyze',
    description: 'Use our advanced calculators and comparison tools to evaluate ROIs and find your perfect investment match.',
    color: 'from-purple-500 to-indigo-400'
  },
  {
    icon: <Handshake className="w-8 h-8" />,
    title: 'Expert Consultation',
    description: 'Connect with our real estate experts for site visits, legal verification, and document assistance.',
    color: 'from-amber-500 to-orange-400'
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: 'Secure Closure',
    description: 'Transact with confidence through our verified processes and dedicated closure support.',
    color: 'from-emerald-500 to-teal-400'
  }
];

const Working = () => {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      <div className="text-center mb-20">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-bold tracking-widest uppercase mb-6"
        >
          Our Process
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
        >
          How Bada Builder <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-indigo-600">Works</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-500 max-w-2xl mx-auto font-light"
        >
          Your journey from searching for a property to owning your dream investment, simplified with technology and expertise.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
        {/* Connection Line (Desktop) */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-slate-100 hidden lg:block -z-10"></div>
        
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="group relative flex flex-col items-center text-center p-8 rounded-3xl hover:bg-white hover:shadow-2xl transition-all duration-500"
          >
            <div className={`w-20 h-20 rounded-2xl bg-linear-to-br ${step.color} p-0.5 mb-8 transform group-hover:rotate-6 transition-transform duration-500 shadow-xl`}>
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-slate-900">
                {step.icon}
              </div>
            </div>
            
            <div className="absolute top-4 right-4 text-6xl font-black text-slate-50 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              0{index + 1}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-light">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Working;