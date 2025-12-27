import api from './api';

const SubscriptionService = {
  
  createSubscription: async (userId, data) => {
    try {
      // Direct call to backend API
      const response = await api.post('/subscriptions', data);
      return response.data.subscriptionId;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  getMySubscription: async () => {
      try {
          const response = await api.get('/subscriptions/me');
          return response.data.subscription;
      } catch (error) {
          console.error('Error fetching subscription:', error);
          return null;
      }
  },

  checkPropertyPostingSubscription: async (userId) => {
      // Logic checked nicely in backend now
      // We can just hit an endpoint like /properties/check-eligibility or rely on /subscriptions/me
      try {
          const response = await api.get('/subscriptions/me');
          const sub = response.data.subscription;
          
          if (!sub || sub.status !== 'active') {
              return { hasSubscription: false, reason: 'No active subscription' };
          }
          
          // Check expiry
          if (new Date(sub.expires_at) <= new Date()) {
               return { hasSubscription: false, reason: 'Subscription expired' };
          }

          return { hasSubscription: true, subscription: sub };

      } catch (error) {
           console.error('Error checking subscription', error);
           return { hasSubscription: false, reason: 'Error checking subscription' };
      }
  }
};

export default SubscriptionService;