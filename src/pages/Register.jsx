import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import "./Login.css"; 
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
    <div className="login-page">
      {/* Loading Overlay */}
      {(loading && step !== 'success') || step === 'redirecting' ? (
        <motion.div
          className="fullscreen-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <p className="loading-text">
              {step === 'redirecting' ? "Redirecting to login..." : 
               step === 'creating' ? "Verifying & Creating Account..." : 
               "Processing..."}
            </p>
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
          Create Account
        </motion.h2>

        <form onSubmit={createUser} className={`login-form ${loading ? 'form-disabled' : ''}`}>
          
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} disabled={loading || step === 'otp'} />
          {errors.name && <p className="error">{errors.name}</p>}

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading || step === 'otp'}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Phone Number</label>
          <input
            name="phone_number"
            type="tel"
            maxLength="10"
            value={formData.phone_number}
            onChange={handleChange}
            disabled={loading || step === 'otp'}
          />
          {errors.phone_number && <p className="error">{errors.phone_number}</p>}

          <label>Password</label>
          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="password-input"
              disabled={loading || step === 'otp'}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading || step === 'otp'}
            >
              <i className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
            </button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="password-input"
              disabled={loading || step === 'otp'}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              disabled={loading || step === 'otp'}
            >
              <i className={`far ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}

          {/* OTP Section - Only show after initial validation and send button click */}
          {step === 'otp' && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="otp-section"
             >
                <div style={{ margin: '15px 0', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <label style={{ color: '#58335e', fontWeight: 'bold' }}>Enter Verification Code</label>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                       Sent to {formData.email}
                    </p>
                    <input 
                       name="otp" 
                       value={formData.otp} 
                       onChange={handleChange} 
                       placeholder="6-digit OTP"
                       maxLength="6"
                       style={{ letterSpacing: '2px', fontSize: '18px', textAlign: 'center' }}
                       disabled={loading}
                    />
                    {errors.otp && <p className="error">{errors.otp}</p>}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px' }}>
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
            <p className={`error submit-error ${errors.submit.includes('sent') ? 'success-login' : ''}`}>
              {errors.submit}
            </p>
          )}

          {step === 'success' && (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="success">✓ Registration successful!</p>
            </motion.div>
          )}

          {step === 'form' ? (
             <button 
               type="button"
               className="submit-btn" 
               onClick={handleSendOtp}
               disabled={loading}
             >
               {loading ? <span className="spinner"></span> : "Verify Email & Register"}
             </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  className="submit-btn" 
                  onClick={() => { setStep('form'); setErrors({}); }}
                  style={{ background: '#f5f5f5', color: '#333' }}
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  className="submit-btn" 
                  disabled={loading}
                >
                  {loading ? <span className="spinner"></span> : "Complete Registration"}
                </button>
            </div>
          )}
          
        </form>

        <p className="toggle-text">
          Already have an account?{" "}
          <Link to="/login" className="toggle-link">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
