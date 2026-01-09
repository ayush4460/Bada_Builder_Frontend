import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { collection, query, where, getDocs, doc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebase';
import api from '../services/api';
import SubscriptionService from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';
import ViewToggle from '../components/ViewToggle/ViewToggle';
import useViewPreference from '../hooks/useViewPreference';
import { FiEdit2, FiEye, FiTrash2, FiClock, FiMapPin, FiHome, FiCalendar } from 'react-icons/fi';
import { formatDate } from '../utils/dateFormatter';

const MyProperties = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useViewPreference();

  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'developer'

  // Initial data fetch
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchProperties();
    fetchSubscriptionData();
  }, [currentUser, navigate]);



  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Fetch user's properties from backend
      const response = await api.get('/properties/user/me');
      const propertiesData = response.data || [];

      // Sort by created_at (newest first)
      propertiesData.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });

      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // alert('Failed to load properties. Please try again.'); // Silent fail is better sometimes, or specific error UI
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      const subscription = await SubscriptionService.getMySubscription();
      if (subscription) {
        setSubscriptionExpiry(subscription.expires_at || subscription.subscription_expiry);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    }
  };



  const getSubscriptionTimeRemaining = (property) => {
    // Use property's own subscription expiry if available
    const expiryDate = property.subscription_expiry ? new Date(property.subscription_expiry) : (subscriptionExpiry ? new Date(subscriptionExpiry) : null);

    if (!expiryDate) {
      return { expired: false, text: 'Active', daysLeft: null };
    }

    const now = new Date();
    const diffMs = expiryDate - now;

    if (diffMs <= 0) {
      return { expired: true, text: 'Subscription expired', daysLeft: 0 };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return {
        expired: false,
        text: `${months}mo ${remainingDays}d left`,
        daysLeft: diffDays,
        urgent: false
      };
    } else if (diffDays > 7) {
      return {
        expired: false,
        text: `${diffDays} days left`,
        daysLeft: diffDays,
        urgent: false
      };
    } else if (diffDays > 0) {
      return {
        expired: false,
        text: `${diffDays}d ${diffHours}h left`,
        daysLeft: diffDays,
        urgent: true
      };
    } else {
      return {
        expired: false,
        text: `${diffHours}h left`,
        daysLeft: 0,
        urgent: true
      };
    }
  };

  const isEditable = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();
    return now < threeDaysLater;
  };

  const getTimeRemaining = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();

    const diffMs = threeDaysLater - now;

    if (diffMs <= 0) {
      return { expired: true, text: 'Edit period expired' };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return {
        expired: false,
        text: `${diffDays}d ${diffHours}h left`,
        urgent: diffDays === 0
      };
    } else if (diffHours > 0) {
      return {
        expired: false,
        text: `${diffHours}h ${diffMinutes}m left`,
        urgent: true
      };
    } else {
      return {
        expired: false,
        text: `${diffMinutes}m left`,
        urgent: true
      };
    }
  };

  const handleView = (property) => {
    navigate(`/property-details/${property.id}`, {
      state: { property, type: property.user_type }
    });
  };

  const handleEdit = (property) => {
    if (!isEditable(property.created_at)) {
      alert('⏰ Edit period has expired!\n\nThis property was posted more than 3 days ago and can no longer be edited.');
      return;
    }
    navigate('/post-property', {
      state: {
        userType: property.user_type,
        editProperty: property
      }
    });
  };

  const handleDelete = async (property) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${property.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/properties/${property.id}`);
      alert('✅ Property deleted successfully!');
      // Refresh the list
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('❌ Failed to delete property. Please try again.');
    }
  };

  // Separate properties by user type
  const individualProperties = properties.filter(p => !p.user_type || p.user_type === 'individual');
  const developerProperties = properties.filter(p => p.user_type === 'developer');

  const renderPropertyCard = (property) => {
    const timeRemaining = getTimeRemaining(property.created_at);
    const editable = isEditable(property.created_at);
    const subscriptionTime = getSubscriptionTimeRemaining(property);

    return (
      <div
        key={property.id}
        className={`bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden ${
            view === 'list' 
            ? 'rounded-xl flex flex-row min-h-[100px] max-h-[120px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]' 
            : 'rounded-2xl flex flex-col hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]'
        } ${!editable ? 'opacity-75 bg-linear-to-br from-[#fafafa] to-[#f5f5f5]' : ''} ${subscriptionTime.expired ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {/* Property Image */}
        <div className={`relative overflow-hidden shrink-0 ${
            view === 'list' 
            ? 'w-[150px] min-w-[150px] h-full sm:w-[110px] sm:min-w-[110px] xs:w-[90px] xs:min-w-[90px]' 
            : 'w-full h-[240px] sm:h-[200px]'
        }`}>
          <img
            src={property.image_url || '/placeholder-property.jpg'}
            alt={property.title}
            onError={(e) => {
              e.target.src = '/placeholder-property.jpg';
            }}
            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${!editable ? 'grayscale-30' : ''} ${subscriptionTime.expired ? 'grayscale' : ''}`}
          />
          <div className={`absolute top-3 left-3 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase backdrop-blur-md ${
            property.status === 'active' || !property.status ? 'bg-emerald-500/90 text-white' :
            property.status === 'pending' ? 'bg-amber-500/90 text-white' :
            property.status === 'expired' ? 'bg-red-500/90 text-white' : 'bg-gray-500/90 text-white'
          }`}>
            {property.status === 'expired' ? 'Expired' : property.status || 'Active'}
          </div>
          {subscriptionTime.expired && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-lg font-bold uppercase tracking-widest">
              <span>Subscription Expired</span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className={`${
            view === 'list' 
            ? 'p-3 px-4 flex flex-row items-center gap-3 flex-1 overflow-hidden sm:p-2.5 sm:gap-2.5 sm:flex-nowrap sm:overflow-x-auto sm:overflow-y-hidden sm:scrollbar-thin sm:scrollbar-thumb-slate-300 sm:scrollbar-track-transparent xs:p-2 xs:gap-2' 
            : 'p-5 flex flex-col gap-3'
        }`}>
          <h3 className={`font-bold text-[#1a1a1a] m-0 leading-[1.3] overflow-hidden ${
              view === 'list'
              ? 'text-[15px] min-w-[150px] max-w-[200px] line-clamp-1 shrink-0 sm:text-sm sm:min-w-[120px] sm:max-w-[150px] xs:text-[13px] xs:min-w-[100px] xs:max-w-[120px]'
              : 'text-xl line-clamp-2 md:text-base'
          }`}>{property.title}</h3>

          <div className={`flex items-center flex-wrap ${
              view === 'list'
              ? 'gap-2 min-w-[150px] flex-nowrap shrink-0 sm:gap-1.5 sm:min-w-[120px] xs:min-w-[100px]'
              : 'gap-3'
          }`}>
            <span className={`flex items-center gap-1 text-gray-500 ${view === 'list' ? 'text-[11px] whitespace-nowrap shrink-0 sm:text-[11px] xs:text-[10px]' : 'text-sm'}`}>
              <FiMapPin className={view === 'list' ? 'w-3.5 h-3.5 sm:w-3 sm:h-3 xs:w-2.5 xs:h-2.5' : 'w-3.5 h-3.5'} /> {property.location}
            </span>
            {property.bhk && (
              <span className={`flex items-center gap-1 text-gray-500 ${view === 'list' ? 'text-[11px] whitespace-nowrap shrink-0 sm:text-[11px] xs:text-[10px]' : 'text-sm'}`}>
                <FiHome className={view === 'list' ? 'w-3.5 h-3.5 sm:w-3 sm:h-3 xs:w-2.5 xs:h-2.5' : 'w-3.5 h-3.5'} /> {property.bhk}
              </span>
            )}
            <span className={`bg-indigo-50 text-blue-800 font-semibold rounded-md ${
                view === 'list' 
                ? 'px-2 py-0.5 text-[10px] whitespace-nowrap shrink-0' 
                : 'px-2.5 py-1 text-sm'
            }`}>
              {property.type}
            </span>
          </div>

          <div className={`font-extrabold text-[#58335e] ${
              view === 'list'
              ? 'text-base m-0 min-w-[100px] text-right shrink-0 sm:text-[15px] sm:min-w-[90px] xs:text-sm xs:min-w-[80px]'
              : 'text-2xl my-1 md:text-lg'
          }`}>{property.price}</div>

          <div className={`flex justify-between items-center text-[13px] text-gray-500 ${view === 'list' ? 'hidden' : ''}`}>
            <span className="font-medium">
              Posted: {formatDate(property.created_at)}
            </span>
          </div>

          {/* Subscription Timeline */}
          <div className={`flex items-center gap-1.5 rounded-lg font-semibold ${
              view === 'list'
              ? 'px-2 py-1 text-[10px] m-0 min-w-[100px] whitespace-nowrap shrink-0 sm:px-1.5 sm:py-1.5 sm:text-[11px] sm:min-w-[100px] xs:px-1 xs:py-1.5 xs:text-[10px] xs:min-w-[90px]'
              : 'px-3 py-2 text-[13px] my-2'
          } ${
              subscriptionTime.expired 
              ? 'bg-linear-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-500' 
              : subscriptionTime.urgent 
              ? 'bg-linear-to-br from-amber-100 to-amber-200 text-amber-800 border-2 border-amber-500 animate-pulse'
              : 'bg-linear-to-br from-indigo-100 to-indigo-200 text-indigo-800 border-2 border-indigo-500'
          }`}>
            <FiCalendar className={view === 'list' ? 'w-3 h-3 shrink-0 sm:w-3 sm:h-3 xs:w-2.5 xs:h-2.5' : 'w-3.5 h-3.5 shrink-0'} />
            <span className={view === 'list' ? 'hidden' : 'text-[11px] opacity-80 font-medium'}>Listing Active:</span>
            <span>{subscriptionTime.text}</span>
          </div>

          {/* Edit Timer */}
          <div className={`flex items-center gap-1.5 rounded-lg font-semibold ${
              view === 'list'
              ? 'px-2 py-1 text-[10px] m-0 min-w-[100px] whitespace-nowrap shrink-0 sm:px-1.5 sm:py-1.5 sm:text-[11px] sm:min-w-[100px] xs:px-1 xs:py-1.5 xs:text-[10px] xs:min-w-[90px]'
              : 'px-3 py-2 text-[13px] my-2'
          } ${
              timeRemaining.expired
              ? 'bg-linear-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-500'
              : timeRemaining.urgent
              ? 'bg-linear-to-br from-amber-100 to-amber-200 text-amber-800 border-2 border-amber-500 animate-pulse'
              : 'bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-2 border-emerald-500'
          }`}>
            <FiClock className={view === 'list' ? 'w-3 h-3 shrink-0 sm:w-3 sm:h-3 xs:w-2.5 xs:h-2.5' : 'w-3.5 h-3.5 shrink-0'} />
            <span className={view === 'list' ? 'hidden' : 'text-[11px] opacity-80 font-medium'}>Edit Window:</span>
            <span>{timeRemaining.text}</span>
          </div>

          {/* Action Buttons */}
        <div className={`flex gap-2 ${
            view === 'list'
            ? 'm-0 shrink-0 sm:gap-1.5 xs:gap-1.5 sm:flex-nowrap'
            : 'mt-auto flex-wrap'
        }`}>
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 bg-linear-to-br from-[#667eea] to-[#764ba2] text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.4)] ${
                  view === 'list' 
                  ? 'px-2.5 py-1.5 text-[11px] min-w-[70px] sm:px-3 sm:py-2 sm:text-[11px] sm:min-w-[70px] xs:px-3 xs:py-2 xs:text-[11px] xs:min-w-[70px]' 
                  : 'px-4 py-2.5 text-sm'
              }`}
              onClick={() => handleView(property)}
              title="View Property"
            >
              <FiEye className={view === 'list' ? 'w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 xs:w-3.5 xs:h-3.5' : 'w-4 h-4'} /> {view === 'list' ? 'View' : 'View'}
            </button>

            {editable ? (
              <button
                className={`flex-1 flex items-center justify-center gap-1.5 border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 bg-linear-to-br from-emerald-500 to-emerald-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] ${
                    view === 'list' 
                    ? 'px-2.5 py-1.5 text-[11px] min-w-[70px] sm:px-3 sm:py-2 sm:text-[11px] sm:min-w-[70px] xs:px-3 xs:py-2 xs:text-[11px] xs:min-w-[70px]' 
                    : 'px-4 py-2.5 text-sm'
                }`}
                onClick={() => handleEdit(property)}
                title="Edit Property"
              >
                <FiEdit2 className={view === 'list' ? 'w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 xs:w-3.5 xs:h-3.5' : 'w-4 h-4'} /> {view === 'list' ? 'Edit' : 'Edit'}
              </button>
            ) : (
              <button
                className={`flex-1 flex items-center justify-center gap-1.5 border-none rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed opacity-60 ${
                    view === 'list' 
                    ? 'px-2.5 py-1.5 text-[11px] min-w-[70px] sm:px-3 sm:py-2 sm:text-[11px] sm:min-w-[70px] xs:px-3 xs:py-2 xs:text-[11px] xs:min-w-[70px]' 
                    : 'px-4 py-2.5 text-sm'
                }`}
                disabled
                title="Edit period expired"
              >
                <FiEdit2 className={view === 'list' ? 'w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 xs:w-3.5 xs:h-3.5' : 'w-4 h-4'} /> {view === 'list' ? 'Locked' : 'Locked'}
              </button>
            )}

            <button
              className={`flex-1 flex items-center justify-center gap-1.5 border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 bg-linear-to-br from-red-500 to-red-600 text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)] ${
                  view === 'list' 
                  ? 'px-2.5 py-1.5 text-[11px] min-w-[70px] sm:px-3 sm:py-2 sm:text-[11px] sm:min-w-[70px] xs:px-3 xs:py-2 xs:text-[11px] xs:min-w-[70px]' 
                  : 'px-4 py-2.5 text-sm'
              }`}
              onClick={() => handleDelete(property)}
              title="Delete Property"
            >
              <FiTrash2 className={view === 'list' ? 'w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 xs:w-3.5 xs:h-3.5' : 'w-4 h-4'} /> {view === 'list' ? 'Delete' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f9fafb] to-[#ffffff] pt-[100px] px-5 pb-[60px] sm:pt-[80px] sm:px-[15px] sm:pb-[40px]">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div
          className="flex justify-between items-end mb-[50px] pb-6 border-b border-gray-200 flex-wrap gap-6 sm:flex-col sm:items-center sm:text-center sm:gap-5 sm:mb-[30px] sm:pb-5"
        >
          <div className="flex-1 min-w-[320px] sm:min-w-full">
            <h1 className="text-[3.5rem] font-extrabold m-0 tracking-tighter bg-linear-to-br from-[#1a1a1a] to-[#58335e] bg-clip-text text-transparent leading-none sm:text-[2rem] sm:mb-2.5 xs:text-[1.8rem]">My Properties</h1>
            <p className="text-[1.15rem] text-gray-700 mt-3 font-medium max-w-[600px] leading-relaxed sm:text-[0.95rem] sm:m-0 sm:mx-auto sm:max-w-full">Manage all your property listings in one place</p>
          </div>
          {!loading && properties.length > 0 && (
            <ViewToggle view={view} onViewChange={setView} />
          )}
        </div>

        {/* Stats Bar */}
        {!loading && properties.length > 0 && (
          <div
            className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-10"
          >
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-2">
              <span className="text-sm text-[#666] font-medium">Total Properties</span>
              <span className="text-[32px] font-bold text-[#58335e]">{properties.length}</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-2">
              <span className="text-sm text-[#666] font-medium">Editable</span>
              <span className="text-[32px] font-bold text-[#58335e]">
                {properties.filter(p => isEditable(p.created_at)).length}
              </span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-2">
              <span className="text-sm text-[#666] font-medium">Locked</span>
              <span className="text-[32px] font-bold text-[#58335e]">
                {properties.filter(p => !isEditable(p.created_at)).length}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            className="flex flex-col items-center justify-center py-20 px-5 text-center"
          >
            <div className="w-[50px] h-[50px] border-4 border-gray-100 border-t-[#58335e] rounded-full animate-spin mb-5"></div>
            <p className="text-base text-[#666] font-medium">Loading your properties...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div
            className="text-center py-20 px-5 bg-white rounded-2xl shadow-lg"
          >
            <div className="text-[80px] mb-5">🏠</div>
            <h3 className="text-[28px] font-bold text-[#1a1a1a] mb-3">No Properties Yet</h3>
            <p className="text-base text-[#666] mb-[30px]">You haven't posted any properties. Start by adding your first property!</p>
            <button
              className="bg-linear-to-br from-[#58335e] to-[#6d4575] text-white py-3.5 px-8 border-none rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(88,51,94,0.3)]"
              onClick={() => navigate('/post-property')}
            >
              + Add Your First Property
            </button>
          </div>
        )}

        {/* Tabs and Properties List */}
        {!loading && properties.length > 0 && (
          <div className="flex flex-col gap-8">
            {/* Type Tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-0.5 overflow-x-auto">
              <button
                className={`py-3 px-1 border-b-[3px] font-semibold text-base whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'individual' 
                    ? 'border-[#58335e] text-[#58335e]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('individual')}
              >
                Individual Properties
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === 'individual' 
                    ? 'bg-[#58335e] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>{individualProperties.length}</span>
              </button>
              <button
                className={`py-3 px-1 border-b-[3px] font-semibold text-base whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'developer' 
                    ? 'border-[#58335e] text-[#58335e]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('developer')}
              >
                Developer / Builder Properties
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === 'developer' 
                    ? 'bg-[#58335e] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>{developerProperties.length}</span>
              </button>
            </div>

            {/* Content Area */}
            <div>
              {activeTab === 'individual' && (
                <div>
                  {individualProperties.length > 0 ? (
                    <div className={view === 'list' ? 'flex flex-col gap-5' : 'grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-[30px] sm:grid-cols-1'}>
                      {individualProperties.map(renderPropertyCard)}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p>No properties uploaded as Individual</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'developer' && (
                <div>
                  {developerProperties.length > 0 ? (
                    <div className={view === 'list' ? 'flex flex-col gap-5' : 'grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-[30px] sm:grid-cols-1'}>
                      {developerProperties.map(renderPropertyCard)}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p>No properties uploaded as Developer / Builder</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;
