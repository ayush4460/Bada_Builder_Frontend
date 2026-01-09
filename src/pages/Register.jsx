import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
// import "./Login.css"; // Removed and replaced with Tailwind 
import { authService } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { performanceMonitor } from "../utils/performance";

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
  const [step, setStep] = useState('form'); // 'form', 'otp', 'creating', 'success'
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
        }, 800);
      }, 1000);

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-[#f5f7fa] to-[#e8ecf1] p-5">
      {/* Loading Overlay */}
      {(loading && step !== 'success') || step === 'redirecting' ? (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-9999 cursor-wait select-none pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex flex-col items-center gap-5 bg-white p-10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[300px] text-center pointer-events-none">
            <div className="w-10 h-10 border-4 border-[#58335e]/20 border-t-[#58335e] rounded-full animate-spin"></div>
            <p className="m-0 text-base font-semibold text-[#333] leading-relaxed">
              {step === 'redirecting' ? "Redirecting to login..." : 
               step === 'creating' ? "Verifying & Creating Account..." : 
               "Processing..."}
            </p>
          </div>
        </motion.div>
      ) : null}

      <motion.div
        className="bg-white p-10 rounded-2xl w-full max-w-[450px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] sm:p-[30px_20px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-2 text-[32px] font-bold text-[#1a1a1a] text-center sm:text-[26px]"
        >
          Create Account
        </motion.h2>

        <form onSubmit={createUser} className={`flex flex-col gap-5 sm:gap-4 ${loading ? 'pointer-events-none opacity-70' : ''}`}>
          
          <div className="flex flex-col">
            <label className="block text-left mb-1.5 font-semibold text-sm text-[#333]">Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              disabled={loading || step === 'otp'} 
              className="w-full p-3 px-4 rounded-lg border-2 border-[#e0e0e0] text-[15px] text-[#1a1a1a] transition-all duration-200 font-inherit focus:outline-none focus:border-[#58335e] focus:shadow-[0_0_0_3px_rgba(88,51,94,0.1)] disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed disabled:border-[#e0e0e0] sm:p-[10px_14px] sm:text-sm"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1 text-left">{errors.name}</p>}
          </div>

          <div className="flex flex-col">
            <label className="block text-left mb-1.5 font-semibold text-sm text-[#333]">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || step === 'otp'}
              className="w-full p-3 px-4 rounded-lg border-2 border-[#e0e0e0] text-[15px] text-[#1a1a1a] transition-all duration-200 font-inherit focus:outline-none focus:border-[#58335e] focus:shadow-[0_0_0_3px_rgba(88,51,94,0.1)] disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed disabled:border-[#e0e0e0] sm:p-[10px_14px] sm:text-sm"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1 text-left">{errors.email}</p>}
          </div>

          <div className="flex flex-col">
            <label className="block text-left mb-1.5 font-semibold text-sm text-[#333]">Phone Number</label>
            <input
              name="phone_number"
              type="tel"
              maxLength="10"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={loading || step === 'otp'}
              className="w-full p-3 px-4 rounded-lg border-2 border-[#e0e0e0] text-[15px] text-[#1a1a1a] transition-all duration-200 font-inherit focus:outline-none focus:border-[#58335e] focus:shadow-[0_0_0_3px_rgba(88,51,94,0.1)] disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed disabled:border-[#e0e0e0] sm:p-[10px_14px] sm:text-sm"
            />
            {errors.phone_number && <p className="text-red-600 text-sm mt-1 text-left">{errors.phone_number}</p>}
          </div>

          <div className="flex flex-col">
            <label className="block text-left mb-1.5 font-semibold text-sm text-[#333]">Password</label>
            <div className="relative flex items-center">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 px-4 pr-[35px] rounded-lg border-2 border-[#e0e0e0] text-[15px] text-[#1a1a1a] transition-all duration-200 font-inherit focus:outline-none focus:border-[#58335e] focus:shadow-[0_0_0_3px_rgba(88,51,94,0.1)] disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed disabled:border-[#e0e0e0] sm:p-[10px_14px] sm:text-sm"
                disabled={loading || step === 'otp'}
              />
              <button
                type="button"
                className="absolute right-[5px] bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading || step === 'otp'}
              >
                <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1 text-left">{errors.password}</p>}
          </div>

          <div className="flex flex-col">
            <label className="block text-left mb-1.5 font-semibold text-sm text-[#333]">Confirm Password</label>
            <div className="relative flex items-center">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 px-4 pr-[35px] rounded-lg border-2 border-[#e0e0e0] text-[15px] text-[#1a1a1a] transition-all duration-200 font-inherit focus:outline-none focus:border-[#58335e] focus:shadow-[0_0_0_3px_rgba(88,51,94,0.1)] disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed disabled:border-[#e0e0e0] sm:p-[10px_14px] sm:text-sm"
                disabled={loading || step === 'otp'}
              />
              <button
                type="button"
                className="absolute right-[5px] bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={loading || step === 'otp'}
              >
                <i className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`} />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1 text-left">{errors.confirmPassword}</p>
            )}
          </div>

          {/* OTP Section */}
          {step === 'otp' && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="mt-4 pt-4 border-t border-[#eee]"
             >
                <div className="my-[15px]">
                    <label className="block text-[#58335e] font-bold">Enter Verification Code</label>
                    <p className="text-xs text-[#666] mb-2">
                       Sent to {formData.email}
                    </p>
                    <input 
                       name="otp" 
                       value={formData.otp} 
                       onChange={handleChange} 
                       placeholder="6-digit OTP"
                       maxLength="6"
                       className="w-full p-2 tracking-[2px] text-lg text-center border-2 border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#58335e] mb-2"
                       disabled={loading}
                    />
                    {errors.otp && <p className="text-red-600 text-sm mt-1">{errors.otp}</p>}
                    
                    <div className="flex justify-between mt-2 text-[13px]">
                       <span style={{ color: timer > 0 ? '#666' : '#d32f2f' }}>
                          Expect code in: {formatTime(timer)}
                       </span>
                       <button 
                         type="button"
                         onClick={handleSendOtp}
                         disabled={timer > 0 || loading}
                         style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: timer > 0 ? '#ccc' : '#58335e',
                            cursor: timer > 0 ? 'default' : 'pointer',
                            textDecoration: 'underline'
                         }}
                       >
                         Resend Code
                       </button>
                    </div>
                </div>
             </motion.div>
          )}

          {errors.submit && (
            <p className={`text-center p-3 rounded-lg border mt-0 text-sm ${
              errors.submit.includes('sent') ? 'text-green-800 bg-green-100 border-green-200' : 'text-center bg-[#fee] border-[#fcc] text-[#dc2626]'
            }`}>
              {errors.submit}
            </p>
          )}

          {step === 'success' && (
            <motion.div 
              className="text-center p-4 bg-green-100 border border-green-200 rounded-lg text-green-700 font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="m-0">✓ Registration successful!</p>
            </motion.div>
          )}

          {step === 'form' ? (
             <button 
               type="button"
               className="p-3.5 px-6 bg-linear-to-br from-[#58335e] to-[#6d4575] text-white border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 mt-2.5 hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(88,51,94,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none sm:p-[12px_20px] sm:text-[15px] text-white flex justify-center items-center" 
               onClick={handleSendOtp}
               disabled={loading}
             >
               {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> : "Verify Email & Register"}
             </button>
          ) : (
            <div className="flex gap-2.5">
                <button 
                  type="button"
                  onClick={() => { setStep('form'); setErrors({}); }}
                  className="p-3.5 px-6 bg-[#f5f5f5] text-[#333] border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 mt-2.5 hover:bg-[#e0e0e0] disabled:opacity-60 disabled:cursor-not-allowed sm:p-[12px_20px] sm:text-[15px]" 
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  className="p-3.5 px-6 bg-linear-to-br from-[#58335e] to-[#6d4575] text-white border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 mt-2.5 hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(88,51,94,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none sm:p-[12px_20px] sm:text-[15px] text-white flex-1 flex justify-center items-center" 
                  disabled={loading}
                >
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> : "Complete Registration"}
                </button>
            </div>
          )}
          
        </form>

        <p className="mt-6 text-center text-[#666] text-[15px]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#58335e] cursor-pointer font-semibold transition-colors duration-200 hover:text-[#6d4575] hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
