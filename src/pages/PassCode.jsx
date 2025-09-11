import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {sendCode, verifyCode, verifyForgotPasswordCode} from "../services/api";
import {CountdownTimer} from "../components/CountDown.jsx";

export default function PassCode({ onClose, onSwitchToResetPass, onSwitchToForgotPass }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [timerResetCounter, setTimerResetCounter] = useState(0);
  const initialTimer = 5 * 60 * 1000;

  const handleCodeChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
      try {
        const email = localStorage.getItem('email');
        const providedCode = code.join('');
        const response = await verifyForgotPasswordCode(email, providedCode);
        console.log("Code verification Successfully", response);
        console.log(providedCode);
        if (onSwitchToResetPass) {
          e.preventDefault();
          onClose?.();
          onSwitchToResetPass();
        } else {
          navigate("/reset-password");
        }
        setIsVerifying(false);
      } catch (error) {
        console.log(error);
        alert("Login error: " + (error.response?.data?.message || error.message));
        setIsVerifying(false);
      }
    };
  const handleSubmitCode = (e) => {
    if (onSwitchToResetPass) {
      e.preventDefault();
      onClose?.();
      onSwitchToResetPass();
    } else {
      navigate("/reset-password");
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      const email = localStorage.getItem('email');
      const response = await sendCode(email);
      setTimerResetCounter((c) => c + 1);
      console.log("Code verification Successfully", response);
    } catch (error) {
      console.log(error);
      alert("Login error: " + (error.response?.data?.message || error.message));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 font-poppins p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md relative">
        {/* Logo */}
        <svg onClick={onSwitchToForgotPass} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        <div className="flex justify-center mb-4 sm:mb-6">
          <img src={logo} alt="BitCampus Logo" className="w-32 sm:w-40" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-1 sm:mb-2">
          Forgot Password
        </h1>

        {/* Description */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Please check your email for verification code
          </p>
        </div>

        {/* Error/Success Message */}
        {error && (
          <div
            className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
              error.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* Code Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(e, index)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            // onClick={handleSubmitCode}
            disabled={isVerifying}
            className={`w-full py-2 sm:py-3 px-4 rounded-full font-medium text-white text-sm sm:text-base ${
              isVerifying ? "bg-gray-400" : "bg-[#2C3E50] hover:opacity-90"
            }`}
          >
            {isVerifying ? "Verifying..." : "Submit"}
          </button>
        </form>
        <div className="flex justify-center mt-2 mb-0 text-red-600 ">

        </div>

        {/* Resend Code */}
        <p className="mt-3 text-center text-xs sm:text-sm text-gray-600 flex justify-center items-center space-x-2">
          Didn't receive code?{" "}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sky-500 hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>
          <span className="text-red-600">
            <CountdownTimer initialTime={initialTimer} resetTrigger={timerResetCounter}/>
          </span>
        </p>
      </div>
    </div>
  );
}
