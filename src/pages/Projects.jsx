import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import './Projects.css'; // Removed and replaced with Tailwind
import listings from '../data/listings';

const categories = ['All', 'Flat/Apartment', 'Independent House/Villa', 'Commercial Property', 'Land'];

const Project = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const filteredListings = selectedCategory === 'All'
    ? listings
    : listings.filter(listing => listing.type === selectedCategory);

  const handleBookVisit = (e, project = null) => {
    e.preventDefault(); // to prevent <Link> navigation
    if (isAuthenticated) {
      navigate('/book-visit', { 
        state: project ? { property: { ...project, type: 'projects' } } : null 
      });
    } else {
      navigate('/login', {
        state: {
          returnTo: '/book-visit',
          property: project,
          message: 'Please login to book a site visit'
        }
      });
    }
  };



  return (
    <div className="p-8 max-w-[1200px] mx-auto font-sans">
      <h1 className="text-[2rem] font-bold text-white mb-6 text-center">Explore Projects</h1>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-[25px] cursor-pointer transition-all duration-300 text-[0.95rem] border ${
                selectedCategory === cat 
                ? 'bg-[#2b2f60] text-white border-[#58335e]' 
                : 'bg-[#f3f3f3] text-[#333] border-[#ccc] hover:bg-[#e6dbec] hover:text-[#2b2f60]'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-6">
        {filteredListings.map((listing) => (
          <Link to={`/projects/${listing.id}`} key={listing.id} className="block no-underline text-inherit">
            <div className="border border-[#eee] rounded-xl overflow-hidden bg-white shadow-[0_6px_12px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lg">
              <div className="relative w-full h-[240px] overflow-hidden">
                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                <div className="absolute top-2.5 right-2.5 flex gap-1.5 flex-wrap">
                  {listing.tags?.map((tag, i) => (
                    <span key={i} className="bg-[#58335e] text-white text-[0.9rem] px-2.5 py-1 rounded-[20px] font-semibold border border-white">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 text-black">
                <h3 className="mb-1 text-[1.1rem] text-[#333] font-bold">{listing.title}</h3>
                <p className="text-gray-600 mb-2">{listing.location}</p>
                <p className="text-[#1b5e20] font-bold mb-2">{listing.priceRange}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    className="flex-1 p-[0.4rem] border border-[#e0d0ec] rounded-md font-semibold cursor-pointer transition-colors duration-300 bg-[#f9f3ff] text-[#58335e] hover:bg-[#eadef6]"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBookVisit(e);
                    }}
                  >
                    Book a Site Visit
                  </button>

                  <Link to={`/projects/${listing.id}`} className="flex-1 p-[0.4rem] border-none rounded-md font-medium cursor-pointer transition-colors duration-300 text-center bg-[#58335e] text-white hover:bg-[#452b4b]">
                    View More
                  </Link>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Project;