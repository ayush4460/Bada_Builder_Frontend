import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { performanceMonitor } from "../utils/performance";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form', 'otp', 'creating', 'success', 'redirecting'
  const [timer, setTimer] = useState(0);

  // ------------------ TIMER LOGIC ------------------
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ------------------ HANDLE INPUT ------------------
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Limit OTP to 6 digits
    if (name === 'otp' && value.length > 6) return;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // ------------------ VALIDATION ------------------
  const validate = useMemo(() => {
    return (validateOtp = false) => {
      const newErrors = {};

      if (!formData.name.trim()) newErrors.name = "Name is required.";

      if (!formData.email) {
        newErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Enter a valid email.";
      }

      if (!formData.phone_number) {
         newErrors.phone_number = "Phone number is required.";
      } else if (!/^\d{10}$/.test(formData.phone_number)) {
         newErrors.phone_number = "Enter a valid 10-digit phone number.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password should be at least 6 characters.";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }

      if (validateOtp) {
         if (!formData.otp) newErrors.otp = "Enter the 6-digit OTP sent to your email.";
         else if (formData.otp.length !== 6) newErrors.otp = "OTP must be 6 digits.";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  }, [formData]);

  // ------------------ SEND OTP ------------------
  const handleSendOtp = async () => {
    if (timer > 0) return;
    if (!validate(false)) return; // Validate basics first

    setLoading(true);
    setErrors({});
    try {
      await authService.sendOtp(formData.email);
      setStep('otp');
      setTimer(180); // 3 minutes
      setErrors({ submit: "OTP sent to your email!" });
      setTimeout(() => setErrors({}), 3000);
    } catch (error) {
      let msg = "Failed to send OTP";
      if (error.response?.data?.message) msg = error.response.data.message;
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ REGISTER ------------------
  const createUser = useCallback(async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate(true)) return; // Validate including OTP

    setLoading(true);
    setErrors({});
    setStep('creating');

    try {
      await performanceMonitor.trackNetworkRequest(
        'Registration',
        (async () => {
            const response = await authService.register({ 
                email: formData.email, 
                password: formData.password, 
                name: formData.name, 
                phone_number: formData.phone_number,
                otp: formData.otp,
                user_type: 'individual' 
            });
            return response;
        })()
      );

      setStep('success');
      
      // Redirect to login after a brief success message
      setTimeout(() => {
        setStep('redirecting');
        setTimeout(() => {
             navigate('/login', { state: { message: "Registration successful! Please login." } });
        }, 1500);
      }, 1500);

    } catch (error) {
      setStep('otp'); // Go back to OTP step on failure
      setLoading(false);
      let msg = "Registration failed";
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      } else if (error.message) {
         msg = error.message;
      }
      setErrors({ submit: msg });
    }
  }, [formData, loading, validate, navigate]);

  // ------------------ UI STYLES ------------------

  const inputIconStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors duration-300";
  const inputStyle = `w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium 
    placeholder:text-slate-400 transition-all duration-300
    focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:outline-none
    disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`;
  const errorStyle = "text-red-500 text-xs mt-1 ml-1 flex items-center gap-1 font-medium";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0a0a0a] relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md relative z-10"
        >
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 p-8 sm:p-10 overflow-hidden relative">
                
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Create Account</h2>
                    <p className="text-slate-500 text-sm">Join Bada Builder today</p>
                </motion.div>

                <form onSubmit={createUser} className="flex flex-col gap-5">
                    
                    <AnimatePresence mode="wait">
                        {step === 'form' && (
                            <motion.div
                                key="form-fields"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-5"
                            >
                                {/* Name */}
                                <div className="space-y-1 group">
                                    <div className="relative">
                                        <FiUser className={inputIconStyle} size={18} />
                                        <input
                                            name="name"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className={inputStyle}
                                        />
                                    </div>
                                    {errors.name && <p className={errorStyle}><FiAlertCircle size={12} /> {errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-1 group">
                                    <div className="relative">
                                        <FiMail className={inputIconStyle} size={18} />
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className={inputStyle}
                                        />
                                    </div>
                                    {errors.email && <p className={errorStyle}><FiAlertCircle size={12} /> {errors.email}</p>}
                                </div>

                                {/* Phone */}
                                <div className="space-y-1 group">
                                    <div className="relative">
                                        <FiPhone className={inputIconStyle} size={18} />
                                        <input
                                            name="phone_number"
                                            type="tel"
                                            maxLength="10"
                                            placeholder="Phone Number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className={inputStyle}
                                        />
                                    </div>
                                    {errors.phone_number && <p className={errorStyle}><FiAlertCircle size={12} /> {errors.phone_number}</p>}
                                </div>

                                {/* Password */}
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
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className={errorStyle}><FiAlertCircle size={12} /> {errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1 group">
                                    <div className="relative">
                                        <FiLock className={inputIconStyle} size={18} />
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className={inputStyle}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className={errorStyle}><FiAlertCircle size={12} /> {errors.confirmPassword}</p>}
                                </div>
                            </motion.div>
                        )}

                        {step === 'otp' && (
                            <motion.div
                                key="otp-field"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiMail className="text-purple-600 text-2xl" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">Verify your Email</h3>
                                    <p className="text-slate-500 text-sm mt-1">We sent a code to <span className="font-medium text-slate-900">{formData.email}</span></p>
                                </div>

                                <div className="space-y-2">
                                    <input 
                                       name="otp" 
                                       value={formData.otp} 
                                       onChange={handleChange} 
                                       placeholder="Enter 6-digit Code"
                                       maxLength="6"
                                       className="w-full text-center text-2xl tracking-[0.5em] font-bold py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all outline-none"
                                       disabled={loading}
                                    />
                                    {errors.otp && <p className="text-red-500 text-sm text-center font-medium">{errors.otp}</p>}
                                </div>

                                <div className="flex justify-between items-center text-sm px-1">
                                    <span className={`${timer > 0 ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Expiring in {formatTime(timer)}
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={timer > 0 || loading}
                                        className={`font-medium transition-colors ${timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-purple-600 hover:text-purple-700'}`}
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </motion.div>
                        )}
                         {step === 'creating' && (
                            <motion.div
                                key="loading-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-10"
                            >
                                <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-4" />
                                <p className="text-slate-600 font-medium">Creating your account...</p>
                            </motion.div>
                        )}

                        {step === 'success' || step === 'redirecting' ? (
                             <motion.div
                                key="success-state"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-10 text-center"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                    <FiCheck className="text-green-500 text-4xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome Aboard!</h3>
                                <p className="text-slate-500">Your account has been created successfully.</p>
                                {step === 'redirecting' && (
                                     <p className="text-sm text-purple-600 mt-4 font-medium animate-pulse">Redirecting to login...</p>
                                )}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {errors.submit && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-3"
                        >
                            <FiAlertCircle className="shrink-0 mt-0.5" size={18} />
                            <span>{errors.submit}</span>
                        </motion.div>
                    )}

                    {/* Actions */}
                    {step !== 'creating' && step !== 'success' && step !== 'redirecting' && (
                         <motion.div variants={itemVariants} className="mt-2">
                            {step === 'form' ? (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full bg-[#0a0a0a] text-white font-semibold py-4 rounded-xl hover:bg-slate-900 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 group"
                                >
                                    {loading ? <FiLoader className="animate-spin" /> : <>Verify & Continue <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('form'); setErrors({}); }}
                                        disabled={loading}
                                        className="w-full bg-slate-100 text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-200 transition-all duration-200 disabled:opacity-70"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={createUser} // Ensure this triggers form submission/creation
                                        disabled={loading}
                                        className="w-full bg-[#0a0a0a] text-white font-semibold py-4 rounded-xl hover:bg-slate-900 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 shadow-lg shadow-slate-900/20"
                                    >
                                        {loading ? <FiLoader className="animate-spin mx-auto" /> : "Complete Signup"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                </form>

                {/* Footer */}
                <motion.div variants={itemVariants} className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-colors">
                            Sign In
                        </Link>
                    </p>
                </motion.div>

            </div>
        </motion.div>
    </div>
  );
};

export default Register;
