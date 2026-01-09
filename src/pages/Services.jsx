import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Services.css';

const services = [
  {
    id: 1,
    title: 'Legal Verification',
    description: 'Complete property document verification and legal clearance services',
    icon: '⚖️',
    features: ['Title verification', 'Document authentication', 'Legal compliance check'],
    link: null
  },
  {
    id: 2,
    title: 'Home Loans',
    description: 'Get the best home loan deals with competitive interest rates',
    icon: '🏦',
    features: ['Low interest rates', 'Quick approval', 'Flexible repayment'],
    link: null
  },
  {
    id: 3,
    title: 'Interior Design',
    description: 'Professional interior design services for your dream home',
    icon: '🎨',
    features: ['Custom designs', '3D visualization', 'Turnkey solutions'],
    link: null
  },
  {
    id: 4,
    title: 'Investment Advisory',
    description: 'Expert guidance on real estate investments and portfolio management',
    icon: '📈',
    features: ['ROI analysis', 'Market insights', 'Investment strategies'],
    link: '/investments'
  },
  {
    id: 5,
    title: 'Property Valuation',
    description: 'Accurate property valuation by certified professionals',
    icon: '💰',
    features: ['Market analysis', 'Detailed reports', 'Expert consultation'],
    link: null
  },
  {
    id: 6,
    title: 'Property Management',
    description: 'End-to-end property management and maintenance services',
    icon: '🏢',
    features: ['Tenant management', 'Maintenance', 'Rent collection'],
    link: null
  },
  {
    id: 7,
    title: 'Insurance Services',
    description: 'Comprehensive property and home insurance solutions',
    icon: '🛡️',
    features: ['Property insurance', 'Home insurance', 'Claim assistance'],
    link: null
  }
];

const Services = () => {
  const navigate = useNavigate();

  const handleServiceClick = (service) => {
    if (service.link) {
      navigate(service.link);
    } else {
      alert(`${service.title} service - Coming soon! Contact us for more information.`);
    }
  };

  return (
    <div className="services-page bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="services-container max-w-[1400px] mx-auto relative z-10">
        <motion.div 
          className="services-header text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black tracking-[0.2em] uppercase mb-6">
            Expert Solutions
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Our <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-indigo-600">Services</span></h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Comprehensive real estate solutions tailored for investors, developers, and homeowners.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={service.id} 
              className="group relative bg-white p-8 rounded-[32px] border border-slate-100 hover:border-purple-200 shadow-sm hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col items-start text-left"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:bg-purple-50">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{service.title}</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed mb-8 grow">
                {service.description}
              </p>
              
              <ul className="space-y-3 mb-10 w-full">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300
                  ${service.link 
                    ? 'bg-slate-900 text-white hover:bg-purple-700 shadow-lg shadow-slate-200' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                onClick={() => handleServiceClick(service)}
              >
                {service.link ? 'Explore Now' : 'Coming Soon'}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-32 p-1 relative rounded-[48px] overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "circOut" }}
        >
          {/* Main Background with Mesh Overlay */}
          <div className="absolute inset-0 bg-[#050505] z-0">
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10H90V90H10V10Z' fill='none' stroke='%23ffffff' stroke-width='0.5' stroke-dasharray='1 4'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Animated Ambient Glows */}
          <motion.div 
            className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
          
          <motion.div 
            className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px]"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -40, 0],
              y: [0, 20, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>

          {/* Content Container */}
          <div className="relative z-10 p-12 md:p-20 text-center flex flex-col items-center">
            {/* Social Proof Badge */}
            <motion.div 
              className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full mb-10 transition-colors hover:bg-white/10"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#050505] bg-slate-800 flex items-center justify-center text-[10px] overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Expert" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-300 tracking-wide">50+ Area Experts Active Now</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white! mb-6 leading-tight max-w-3xl">
              Need <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-indigo-400 to-purple-400 bg-size-[200%_auto] animate-gradient">Personalized Guidance?</span>
            </h2>
            
            <p className="text-lg md:text-xl text-white! max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              Skip the confusion. Our dedicated team of property advisors is ready to build your customized investment strategy.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <motion.button 
                className="group relative px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)] overflow-hidden"
                onClick={() => navigate('/contact')}
                whileHover="hover"
              >
                <div className="relative z-10 flex items-center gap-2">
                  <span>Talk to an Expert</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <motion.div 
                  className="absolute inset-0 bg-linear-to-r from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"
                ></motion.div>
              </motion.button>

              <button 
                className="px-8 py-4 text-slate-400 hover:text-white transition-colors font-medium flex items-center gap-2"
                onClick={() => navigate('/about')}
              >
                Learn Our Process
              </button>
            </div>
          </div>

          {/* Floating Decorative Glass Shapes */}
          <div className="absolute right-[5%] bottom-[15%] w-24 h-24 bg-white/5 backdrop-blur-3xl rounded-3xl rotate-12 -z-1 border border-white/10 hidden lg:block animate-pulse"></div>
          <div className="absolute left-[8%] top-[20%] w-16 h-16 bg-white/5 backdrop-blur-3xl rounded-2xl -rotate-12 -z-1 border border-white/10 hidden lg:block animate-bounce [animation-duration:5s]"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
