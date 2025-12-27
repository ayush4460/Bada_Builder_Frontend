import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiHash, FiBriefcase, FiHome, FiUsers, FiCalendar, FiUpload, FiTrash2, FiEdit3, FiTrendingUp } from 'react-icons/fi';
// import { doc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebase';
import api from '../services/api';
import './ProfilePage.css';

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dooamkdih";
const CLOUDINARY_UPLOAD_PRESET = "property_images";

/**
 * Uploads an image file to Cloudinary using an unsigned preset.
 * @param {File} file The image file to upload.
 * @returns {Promise<string>} A promise that resolves to the secure URL of the uploaded image.
 */
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

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

  // Placeholder data - will be replaced with actual Firebase data
  const userData = {
    name: userProfile?.name || 'John Doe',
    email: currentUser?.email || 'john.doe@example.com',
    phone: userProfile?.phone || '+91 9876543210',
    userId: currentUser?.uid?.substring(0, 8).toUpperCase() || 'USER1234',
    userType: userProfile?.userType || '',
    profilePhoto: profilePhoto
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
        profilePhoto: null
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

      console.log('📸 Uploading profile photo to Cloudinary...');

      // Upload to Cloudinary
      const photoURL = await uploadToCloudinary(file);

      console.log('✅ Profile photo uploaded successfully:', photoURL);

      // Update backend
      await api.put('/auth/update', {
        profilePhoto: photoURL
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

      let errorMessage = 'Failed to upload photo. ';
      if (error.message.includes('Cloudinary')) {
        errorMessage += 'Image upload service is temporarily unavailable. Please try again later.';
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }

      alert(errorMessage);
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
        {/* Page Header */}
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">View your account information and activity</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-content">
            {/* Profile Photo */}
            <div className="profile-photo-section">
              <div className="profile-photo-container">
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
                      <div className="photo-uploading">
                        <div className="spinner"></div>
                        <span>Processing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Action Buttons */}
                <div className="photo-action-buttons">
                  <button
                    className="photo-action-btn change-photo"
                    onClick={handleChangePhoto}
                    disabled={uploading}
                  >
                    <FiEdit3 className="action-icon" />
                    <span>Change Photo</span>
                  </button>
                  {userData.profilePhoto && (
                    <button
                      className="photo-action-btn remove-photo"
                      onClick={handleRemovePhoto}
                      disabled={uploading}
                    >
                      <FiTrash2 className="action-icon" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              {uploadSuccess && (
                <div className="upload-success">
                  <FiUpload className="success-icon" />
                  Photo updated successfully!
                </div>
              )}
              <div className="profile-name-mobile">
                <h2>{userData.name}</h2>
                <span className={`user-type-badge ${userData.userType.toLowerCase()}`}>
                  {userData.userType}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="profile-details">
              <div className="profile-name-desktop">
                <h2>{userData.name}</h2>
                <span className={`user-type-badge ${userData.userType.toLowerCase()}`}>
                  {userData.userType}
                </span>
              </div>

              <div className="details-grid">
                {/* Email */}
                <div className="detail-item">
                  <div className="detail-icon-wrapper email">
                    <FiMail className="detail-icon" />
                  </div>
                  <div className="detail-content">
                    <p className="detail-label">Email Address</p>
                    <p className="detail-value">{userData.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="detail-item">
                  <div className="detail-icon-wrapper phone">
                    <FiPhone className="detail-icon" />
                  </div>
                  <div className="detail-content">
                    <p className="detail-label">Phone Number</p>
                    <p className="detail-value">{userData.phone}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="detail-item">
                  <div className="detail-icon-wrapper userid">
                    <FiHash className="detail-icon" />
                  </div>
                  <div className="detail-content">
                    <p className="detail-label">User ID</p>
                    <p className="detail-value user-id">{userData.userId}</p>
                  </div>
                </div>

                {/* User Type */}
                <div className="detail-item">
                  <div className="detail-icon-wrapper usertype">
                    <FiBriefcase className="detail-icon" />
                  </div>
                  <div className="detail-content">
                    <p className="detail-label">Account Type</p>
                    <p className="detail-value">{userData.userType} Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="activity-section">
          <div className="activity-header">
            <h2 className="activity-title">Activity Overview</h2>
            <p className="activity-subtitle">Track your engagement and contributions</p>
            {loadingActivity && (
              <div className="activity-loading">
                <div className="spinner-small"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>

          <div className="activity-grid">
            {activityItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleActivityClick(item.path)}
                className={`activity-card ${item.color}`}
              >
                <div className="activity-icon-wrapper">
                  {item.icon}
                </div>
                <h3 className="activity-card-title">{item.title}</h3>
                <p className="activity-count">{item.count}</p>
                <div className="activity-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
