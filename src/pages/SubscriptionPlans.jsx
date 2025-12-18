import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './SubscriptionPlans.css';

const plans = [
  {
    id: '1month',
    duration: '1 Month',
    price: 3000,
    features: ['Post unlimited properties', 'Featured listing for 7 days', 'Email support']
  },
  {
    id: '3months',
    duration: '3 Months',
    price: 8000,
    features: ['Post unlimited properties', 'Featured listing for 21 days', 'Priority email support', 'Save ₹1,000'],
    popular: true
  },
  {
    id: '6months',
    duration: '6 Months',
    price: 15000,
    features: ['Post unlimited properties', 'Featured listing for 45 days', 'Priority support', 'Save ₹3,000']
  },
  {
    id: '12months',
    duration: '12 Months',
    price: 25000,
    features: ['Post unlimited properties', 'Featured listing for 90 days', 'Dedicated support', 'Save ₹11,000'],
    bestValue: true
  }
];

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const calculateExpiryDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString();
  };

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      alert('Please login to subscribe');
      navigate('/login');
      return;
    }

    setSelectedPlan(plan.id);
    setLoading(true);

    try {
      // Calculate expiry date based on plan
      let months = 1;
      if (plan.id === '3months') months = 3;
      else if (plan.id === '6months') months = 6;
      else if (plan.id === '12months') months = 12;

      const expiryDate = calculateExpiryDate(months);

      // Update user subscription in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        is_subscribed: true,
        subscription_expiry: expiryDate,
        subscription_plan: plan.id,
        subscription_price: plan.price,
        subscribed_at: new Date().toISOString()
      });

      console.log('Subscription updated successfully');
      alert(`Successfully subscribed to ${plan.duration} plan!`);
      
      // Redirect to post property page
      navigate('/post-property');
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="subscription-page">
      <div className="subscription-container">
        <motion.div 
          className="subscription-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Choose Your Plan</h1>
          <p>Select a subscription plan to start posting properties</p>
        </motion.div>

        <div className="plans-grid">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.id} 
              className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.bestValue ? 'best-value' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              {plan.popular && <div className="badge">Most Popular</div>}
              {plan.bestValue && <div className="badge best">Best Value</div>}
              
              <div className="plan-header">
                <h3>{plan.duration}</h3>
                <div className="price">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price.toLocaleString()}</span>
                </div>
              </div>

              <ul className="features-list">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="select-button"
                onClick={() => handleSelectPlan(plan)}
                disabled={loading && selectedPlan === plan.id}
              >
                {loading && selectedPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner"></span>
                    Processing...
                  </span>
                ) : (
                  'Select Plan'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="subscription-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p>Note: This is a demo implementation. In production, integrate with a payment gateway.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
