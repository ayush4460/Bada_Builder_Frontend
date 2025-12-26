import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaMapMarkerAlt,
    FaRulerCombined,
    FaMoneyBillWave,
    FaChartLine,
    FaClock,
    FaLock,
    FaExchangeAlt,
    FaArrowLeft,
    FaCheckCircle
} from 'react-icons/fa';

// Mock Data for different investment types
const investmentData = {
    shop: {
        title: 'Premium Retail Shop',
        type: 'Commercial Investment',
        location: 'High Street, Mumbai',
        area: '450 sq.ft',
        description: 'A prime commercial property situated in the heart of Mumbai’s busiest shopping district. Suitable for high-end retail brands, ensuring steady rental income and capital appreciation.',
        fundingRequired: 25000000, // 2.5 Cr
        minInvestment: 1000000,    // 10 Lakhs
        fundedAmount: 7500000,     // 75 Lakhs
        annualReturn: '7%',
        openingDate: '2026-01-11',
        closingDate: '2026-02-11',
        lockIn: 'Till price doubles',
        liquidity: 'Highly Liquid',
        images: ['https://images.unsplash.com/photo-1541976844346-618be1a1f3c0?auto=format&fit=crop&q=80&w=1200']
    },
    office: {
        title: 'Corporate Office Space',
        type: 'Commercial Investment',
        location: 'Tech Park, Bangalore',
        area: '1200 sq.ft',
        description: 'Grade A office space leased to a multinational IT firm. Long-term lease agreement with escalation clauses.',
        fundingRequired: 50000000,
        minInvestment: 1500000,
        fundedAmount: 32000000,
        annualReturn: '8.5%',
        openingDate: '2026-02-01',
        closingDate: '2026-03-01',
        lockIn: '3 Years',
        liquidity: 'Liquid',
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200']
    },
    flat: {
        title: 'Luxury 3BHK Apartment',
        type: 'Residential Investment',
        location: 'Bandra West, Mumbai',
        area: '1800 sq.ft',
        description: 'Premium residential apartment with sea view. High demand for rental in this premium locality.',
        fundingRequired: 65000000,
        minInvestment: 2000000,
        fundedAmount: 15000000,
        annualReturn: '5.5%',
        openingDate: '2026-01-20',
        closingDate: '2026-02-28',
        lockIn: '5 Years',
        liquidity: 'Moderate',
        images: ['https://images.unsplash.com/photo-1600596542815-e3289cab473c?auto=format&fit=crop&q=80&w=1200']
    },
    default: {
        title: 'Prime Investment Opportunity',
        type: 'Real Estate Asset',
        location: 'Prime Location',
        area: 'Variable',
        description: 'An excellent opportunity to invest in high-growth real estate assets.',
        fundingRequired: 10000000,
        minInvestment: 500000,
        fundedAmount: 0,
        annualReturn: '6-9%',
        openingDate: '2026-01-01',
        closingDate: '2026-12-31',
        lockIn: 'Variable',
        liquidity: 'Variable',
        images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200']
    }
};

const InvestmentDetails = () => {
    const { type } = useParams();
    const [data, setData] = useState(investmentData.default);
    const [investAmount, setInvestAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [currentFunded, setCurrentFunded] = useState(0);

    useEffect(() => {
        const key = type ? type.toLowerCase() : 'default';
        const selectedData = investmentData[key] || investmentData.default;
        setData(selectedData);
        setCurrentFunded(selectedData.fundedAmount);
    }, [type]);

    const fundingPercentage = Math.min((currentFunded / data.fundingRequired) * 100, 100);

    const handleInvest = (e) => {
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

        // Simulate API call
        setSuccess(true);
        setError('');
        setCurrentFunded(prev => prev + amount);

        setTimeout(() => setSuccess(false), 3000);
        setInvestAmount('');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb / Back */}
                <div className="mb-8">
                    <Link to="/investments" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                        <FaArrowLeft className="mr-2" /> Back to Investments
                    </Link>
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
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-blue-800 shadow-sm">
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
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-lg"
                                >
                                    INVEST NOW
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
