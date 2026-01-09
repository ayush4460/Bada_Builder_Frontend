import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle } from 'lucide-react';
import logo from '../../assets/logo.png';
import UserTypeModal from '../UserTypeModal/UserTypeModal';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const timeoutRef = useRef(null);
  const profileTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    setIsLoggedIn(!!currentUser);
    setLoading(authLoading);
  }, [currentUser, authLoading]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (showLogoutModal || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showLogoutModal, isMobileMenuOpen]);


  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowProfileDropdown(false);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate('/');
      setIsMobileMenuOpen(false);
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const cancelLogout = () => setShowLogoutModal(false);

  const handleLoginClick = (e) => {
    if (location.pathname === '/login') {
      e.preventDefault();
      navigate('/login', { state: { resetForm: true } });
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) setMobileLearnOpen(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 150);
  };

  const handleProfileMouseEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setShowProfileDropdown(true);
  };

  const handleProfileMouseLeave = () => {
    profileTimeoutRef.current = setTimeout(() => setShowProfileDropdown(false), 150);
  };

  const getUserInitials = () => {
    if (userProfile?.name) return userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (currentUser?.displayName) return currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => userProfile?.name || currentUser?.displayName || 'User';
  const getUserEmail = () => userProfile?.email || currentUser?.email || '';

  const dropdownItems = [
    { label: 'Lease and asset management', href: '/learn/lease-and-asset-management' },
    { label: 'Market and investment analysis', href: '/learn/market-and-investment-analysis' },
    { label: 'Real estate financial modelling', href: '/learn/real-estate-financial-modelling' },
    { label: 'Real estate market research', href: '/learn/real-estate-market-research' },
    { label: 'Reit valuation and compliance', href: '/learn/reit-valuation-and-compliance' },
    { label: 'Risk assessment & due diligence', href: '/learn/risk-assessment-due-diligence' },
    { label: 'Stakeholder communication in Reit', href: '/learn/stakeholder-communication' },
    { label: 'Types of Reits in India', href: '/learn/types-of-reits-india' },
    { label: 'Taxation in Reits', href: '/learn/taxation-in-reits' },
    { label: 'Job profiles in Reits', href: '/learn/job-profiles-in-reits' },
    { label: 'Work of Different job profiles', href: '/learn/work-of-job-profiles' }
  ];

  if (loading) {
    return (
      <header className="h-20 bg-white/95 backdrop-blur-md shadow-sm flex justify-center items-center sticky top-0 z-50">
        <div className="w-8 h-8 border-4 border-[#58335e] border-t-transparent rounded-full animate-spin"></div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <Link to="/" className="block">
                <img className="h-10 w-auto md:h-12 hover:scale-105 transition-transform duration-200" src={logo} alt="Bada Builder" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-8">
              {userProfile?.user_type === 'admin' ? (
                <>
                  <Link to="/admin/dashboard" className={`text-gray-700 hover:text-[#58335e] font-medium transition-colors relative group py-2 ${location.pathname === '/admin/dashboard' ? 'text-[#58335e]' : ''}`}>
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={18} />
                      Dashboard
                    </div>
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-[#58335e] transition-all duration-300 ${location.pathname === '/admin/dashboard' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                  <Link to="/admin/properties" className={`text-gray-700 hover:text-[#58335e] font-medium transition-colors relative group py-2 ${location.pathname === '/admin/properties' ? 'text-[#58335e]' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Building2 size={18} />
                      Manage Properties
                    </div>
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-[#58335e] transition-all duration-300 ${location.pathname === '/admin/properties' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                  <Link to="/admin/add-property" className={`text-gray-700 hover:text-[#58335e] font-medium transition-colors relative group py-2 ${location.pathname === '/admin/add-property' ? 'text-[#58335e]' : ''}`}>
                    <div className="flex items-center gap-2">
                      <PlusCircle size={18} />
                      Add Property
                    </div>
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-[#58335e] transition-all duration-300 ${location.pathname === '/admin/add-property' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/exhibition" className="text-gray-700 hover:text-[#58335e] font-medium transition-colors relative group py-2">
                    Exhibition
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#58335e] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link to="/services" className="text-gray-700 hover:text-[#58335e] font-medium transition-colors relative group py-2">
                    Services
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#58335e] transition-all duration-300 group-hover:w-full"></span>
                  </Link>

                  {/* Learn Dropdown */}
                  <div className="relative group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <button className={`flex items-center gap-1 text-gray-700 font-medium hover:text-[#58335e] transition-colors py-2 group ${showDropdown ? 'text-[#58335e]' : ''}`}>
                      <span>Learn Reit's</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className={`absolute bottom-0 left-0 h-0.5 bg-[#58335e] transition-all duration-300 ${showDropdown ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>
                    
                    {showDropdown && (
                      <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 overflow-hidden origin-top-right transition-all duration-200 z-50">
                        <div className="py-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
                          {dropdownItems.map((item, idx) => (
                            <Link
                              key={idx}
                              to={item.href}
                              className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#58335e] transition-colors border-l-4 border-transparent hover:border-[#58335e]"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to="/investments" className="text-gray-700 hover:text-[#58335e] font-medium transition-colors relative group py-2">
                    Investment
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#58335e] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link to="/contact" className="text-gray-700 hover:text-[#58335e] font-medium transition-colors relative group py-2">
                    Contact Us
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#58335e] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden xl:flex items-center gap-4">
              {userProfile?.user_type !== 'admin' && (
                <button
                  onClick={() => setIsUserTypeModalOpen(true)}
                  className="bg-linear-to-r from-[#58335e] to-[#8a4f94] text-white! px-7 py-2.5 rounded-full shadow-[0_10px_20px_-10px_rgba(88,51,94,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(88,51,94,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Post Property</span>
                  <span className="text-lg">✨</span>
                </button>
              )}

              {isLoggedIn ? (
                <div className="relative" onMouseEnter={handleProfileMouseEnter} onMouseLeave={handleProfileMouseLeave}>
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-[#58335e] to-[#8a4f94] text-white font-semibold shadow-md ring-2 ring-transparent hover:ring-[#58335e] transition-all duration-200">
                    {getUserInitials()}
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 ring-1 ring-black ring-opacity-5 overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-[#58335e] to-[#8a4f94] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                           {getUserInitials()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                          <p className="text-xs text-gray-500 truncate">{getUserEmail()}</p>
                        </div>
                      </div>
                      
                      <div className="p-2">
                         <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</div>
                         <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setShowProfileDropdown(false)}>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            View Profile
                         </Link>
                         <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left mt-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Logout
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" onClick={handleLoginClick} className="bg-[#58335e] hover:bg-[#46284b] text-white! px-6 py-2.5 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 font-medium text-sm">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex xl:hidden!">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-[#58335e] hover:bg-purple-50 focus:outline-none transition-colors"
              >
                <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                   <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                   <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                   <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-100 xl:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={toggleMobileMenu}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden">
             
             {/* Mobile Header */}
             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
               <h2 className="text-lg font-bold text-gray-900">Menu</h2>
               <button onClick={toggleMobileMenu} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>

             {/* Mobile Content */}
             <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                
                {/* Profile Section */}
                {isLoggedIn ? (
                  <div className="bg-linear-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#58335e] text-white flex items-center justify-center font-bold text-lg">
                        {getUserInitials()}
                      </div>
                      <div className="min-w-0">
                         <h3 className="font-semibold text-gray-900 truncate">{getUserDisplayName()}</h3>
                         <p className="text-xs text-gray-500 truncate">{getUserEmail()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <Link to="/profile" onClick={toggleMobileMenu} className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#58335e] bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                         View Profile
                       </Link>
                       <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                         Logout
                       </button>
                    </div>
                  </div>
                ) : (
                   <Link to="/login" onClick={handleLoginClick} className="flex items-center justify-center w-full py-3.5 bg-linear-to-r from-[#58335e] to-[#7c4581] text-white! rounded-xl font-bold shadow-lg shadow-purple-900/10 active:scale-95 transition-all">
                      Login / Sign Up
                   </Link>
                )}

                {/* Main Links */}
                <div className="space-y-2">
                   {userProfile?.user_type === 'admin' ? (
                     <>
                        <Link to="/admin/dashboard" onClick={toggleMobileMenu} className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-colors ${location.pathname === '/admin/dashboard' ? 'bg-purple-50 text-[#58335e]' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <LayoutDashboard size={20} />
                          Dashboard
                        </Link>
                        <Link to="/admin/properties" onClick={toggleMobileMenu} className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-colors ${location.pathname === '/admin/properties' ? 'bg-purple-50 text-[#58335e]' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <Building2 size={20} />
                          Manage Properties
                        </Link>
                        <Link to="/admin/add-property" onClick={toggleMobileMenu} className={`flex items-center gap-3 p-3.5 rounded-xl font-medium transition-colors ${location.pathname === '/admin/add-property' ? 'bg-purple-50 text-[#58335e]' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <PlusCircle size={20} />
                          Add Property
                        </Link>
                     </>
                   ) : (
                     <>
                        <button 
                           onClick={() => { toggleMobileMenu(); setIsUserTypeModalOpen(true); }}
                           className="w-full flex items-center justify-between p-4 bg-linear-to-br from-[#58335e]/5 to-white text-[#58335e] rounded-2xl hover:bg-linear-to-br hover:from-[#58335e]/10 hover:to-white transition-all font-bold border border-[#58335e]/10 shadow-sm active:scale-[0.98]"
                        >
                          <span>Post Property</span>
                          <span className="text-xl">✨</span>
                        </button>

                        <Link to="/exhibition" onClick={toggleMobileMenu} className="block p-3.5 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors">Exhibition</Link>
                        <Link to="/services" onClick={toggleMobileMenu} className="block p-3.5 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors">Services</Link>
                        
                        {/* Mobile Dropdown */}
                        <div className="overflow-hidden">
                           <button 
                             onClick={() => setMobileLearnOpen(!mobileLearnOpen)}
                             className="w-full flex items-center justify-between p-3.5 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                           >
                             <span>Learn Reit's</span>
                             <svg className={`w-5 h-5 text-gray-400 transition-transform ${mobileLearnOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                             </svg>
                           </button>
                           <div className={`space-y-1 pl-4 pr-2 overflow-hidden transition-all duration-300 ${mobileLearnOpen ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                              {dropdownItems.map((item, idx) => (
                                <Link key={idx} to={item.href} onClick={toggleMobileMenu} className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[#58335e] border-l-2 border-transparent hover:border-[#58335e] bg-gray-50/50 rounded-r-lg">
                                  {item.label}
                                </Link>
                              ))}
                           </div>
                        </div>

                        <Link to="/investments" onClick={toggleMobileMenu} className="block p-3.5 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors">Investment</Link>
                        <Link to="/contact" onClick={toggleMobileMenu} className="block p-3.5 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors">Contact Us</Link>
                     </>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* User Type Modal */}
      <UserTypeModal
        isOpen={isUserTypeModalOpen}
        onClose={() => setIsUserTypeModalOpen(false)}
      />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                 <p className="text-gray-500">Are you sure you want to end your session?</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={cancelLogout} disabled={logoutLoading} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                    Cancel
                 </button>
                 <button onClick={confirmLogout} disabled={logoutLoading} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg shadow-red-200 transition-colors flex items-center justify-center gap-2">
                    {logoutLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Logout'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Header;
