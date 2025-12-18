import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './ProjectDetails.css'; // Using the same CSS as Gracewood Elegance
import balajiLogo from '../assets/balaji.png';

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get property from location state or fetch from database
    if (location.state?.property) {
      setProperty(location.state.property);
      setLoading(false);
    } else {
      // TODO: Fetch property from Firebase using ID
      // For now, show error
      setLoading(false);
    }
  }, [id, location.state]);

  if (loading) {
    return <div className="text-center py-20">Loading property details...</div>;
  }

  if (!property) {
    return <div className="text-center py-20">Property not found</div>;
  }

  // Prepare dynamic data with fallbacks
  const propertyImages = property.images || [property.image] || [];
  const propertyTags = property.tags || [property.status, property.type].filter(Boolean);
  const propertyFacilities = property.facilities || property.amenities || [];
  const propertyAdvantages = property.advantages || property.nearbyPlaces || [];
  const propertyFloorPlans = property.floorPlans || property.configurations || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {propertyImages.slice(0, 6).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Property Image ${idx + 1}`}
              className="w-full h-68 object-cover rounded"
            />
          ))}
        </div>
        <div className="absolute text-white top-4 right-4">
          <button className="px-4 py-2 text-sm font-semibold rounded shadow">
            Download Brochure
          </button>
        </div>
      </div>

      {/* Title & Tags */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto text-left">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="text-gray-400 font-bold">{property.location}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {propertyTags.map((tag, i) => (
              <span key={i} className="px-3 py-1 text-xs font-medium ui-bg text-white rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Book a Site Visit Button */}
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/book-visit', { state: { property } })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-300"
          >
            Book a Site Visit
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-8 ui-bg p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Price Range</h2>
        <p className="text-2xl font-bold text-white">
          ₹ {property.price || property.groupPrice || property.priceRange || 'Contact for Price'}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {property.type} {property.area && `(${property.area})`}
        </p>
      </div>

      {/* Floor Plans / Configurations */}
      {propertyFloorPlans.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Floor Plans & Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertyFloorPlans.map((plan, idx) => (
              <div key={idx} className="ui-bg floor-plan-card rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <img src={plan.image} alt={`Plan ${idx + 1}`} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="text-lg font-medium">{plan.size} sq.ft. • {plan.type || property.type}</p>
                  <p className="text-sm text-gray-400 mt-1">₹ {plan.price}</p>
                  {plan.possession && (
                    <p className="text-xs text-gray-400 mt-1">Possession: {plan.possession}</p>
                  )}
                  <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded text-sm font-semibold">Request Callback</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Developer/Owner Info */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          {property.developer ? 'DEVELOPER' : property.owner ? 'OWNER' : 'SELLER'}
        </h2>
        <div className="p-4 ui-bg rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">
              {property.developer || property.owner || 'Contact for Details'}
            </p>
            <p className="text-sm text-gray-400">
              {property.developer ? 'Builder' : property.owner ? 'Owner' : 'Seller'}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <img
              src={property.logo || balajiLogo}
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Facilities/Amenities */}
      {propertyFacilities.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Top Facilities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {propertyFacilities.map((facility, idx) => (
              <div key={idx} className="p-3 ui-bg rounded-lg text-center text-sm font-medium">{facility}</div>
            ))}
          </div>
        </div>
      )}

      {/* Location Advantages */}
      {propertyAdvantages.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Location Advantages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {propertyAdvantages.map((item, idx) => (
              <div key={idx} className="ui-bg p-4 rounded-lg shadow">
                <p className="text-white font-bold">{item.place || item.name}</p>
                <p className="text-sm text-gray-500">{item.distance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits (for Grouping properties) */}
      {property.benefits && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Group Benefits</h2>
          <div className="ui-bg p-6 rounded-lg shadow-sm">
            <ul className="space-y-2">
              {property.benefits.map((benefit, index) => (
                <li key={index} className="text-white flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* More Info */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">More about {property.title}</h2>
        <p className="text-gray-400 leading-relaxed">
          {property.description || 
           `This ${property.type} is located in ${property.location} and offers excellent value for money. 
           Contact us for more details and to schedule a site visit.`}
        </p>
      </div>
    </div>
  );
};

export default PropertyDetails;