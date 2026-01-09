import React from 'react';
import { Building2, Users, LayoutDashboard, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    // These stats would ideally be fetched from the backend
    const stats = [
        { title: 'Total Properties', value: '128', icon: Building2, color: 'bg-blue-500' },
        { title: 'Registered Users', value: '1,240', icon: Users, color: 'bg-purple-500' },
        { title: 'Active Group Bookings', value: '12', icon: LayoutDashboard, color: 'bg-green-500' },
        { title: 'Total Revenue', value: '₹4.2 Cr', icon: TrendingUp, color: 'bg-yellow-500' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center text-white`}>
                                    <Icon className={stat.color.replace('bg-', 'text-')} size={24} />
                                </div>
                                <span className="text-gray-400 text-sm font-medium">Last 30 days</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                            <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[300px]">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Chart / Activity Stream Placeholder
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[300px]">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Performance</h2>
                     <div className="flex items-center justify-center h-full text-gray-400">
                        Chart / Analytics Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
