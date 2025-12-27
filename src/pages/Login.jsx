import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import "./Login.css";
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
    <div className="login-page">
      {/* Full-screen loading overlay */}
      {loading ? (
        <motion.div
          className="fullscreen-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <p className="loading-text">Signing you in...</p>
          </div>
        </motion.div>
      ) : null}

      <motion.div
        className="login-box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Login
        </motion.h2>

        {/* Message from redirect (e.g., from Register or BookSiteVisit) */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="redirect-message"
            style={{
              backgroundColor: message.toLowerCase().includes('success') ? '#dcfce7' : '#fef3c7',
              color: message.toLowerCase().includes('success') ? '#166534' : '#92400e',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: message.toLowerCase().includes('success') ? '1px solid #bbf7d0' : '1px solid #fbbf24',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={loginUser} className={`login-form ${loading ? 'form-disabled' : ''}`}>
          
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Password</label>
          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="password-input"
              disabled={loading}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
            >
              <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
            </button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          {errors.submit && (
            <p className={`error submit-error ${
              errors.submit.includes('successful') ? 'success-login' : 
              errors.submit.includes('reset') ? 'info-message' : ''
            }`}>
              {errors.submit}
            </p>
          )}

          <button 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>

        <p className="toggle-text">
          Don't have an account?{" "}
          <Link to="/register" className="toggle-link">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

