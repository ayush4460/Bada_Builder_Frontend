import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// import { db } from '../firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import api from '../services/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaMapMarkerAlt, FaRulerCombined, FaChartLine, FaClock, FaLock, FaExchangeAlt, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

const InvestmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [investAmount, setInvestAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [currentFunded, setCurrentFunded] = useState(0);
    const [fundingPercentage, setFundingPercentage] = useState(0);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch property from API or use mock if not implementing full investment backend yet
                // For now, let's try to fetch a property and map it, or handle 404
                let investmentData = null;
                try {
                    const response = await api.get(`/properties/${id}`);
                    const property = response.data;
                    if (property) {
                        investmentData = {
                             id: property.id,
                             title: property.title || 'Investment Opportunity',
                             type: property.type || 'Commercial',
                             minInvestment: 500000, 
                             fundingRequired: 10000000,
                             annualReturn: '12%',
                             openingDate: 'Jan 1, 2025',
                             closingDate: 'Feb 1, 2025',
                             lockIn: '3 Years',
                             liquidity: 'High',
                             images: property.image_url ? [property.image_url] : ['/placeholder.jpg'],
                             description: property.description || 'No description available.',
                             location: property.location || 'Unknown Location',
                             area: '1200 sq.ft',
                             ...property // Spread original properties
                        };
                    }
                } catch (e) {
                    console.log("Property fetch failed, using fallback or empty", e);
                }

                if (investmentData) {
                    setData(investmentData);
                    setCurrentFunded(2500000); 
                    setFundingPercentage(25); 
                } else {
                     setError("Investment not found.");
                }
            } catch (err) {
                console.error("Error fetching investment details:", err);
                setError("Failed to load investment details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (!data && !isLoading) return <div className="p-10 text-center">Investment Opportunity Not Found</div>;

    const handleInvest = async (e) => {
        e.preventDefault();
        const amount = parseFloat(investAmount);

        if (!amount || amount < data.minInvestment) {
            setError(`Minimum investment is ₹${data.minInvestment.toLocaleString('en-IN')}`);
            return;
        }

        if (currentFunded + amount > data.fundingRequired) {
            setError("Investment exceeds remaining required funding.");
            return;
        }

        if (!currentUser) {
            setError("Please login to invest.");
            // Optionally redirect to login
            // navigate('/login'); 
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Simulate Payment Processing Delay (optional, keeps UI feeling real)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create Investment Record via API
            await api.post('/investments', {
                propertyId: data.id || id,
                propertyName: data.title,
                propertyType: data.type,
                category: data.category,
                investedAmount: amount,
                expectedReturn: parseFloat(data.annualReturn) || 0,
                totalFunding: data.fundingRequired,
                currentFunding: currentFunded + amount,
                status: 'Active',
                image: data.images?.[0] || ''
            });

            setSuccess(true);
            setCurrentFunded(prev => prev + amount);
            setInvestAmount('');

            // Redirect after success? Or just show message. Keeping message for now.
        } catch (err) {
            console.error("Investment failed:", err);
            setError("Failed to process investment. Please try again.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center"
                    >
                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h3>
                        <p className="text-gray-500">Please wait while we secure your investment allocation.</p>
                    </motion.div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb Navigation */}
                <div className="mb-8 flex items-center text-sm text-gray-500 gap-2">
                    <Link to="/investments" className="hover:text-blue-600">Investments</Link>
                    <FaChevronRight className="text-xs" />
                    <Link to={`/investments/${data.type}`} className="hover:text-blue-600 capitalize">{data.type}s</Link>
                    <FaChevronRight className="text-xs" />
                    <span className="text-gray-900 font-semibold">{data.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100"
                        >
                            <div className="h-64 sm:h-80 overflow-hidden relative">
                                <img
                                    src={data.images[0]}
                                    alt={data.title}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-blue-800 shadow-sm capitalize">
                                    {data.type}
                                </div>
                            </div>

                            <div className="p-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.title}</h1>
                                <p className="text-gray-500 mb-6 flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-blue-500" /> {data.location}
                                </p>

                                <div className="flex flex-wrap gap-6 mb-6">
                                    <div className="bg-blue-50 px-4 py-2 rounded-xl">
                                        <span className="block text-xs text-blue-600 font-semibold uppercase tracking-wider">Area</span>
                                        <span className="text-lg font-bold text-gray-800 flex items-center gap-1">
                                            <FaRulerCombined className="text-sm" /> {data.area}
                                        </span>
                                    </div>
                                    <div className="bg-green-50 px-4 py-2 rounded-xl">
                                        <span className="block text-xs text-green-600 font-semibold uppercase tracking-wider">Annual Return</span>
                                        <span className="text-lg font-bold text-gray-800 flex items-center gap-1">
                                            <FaChartLine className="text-sm" /> {data.annualReturn}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-600 leading-relaxed">
                                    {data.description}
                                </p>
                            </div>
                        </motion.div>

                        {/* Investment Stats Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                        <FaClock />
                                    </div>
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium">Timelines</h3>
                                <p className="text-gray-900 font-semibold mt-1">Open: {data.openingDate}</p>
                                <p className="text-gray-900 font-semibold">Close: {data.closingDate}</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <FaLock />
                                    </div>
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium">Lock-in Period</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data.lockIn}</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
                                        <FaExchangeAlt />
                                    </div>
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium">Liquidity</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data.liquidity}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                                        <FaMoneyBillWave />
                                    </div>
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium">Min Investment</h3>
                                <p className="text-2xl font-bold text-gray-900 mt-1">₹{(data.minInvestment / 100000).toFixed(1)} Lakhs</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Funding Widget */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 sticky top-24"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Investment Status</h3>

                            {/* Progress Bar */}
                            <div className="mb-2 flex justify-between text-sm font-medium">
                                <span className="text-gray-500">Funded: {Math.round(fundingPercentage)}%</span>
                                <span className="text-gray-900">₹{currentFunded.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 mb-1 overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${fundingPercentage}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mb-8">
                                <span>Goal: ₹{data.fundingRequired.toLocaleString('en-IN')}</span>
                                <span>{data.fundingRequired - currentFunded > 0 ? `₹${(data.fundingRequired - currentFunded).toLocaleString('en-IN')} left` : 'Fully Funded'}</span>
                            </div>

                            {/* Invest Form */}
                            <form onSubmit={handleInvest} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={investAmount}
                                            onChange={(e) => setInvestAmount(e.target.value)}
                                            placeholder={data.minInvestment.toString()}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Minimum: ₹{data.minInvestment.toLocaleString('en-IN')}</p>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center">
                                        <FaCheckCircle className="mr-2" /> Investment Successful!
                                    </div>
                                )}

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'PROCESSING...' : 'INVEST NOW'}
                                </motion.button>

                                <motion.button
                                    type="button" // Important: type button to prevent form submission
                                    onClick={() => navigate('/book-visit', { state: { property: data } })}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-4 rounded-xl border border-blue-200 transition-all text-lg flex items-center justify-center gap-2"
                                >
                                    <FaClock /> BOOK SITE VISIT
                                </motion.button>

                                <p className="text-center text-xs text-gray-400 mt-4">
                                    By clicking Invest Now, you agree to our Terms & Conditions.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentDetails;
