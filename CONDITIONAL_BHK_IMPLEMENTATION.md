# Conditional BHK Type Implementation

## Overview
BHK (Bedroom-Hall-Kitchen) type field is now conditionally shown across the entire website based on the selected property type. This improves user experience by only showing relevant fields.

## Implementation Details

### When BHK Type is Shown:
BHK type field appears ONLY when user selects:
- **Flat/Apartment**
- **Independent House/Villa** (or just "House" or "Villa")

### When BHK Type is Hidden:
BHK type field is hidden for:
- Plot/Land
- Commercial Property/Space
- Shop
- Office
- Warehouse
- Showroom

## Updated Components

### 1. LeadModal Component
**File:** `src/components/LeadModal/LeadModal.jsx`

**Changes:**
- Added `showBhkType` constant that checks if property type is Flat, House, or Villa
- BHK field conditionally rendered with smooth animation
- Auto-resets BHK value when property type changes to non-applicable type
- Smart validation: BHK only required when field is visible
- Database optimization: BHK only saved when applicable

**Property Types:**
- Flat, House, Villa → BHK shown ✅
- Plot, Commercial, Shop, Office, Warehouse, Showroom → BHK hidden ❌

---

### 2. HeroSection Component (Home Page)
**File:** `src/components/HeroSection/HeroSection.jsx`

**Changes:**
- Added `showBhkType` constant
- Added `handlePropertyTypeChange` function to reset BHK when needed
- BHK select field conditionally rendered with motion animation
- Search parameters only include BHK when applicable

**Property Types:**
- Flat, House, Villa → BHK shown ✅
- Plot, Commercial, Shop, Office, Warehouse, Showroom → BHK hidden ❌

---

### 3. SearchBar Component (Exhibition & Other Pages)
**File:** `src/components/SearchBar/SearchBar.jsx`

**Changes:**
- Added `bhkType` state
- Added `showBhkType` constant (checks for 'flat', 'house', 'villa' - lowercase)
- Added `handlePropertyTypeChange` function
- BHK field conditionally rendered in full search bar
- Search parameters only include BHK when applicable

**Property Types:**
- flat, house, villa → BHK shown ✅
- land, commercial, shop, office → BHK hidden ❌

---

### 4. PostProperty Page
**File:** `src/pages/PostProperty.jsx`

**Changes:**
- Added `showBhkType` constant
- Modified `handleChange` to reset BHK when property type changes
- BHK field changed from text input to dropdown select
- Conditionally rendered based on property type
- Database save only includes BHK when applicable

**Property Types:**
- Flat/Apartment, Independent House/Villa → BHK shown ✅
- Commercial Property, Land → BHK hidden ❌

**BHK Options:**
- 1 RK, 1 BHK, 2 BHK, 3 BHK, 4 BHK, 5 BHK, 6+ BHK

---

## User Experience Flow

### Example 1: Lead Modal
1. User opens website → Lead modal appears
2. User selects "Flat" → BHK field slides in ✅
3. User selects BHK type (e.g., "3 BHK")
4. User changes to "Plot" → BHK field slides out, value cleared ❌
5. User changes back to "Villa" → BHK field slides in (empty) ✅

### Example 2: Home Page Search
1. User on home page
2. Selects "House" → BHK dropdown appears ✅
3. Selects "2 BHK"
4. Changes to "Commercial" → BHK dropdown disappears ❌
5. Clicks Search → Only relevant parameters sent

### Example 3: Post Property
1. User posting property
2. Selects "Flat/Apartment" → BHK dropdown appears ✅
3. Selects "3 BHK"
4. Changes to "Land" → BHK dropdown disappears, value cleared ❌
5. Submits form → BHK not saved for Land property

---

## Technical Implementation

### State Management
```javascript
// Check if BHK should be shown
const showBhkType = ['Flat', 'House', 'Villa'].includes(propertyType);
```

### Property Type Change Handler
```javascript
const handlePropertyTypeChange = (e) => {
  const newType = e.target.value;
  setPropertyType(newType);
  // Reset BHK if not applicable
  if (!['Flat', 'House', 'Villa'].includes(newType)) {
    setBhkType('');
  }
};
```

### Conditional Rendering
```javascript
{showBhkType && (
  <motion.select 
    value={bhkType}
    onChange={(e) => setBhkType(e.target.value)}
    initial={{ opacity: 0, width: 0 }}
    animate={{ opacity: 1, width: 'auto' }}
    exit={{ opacity: 0, width: 0 }}
    transition={{ duration: 0.3 }}
  >
    <option value="">BHK Type</option>
    <option value="1RK">1 RK</option>
    {/* ... more options */}
  </motion.select>
)}
```

### Database Save Logic
```javascript
// Only add BHK if applicable
if (showBhkType && formData.bhkType) {
  propertyData.bhk_type = formData.bhkType;
}
```

---

## Benefits

1. **Better UX**: Users only see relevant fields
2. **Cleaner Interface**: Less clutter on forms
3. **Data Integrity**: No invalid BHK values for non-residential properties
4. **Smooth Animations**: Fields slide in/out gracefully
5. **Smart Validation**: Only validates fields that are shown
6. **Database Optimization**: Only stores relevant data

---

## Property Type Mapping

| Property Type | BHK Applicable? | Component |
|--------------|----------------|-----------|
| Flat/Apartment | ✅ Yes | All |
| Independent House | ✅ Yes | All |
| Villa | ✅ Yes | All |
| Plot/Land | ❌ No | All |
| Commercial | ❌ No | All |
| Shop | ❌ No | All |
| Office | ❌ No | All |
| Warehouse | ❌ No | All |
| Showroom | ❌ No | All |

---

## Testing Checklist

- [x] Lead Modal - BHK shows/hides correctly
- [x] Home Page Search - BHK shows/hides correctly
- [x] Exhibition Search Bar - BHK shows/hides correctly
- [x] Post Property Form - BHK shows/hides correctly
- [x] BHK value resets when switching to non-applicable type
- [x] Search parameters only include BHK when applicable
- [x] Database saves BHK only when applicable
- [x] Smooth animations on show/hide
- [x] No console errors
- [x] All diagnostics pass

---

## Future Enhancements

1. Add similar conditional logic for other property-specific fields
2. Add "Number of Floors" for Independent Houses
3. Add "Plot Area" for Land properties
4. Add "Carpet Area" for Commercial properties
5. Create reusable hook: `useConditionalFields(propertyType)`

---

**Status:** ✅ Fully Implemented and Tested
**Date:** December 13, 2025
**Components Updated:** 4 (LeadModal, HeroSection, SearchBar, PostProperty)
