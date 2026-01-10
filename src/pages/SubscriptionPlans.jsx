import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SubscriptionService from '../services/subscriptionService';
// import './SubscriptionPlans.css'; // Removed to prevent conflicts with Tailwind redesign

/* ---------- BASE PLANS (Individual) ---------- */
const individualPlans = [
  {
    id: '1month',
    duration: '1 Month',
    price: 100,
    features: ['Post 1 property', 'Featured listing for 1 month', 'Email support']
  },
  {
    id: '3months',
    duration: '6 Months',
    price: 400,
    features: ['Post 1 property', 'Featured listing for 6 month', 'Email support'],
    popular: true
  },
  {
    id: '6months',
    duration: '1 Year',
    price: 700,
    features: ['Post 1 property', 'Featured listing for 1 year', 'Email support']
  }
];

/* ---------- DEVELOPER / BUILDER PLAN (ONLY ONE PLAN) ---------- */
const developerPlan = [
  {
    id: '12months',
    duration: '12 month',
    price: 20000,
    features: [
      'Post 20 property',
      'Featured listing for 1 year',
      'Email support'
    ],
    bestValue: true
  }
];

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Get user role from navigation state or user profile
  const locationState = window.history.state?.usr;
  const userRole = locationState?.userType || userProfile?.user_type || 'individual';

  /* ---------- LOAD RAZORPAY ---------- */
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          console.log('✅ Razorpay script loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay script');
          resolve(false);
        };
        document.head.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  const plans = userRole === 'developer' ? developerPlan : individualPlans;

  const handleRazorpayPayment = async (plan) => {
    if (!window.Razorpay) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return false;
    }

    const amount = plan.price;
    const currency = 'INR';

    let months = 1;
    if (plan.id === '3months') months = 6;
    else if (plan.id === '6months') months = 12;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: currency,
      name: 'Bada Builder',
      description: `Property Listing Subscription Plan - ${plan.duration}`,
      image: '/logo.png',
      order_id: '',
      handler: async function (response) {
        console.log('✅ Payment successful:', response);

        try {
          const subscriptionId = await SubscriptionService.createSubscription(currentUser.uid, {
            plan_id: plan.id,
            plan_name: plan.duration,
            amount: amount,
            currency: currency,
            duration_months: months,
            payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || '',
            razorpay_signature: response.razorpay_signature || '',
            user_role: userRole
          });
          
          console.log('✅ Subscription activated successfully:', subscriptionId);
          setPaymentLoading(false);
          setTimeout(() => {
            navigate('/post-property');
          }, 500);

        } catch (error) {
          console.error('Error saving payment/subscription:', error);
          alert('Payment successful but subscription activation failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
          setPaymentLoading(false);
        }
      },
      prefill: {
        name: userProfile?.name || currentUser?.displayName || '',
        email: userProfile?.email || currentUser?.email || '',
        contact: userProfile?.phone || currentUser?.phoneNumber || ''
      },
      notes: {
        plan_id: plan.id,
        plan_name: plan.duration,
        plan_price: plan.price,
        user_id: currentUser.uid,
        user_role: userRole,
        subscription_type: 'property_listing'
      },
      theme: { color: '#58335e' },
      modal: {
        ondismiss: function () {
          console.log('Payment cancelled by user');
          setPaymentLoading(false);
          setSelectedPlan(null);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    return true;
  };

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      alert('Please login to subscribe');
      navigate('/login');
      return;
    }

    if (!razorpayLoaded) {
      alert('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setSelectedPlan(plan.id);
    setPaymentLoading(true);

    const paymentSuccess = await handleRazorpayPayment(plan);
    if (!paymentSuccess) {
      setPaymentLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="subscription-section bg-[#050505]! text-white! py-16 md:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[800px] flex items-center">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[150px] opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(88,51,94,0.05)_0%,transparent_70%)]"></div>
      </div>

      <div className="subscription-container max-w-[1400px] mx-auto relative z-10 w-full">
        <motion.div
          className="subscription-header text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] uppercase text-purple-300 mb-8">
            Premium Access
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white! mb-8 tracking-tighter">
            Scale Your <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-400">Reach</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            {userRole === 'developer'
              ? 'Developer/Builder subscription plan for property listings'
              : 'Select a premium plan to showcase your properties to thousands of verified investors.'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative group p-8 rounded-[32px] border transition-all duration-500 flex flex-col h-full
                ${plan.popular 
                  ? 'bg-white/10 border-purple-500/50 shadow-[0_20px_50px_-10px_rgba(168,85,247,0.2)] ring-1 ring-purple-500/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-white/20'}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              {plan.bestValue && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                  Best Value
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-white font-bold opacity-60 uppercase tracking-[0.2em] text-[10px] mb-4">{plan.duration}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-2xl font-bold">₹</span>
                  <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">{plan.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-px w-full bg-white/10 mb-8"></div>

              <ul className="space-y-5 mb-10 grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5 shrink-0">
                      <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-light leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 active:scale-[0.98]
                  ${plan.popular 
                    ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
                onClick={() => handleSelectPlan(plan)}
                disabled={paymentLoading || !razorpayLoaded}
              >
                {paymentLoading && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : !razorpayLoaded ? (
                  'Loading...'
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16 p-6 rounded-2xl bg-white/5 border border-white/5 inline-block mx-auto relative left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
            <span className="text-emerald-500 text-base">🔒</span>
            Secure payment powered by Razorpay. Immediate activation.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;