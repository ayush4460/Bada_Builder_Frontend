import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiHome, FiUsers, FiCalendar, FiTrendingUp, FiMapPin, FiPhone, FiMail, FiEdit2, FiCamera, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api, { uploadService } from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile, logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityCounts, setActivityCounts] = useState({
    propertiesUploaded: 0,
    joinedLiveGroups: 0,
    bookedSiteVisits: 0,
    investments: 0
  });
  const [loadingActivity, setLoadingActivity] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setProfilePhoto(userProfile.profilePhoto || null);
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchActivityStats = async () => {
      setLoadingActivity(true);
      try {
        const results = await Promise.allSettled([
          api.get('/properties/user/me'),
          api.get('/bookings/my'),
          api.get('/live-groups/my').catch(() => ({ data: [] })), 
          api.get('/investments/my').catch(() => ({ data: [] }))
        ]);

        const [propsResult, bookingsResult, groupsResult, invResult] = results;

        let properties = [];
        if (propsResult.status === 'fulfilled') {
           properties = propsResult.value.data?.properties || [];
           if (Array.isArray(propsResult.value.data)) {
              properties = propsResult.value.data;
           }
        }

        let activeBookings = [];
        if (bookingsResult.status === 'fulfilled') {
            const bookings = bookingsResult.value.data?.bookings || [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            activeBookings = bookings.filter(b => {
              if (b.visit_date) {
                const visitDate = new Date(b.visit_date);
                visitDate.setHours(0, 0, 0, 0);
                return visitDate >= today;
              }
              return true;
            });
        }

        const liveGroups = (groupsResult.status === 'fulfilled' && groupsResult.value.data) ? groupsResult.value.data : [];
        const investments = (invResult.status === 'fulfilled' && invResult.value.data) ? invResult.value.data : [];

        setActivityCounts({
          propertiesUploaded: properties.length,
          joinedLiveGroups: Array.isArray(liveGroups) ? liveGroups.length : 0,
          bookedSiteVisits: activeBookings.length,
          investments: Array.isArray(investments) ? investments.length : 0
        });

      } catch (error) {
        console.error('Error fetching activity stats:', error);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivityStats();
  }, [currentUser]);

  const userData = {
    name: userProfile?.name || currentUser?.displayName || 'User',
    email: currentUser?.email || '',
    phone: userProfile?.phone_number || '',
    userId: currentUser?.uid || userProfile?.uid || '',
    userType: userProfile?.user_type || userProfile?.userType || 'Individual',
    profilePhoto: userProfile?.profile_photo || userProfile?.profilePhoto || null,
    createdAt: userProfile?.created_at,
    location: userProfile?.location || 'India'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Unknown';
    }
  };

  const activityItems = [
    {
      id: 1,
      title: 'Properties Uploaded',
      icon: <FiHome className="text-2xl" />,
      count: loadingActivity ? '...' : activityCounts.propertiesUploaded,
      path: '/my-properties',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'group-hover:border-blue-200'
    },
    {
      id: 2,
      title: 'Joined Live Groups',
      icon: <FiUsers className="text-2xl" />,
      count: loadingActivity ? '...' : activityCounts.joinedLiveGroups,
      path: '/exhibition/live-grouping',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'group-hover:border-purple-200'
    },
    {
      id: 3,
      title: 'Booked Site Visits',
      icon: <FiCalendar className="text-2xl" />,
      count: loadingActivity ? '...' : activityCounts.bookedSiteVisits,
      path: '/my-bookings',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'group-hover:border-emerald-200'
    },
    {
      id: 4,
      title: 'Investments',
      icon: <FiTrendingUp className="text-2xl" />,
      count: loadingActivity ? '...' : activityCounts.investments,
      path: '/profile/investments',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'group-hover:border-amber-200'
    }
  ];

  const handleActivityClick = (path) => {
    navigate(path);
  };

  const handleRemovePhoto = async () => {
    if (!currentUser) return;
    try {
      setUploading(true);
      await api.put('/auth/update', { profile_photo: null });
      setProfilePhoto(null);
      await refreshProfile();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Failed to remove photo.');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadSuccess(false);
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await uploadService.uploadImage(formData);
      if (!uploadRes.data.success) throw new Error(uploadRes.data.message || 'Upload failed');

      const photoURL = uploadRes.data.url;
      await api.put('/auth/update', { profile_photo: photoURL });
      setProfilePhoto(photoURL);
      await refreshProfile();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: ''
  });
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (userProfile || currentUser) {
      setEditForm({
        name: userProfile?.name || currentUser?.displayName || '',
        phone: userProfile?.phone_number || '',
        email: currentUser?.email || '',
        location: userProfile?.location || ''
      });
    }
  }, [userProfile, currentUser]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel
      setEditForm({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        location: userData.location
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    try {
      let profileUpdated = false;
      const updates = {};
      
      // Check for non-email URL changes
      if (editForm.name !== userData.name) updates.name = editForm.name;
      if (editForm.phone !== userData.phone) updates.phone_number = editForm.phone;
      if (editForm.location !== userData.location) updates.location = editForm.location;

      if (Object.keys(updates).length > 0) {
        await api.put('/auth/update', updates);
        profileUpdated = true;
      }

      // Check for email change
      if (editForm.email !== userData.email) {
        // Initiate Email Change
        await api.post('/auth/initiate-email-change', { newEmail: editForm.email });
        setPendingEmail(editForm.email);
        setShowOtpModal(true);
        // Note: We don't turn off isEditing or refresh profile yet if email is pending
      } else {
        // If only profile updated
        if (profileUpdated) {
          await refreshProfile();
          setIsEditing(false);
          alert('Profile updated successfully!');
        }
      }
      
      if (profileUpdated && editForm.email === userData.email) {
          // done
      }

    } catch (error) {
      console.error('Error saving changes:', error);
      alert(error.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert('Please enter OTP');
    setOtpLoading(true);
    try {
      await api.post('/auth/verify-email-change', { newEmail: pendingEmail, otp });
      await refreshProfile();
      
      setShowOtpModal(false);
      setIsEditing(false);
      setPendingEmail('');
      setOtp('');
      alert('Email updated successfully!');
    } catch (error) {
       console.error('Error verifying OTP:', error);
       alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-5 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        
       {/* Subtle Background Elements */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-[100px]" />
       </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* OTP Modal */}
        <AnimatePresence>
          {showOtpModal && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              >
                  <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md ring-1 ring-black/5"
                  >
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Verify New Email</h3>
                      <p className="text-sm text-slate-500 mb-6">
                          We sent a verification code to <span className="font-semibold text-slate-700 underline decoration-blue-200 decoration-2">{pendingEmail}</span>. 
                          Please enter it below to confirm.
                      </p>
                      
                      <input 
                          type="text" 
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="000000"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-center text-2xl tracking-[0.5em] mb-6 text-slate-800 placeholder:text-slate-300"
                          maxLength={6}
                      />

                      <div className="flex gap-3">
                          <button 
                              onClick={() => setShowOtpModal(false)}
                              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleVerifyOtp}
                              disabled={otpLoading}
                              className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                              {otpLoading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                'Verify Email'
                              )}
                          </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-10"
        >
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
                <p className="text-slate-500 mt-1 font-medium">Manage your account and view your activity.</p>
            </div>
            
            <button 
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
            >
                <FiLogOut className="text-lg" /> Sign Out
            </button>
        </motion.div>

        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start"
        >
          
          {/* Left Column: Identity Card */}
          <motion.div variants={itemVariants} className="sticky top-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 text-center relative overflow-hidden">
                
                {/* Profile Photo Area */}
                <div className="relative mx-auto w-32 h-32 mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
                    <div className="w-full h-full rounded-full p-1 bg-white shadow-lg relative z-10 overflow-hidden">
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
                             {userData.profilePhoto ? (
                                <img 
                                    src={userData.profilePhoto} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                             ) : (
                                <FiUser size={40} className="text-slate-300" />
                             )}
                             
                             <label 
                                htmlFor="photo-upload"
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white"
                             >
                                <FiCamera className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                             </label>
                        </div>
                    </div>
                    <input id="photo-upload" ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-1">{userData.name}</h2>
                <div className="flex justify-center mb-8">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                        {userData.userType}
                    </span>
                </div>

                {/* Contact Info (Compact on sidebar) */}
                <div className="space-y-3 text-left">
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FiPhone size={18} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
                            <p className="text-sm font-semibold text-slate-700 truncate">{userData.phone || '—'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <FiMail size={18} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                            <p className="text-sm font-semibold text-slate-700 truncate" title={userData.email}>{userData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Remove Photo Action */}
                {userData.profilePhoto && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                         <button 
                            onClick={handleRemovePhoto}
                            disabled={uploading}
                            className="w-full py-2.5 rounded-xl text-red-500 font-medium hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                         >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Remove Photo
                         </button>
                    </div>
                )}

            </div>
          </motion.div>

          {/* Right Column: Stats & Data */}
          <div className="space-y-6">
            
            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activityItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleActivityClick(item.path)}
                  className={`group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden`}
                >
                  <div className="flex justify-between items-start z-10">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-800 transition-colors duration-300">{item.title}</span>
                        <span className="text-4xl font-bold text-slate-900 mt-3 tracking-tight">{item.count}</span>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Decorative background bloom */}
                  <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${item.bg.replace('bg-', 'from-').replace('/10', '/20')} to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
              ))}
            </motion.div>

            {/* Editable Information Section */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
                 
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30" />

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                        <p className="text-slate-400 text-sm mt-1">Update your personal details here.</p>
                    </div>
                    
                    {!isEditing ? (
                         <button 
                            onClick={handleEditToggle}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:translate-y-0.5 transition-all"
                         >
                            <FiEdit2 size={16} /> Edit
                         </button>
                    ) : (
                        <div className="flex gap-3">
                             <button 
                                onClick={handleEditToggle}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                             >
                                Cancel
                             </button>
                             <button 
                                onClick={handleSaveChanges}
                                disabled={saveLoading}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:translate-y-0.5 transition-all flex items-center gap-2"
                             >
                                {saveLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                Save
                             </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        {isEditing ? (
                            <input 
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                                placeholder="Unknown"
                            />
                        ) : (
                            <p className="text-lg font-medium text-slate-800 py-2 border-b border-transparent">{userData.name}</p>
                        )}
                    </div>

                    {/* Email */}
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                        {isEditing ? (
                            <div className="relative">
                                <input 
                                    type="email"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                                    placeholder="email@example.com"
                                />
                                {editForm.email !== userData.email && (
                                    <div className="absolute right-3 top-3.5 flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 pointer-events-none">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Verify
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-lg font-medium text-slate-800 py-2 border-b border-transparent">{userData.email}</p>
                        )}
                    </div>

                    {/* Phone */}
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                        {isEditing ? (
                            <input 
                                type="text"
                                name="phone"
                                value={editForm.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                                placeholder="+91 ..."
                            />
                        ) : (
                            <p className="text-lg font-medium text-slate-800 py-2 border-b border-transparent">{userData.phone || '—'}</p>
                        )}
                    </div>

                    {/* Location */}
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                        {isEditing ? (
                            <input 
                                type="text"
                                name="location"
                                value={editForm.location}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                                placeholder="City, Country"
                            />
                        ) : (
                            <p className="text-lg font-medium text-slate-800 py-2 border-b border-transparent">{userData.location || '—'}</p>
                        )}
                    </div>
                </div>

                {/* Non-editable Meta Data */}
                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-8 text-sm">
                     <div className="flex items-center gap-3 text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <span className="font-semibold uppercase tracking-wider text-[10px]">ID</span>
                        <code className="font-mono text-slate-700">{userData.userId}</code>
                    </div>
                     <div className="flex items-center gap-3 text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <span className="font-semibold uppercase tracking-wider text-[10px]">Since</span>
                        <span className="font-medium text-slate-700">{formatDate(userData.createdAt)}</span>
                    </div>

                    {/* Account Status & Access */}
                    <div className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-2 text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm shrink-0">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider">Active Account</span>
                        </div>
                        <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                            You have <span className="font-bold underline decoration-emerald-300 decoration-2">All Access</span> to Bada Builder features including unlimited property listings, advanced analytics, live grouping, and premium investment insights.
                        </p>
                    </div>
                </div>

            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
