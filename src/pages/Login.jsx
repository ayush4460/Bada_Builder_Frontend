import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { performanceMonitor } from "../utils/performance";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiLoader, FiCheckCircle, FiSmartphone, FiKey } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || "/";
  const returnTo = location.state?.returnTo;
  const property = location.state?.property;
  const message = location.state?.message;

  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0); // in seconds
  const [canResend, setCanResend] = useState(false);

  const getRedirectPath = useCallback(() => {
    if (returnTo && returnTo.includes('/book-visit')) {
      return { 
        path: '/book-visit', 
        state: { property } 
      };
    }
    return from === "/login" ? "/" : from;
  }, [from, returnTo, property]);

  // ------------------ RESET FORM ------------------
  const resetForm = useCallback(() => {
    setShowPassword(false);
    setFormData({ email: "", password: "", otp: "" });
    setErrors({});
    setLoading(false);
    setOtpSent(false);
    setTimer(0);
    setCanResend(false);
  }, []);

  useEffect(() => {
    if (location.state?.resetForm) {
      resetForm();
      setErrors({ submit: "Form has been reset. Please enter your credentials." });
      setTimeout(() => setErrors({}), 2000); 
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, resetForm, navigate, location.pathname]);

  // ------------------ OTP TIMER ------------------
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && otpSent) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, otpSent]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ------------------ HANDLERS ------------------
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === 'email') setOtpSent(false); // Reset OTP flow if email changes
  }, [errors]);

  const validateEmail = () => {
    if (!formData.email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Enter a valid email.";
    return null;
  };

  const validate = () => {
    const newErrors = {};
    const emailError = validateEmail();
    if (emailError) newErrors.email = emailError;

    if (loginMethod === 'password') {
       if (!formData.password) newErrors.password = "Password is required.";
    } else {
       if (otpSent && !formData.otp) newErrors.otp = "OTP is required.";
       if (otpSent && formData.otp.length !== 6) newErrors.otp = "OTP must be 6 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    const emailError = validateEmail();
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authService.sendLoginOtp({ email: formData.email });
      setOtpSent(true);
      setTimer(180); // 3 minutes
      setCanResend(false);
      setErrors({}); // Clear any previous errors
    } catch (error) {
       let msg = "Failed to send OTP";
       if (error.response?.data?.message) msg = error.response.data.message;
       setErrors({ submit: msg });
    } finally {
       setLoading(false);
    }
  };

  const loginUser = useCallback(async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    if (loginMethod === 'otp' && !otpSent) {
      handleSendOtp();
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await performanceMonitor.trackNetworkRequest(
        'Login',
        (async () => {
          let response;
          if (loginMethod === 'password') {
             response = await authService.login({ 
               email: formData.email, 
               password: formData.password 
             });
          } else {
             response = await authService.loginWithOtp({
               email: formData.email,
               otp: formData.otp
             });
          }

          if (response.data.success) {
            login(response.data.token, response.data.user);
            return response.data;
          } else {
            throw new Error(response.data.message || 'Login failed');
          }
        })()
      );
      
      const redirectInfo = getRedirectPath();
      if (typeof redirectInfo === 'object' && redirectInfo.path) {
        navigate(redirectInfo.path, { state: redirectInfo.state, replace: true });
      } else {
        navigate(redirectInfo, { replace: true });
      }
    } catch (error) {
      let msg = "Login failed";
      if (error.response?.data?.message) msg = error.response.data.message;
      else if (error.message) msg = error.message;
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  }, [navigate, formData, login, getRedirectPath, loading, loginMethod, otpSent]);

  // ------------------ UI STYLES ------------------
  const inputIconStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors duration-300";
  const inputStyle = `w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium 
    placeholder:text-slate-400 transition-all duration-300
    focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none
    disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`;
  const errorStyle = "text-red-500 text-xs mt-1 ml-1 flex items-center gap-1 font-medium";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0a0a0a] relative overflow-hidden font-sans">
      
      {/* Ambient Background */}
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
          
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Sign in to manage your property journey</p>
          </motion.div>

          {/* Login Method Toggle */}
          <motion.div variants={itemVariants} className="flex p-1 bg-slate-100/80 rounded-xl mb-8 relative">
            <div 
               className="absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out"
               style={{ left: loginMethod === 'password' ? '4px' : 'calc(50% - 4px)' }}
            />
            <button
               type="button"
               onClick={() => { setLoginMethod('password'); setErrors({}); }}
               className={`flex-1 relative z-10 py-2 text-sm font-semibold transition-colors duration-300 ${loginMethod === 'password' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
               Password
            </button>
            <button
               type="button"
               onClick={() => { setLoginMethod('otp'); setErrors({}); }}
               className={`flex-1 relative z-10 py-2 text-sm font-semibold transition-colors duration-300 ${loginMethod === 'otp' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
               OTP
            </button>
          </motion.div>

          {/* Flash Message */}
          <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
                        message.toLowerCase().includes('success') 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                >
                    <FiAlertCircle size={16} />
                    {message}
                </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={loginUser} className="flex flex-col gap-5">
            
            {/* Email */}
            <motion.div variants={itemVariants} className="space-y-1 group">
                <div className="relative">
                    <FiMail className={inputIconStyle} size={18} />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading || (loginMethod === 'otp' && otpSent)}
                        className={inputStyle}
                    />
                     {/* Edit Email Icon for OTP Flow */}
                     {loginMethod === 'otp' && otpSent && (
                        <button 
                           type="button" 
                           onClick={() => { setOtpSent(false); setTimer(0); setFormData(prev => ({...prev, otp: ''})); }}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-700 text-xs font-bold"
                        >
                           EDIT
                        </button>
                     )}
                </div>
                {errors.email && <p className={errorStyle}><FiAlertCircle size={12} /> {errors.email}</p>}
            </motion.div>

            <AnimatePresence mode="wait">
              {loginMethod === 'password' ? (
                <motion.div 
                   key="password-field"
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="space-y-5"
                >
                    <div className="space-y-1 group">
                        <div className="relative">
                            <FiLock className={inputIconStyle} size={18} />
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
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
                        {errors.password && <p className={errorStyle}><FiAlertCircle size={12} /> {errors.password}</p>}
                        
                        <div className="flex justify-end mt-2">
                             <Link to="/forgot-password" className="text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="otp-field"
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="space-y-5"
                >
                   {/* OTP Input - Only show if OTP sent */}
                   {otpSent && (
                      <div className="space-y-3">
                         <div className="relative group">
                            <FiKey className={inputIconStyle} size={18} />
                            <input
                                name="otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={formData.otp}
                                onChange={(e) => {
                                   if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                                      handleChange(e);
                                   }
                                }}
                                disabled={loading}
                                className={`${inputStyle} tracking-[0.2em] font-bold text-center pl-4 pr-4`} 
                                maxLength={6}
                            />
                         </div>
                         {errors.otp && <p className={errorStyle}><FiAlertCircle size={12} /> {errors.otp}</p>}

                         <div className="flex items-center justify-between text-xs px-1">
                            <span className="text-slate-500">
                               Time remaining: <span className={`${timer < 30 ? 'text-red-500 font-bold' : 'text-slate-700 font-medium'}`}>{formatTime(timer)}</span>
                            </span>
                            <button 
                               type="button"
                               onClick={handleSendOtp}
                               disabled={!canResend || loading}
                               className={`font-semibold ${canResend ? 'text-purple-600 hover:text-purple-700 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                            >
                               Resend OTP
                            </button>
                         </div>
                      </div>
                   )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Error */}
            <AnimatePresence>
                {errors.submit && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-3 border border-red-100"
                    >
                        <FiAlertCircle className="shrink-0 mt-0.5" size={16} />
                        <span>{errors.submit}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Button */}
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
                        <span>{loginMethod === 'otp' && !otpSent ? 'Sending OTP...' : 'Signing In...'}</span>
                    </div>
                ) : (
                    <>
                        <span className="group-hover:text-white transition-colors">
                           {loginMethod === 'otp' && !otpSent ? 'Send OTP' : 'Sign In'}
                        </span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform group-hover:text-white" />
                    </>
                )}
            </motion.button>

          </form>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-purple-600 font-bold hover:text-purple-700 hover:underline transition-colors">
                    Register Now
                </Link>
            </p>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
