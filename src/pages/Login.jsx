import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {sendCode, signin} from "../services/api";
import CustomizedSnackbars from "../components/SnackBar";

export default function Login({
  onClose,
  onSwitchToRegister,
  onForgotPasswordClick,
  onSwitchToVerify
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleError, setGoogleError] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  // Helper: send Google idToken to backend
  const handleGoogleToken = async (idToken, retryCount = 0) => {
    console.log("Received Google idToken:", idToken?.substring(0, 50) + "..."); // Debug log
    
    try {
      setIsLoading(true);
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/auth/google-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await res.json();
      console.log("Backend response:", data); // Debug log
      
      if (!res.ok || !data.success) {
        // If it's a token timing issue and we haven't retried, try once more
        if (data.message?.includes('Token used too early') && retryCount === 0) {
          console.log("Token timing issue, retrying in 1 second...");
          setTimeout(() => {
            handleGoogleToken(idToken, 1);
          }, 1000);
          return;
        }
        
        setSnackbarMessage(data.message || "Google sign-in failed");
        setSnackbarSeverity("error");
        setOpen(true);
        return;
      }
      
      localStorage.setItem("token", data.token);
      // Handle role array format from backend
      const role = Array.isArray(data.role) ? data.role[0] : data.role;
      localStorage.setItem("role", role || "ROLE_USER");
      
      // Show success message - account linking or login
      setSnackbarMessage("Google login successful! Account linked.");
      setSnackbarSeverity("success");
      setOpen(true);
      
      setTimeout(() => {
        onClose?.();
        const userRole = localStorage.getItem("role");
        if (userRole === 'ROLE_ADMIN') {
          navigate("/admin");
        } else {
          navigate("/");
        }
        // Reload page after navigation
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 750);
      
    } catch (err) {
      console.error("Google sign-in request error:", err);
      setSnackbarMessage("Network error during Google sign-in");
      setSnackbarSeverity("error");
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Google Identity Services and render button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log("Frontend Google Client ID:", clientId); // Debug log
    
    // Check if client ID is properly configured
    if (!clientId || clientId === "your_actual_google_client_id_here" || clientId.trim() === "") {
      console.log("Google Client ID not configured");
      setGoogleError(true);
      return;
    }
    
    const initializeGoogle = () => {
      if (window.google && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              console.log("Google callback response:", response); // Debug log
              if (response && response.credential) {
                handleGoogleToken(response.credential);
              } else {
                console.error("No credential in Google response");
                setSnackbarMessage("Google sign-in failed - no credential received");
                setSnackbarSeverity("error");
                setOpen(true);
              }
            },
            error_callback: (error) => {
              console.error("Google OAuth error:", error);
              setSnackbarMessage(`Google sign-in error: ${error.type || 'Unknown error'}`);
              setSnackbarSeverity("error");
              setOpen(true);
            },
            // Add these options for better compatibility
            use_fedcm_for_prompt: false,
            itp_support: true,
          });
          
          // render the button into a placeholder div
          const btnContainer = document.getElementById("google-signin-button");
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              width: "100%",
              logo_alignment: "left"
            });
            setGoogleLoaded(true);
            console.log("Google button rendered successfully");
          } else {
            console.error("Google button container not found");
          }
        } catch (error) {
          console.error("Google initialization error:", error);
          setGoogleError(true);
        }
      } else {
        console.log("Google script not loaded or client ID missing");
      }
    };

    // Check if script already exists
    const existingScript = document.getElementById("google-identity-script");
    if (existingScript) {
      // Script exists, try to initialize
      if (window.google) {
        initializeGoogle();
      } else {
        // Wait for script to load
        existingScript.onload = initializeGoogle;
      }
    } else {
      // Create and load script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-identity-script";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        console.error("Failed to load Google Identity Services");
        setGoogleError(true);
      };
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Optional: cleanup if needed
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await signin(formData.email, formData.password);

      // First, check if login credentials are correct
      if (!response.success && response.message !== "You are not verified yet!") {
        // Wrong password or other login issues
        setSnackbarMessage(response.message);
        setSnackbarSeverity("error");
        setOpen(true);
        return;
      }

      // Only redirect to verification if credentials are correct but not verified
      else if (!response.success && response.message === "You are not verified yet!") {
        alert("You are not verified yet! Let's verify your account");
        localStorage.setItem("email", formData.email);
        await sendCode(formData.email); // send verification code

        if (onSwitchToVerify) {
          onClose?.();
          onSwitchToVerify();
        } else {
          navigate("/verify");
        }
        return; // stop execution here
      }

      // If success, proceed to normal login
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      console.log("Login successfully:", response);
      setSnackbarMessage("Login successful!");
      setSnackbarSeverity("success");
      setOpen(true);
      setTimeout(() => {
        onClose?.();
        const role = localStorage.getItem("role");
        if (role === 'ROLE_ADMIN') {
          navigate("/admin");
        } else {
          navigate("/");
        }
        // Reload page after navigation
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 750);

    } catch (error) {
      console.log(error);
      setSnackbarMessage("Error logging in");
      setSnackbarSeverity("error");
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (onForgotPasswordClick) {
      onForgotPasswordClick();
    } else {
      navigate("/forgot-password");
    }
  };

  const handleSignUpClick = (e) => {
    if (onSwitchToRegister) {
      e.preventDefault();
      onClose?.();
      onSwitchToRegister();
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md relative mx-auto my-8">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close login"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className="flex flex-col items-center mt-2 sm:mt-6">
          <img src={logo} alt="BitCampus Logo" className="w-32 sm:w-40" />
          <p className="text-gray-500 text-xs sm:text-sm text-center mt-2 px-2">
            If you are already a member you can login with your email address
            and password.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-4 sm:mt-6" onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="email"
              className="block font-medium mb-1 text-sm sm:text-base"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="p-2 sm:p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm sm:text-base"
              required
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="password"
              className="block font-medium mb-1 text-sm sm:text-base"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="p-2 sm:p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm sm:text-base pr-10"
                required
                minLength="8"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a10.05 10.05 0 012.042-3.338m2.958-2.958A9.956 9.956 0 0112 5c5 0 9.27 3.11 10.5 7.5a9.956 9.956 0 01-4.207 5.294M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex justify-end items-center text-xs sm:text-sm mb-1 sm:mb-3">
            <span
              role="button"
              tabIndex={0}
              onClick={handleForgotPassword}
              className="text-sky-500 hover:underline focus:outline-none m-0 cursor-pointer"
            >
              Forgot Password?
            </span>
          </div>

          {/* Log in button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#2C3E50] text-white py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Or divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="px-3 text-gray-400 text-xs">
            {googleError ? "Alternative option" : "or"}
          </span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {/* Google Sign-in button - moved below form */}
        <div className="mb-4 flex justify-center">
          {!googleError && !googleLoaded && (
            <div className="flex items-center justify-center gap-2 w-full py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span className="text-gray-600 text-sm">Loading Google Sign-in...</span>
            </div>
          )}
          
          <div id="google-signin-button" className={googleError ? 'hidden' : ''}></div>
          
          {/* Show setup message if Google is not configured */}
          {googleError && (
            <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Google Sign-in not available</span>
              </div>
              <p className="text-yellow-700 text-xs mt-1">
                Please configure VITE_GOOGLE_CLIENT_ID in .env file
              </p>
            </div>
          )}
        </div>

        {/* Sign up link */}
        <p className="text-center text-xs sm:text-sm mt-3 sm:mt-4">
          Don't have an account?{" "}
          <button
            onClick={handleSignUpClick}
            className="text-sky-500 hover:underline focus:outline-none"
          >
            Sign up here
          </button>
        </p>
      </div>
      <CustomizedSnackbars
        open={open}
        handleClose={handleClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </div>
  );
}
