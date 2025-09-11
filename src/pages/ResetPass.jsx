import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {resetPassword} from "../services/api.js";
import CustomizedSnackbars from "../components/SnackBar";

export default function ResetPass({ onClose, onSwitchToLogin, onSwitchToFotgotPass }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")

  const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpen(false);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const email = localStorage.getItem('email');
      const respose = await resetPassword(email, password);

      console.log("Password reset Successfully", respose);
      localStorage.removeItem('email');
      setSnackbarMessage("Reset password successful!");
      setSnackbarSeverity("success");
      setOpen(true);

      // On success, navigate to login or success page
      setTimeout(() => {
        if (onSwitchToLogin) {
        onClose?.();
        onSwitchToLogin();
      } else {
        navigate("/login", {
          state: {
            message:
              "Password reset successfully! Please login with your new password.",
          },
        });
      }
      }, 750);
      
    } catch (err) {
      console.log(err);
      setError("Failed to reset password. Please try again.");
      setSnackbarMessage("Error resetting password");
      setSnackbarSeverity("error");
      setOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleLoginClick = (e) => {
    if (onSwitchToLogin) {
      e.preventDefault();
      onClose?.();
      onSwitchToLogin();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 font-poppins p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md relative">
        {/* Logo */}
        <svg onClick={onSwitchToFotgotPass} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        <div className="flex justify-center mb-4 sm:mb-6">
          <img src={logo} alt="BitCampus Logo" className="w-32 sm:w-40" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-1 sm:mb-2">
          Change New Password
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-sm text-center mb-4 sm:mb-6">
          Enter your new password below
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block font-medium mb-1 text-sm sm:text-base">
              New Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm sm:text-base"
              required
              minLength="8"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-sm sm:text-base">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base ${
                error
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-sky-400"
              }`}
              required
              minLength="8"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#2C3E50] text-white py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base ${
              isLoading ? "opacity-75" : "hover:opacity-90"
            }`}
          >
            {isLoading ? "Processing..." : "Submit"}
          </button>
        </form>
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
