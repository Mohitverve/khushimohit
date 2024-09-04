// src/Login.js
import React from 'react';
import { auth, provider, signInWithPopup } from './firebaseConfig';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert('You are successfully signed in!');

     

      navigate('/'); // Redirect to home page after successful login
    } catch (error) {
      console.error('Error during sign-in:', error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to Our Love Den Baby 💖</h2>
        <p>Sign in to continue sharing the love and memories.</p>
        <button onClick={handleGoogleSignIn} className="google-signin-btn">
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
