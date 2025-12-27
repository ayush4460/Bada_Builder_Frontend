// import { doc, updateDoc } from 'firebase/firestore';
// import { db } from '../firebase';
// import api from '../services/api';

/**
 * Check if a property's subscription has expired
 * @param {Object} property - Property object with subscription_expiry field
 * @returns {boolean} - True if expired, false otherwise
 */
export const isPropertyExpired = (property) => {
  if (!property.subscription_expiry) {
    return false; // No expiry date means it's active
  }

  const expiryDate = new Date(property.subscription_expiry);
  const now = new Date();
  
  return now > expiryDate;
};

/**
 * Mark an expired property as inactive (Backend handled)
 * @param {string} propertyId - Property document ID
 */
export const markPropertyAsExpired = async (propertyId) => {
  try {
     // This should be handled by backend.
     // await api.put(`/properties/${propertyId}/expire`);
     console.log(`Property ${propertyId} marked as expired (frontend view)`);
  } catch (error) {
    console.error(`Error marking property ${propertyId} as expired:`, error);
  }
};

/**
 * Filter out expired properties
 * @param {Array} properties - Array of property objects
 * @returns {Array} - Filtered array of active properties only
 */
export const filterAndMarkExpiredProperties = async (properties) => {
  const activeProperties = [];
  const expiredPropertyIds = [];

  properties.forEach(property => {
    if (isPropertyExpired(property)) {
      expiredPropertyIds.push(property.id);
    } else {
      activeProperties.push(property);
    }
  });

  // Mark expired properties logic removed from frontend
  
  return activeProperties;
};

/**
 * Check if property should be displayed (active and not expired)
 * @param {Object} property - Property object
 * @returns {boolean} - True if should be displayed
 */
export const shouldDisplayProperty = (property) => {
  // Must be active status
  if (property.status !== 'active') {
    return false;
  }

  // Must not be expired
  if (isPropertyExpired(property)) {
    return false;
  }

  return true;
};
