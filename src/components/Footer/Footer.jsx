import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import logo from "../../assets/logo.png"; // adjust the path as per your project structure
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="text-white py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Updated Logo Section */}
        <div>
          <div className="footer-logo-container mb-4">
            <Link to="/" className="footer-logo-link">
              <img src={logo} alt="Logo" className="footer-logo-image h-10" />
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            Designing dreams into reality. From concept to creation, we deliver elegant and functional spaces that reflect your vision.
          </p>

          <div className="flex space-x-4 mt-6">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon hover:scale-110 transition-transform"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon hover:scale-110 transition-transform"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon hover:scale-110 transition-transform"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon hover:scale-110 transition-transform"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-medium mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/booksitevisit" className="footer-link hover:text-white transition-colors">Book a Site Visit</Link></li>
            <li><Link to="/exhibition/individual" className="footer-link hover:text-white transition-colors">Exhibition</Link></li>
            <li><Link to="/services" className="footer-link hover:text-white transition-colors">Services</Link></li>
            <li><Link to="/subscription-plans" className="footer-link hover:text-white transition-colors">Pricing</Link></li>
            <li><Link to="/contact" className="footer-link hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* More Links */}
        <div>
          <h3 className="text-lg font-medium mb-4">Resources</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/post-property" className="footer-link hover:text-white transition-colors">Post Property</Link></li>
            <li><Link to="/exhibition/live-grouping" className="footer-link hover:text-white transition-colors">Live Grouping</Link></li>
            <li><Link to="/investments" className="footer-link hover:text-white transition-colors">Investments</Link></li>
            <li><Link to="/login" className="footer-link hover:text-white transition-colors">Login / Sign Up</Link></li>
            <li><Link to="/about" className="footer-link hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Bada Builder. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
