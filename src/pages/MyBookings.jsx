// src/pages/MyBookings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '../firebase';
import api from '../services/api';
import { formatDate } from '../utils/dateFormatter';
// import './MyBookings.css'; // Removed and replaced with Tailwind

const MyBookings = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [allBookingsCount, setAllBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Auth state:', { isAuthenticated, currentUser: currentUser?.uid });
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching bookings for user:', currentUser.uid);
        
        const response = await api.get('/bookings/my');
        const allBookings = response.data || [];
        
        // ... filtering and sorting ...
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activeBookings = allBookings.filter(booking => {
          if (booking.visit_date) {
            const visitDate = new Date(booking.visit_date);
            visitDate.setHours(0, 0, 0, 0);
            return visitDate >= today;
          }
          return true;
        });

        activeBookings.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return dateB - dateA;
        });

        console.log('✅ Active bookings loaded:', activeBookings.length);
        setBookings(activeBookings);
        setAllBookingsCount(allBookings.length);
      } catch (error) {
        console.error('❌ Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.uid) {
      console.log('✅ User authenticated, fetching bookings');
      fetchBookings();
    }
  }, [currentUser, isAuthenticated, navigate]);

  const formatDateDisplay = (dateString) => {
    return formatDate(dateString);
  };

  // const getStatusBadgeClass = (status) => { ... } // Removed unused function

  const getPaymentStatusBadge = (paymentStatus, paymentMethod) => {
    if (paymentStatus === 'completed') {
      return <span className="payment-badge paid">✓ Paid</span>;
    }
    if (paymentMethod === 'previsit') {
      return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm bg-linear-to-br from-green-500 to-green-700 text-white">✓ Pre-Paid</span>;
    }
    return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm bg-linear-to-br from-indigo-500 to-indigo-700 text-white">⏳ Pay After Visit</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#667eea] to-[#764ba2] pt-[100px] pb-[60px] px-5">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-[50px] h-[50px] border-4 border-slate-100 border-t-[#58335e] rounded-full animate-spin mb-5"></div>
          <p className="text-base text-gray-100 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#667eea] to-[#764ba2] pt-[100px] pb-[60px] px-5">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-[30px] text-center">
          <div className="mb-2">
            <h1 className="text-[42px] font-bold text-white mb-2 shadow-sm drop-shadow-md">📅 My Booked Site Visits</h1>
            <p className="text-base text-white/90">View all your scheduled property site visits</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-2 transition-all duration-300 border-2 border-white/30 hover:-translate-y-1 hover:shadow-xl">
            <span className="text-[13px] text-gray-500 font-semibold uppercase tracking-wide">Active Bookings</span>
            <span className="text-4xl font-extrabold bg-linear-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">{bookings.length}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-2 transition-all duration-300 border-2 border-white/30 hover:-translate-y-1 hover:shadow-xl">
            <span className="text-[13px] text-gray-500 font-semibold uppercase tracking-wide">Past Bookings</span>
            <span className="text-4xl font-extrabold bg-linear-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              {allBookingsCount - bookings.length}
            </span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-2 transition-all duration-300 border-2 border-white/30 hover:-translate-y-1 hover:shadow-xl">
            <span className="text-[13px] text-gray-500 font-semibold uppercase tracking-wide">Today's Bookings</span>
            <span className="text-4xl font-extrabold bg-linear-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              {bookings.filter(b => {
                if (!b.visit_date) return false;
                const visitDate = new Date(b.visit_date);
                const today = new Date();
                visitDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                return visitDate.getTime() === today.getTime();
              }).length}
            </span>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-20 px-5 bg-white rounded-2xl shadow-sm">
            <div className="text-[80px] mb-5">📅</div>
            <h3 className="text-[28px] font-bold text-neutral-900 mb-3">No Bookings Yet</h3>
            <p className="text-base text-gray-500 mb-[30px]">You haven't booked any site visits yet. Start exploring properties!</p>
            <button
              className="bg-linear-to-br from-[#58335e] to-[#6d4575] text-white py-3.5 px-8 border-none rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(88,51,94,0.3)]"
              onClick={() => navigate('/exhibition')}
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 border border-white/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)] hover:-translate-y-1.5">
                {/* Property Info */}
                <div className="flex justify-between items-start p-4 px-5 bg-linear-to-br from-[#667eea] to-[#764ba2] gap-4 sm:flex-col sm:items-start">
                  <div className="text-white">
                    <h3 className="text-lg font-bold text-white mb-1.5 sm:text-lg">{booking.property_title || 'Property Visit'}</h3>
                    {booking.property_location && (
                      <p className="text-[13px] text-white/90 flex items-center gap-1">📍 {booking.property_location}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end sm:flex-row sm:items-start">
                    {getPaymentStatusBadge(booking.payment_status, booking.payment_method)}
                  </div>
                </div>

                {/* Visit Details */}
                <div className="p-4 px-5 flex flex-col gap-3 sm:p-4">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 sm:grid-cols-1">
                    <div className="flex items-center gap-2.5 p-3 bg-linear-to-br from-indigo-50 to-blue-50 rounded-[10px] border-2 border-indigo-100 transition-all duration-300 hover:border-[#667eea] hover:translate-x-1 sm:p-3">
                      <span className="text-[22px] shrink-0">📅</span>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Visit Date</span>
                        <span className="text-[14px] text-neutral-900 font-bold">{formatDate(booking.visit_date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 bg-linear-to-br from-indigo-50 to-blue-50 rounded-[10px] border-2 border-indigo-100 transition-all duration-300 hover:border-[#667eea] hover:translate-x-1 sm:p-3">
                      <span className="text-[22px] shrink-0">🕐</span>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Visit Time</span>
                        <span className="text-[14px] text-neutral-900 font-bold">{booking.visit_time || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 sm:grid-cols-1">
                    <div className="flex items-center gap-2.5 p-3 bg-linear-to-br from-indigo-50 to-blue-50 rounded-[10px] border-2 border-indigo-100 transition-all duration-300 hover:border-[#667eea] hover:translate-x-1 sm:p-3">
                      <span className="text-[22px] shrink-0">👥</span>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Number of Visitors</span>
                        <span className="text-[14px] text-neutral-900 font-bold">{booking.number_of_people || 1} Person(s)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 bg-linear-to-br from-indigo-50 to-blue-50 rounded-[10px] border-2 border-indigo-100 transition-all duration-300 hover:border-[#667eea] hover:translate-x-1 sm:p-3">
                      <span className="text-[22px] shrink-0">💳</span>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Payment Type</span>
                        <span className="text-[14px] text-neutral-900 font-bold">
                          {booking.payment_method === 'previsit' ? 'Pre-Visit' : 'Post-Visit'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visitors Names */}
                  <div className="p-3.5 bg-white rounded-[10px] border-2 border-indigo-100 shadow-[0_2px_8px_rgba(102,126,234,0.1)]">
                    <span className="text-[12px] font-bold text-[#667eea] flex items-center gap-1.5 mb-2.5 uppercase tracking-wide">👤 Visitor Names:</span>
                    <div className="flex flex-wrap gap-2">
                      {booking.person1_name && (
                        <span className="text-[13px] text-neutral-900 font-semibold px-3.5 py-2 bg-linear-to-br from-indigo-50 to-indigo-100 rounded-[18px] inline-flex items-center border-2 border-indigo-200 transition-all duration-300 hover:bg-linear-to-br hover:from-[#667eea] hover:to-[#764ba2] hover:text-white hover:border-[#667eea] hover:scale-105">1. {booking.person1_name}</span>
                      )}
                      {booking.person2_name && (
                        <span className="text-[13px] text-neutral-900 font-semibold px-3.5 py-2 bg-linear-to-br from-indigo-50 to-indigo-100 rounded-[18px] inline-flex items-center border-2 border-indigo-200 transition-all duration-300 hover:bg-linear-to-br hover:from-[#667eea] hover:to-[#764ba2] hover:text-white hover:border-[#667eea] hover:scale-105">2. {booking.person2_name}</span>
                      )}
                      {booking.person3_name && (
                        <span className="text-[13px] text-neutral-900 font-semibold px-3.5 py-2 bg-linear-to-br from-indigo-50 to-indigo-100 rounded-[18px] inline-flex items-center border-2 border-indigo-200 transition-all duration-300 hover:bg-linear-to-br hover:from-[#667eea] hover:to-[#764ba2] hover:text-white hover:border-[#667eea] hover:scale-105">3. {booking.person3_name}</span>
                      )}
                    </div>
                  </div>

                  {/* Pickup Address */}
                  <div className="p-3.5 bg-white rounded-[10px] border-2 border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.1)]">
                    <span className="text-[12px] font-bold text-emerald-500 mb-2 block uppercase tracking-wide">📍 Pickup Address:</span>
                    <p className="text-[13px] text-neutral-900 font-medium leading-relaxed p-2.5 px-3.5 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200">{booking.pickup_address || 'N/A'}</p>
                  </div>

                  {/* Booking Info */}
                  <div className="flex justify-between items-center pt-3 mt-1.5 border-t-2 border-gray-100 text-[11px] text-gray-500 sm:flex-col sm:items-start sm:gap-2">
                    <span className="font-bold text-[#667eea] bg-linear-to-br from-indigo-50 to-indigo-100 px-2.5 py-1.5 rounded-md text-[10px] tracking-wide">Booking ID: {booking.id}</span>
                    <span className="font-semibold text-gray-500 text-[11px]">
                      Booked on: {formatDateDisplay(booking.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
