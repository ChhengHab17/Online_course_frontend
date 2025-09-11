import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {sendForgotPasswordCode} from "../services/api.js";

export default function ForgotPass({
  onClose,
  onSwitchToRegister,
  onSwitchToLogin,
  onSwitchToPassCode,
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await sendForgotPasswordCode(email);
      localStorage.setItem("email", email);

      if (onSwitchToPassCode) {
        e.preventDefault();
        onClose?.();
        onSwitchToPassCode();
      } else {
        navigate("/pass-code");
      }
    } catch (err) {
      console.log(err);
      setError("Failed to send code. Please try again.");
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
  const handleSignUpClick = (e) => {
    if (onSwitchToRegister) {
      e.preventDefault();
      onClose?.();
      onSwitchToRegister();
    } else {
      navigate("/register");
    }
  };
  // const handleSubmitClick = (e) => {
  //   if (onSwitchToPassCode) {
  //     e.preventDefault();
  //     onClose?.();
  //     onSwitchToPassCode();
  //   } else {
  //     navigate("/Pass-code");
  //   }
  // };

 return (
  <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4 sm:p-6">
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md relative mx-auto my-8">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close forgot password"
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

      {/* Logo and Title */}
      <div className="flex flex-col items-center mt-2 sm:mt-6">
        <img src={logo} alt="BitCampus Logo" className="w-32 sm:w-40" />
        <h1 className="text-center text-xl sm:text-2xl font-bold text-gray-900 mt-2">
          Forgot Password
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm text-center mt-2 px-2">
          Enter your registered email below
        </p>
      </div>

      {/*/!* Success Message *!/*/}
      {/*{success && (*/}
      {/*  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm text-center">*/}
      {/*    Password reset link sent successfully!*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      {!success && (
        <form className="mt-4 sm:mt-6" onSubmit={handleSubmit}>
          <div className="mb-4 sm:mb-6">
            <label className="block font-medium mb-1 text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 sm:p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm sm:text-base"
              required
            />
          </div>

          <button
            type="submit"
            // onClick={handleSubmitClick}
            className={`w-full bg-[#2C3E50] text-white py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:opacity-90"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Submit"}
          </button>
        </form>
      )}

      {/* Links */}
      <div className="text-center text-xs sm:text-sm mt-4 sm:mt-6 space-y-1 sm:space-y-2">
        <p className="text-gray-600">
          Remember your password?{" "}
          <button
            onClick={handleLoginClick}
            className="text-sky-500 hover:underline"
          >
            Log in
          </button>
        </p>
        <p className="text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={handleSignUpClick}
            className="text-sky-500 hover:underline"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  </div>
  );
}


