// src/pages/MyInvestments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
// import { db } from '../firebase';
import api from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { FaChartLine, FaRupeeSign, FaCalendarAlt, FaArrowRight, FaBuilding } from 'react-icons/fa';
// import './MyInvestments.css'; // Removed and replaced with Tailwind

const MyInvestments = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [stats, setStats] = useState({
        totalInvested: 0,
        activeOpportunities: 0,
        averageReturn: 0
    });

    const categories = ['All', 'Commercial', 'Residential', 'Co-Working', 'Co-Living', 'Land'];

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchInvestments = async () => {
            try {
                // Fetch user's investments
                const response = await api.get('/investments/my');
                const investmentsData = response.data || [];

                // Sort by date manually
                investmentsData.sort((a, b) => {
                    const dateA = new Date(a.investedDate || 0);
                    const dateB = new Date(b.investedDate || 0);
                    return dateB - dateA;
                });

                setInvestments(investmentsData);

                // Calculate Stats 
                const total = investmentsData.reduce((sum, inv) => sum + (inv.investedAmount || 0), 0);
                const uniqueProps = new Set(investmentsData.map(inv => inv.propertyId)).size;
                const avgReturn = investmentsData.length > 0
                    ? investmentsData.reduce((sum, inv) => sum + (inv.expectedReturn || 0), 0) / investmentsData.length
                    : 0;

                setStats({
                    totalInvested: total,
                    activeOpportunities: uniqueProps,
                    averageReturn: avgReturn.toFixed(1)
                });
            } catch (error) {
                console.error("Error fetching investments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestments();
    }, [currentUser, navigate]);

    const filteredInvestments = investments.filter(inv => {
        if (activeCategory === 'All') return true;
        return inv.category?.toLowerCase() === activeCategory.toLowerCase();
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9fafb] py-8 px-4">
                <div className="flex flex-col items-center justify-center py-16 px-8 bg-white rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] text-center">
                    <div className="w-12 h-12 border-4 border-[#f3f3f3] border-t-[#58335e] rounded-full animate-spin mb-6"></div>
                    <p className="text-base text-gray-500 font-medium">Analyzing your portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fafb] py-8 px-4">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="mb-8 text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">📈 My Portfolio</h1>
                    <p className="text-lg text-gray-500">Track and manage your fractional real estate investments</p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-10 bg-white p-6 rounded-[20px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Invested</span>
                        <span className="text-2xl font-extrabold text-[#58335e]">₹{(stats.totalInvested / 100000).toFixed(2)} L</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Projects</span>
                        <span className="text-2xl font-extrabold text-[#58335e]">{stats.activeOpportunities}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg. Expected Yield</span>
                        <span className="text-2xl font-extrabold text-[#58335e]">{stats.averageReturn}%</span>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                activeCategory === cat 
                                ? 'bg-[#58335e] text-white border-[#58335e] shadow-[0_4px_6px_-1px_rgba(88,51,94,0.2)]' 
                                : 'bg-white border-gray-200 text-gray-600 hover:border-[#58335e] hover:text-[#58335e] hover:bg-[#fdf2ff]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Investments Content */}
                {filteredInvestments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-8 bg-white rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] text-center">
                        <div className="text-[4rem] mb-6">💸</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">{activeCategory === 'All' ? 'No Investments Yet' : `No ${activeCategory} Investments`}</h3>
                        <p className="text-gray-500 mb-8 max-w-[400px]">
                            {activeCategory === 'All'
                                ? "You haven't made any investments yet. Start building your portfolio with high-yield fractional properties!"
                                : `You don't have any investments in the ${activeCategory} category yet.`}
                        </p>
                        {activeCategory === 'All' && (
                            <button
                                className="bg-[#58335e] text-white py-3.5 px-8 rounded-full font-semibold transition-all duration-300 shadow-[0_10px_15px_-3px_rgba(88,51,94,0.3)] hover:-translate-y-0.5 hover:shadow-[0_20px_25px_-5px_rgba(88,51,94,0.4)] hover:opacity-95"
                                onClick={() => navigate('/investments')}
                            >
                                Explore Opportunities
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredInvestments.map((investment) => (
                            <div key={investment.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-[#f3f4f6] flex transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] md:flex-col">
                                <div className="w-[250px] relative overflow-hidden md:w-full md:h-[200px]">
                                    <img src={investment.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400'} alt={investment.propertyName} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 left-4 py-1 px-3 rounded-full text-xs font-bold bg-white text-emerald-600 shadow-sm">{investment.status || 'Active'}</div>
                                </div>

                                <div className="flex-1 p-8 flex flex-col">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{investment.propertyName}</h3>
                                        <div className="flex gap-2 text-sm text-gray-500">
                                            <span className="text-[#58335e] font-semibold">{investment.propertyType}</span>
                                            <span>•</span>
                                            <span className="text-[#58335e] font-semibold">{investment.category}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-6 mb-8 p-6 bg-[#fdf2ff] rounded-2xl md:grid-cols-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Invested Amount</span>
                                            <span className="text-lg font-bold text-gray-800">₹{investment.investedAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Expected Yield</span>
                                            <span className="text-lg font-bold text-gray-800">{investment.expectedReturn}% p.a.</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex justify-between items-center pt-6 border-t border-[#f3f4f6]">
                                        <span className="text-sm text-gray-400">
                                            <FaCalendarAlt className="inline mr-1" />
                                            Invested: {investment.investedDate ? formatDate(investment.investedDate.toDate()) : 'N/A'}
                                        </span>
                                        <Link to={`/investment-details/${investment.propertyId}`} className="flex items-center gap-2 text-[#58335e] font-bold text-sm transition-all duration-200 hover:gap-3">
                                            View Details <FaArrowRight />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyInvestments;
