import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { sendCode, verifyCode } from "../services/api";
import {CountdownTimer} from "../components/CountDown.jsx";
import CustomizedSnackbars from "../components/SnackBar";

export default function VerifyCode({ onClose, onSwitchToResetPass, onSwitchToRegister }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const inputRefs = useRef([]);
  const [timerResetCounter, setTimerResetCounter] = useState(0);
  const initialTimer = 5 * 60 * 1000;
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")

  const handleCodeChange = (value, index) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < code.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpen(false);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
      try {
        const email = localStorage.getItem('email');
        const enteredCode = code.join('');
        const response = await verifyCode(email, enteredCode);
        console.log("Code verification Successfully", response);
        setSnackbarMessage("Registration successful!");
        setSnackbarSeverity("success");
        setOpen(true);
        setTimeout(() => {
          onClose?.(); // optional: close modal
          navigate("/");
        }, 750);
        localStorage.setItem('role', 'ROLE_USER');
        localStorage.setItem('token', response.token);
        localStorage.removeItem('email');
      } catch (error) {
        console.log(error);
        // alert("Login error: " + (error.response?.data?.message || error.message));
        setSnackbarMessage("Registration failed");
        setSnackbarSeverity("error");
        setOpen(true);
      }finally {
        setIsVerifying(false);
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
        <svg onClick={onSwitchToRegister} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        <div className="flex justify-center mb-4 sm:mb-6">
          <img src={logo} alt="BitCampus Logo" className="w-32 sm:w-40" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-1 sm:mb-2">
          Verication Code
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
                type="text"
                value={digit}
                onChange={(e) => handleCodeChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                maxLength="1"
                className="w-12 h-12 text-center text-lg font-bold border border-gray-500 rounded-lg focus:outline-none focus:border-blue-500"
              />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isVerifying}
            className={`w-full py-2 sm:py-3 px-4 rounded-full font-medium text-white text-sm sm:text-base ${
              isVerifying ? "bg-gray-400" : "bg-[#2C3E50] hover:opacity-90"
            }`}
          >
            {isVerifying ? "Verifying..." : "Submit"}
          </button>
        </form>

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
      <CustomizedSnackbars
              open={open}
              handleClose={handleClose}
              message={snackbarMessage}
              severity={snackbarSeverity}
            />
    </div>
  );
}
