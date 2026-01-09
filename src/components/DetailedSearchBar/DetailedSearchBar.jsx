import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiHome, FiCpu, FiGrid, FiKey } from 'react-icons/fi';
import './DetailedSearchBar.css';

const DetailedSearchBar = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [bhkType, setBhkType] = useState('');
    const [area, setArea] = useState('');
    const [possession, setPossession] = useState('');

    // Initialize state from URL params
    useEffect(() => {
        const loc = searchParams.get('location');
        const type = searchParams.get('type');
        const bhk = searchParams.get('bhk');
        const ar = searchParams.get('area');
        const poss = searchParams.get('possession');

        if (loc) setLocation(loc);
        if (type) setPropertyType(type);
        if (bhk) setBhkType(bhk);
        if (ar) setArea(ar);
        if (poss) setPossession(poss);
    }, [searchParams]);

    const showBhkType = ['Flat', 'House', 'Villa'].includes(propertyType);
    const showArea = !!propertyType;

    const handlePropertyTypeChange = (e) => {
        const newType = e.target.value;
        setPropertyType(newType);
        setArea('');

        if (!['Flat', 'House', 'Villa'].includes(newType)) {
            setBhkType('');
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (location) params.append('location', location);
        if (propertyType) params.append('type', propertyType);
        if (bhkType && showBhkType) params.append('bhk', bhkType);
        if (area) params.append('area', area);
        if (possession) params.append('possession', possession);

        navigate(`/search?${params.toString()}`);
    };

    return (
        <motion.div
            className="search-bar"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 50 }}
        >
            {/* Location */}
            <div className="search-field-wrapper">
                <label className="search-label"><FiMapPin style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Location</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="search-input"
                    placeholder="Where do you want to live?"
                    list="location-suggestions"
                />
            </div>

            <datalist id="location-suggestions">
                <option value="PAN India" />
                <option value="Mumbai" />
                <option value="Delhi" />
                <option value="Bangalore" />
                <option value="Hyderabad" />
                <option value="Ahmedabad" />
                <option value="Pune" />
                <option value="Surat" />
                <option value="Vadodara" />
                <option value="Rajkot" />
            </datalist>

            {/* Property Type */}
            <div className="search-field-wrapper">
                <label className="search-label"><FiHome style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Type</label>
                <select
                    value={propertyType}
                    onChange={handlePropertyTypeChange}
                    className="search-select"
                >
                    <option value="">All Types</option>
                    <option value="Flat">Flat / Apartment</option>
                    <option value="House">Independent House</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot / Land</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Shop">Shop</option>
                    <option value="Office">Office</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Showroom">Showroom</option>
                </select>
            </div>

            {/* BHK / Area logic */}
            {showBhkType ? (
                <div className="search-field-wrapper">
                     <label className="search-label"><FiGrid style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> BHK</label>
                    <select
                        value={bhkType}
                        onChange={(e) => setBhkType(e.target.value)}
                        className="search-select"
                    >
                        <option value="">Any</option>
                        <option value="1RK">1 RK</option>
                        <option value="1BHK">1 BHK</option>
                        <option value="2BHK">2 BHK</option>
                        <option value="3BHK">3 BHK</option>
                        <option value="4BHK">4 BHK</option>
                        <option value="5BHK">5 BHK</option>
                        <option value="6BHK">6+ BHK</option>
                    </select>
                </div>
            ) : showArea ? (
                <div className="search-field-wrapper">
                    <label className="search-label"><FiGrid style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Area</label>
                    <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="search-select"
                    >
                        <option value="">Any Size</option>
                        <option value="Under 500 Sq Ft">Under 500 Sq Ft</option>
                        <option value="500-1000 Sq Ft">500 - 1000 Sq Ft</option>
                        <option value="1000-1500 Sq Ft">1000 - 1500 Sq Ft</option>
                        <option value="1500-2000 Sq Ft">1500 - 2000 Sq Ft</option>
                        <option value="Above 2000 Sq Ft">Above 2000 Sq Ft</option>
                    </select>
                </div>
            ) : (
                <div className="search-field-wrapper">
                   <label className="search-label"><FiCpu style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Config</label>
                   <div className="search-select text-gray-400">Select Type First</div>
                </div>
            )}

            {/* Possession */}
             <div className="search-field-wrapper">
                <label className="search-label"><FiKey style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Possession</label>
                <select
                    value={possession}
                    onChange={(e) => setPossession(e.target.value)}
                    className="search-select"
                >
                    <option value="">Anytime</option>
                    <option value="Just Launched">Just Launched</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Ready to Move">Ready to Move</option>
                </select>
            </div>

            <button onClick={handleSearch} className="search-button" aria-label="Search">
                <FiSearch />
            </button>
        </motion.div>
    );
};

export default DetailedSearchBar;
