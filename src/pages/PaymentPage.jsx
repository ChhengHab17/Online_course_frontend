import React, { useState, useEffect } from "react";
import { generateQR, checkTransaction } from "../services/api"; // assume you have verifyQR implemented in your API
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import CustomizedSnackbars from "../components/SnackBar";
import { motion } from "framer-motion";
import {CountdownTimer} from "../components/CountDown.jsx";

export const PaymentPage = () => {
  const [qrImage, setQrImage] = useState(null);
  const [md5, setMd5] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const { course_id } = useParams();
  const { state } = useLocation();
  const amount = parseFloat(state?.coursePrice || 0);
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [username, setUsername] = useState("");
  const [courseName, setCourseName] = useState("");
  const initialTimer = 5 * 60 * 1000;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try{
        const token = localStorage.getItem("token");
        const username = jwtDecode(token).username;
        setUsername(username);
        setCourseName(state?.courseName || "the course");

      }catch(err){
        console.log(err);
      }
    }
    fetchDetails();
  }, [course_id]);
  const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpen(false);
    };

  const generateQRHandler = async (amount) => {
    setLoading(true);
    setQrImage(null);
    setMd5(null);
    setSuccess(false);

    try {
      const response = await generateQR(amount);
      console.log(response);

      if (response.success) {
        setQrImage(response.data.base64);
        setMd5(response.data.md5);
      } else {
        alert("Failed to generate QR: " + response.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate QR: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Get stored end time or set a new one
    localStorage.removeItem('paymentEndTime');
    const storedEndTime = localStorage.getItem('paymentEndTime');
    const endTime = storedEndTime || (Date.now() + initialTimer);
    
    // Store end time if not already stored
    if (!storedEndTime) {
      localStorage.setItem('paymentEndTime', endTime);
    }

    const timeLeft = endTime - Date.now();

    // If time's up or negative time left, navigate back
    if (timeLeft <= 0) {
      localStorage.removeItem('paymentEndTime');
      navigate(-1);
      return;
    }

    // Set timeout for remaining time
    const timer = setTimeout(() => {
      localStorage.removeItem('paymentEndTime');
      
      setOpen(true);
      setSnackbarMessage("Payment time expired");
      setSnackbarSeverity("error");
      setTimeout(() => navigate(-1), 1000);
    }, timeLeft);

    return () => {
      clearTimeout(timer);
    };
  }, [navigate]);

  // Calculate remaining time for CountDown component
  const getRemainingTime = () => {
    const endTime = localStorage.getItem('paymentEndTime');
    if (!endTime) return initialTimer;
    const remaining = endTime - Date.now();
    return remaining > 0 ? remaining : 0;
  };
  useEffect(() => {
    generateQRHandler(amount);
  }, [amount]);

  // Polling to check if QR is paid
  useEffect(() => {
  if (!md5) return;

  const interval = setInterval(async () => {
    try {
      const res = await checkTransaction(md5); // call your backend
      const data = res.data?.data;
      console.log("data:", data);
      console.log("Course ID:", course_id);
      console.log("Payment check:", data);

      // If acknowledgedDateMs exists, consider it paid
      if (data === "PAID") {
        setSuccess(true);
        clearInterval(interval);
        const token = localStorage.getItem("token");
        const userId = jwtDecode(token).userId;

  await axios.patch("https://backend-hosting-d4f6.onrender.com/api/enrollment/mark-paid", {
          user_id: userId,
          course_id: course_id,
        });
        setSnackbarMessage("Payment successful!");
        setSnackbarSeverity("success");
        setOpen(true);
        // Redirect to course page
        setTimeout(() => {
          navigate(`/course/${course_id}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Error verifying QR:", err);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [md5]);


    return (
    <div className="min-h-screen bg-gray-100 py-3 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      {/* <motion.button
        onClick={() => {
          navigate(-1);
          localStorage.removeItem('paymentEndTime');
          // Scroll to top after navigation
          setTimeout(() => window.scrollTo(0, 0), 0);
        }}
        className="flex items-center gap-2 px-3 py-1 ml-3 rounded-lg bg-[#2C3E50] text-white font-semibold shadow transition-all duration-200"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </motion.button> */}

      {/* Card */}
      <motion.div
        className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="bg-[#2C3E50] px-6 py-4 relative">
          <motion.button
            onClick={() => {
              navigate(-1);
              localStorage.removeItem('paymentEndTime');
              // Scroll to top after navigation
              setTimeout(() => window.scrollTo(0, 0), 0);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
          <motion.h1
            className="text-2xl font-bold text-white text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Payment Details
          </motion.h1>
        </div>

        <div className="px-6 py-4">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            {/* Order Summary */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Student Name:</span>
                  <span className="font-medium">{username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium">{courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* QR Section */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Scan QR Code to Pay
              </h3>
               <span className="text-red-600 text-lg font-semibold">
                              <CountdownTimer initialTime={getRemainingTime()}/>
              </span>
              {loading ? (
                <motion.p
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  Generating QR...
                </motion.p>
              ) : (
                
                <motion.div
                  className="bg-gray-50 p-4 rounded-lg inline-block"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 10 }}
                >
                  <img
                    src={qrImage}
                    alt="QR Code"
                    className="mx-auto max-w-[200px]"
                  />
                </motion.div>
              )}
              <p className="mt-4 text-sm text-gray-500">
                Please scan the QR code using your mobile payment app
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Snackbar */}
      <CustomizedSnackbars
        open={open}
        handleClose={handleClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </div>
  );
};
