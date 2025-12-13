import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ variant = 'default' }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search query parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (propertyType) params.append('type', propertyType);
    if (location) params.append('location', location);
    
    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
  };

  // Compact version for header
  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className="search-bar-compact">
        <div className="search-input-wrapper">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-compact"
          />
          <button type="submit" className="search-btn-compact">
            Search
          </button>
        </div>
      </form>
    );
  }

  // Full version for hero section and pages
  return (
    <form onSubmit={handleSearch} className="search-bar-full">
      <div className="search-bar-container">
        <div className="search-field">
          <label htmlFor="search-query">
            <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </label>
          <input
            id="search-query"
            type="text"
            placeholder="Search by property name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="search-field">
          <label htmlFor="property-type">
            <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </label>
          <select
            id="property-type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="search-select"
          >
            <option value="">Property Type</option>
            <option value="flat">Flat/Apartment</option>
            <option value="house">Independent House</option>
            <option value="villa">Villa</option>
            <option value="land">Land/Plot</option>
            <option value="commercial">Commercial</option>
            <option value="shop">Shop</option>
            <option value="office">Office</option>
          </select>
        </div>

        <div className="search-field">
          <label htmlFor="location">
            <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
          <input
            id="location"
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-input"
          />
        </div>

        <button type="submit" className="search-btn-full">
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
