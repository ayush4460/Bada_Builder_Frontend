import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 py-12 px-6 md:px-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand Section */}
        <div className="space-y-6">
          <Link to="/" className="block w-48">
            <img src={logo} alt="Bada Builder" className="w-full h-auto object-contain" />
          </Link>
          <p className="text-gray-600 text-sm leading-relaxed">
            Designing dreams into reality. From concept to creation, we deliver elegant and functional spaces that reflect your vision.
          </p>

          <div className="flex space-x-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-white hover:bg-[#58335e] transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <FaInstagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-white hover:bg-[#58335e] transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <FaFacebookF size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-white hover:bg-[#58335e] transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <FaLinkedinIn size={18} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-white hover:bg-[#58335e] transition-all duration-300 transform hover:-translate-y-1 shadow-sm">
              <FaYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-gray-900 relative inline-block after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-[#58335e] after:bottom-[-4px] after:left-0">Quick Links</h3>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link to="/book-visit" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Book a Site Visit</Link></li>
            <li><Link to="/exhibition/individual" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Exhibition</Link></li>
            <li><Link to="/services" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Services</Link></li>
            <li><Link to="/subscription-plans" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Pricing</Link></li>
            <li><Link to="/contact" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Contact Us</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-gray-900 relative inline-block after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-[#58335e] after:bottom-[-4px] after:left-0">Resources</h3>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li><Link to="/post-property" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Post Property</Link></li>
            <li><Link to="/exhibition/live-grouping" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Live Grouping</Link></li>
            <li><Link to="/investments" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Investments</Link></li>
            <li><Link to="/login" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">Login / Sign Up</Link></li>
            <li><Link to="/about" className="hover:text-[#58335e] hover:pl-2 transition-all duration-300 flex items-center gap-2">About Us</Link></li>
          </ul>
        </div>

        {/* Calculators & Tools */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-gray-900 relative inline-block after:content-[''] after:absolute after:w-1/2 after:h-0.5 after:bg-[#58335e] after:bottom-[-4px] after:left-0">Calculators</h3>
          <div className="space-y-6">
            
            {/* Performance */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Performance</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-gray-600">
                <Link to="/calculator/FFO" className="hover:text-[#58335e] transition-colors">FFO</Link>
                <Link to="/calculator/AFFO" className="hover:text-[#58335e] transition-colors">AFFO</Link>
                <Link to="/calculator/NOI" className="hover:text-[#58335e] transition-colors">NOI</Link>
                <Link to="/calculator/EBITDAre" className="hover:text-[#58335e] transition-colors">EBITDAre</Link>
                <Link to="/calculator/OccupancyRate" className="hover:text-[#58335e] transition-colors col-span-2">Occupancy Rate</Link>
              </div>
            </div>

            {/* Valuation & Finance */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Valuation & Finance</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-gray-600">
                <Link to="/calculator/CapRate" className="hover:text-[#58335e] transition-colors">Cap Rate</Link>
                <Link to="/calculator/NAV" className="hover:text-[#58335e] transition-colors">NAV</Link>
                <Link to="/calculator/PFFO" className="hover:text-[#58335e] transition-colors">P/FFO Ratio</Link>
                <Link to="/calculator/DCF" className="hover:text-[#58335e] transition-colors">DCF</Link>
                <Link to="/calculator/NPV" className="hover:text-[#58335e] transition-colors">NPV</Link>
                <Link to="/calculator/LTV" className="hover:text-[#58335e] transition-colors">LTV Ratio</Link>
                <Link to="/calculator/DSCR" className="hover:text-[#58335e] transition-colors col-span-2">DSCR</Link>
              </div>
            </div>

             {/* Investment */}
             <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">Investment</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-gray-600">
                <Link to="/calculator/DividendYield" className="hover:text-[#58335e] transition-colors">Dividend Yield</Link>
                <Link to="/calculator/PayoutRatio" className="hover:text-[#58335e] transition-colors">Payout Ratio</Link>
                <Link to="/calculator/IRR" className="hover:text-[#58335e] transition-colors">IRR</Link>
                <Link to="/calculator/TotalReturn" className="hover:text-[#58335e] transition-colors">Total Return</Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Bada Builder. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
