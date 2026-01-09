import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiHash, FiBriefcase, FiHome, FiUsers, FiCalendar, FiUpload, FiTrash2, FiEdit2, FiTrendingUp } from 'react-icons/fi';
// import { doc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebase';
import api from '../services/api';
import './ProfilePage.css';

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
      icon: <FiHome className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.propertiesUploaded,
      path: '/my-properties',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Joined Live Groups',
      icon: <FiUsers className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.joinedLiveGroups,
      path: '/exhibition/live-grouping',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Booked Site Visits',
      icon: <FiCalendar className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.bookedSiteVisits,
      path: '/my-bookings',
      color: 'green'
    },
    {
      id: 4,
      title: 'Investments',
      icon: <FiTrendingUp className="activity-icon" />,
      count: loadingActivity ? '...' : activityCounts.investments,
      path: '/profile/investments',
      color: 'orange' // Reusing or adding a new color class if needed, checking css might be good but inline styles or existing classes work. ProfilePage.css likely has color classes.
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

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        <div className="profile-layout">
          {/* Left Column: Identity Card */}
          <div className="profile-identity-card">
            <div className="profile-photo-wrapper">
              {userData.profilePhoto ? (
                <img
                  src={userData.profilePhoto}
                  alt="Profile"
                  className="profile-photo"
                />
              ) : (
                <div className="profile-photo-placeholder">
                  <FiUser className="profile-photo-icon" />
                </div>
              )}
              {uploading && (
                <div className="photo-overlay">
                  <div className="spinner"></div>
                </div>
              )}
              <button 
                className="edit-photo-btn"
                onClick={handleChangePhoto}
                disabled={uploading}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#334155" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>

            <h2 className="profile-name">{userData.name}</h2>
            <div className="profile-role">
              <span className={`role-badge ${userData.userType.toLowerCase()}`}>
                {userData.userType}
              </span>
            </div>
            <p className="profile-email">{userData.email}</p>

            <div className="profile-actions">
              {userData.profilePhoto && (
                 <button className="action-btn outline" onClick={handleRemovePhoto} disabled={uploading}>
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
          <div className="profile-info-section">
            
            {/* Quick Stats Row */}
            <div className="stats-grid">
              {activityItems.map((item) => (
                <div 
                  key={item.id} 
                  className="stat-card"
                  onClick={() => handleActivityClick(item.path)}
                >
                  <div className="stat-icon">{item.icon}</div>
                  <div className="stat-info">
                    <span className="stat-value">{item.count}</span>
                    <span className="stat-label">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Info */}
            <div className="info-card">
              <h3 className="section-title">Personal Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <div className="info-label">Phone</div>
                  <div className="info-value">{userData.phone || 'Not provided'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">User ID</div>
                  <div className="info-value mono">{userData.userId}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Location</div>
                  <div className="info-value">{userData.location}</div> 
                </div>
                <div className="info-item">
                  <div className="info-label">Member Since</div>
                  <div className="info-value">{formatDate(userData.createdAt)}</div>
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
