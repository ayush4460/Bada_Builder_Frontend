import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DetailedSearchBar from '../components/DetailedSearchBar/DetailedSearchBar';
// import './SearchResults.css'; // Removed and replaced with Tailwind

// Sample data - replace with actual database query
const sampleProperties = [
  {
    id: 1,
    title: "Luxury 3BHK Apartment",
    type: "flat",
    location: "Alkapuri, Vadodara",
    price: "₹65 Lakhs",
    area: "1450 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 2,
    title: "Modern Villa with Garden",
    type: "villa",
    location: "Waghodia Road, Vadodara",
    price: "₹1.2 Cr",
    area: "2500 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 3,
    title: "Commercial Shop Space",
    type: "commercial",
    location: "RC Dutt Road, Vadodara",
    price: "₹45 Lakhs",
    area: "800 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 4,
    title: "Independent House",
    type: "house",
    location: "Manjalpur, Vadodara",
    price: "₹85 Lakhs",
    area: "1800 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 5,
    title: "Residential Plot",
    type: "land",
    location: "Gorwa, Vadodara",
    price: "₹35 Lakhs",
    area: "1200 sq.ft",
    image: "/api/placeholder/400/300"
  },
  {
    id: 6,
    title: "Office Space",
    type: "office",
    location: "Sayajigunj, Vadodara",
    price: "₹55 Lakhs",
    area: "1000 sq.ft",
    image: "/api/placeholder/400/300"
  }
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';
  const location = searchParams.get('location') || '';

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      let filtered = sampleProperties;

      // Filter by search query
      if (query) {
        filtered = filtered.filter(prop =>
          prop.title.toLowerCase().includes(query.toLowerCase()) ||
          prop.location.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Filter by type
      if (type) {
        // Handle comma-separated types if needed, or simple exact match
        filtered = filtered.filter(prop => prop.type === type);
      }

      // Filter by category
      if (category) {
        const lowerCat = category.toLowerCase();
        if (lowerCat === 'commercial') {
          filtered = filtered.filter(prop => ['shop', 'office', 'godown', 'warehouse', 'showroom', 'commercial'].includes(prop.type));
        } else if (lowerCat === 'residential') {
          filtered = filtered.filter(prop => ['flat', 'bungalow', 'villa', 'house', 'residential'].includes(prop.type));
        } else if (lowerCat === 'land') {
          filtered = filtered.filter(prop => ['land', 'plot'].includes(prop.type));
        } else {
          // Fallback: try to match type directly or just pass if no specific logic
          filtered = filtered.filter(prop => prop.type === lowerCat || prop.type.includes(lowerCat));
        }
      }

      // Filter by location
      if (location) {
        filtered = filtered.filter(prop =>
          prop.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      setResults(filtered);
      setLoading(false);
    }, 500);
  }, [query, type, location, category]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] pt-[80px]">
      {/* Search Bar Section */}
      <div className="bg-linear-to-br from-[#58335e] to-[#6d4575] py-[60px] px-5">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-white text-[36px] font-bold text-center mb-[30px]">Find Your Dream Property</h1>
          <DetailedSearchBar />
        </div>
      </div>

      {/* Results Section */}
      <div className="py-[60px] px-5">
        <div className="max-w-[1200px] mx-auto">
          {/* Search Info */}
          <div className="mb-[40px]">
            <h2 className="text-[28px] font-bold text-[#1a1a1a] mb-4">Search Results</h2>
            {(query || type || location || category) && (
              <div className="flex flex-wrap gap-2.5 mb-3">
                {query && <span className="bg-[#f3e8ff] text-[#58335e] px-4 py-1.5 rounded-[20px] text-[14px] font-medium">Query: {query}</span>}
                {category && <span className="bg-[#f3e8ff] text-[#58335e] px-4 py-1.5 rounded-[20px] text-[14px] font-medium">Category: {category}</span>}
                {type && <span className="bg-[#f3e8ff] text-[#58335e] px-4 py-1.5 rounded-[20px] text-[14px] font-medium">Type: {type}</span>}
                {location && <span className="bg-[#f3e8ff] text-[#58335e] px-4 py-1.5 rounded-[20px] text-[14px] font-medium">Location: {location}</span>}
              </div>
            )}
            <p className="text-[#666] text-[16px]">
              {loading ? 'Searching...' : `${results.length} properties found`}
            </p>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="w-[50px] h-[50px] border-4 border-[#e5e7eb] border-t-[#58335e] rounded-full animate-spin"></div>
              <p className="text-[#666] text-[16px]">Searching properties...</p>
            </div>
          ) : results.length > 0 ? (
            <motion.div
              className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[30px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {results.map((property, index) => (
                <motion.div
                  key={property.id}
                  className="bg-white rounded-[16px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="relative w-full h-[220px] overflow-hidden">
                    <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <span className="absolute top-3 right-3 bg-[rgba(88,51,94,0.9)] text-white px-[14px] py-[6px] rounded-[20px] text-[12px] font-semibold capitalize">{property.type}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-3">{property.title}</h3>
                    <p className="flex items-center gap-1.5 text-[#666] text-[14px] mb-4">
                      <svg className="w-4 h-4 text-[#58335e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </p>
                    <div className="flex justify-between items-center py-4 border-y border-[#e5e7eb] mb-4">
                      <span className="text-[22px] font-bold text-[#16a34a]">{property.price}</span>
                      <span className="text-[14px] text-[#666]">{property.area}</span>
                    </div>
                    <div className="flex gap-2.5">
                      <Link
                        to={`/property-details/${property.id}`}
                        state={{ property, type: 'search' }}
                        className="flex-1 p-3 rounded-[8px] text-[14px] font-semibold text-center transition-all duration-300 cursor-pointer bg-[#f3e8ff] text-[#58335e] border-2 border-[#58335e] hover:bg-[#58335e] hover:text-white"
                      >
                        View Details
                      </Link>
                      <Link
                        to="/book-visit"
                        state={{ property: { ...property, type: 'search' } }}
                        className="flex-1 p-3 rounded-[8px] text-[14px] font-semibold text-center transition-all duration-300 cursor-pointer bg-linear-to-br from-[#16a34a] to-[#22c55e] text-white hover:from-[#15803d] hover:to-[#16a34a] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]"
                      >
                        Book Site Visit
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="w-20 h-20 text-[#d1d5db] mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-[24px] font-bold text-[#1a1a1a] mb-3">No properties found</h3>
              <p className="text-[#666] text-[16px] mb-6">Try adjusting your search criteria or browse all properties</p>
              <Link to="/" className="bg-linear-to-br from-[#58335e] to-[#6d4575] text-white px-8 py-3.5 rounded-[10px] text-[16px] font-semibold transition-all duration-300 hover:from-[#6d4575] hover:to-[#7d5585] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(88,51,94,0.3)]">
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
