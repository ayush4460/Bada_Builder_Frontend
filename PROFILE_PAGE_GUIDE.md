# Profile Page Implementation Guide

## Overview
A clean, modern Profile Page UI that displays user information and activity summary in a professional real-estate style design.

## Features

### 1. User Profile Section
- **Profile Photo**: 
  - 192x192px placeholder container
  - Shows user icon if no photo uploaded
  - Rounded corners with border
  
- **User Details** (Read-only):
  - Name
  - Email
  - Phone Number
  - User ID (8-character uppercase)
  - User Type (Individual/Developer badge)

- **Edit Profile Button**:
  - Located at top-right of profile card
  - Blue button with edit icon
  - Navigates to `/edit-profile` (to be implemented)

### 2. Activity Summary Section
Three clickable activity cards:
- **Properties Uploaded**: Links to `/my-properties`
- **Joined Live Groups**: Links to `/exhibition/live-grouping`
- **Booked Site Visits**: Links to `/my-bookings`

Each card shows:
- Icon
- Title
- Count (currently 0, will be dynamic)

## Routes

### Profile Page
- **URL**: `/profile`
- **Component**: `ProfilePage.jsx`
- **Access**: Available to logged-in users

### Navigation
- Access from Header dropdown: Click profile avatar → "View Profile"
- Direct URL: `/profile`

## Data Integration

### Current Implementation
Uses Firebase Auth and AuthContext:
```javascript
const { currentUser, userProfile } = useAuth();
```

### User Data Structure
```javascript
{
  name: userProfile?.name || 'John Doe',
  email: currentUser?.email || 'john.doe@example.com',
  phone: userProfile?.phone || '+91 9876543210',
  userId: currentUser?.uid?.substring(0, 8).toUpperCase(),
  userType: userProfile?.userType || 'Individual',
  profilePhoto: userProfile?.profilePhoto || null
}
```

### Activity Counts
Currently hardcoded to 0. To make dynamic:
1. Fetch user's properties from Firestore
2. Fetch user's live group memberships
3. Fetch user's site visit bookings

## Design Specifications

### Colors
- Background: `bg-gray-50` (#F9FAFB)
- Card: `bg-white` with subtle shadow
- Primary Blue: `#2563EB`
- Purple (Developer): `#7C3AED`
- Text: Gray scale (900, 600, 500)

### Layout
- **Desktop**: Photo left, details right (side-by-side)
- **Mobile**: Photo top, details below (stacked)
- Max width: 1280px (5xl)
- Padding: Responsive (4-8)

### Typography
- Page title: 3xl, bold
- Section titles: xl, semibold
- Labels: sm, semibold
- Values: base, normal

## Responsive Design

### Desktop (lg+)
- Profile photo and details side-by-side
- Activity cards in 3-column grid

### Tablet (sm-lg)
- Profile photo and details stacked
- Activity cards in 3-column grid

### Mobile (<sm)
- All elements stacked
- Activity cards in 1-column grid
- Full-width buttons

## Future Enhancements

### To Implement
1. **Edit Profile Page** (`/edit-profile`)
   - Form to update name, phone, profile photo
   - Photo upload to Firebase Storage
   - Update Firestore user document

2. **Dynamic Activity Counts**
   - Query Firestore for user's properties
   - Query live group memberships
   - Query site visit bookings

3. **Activity Detail Pages**
   - `/my-properties`: List user's uploaded properties
   - `/my-bookings`: List user's site visit bookings
   - Live groups already exists at `/exhibition/live-grouping`

4. **Profile Photo Upload**
   - Click photo to upload
   - Crop/resize functionality
   - Store in Firebase Storage
   - Update Firestore with photo URL

## Files Modified

### New Files
- `src/pages/ProfilePage.jsx` - Main profile page component

### Updated Files
- `src/App.jsx` - Added `/profile` route
- `src/components/Header/Header.jsx` - Added "View Profile" button in dropdown
- `src/components/Header/Header.css` - Added `.profile-dropdown-link` styles

## Usage

### For Users
1. Login to your account
2. Click your profile avatar in the header
3. Click "View Profile" in the dropdown
4. View your profile information and activity

### For Developers
```javascript
// Navigate to profile page
navigate('/profile');

// Access user data
const { currentUser, userProfile } = useAuth();
```

## Tech Stack
- React 19
- React Router DOM 7
- Tailwind CSS 4
- React Icons (Feather Icons)
- Firebase Auth & Firestore

## Notes
- No unnecessary animations (as requested)
- Clean, minimal design
- Professional real-estate app look
- Fully responsive
- Accessible with proper semantic HTML
