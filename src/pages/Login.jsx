import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Login.css';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword  } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from "../firebase";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (mode === 'register' && !formData.name.trim())
      newErrors.name = 'Name is required.';

    if (!formData.email)
      newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email.';

    if (!formData.phone)
      newErrors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = 'Phone number must be 10 digits.';

    if (!formData.password)
      newErrors.password = 'Password is required.';
    else if (formData.password.length < 6)
      newErrors.password = 'Password should be at least 6 characters.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // To Login for an existing User
  async function loginUser(email, password) {
    setLoading(true);
    setErrors({});
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Logged In Successfully:", userCredential.user.email);
      
      // Small delay for better UX
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error("❌ Login error:", error.code, error.message);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your connection';
      }
      
      setErrors({ submit: errorMessage });
      setLoading(false);
    }
  }

  // To Register a new User
  async function createUser(email, password, name, phone) {
    setLoading(true);
    setErrors({});
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ User Created:", userCredential.user.email);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        name: name,
        phone: phone,
        is_subscribed: false,
        subscription_expiry: null,
        created_at: new Date().toISOString()
      });
      
      console.log("✅ User profile saved to Firestore");
      
      // Small delay for better UX
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error("❌ Registration error:", error.code, error.message);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered. Please login instead';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your connection';
      }
      
      setErrors({ submit: errorMessage });
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      if (mode === 'login') {
        loginUser(formData.email, formData.password);
      } else {
        createUser(formData.email, formData.password, formData.name, formData.phone);
      }
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setErrors({});
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          key={mode}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </motion.h2>
        <p>Please enter your details to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="error">{errors.name}</p>}
            </>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="10-digit number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <p className="error">{errors.phone}</p>}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}

          {errors.submit && (
            <motion.p 
              className="error submit-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.submit}
            </motion.p>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                {mode === 'login' ? 'Logging in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <p className="toggle-text">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span onClick={toggleMode} className="toggle-link">
            {mode === 'login' ? 'Register' : 'Login'}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;