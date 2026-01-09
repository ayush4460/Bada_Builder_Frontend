import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
// import "./Login.css"; // Removed and replaced with Tailwind
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { performanceMonitor } from "../utils/performance";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Get login function from context
  const from = location.state?.from || "/";
  const returnTo = location.state?.returnTo;
  const property = location.state?.property;
  const message = location.state?.message;
  
  // Login redirect logic
  const getRedirectPath = useCallback(() => {
    // If coming from BookSiteVisit, redirect back with property data
    if (returnTo && returnTo.includes('/book-visit')) {
      return { 
        path: '/book-visit', 
        state: { property } 
      };
    }
    
    return from === "/login" ? "/" : from; // Don't redirect back to login page
  }, [from, returnTo, property]);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ------------------ RESET FORM FUNCTION ------------------
  const resetForm = useCallback(() => {
    setShowPassword(false);
    setFormData({
      email: "",
      password: "",
    });
    setErrors({});
    setLoading(false);
  }, []);

  // ------------------ HANDLE HEADER LOGIN CLICK ------------------
  useEffect(() => {
    // Check if user clicked login from header while already on login page
    if (location.state?.resetForm) {
      resetForm();
      // Show brief reset confirmation
      setErrors({ submit: "Form has been reset. Please enter your credentials." });
      setTimeout(() => {
        setErrors({});
      }, 2000); 
      // Clear the state to prevent repeated resets
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, resetForm, navigate, location.pathname]);

  // ------------------ HANDLE INPUT ------------------
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific errors immediately
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // ------------------ VALIDATION ------------------
  const validate = useMemo(() => {
    return () => {
      const newErrors = {};

      if (!formData.email) {
        newErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Enter a valid email.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  }, [formData]);

  // ------------------ LOGIN ------------------
  const loginUser = useCallback(async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await performanceMonitor.trackNetworkRequest(
        'Login',
        (async () => {
          const response = await authService.login({ 
             email: formData.email, 
             password: formData.password 
          });
          if (response.data.success) {
            // Update AuthContext state
            login(response.data.token, response.data.user);
            return response.data;
          } else {
            throw new Error(response.data.message || 'Login failed');
          }
        })()
      );
      
      // Navigate immediately after auth success
      const redirectInfo = getRedirectPath();
      
      if (typeof redirectInfo === 'object' && redirectInfo.path) {
        // Special redirect with state (like BookSiteVisit with property data)
        navigate(redirectInfo.path, { 
          state: redirectInfo.state, 
          replace: true 
        });
      } else {
        // Normal redirect
        navigate(redirectInfo, { replace: true });
      }
    } catch (error) {
      let msg = "Login failed";
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  }, [navigate, formData, validate, login, getRedirectPath, loading]);

  // ------------------ UI ------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-[#f5f7fa] to-[#e8ecf1] p-5">
      {/* Full-screen loading overlay */}
      {loading ? (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-center justify-center z-[9999] cursor-wait select-none pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex flex-col items-center gap-5 bg-white p-10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-[300px] text-center pointer-events-none">
            <div className="w-10 h-10 border-4 border-[#58335e]/20 border-t-[#58335e] rounded-full animate-spin"></div>
            <p className="m-0 text-base font-semibold text-[#333] leading-relaxed">Signing you in...</p>
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
          Login
        </motion.h2>

        {/* Message from redirect (e.g., from Register or BookSiteVisit) */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 px-4 rounded-lg mb-5 border text-sm text-center ${message.toLowerCase().includes('success') ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-300'}`}
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={loginUser} className={`flex flex-col gap-5 sm:gap-4 ${loading ? 'pointer-events-none opacity-70' : ''}`}>
          
          <div>
            <label className="block text-left mb-1.5 font-semibold text-sm text-[#333]">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 px-4 rounded-lg border-2 border-[#e0e0e0] text-[15px] text-[#1a1a1a] transition-all duration-200 font-inherit focus:outline-none focus:border-[#58335e] focus:shadow-[0_0_0_3px_rgba(88,51,94,0.1)] disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed disabled:border-[#e0e0e0] sm:p-[10px_14px] sm:text-sm"
            />
            {errors.email && <p className="text-red-600 text-sm -mt-1 text-left">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-left mb-1.5 font-semibold text-sm text-[#333]">Password</label>
            <div className="relative flex items-center">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 px-4 pr-[35px] rounded-lg border-2 border-[#e0e0e0] text-[15px] text-[#1a1a1a] transition-all duration-200 font-inherit focus:outline-none focus:border-[#58335e] focus:shadow-[0_0_0_3px_rgba(88,51,94,0.1)] disabled:bg-[#f5f5f5] disabled:text-[#999] disabled:cursor-not-allowed disabled:border-[#e0e0e0] sm:p-[10px_14px] sm:text-sm"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-[5px] bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
              >
                <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
              </button>
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1 text-left">{errors.password}</p>}
          </div>

          {errors.submit && (
            <p className={`text-center p-3 rounded-lg border mt-0 text-sm ${
              errors.submit.includes('successful') ? 'text-green-600 bg-green-50 border-green-200' : 
              errors.submit.includes('reset') ? 'text-sky-700 bg-sky-50 border-sky-300' : 'text-center bg-[#fee] border-[#fcc] text-[#dc2626]'
            }`}>
              {errors.submit}
            </p>
          )}

          <button 
            className="p-3.5 px-6 bg-linear-to-br from-[#58335e] to-[#6d4575] text-white border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 mt-2.5 hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(88,51,94,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none sm:p-[12px_20px] sm:text-[15px] !text-white" 
            disabled={loading}
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span> : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-[#666] text-[15px]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#58335e] cursor-pointer font-semibold transition-colors duration-200 hover:text-[#6d4575] hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

