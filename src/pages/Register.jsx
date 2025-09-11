import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { signup, sendCode } from "../services/api";

export default function Register({ onClose, onSwitchToLogin, onSwitchToVerify }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try{
      const response = await signup(formData.username, formData.email, formData.password)
      console.log("Registration response: ", response);
      localStorage.setItem("email", formData.email);
      onClose?.();
      if (onSwitchToVerify) {
        e.preventDefault();
        onClose?.();
        onSwitchToVerify();
      } else {
        navigate("/verify");
      }
      await sendCode(formData.email);
    }catch(error){
      console.log(error);
      alert(
        "Registration failed: " +
          (error.response?.data?.message || error.message)
      );
    }finally{
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
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md relative mx-auto my-8">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close registration"
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
            Let's start,{" "}
            <span className="text-sky-500 font-semibold">It's easy!</span>
          </p>
        </div>

        {/* Form */}
        <form className="mt-4 sm:mt-6" onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="username"
              className="block font-medium mb-1 text-sm sm:text-base"
            >
              User Name
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="User Name"
              value={formData.username}
              onChange={handleChange}
              className="p-2 sm:p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm sm:text-base"
              required
            />
          </div>

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

          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="confirmPassword"
              className="block font-medium mb-1 text-sm sm:text-base"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`p-2 sm:p-3 border rounded-lg w-full focus:outline-none focus:ring-2 ${
                  passwordError
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-sky-400"
                } text-sm sm:text-base pr-10`}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
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
            {passwordError && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {passwordError}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-center mb-4 sm:mb-6">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="mr-2"
              required
            />
            <label className="text-xs sm:text-sm">
              I accept the{" "}
              <button type="button" className="text-sky-500 hover:underline">
                terms of service
              </button>
            </label>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#2C3E50] text-white py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Log in link */}
        <p className="text-center text-xs sm:text-sm mt-3 sm:mt-4">
          Already have an account?{" "}
          <button
            onClick={handleLoginClick}
            className="text-sky-500 hover:underline focus:outline-none"
          >
            Log In here
          </button>
        </p>
      </div>
    </div>
  );
}
