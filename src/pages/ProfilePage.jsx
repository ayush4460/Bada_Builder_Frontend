import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiHome, FiUsers, FiCalendar, FiTrendingUp } from 'react-icons/fi';
// import { doc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebase';
import api from '../services/api';
// import './ProfilePage.css'; // Removed and replaced with Tailwind

// Import removed as we use uploadService from api.js
import { uploadService } from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();
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

  // Load profile photo from userProfile
  useEffect(() => {
    if (userProfile) {
      setProfilePhoto(userProfile.profilePhoto || null);
      setLoading(false);
    }
  }, [userProfile]);

  // Fetch activity stats via API
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchActivityStats = async () => {
      setLoadingActivity(true);
      try {
        // Run fetches in parallel
        const [propsRes, bookingsRes, groupsRes, invRes] = await Promise.all([
          api.get('/properties/user/me'),
          api.get('/bookings/my'), // Assuming endpoint exists
          api.get('/live-groups/my'), // Assuming endpoint exists
          api.get('/investments/my') // Assuming endpoint exists
        ]);

        const properties = propsRes.data || [];
        
        // Filter active upcoming bookings
        const bookings = bookingsRes.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeBookings = bookings.filter(b => {
          if (b.visit_date) {
            const visitDate = new Date(b.visit_date);
            visitDate.setHours(0, 0, 0, 0);
            return visitDate >= today;
          }
          return true;
        });

        // Live groups and investments
        const liveGroups = groupsRes.data || [];
        const investments = invRes.data || [];

        setActivityCounts({
          propertiesUploaded: properties.length,
          joinedLiveGroups: liveGroups.length,
          bookedSiteVisits: activeBookings.length,
          investments: investments.length
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
    phone: userProfile?.phone_number || '', // Backend sends phone_number
    userId: currentUser?.uid || userProfile?.uid || '',
    userType: userProfile?.user_type || userProfile?.userType || 'Individual', // Backend sends user_type
    profilePhoto: userProfile?.profile_photo || userProfile?.profilePhoto || null, // Backend sends profile_photo
    createdAt: userProfile?.created_at,
    location: userProfile?.location || 'India' // Backend doesn't send location yet, keep fallback
  };

  // Helper to format date
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
      icon: <FiHome className="text-xl text-slate-600" />,
      count: loadingActivity ? '...' : activityCounts.propertiesUploaded,
      path: '/my-properties',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Joined Live Groups',
      icon: <FiUsers className="text-xl text-slate-600" />,
      count: loadingActivity ? '...' : activityCounts.joinedLiveGroups,
      path: '/exhibition/live-grouping',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Booked Site Visits',
      icon: <FiCalendar className="text-xl text-slate-600" />,
      count: loadingActivity ? '...' : activityCounts.bookedSiteVisits,
      path: '/my-bookings',
      color: 'green'
    },
    {
      id: 4,
      title: 'Investments',
      icon: <FiTrendingUp className="text-xl text-slate-600" />,
      count: loadingActivity ? '...' : activityCounts.investments,
      path: '/profile/investments',
      color: 'orange' 
    }
  ];

  const handleActivityClick = (path) => {
    navigate(path);
  };

  const handlePhotoClick = () => {
    // Remove click functionality - photo is now just for display
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    if (!currentUser) return;

    try {
      setUploading(true);
      console.log('🗑️ Removing profile photo...');

      // Update backend user profile
      await api.put('/auth/update', {
        profile_photo: null
      });

      console.log('✅ Profile photo removed from backend');

      // Update local state immediately
      setProfilePhoto(null);

      // Refresh profile to get updated data from context
      await refreshProfile();

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Error removing profile photo:', error);
      alert('Failed to remove photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadSuccess(false);

      console.log('📸 Uploading profile photo...');

      // Upload using uploadService (proxies to backend)
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await uploadService.uploadImage(formData);
      
      if (!uploadRes.data.success) {
          throw new Error(uploadRes.data.message || 'Upload failed');
      }

      const photoURL = uploadRes.data.url;
      console.log('✅ Profile photo uploaded successfully:', photoURL);

      // Update backend
      await api.put('/auth/update', {
        profile_photo: photoURL // Match backend field name
      });

      console.log('✅ Profile photo URL saved to backend');

      // Update local state immediately
      setProfilePhoto(photoURL);

      // Refresh profile to get updated data from context
      await refreshProfile();

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Error uploading profile photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getUserTypeBadgeStyle = (type) => {
    if (type?.toLowerCase() === 'developer') {
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    }
    return 'bg-blue-50 text-blue-600 border border-blue-100';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-5 font-sans text-slate-800">
      <div className="max-w-[1000px] mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 items-start">
          {/* Left Column: Identity Card */}
          <div className="bg-white rounded-[20px] shadow-sm p-8 border border-slate-200 text-center sticky top-10">
            <div className="w-[120px] h-[120px] mx-auto mb-5 relative">
              {userData.profilePhoto ? (
                <img
                  src={userData.profilePhoto}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-slate-100 flex items-center justify-center text-slate-400">
                  <FiUser className="w-12 h-12" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-full">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
              <button 
                className="absolute bottom-0 right-0 bg-white border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-slate-700 cursor-pointer shadow-sm transition-all hover:bg-slate-50 hover:text-blue-500 hover:border-blue-500 hover:scale-105 hover:shadow-md z-10"
                onClick={handleChangePhoto}
                disabled={uploading}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">{userData.name}</h2>
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getUserTypeBadgeStyle(userData.userType)}`}>
                {userData.userType}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6">{userData.email}</p>

            <div className="flex flex-col gap-3">
              {userData.profilePhoto && (
                 <button 
                  className="w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all bg-transparent border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-red-500 hover:bg-red-50" 
                  onClick={handleRemovePhoto} 
                  disabled={uploading}
                >
                  Remove Photo
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Right Column: Details & Stats */}
          <div className="flex flex-col gap-6">
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activityItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
                  onClick={() => handleActivityClick(item.path)}
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-slate-900 leading-tight">{item.count}</span>
                    <span className="text-[13px] text-slate-500 font-medium">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Info */}
            <div className="bg-white rounded-[20px] shadow-sm p-8 border border-slate-200 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-4 border-b border-slate-100">Personal Information</h3>
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center py-1">
                  <div className="text-sm text-slate-500 font-medium">Phone</div>
                  <div className="text-sm font-semibold text-slate-800">{userData.phone || 'Not provided'}</div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <div className="text-sm text-slate-500 font-medium">User ID</div>
                  <div className="text-[13px] font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-800">{userData.userId}</div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <div className="text-sm text-slate-500 font-medium">Location</div>
                  <div className="text-sm font-semibold text-slate-800">{userData.location}</div> 
                </div>
                <div className="flex justify-between items-center py-1">
                  <div className="text-sm text-slate-500 font-medium">Member Since</div>
                  <div className="text-sm font-semibold text-slate-800">{formatDate(userData.createdAt)}</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
