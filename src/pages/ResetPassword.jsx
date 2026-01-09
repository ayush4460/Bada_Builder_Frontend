import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiLoader, FiCheckCircle } from "react-icons/fi";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    
    // Validate token existence
    useEffect(() => {
        if (!token || !id) {
            setError("Invalid or missing reset token.");
        }
    }, [token, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
           setError("Password must be at least 6 characters.");
           return;
        }

        setLoading(true);
        setError("");

        try {
            await authService.resetPassword({ token, id, password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Password reset successful! Please login with your new password.',
                        resetForm: true 
                    } 
                });
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. Token may be expired.");
        } finally {
            setLoading(false);
        }
    };

    // UI Styles
    const inputIconStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors duration-300";
    const inputStyle = `w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium 
    placeholder:text-slate-400 transition-all duration-300
    focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none
    disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`;
    const errorStyle = "text-red-500 text-xs mt-1 ml-1 flex items-center gap-1 font-medium";

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    };

    if (success) {
        return (
             <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0a0a0a] relative overflow-hidden font-sans">
                 <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
                 <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
                 
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 p-8 text-center"
                  >
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiCheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful</h2>
                        <p className="text-slate-500 text-sm mb-6">Redirecting you to login...</p>
                        <FiLoader className="animate-spin mx-auto text-purple-600" size={24} />
                  </motion.div>
             </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0a0a0a] relative overflow-hidden font-sans">
             <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 p-8 sm:p-10 overflow-hidden relative">
                    
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Reset Password</h2>
                        <p className="text-slate-500 text-sm">Enter your new password below</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                         {/* New Password */}
                         <motion.div variants={itemVariants} className="space-y-1 group">
                            <div className="relative">
                                <FiLock className={inputIconStyle} size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    disabled={loading}
                                    className={inputStyle}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Confirm Password */}
                         <motion.div variants={itemVariants} className="space-y-1 group">
                            <div className="relative">
                                <FiLock className={inputIconStyle} size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError("");
                                    }}
                                    disabled={loading}
                                    className={inputStyle}
                                />
                            </div>
                            {error && <p className={errorStyle}><FiAlertCircle size={12} /> {error}</p>}
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            whileHover={!loading ? { scale: 1.02, backgroundColor: "#0a0a0a", color: "#ffffff" } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            disabled={loading}
                            className="w-full bg-slate-100 text-slate-900 font-bold py-4 rounded-xl mt-2 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2 text-slate-500">
                                    <FiLoader className="animate-spin" />
                                    <span>Resetting...</span>
                                </div>
                            ) : (
                                <>
                                    <span className="group-hover:text-white transition-colors">Set New Password</span>
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform group-hover:text-white" />
                                </>
                            )}
                        </motion.button>
                    </form>

                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
