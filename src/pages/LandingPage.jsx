import bookLogo from "../assets/book-logo.png";
import htmlLogo from "../assets/html-logo.png";
import cssLogo from "../assets/css-logo.png";
import cppLogo from "../assets/c++-logo.png";
import pcLogo from "../assets/pc-logo.png";
import jsLogo from "../assets/javascript.png";
import pythonLogo from "../assets/python.png";
import csharpLogo from "../assets/cshap2.png";
import javaLogo from "../assets/java.png";
import { Lock, LockOpen } from "lucide-react";
import rocketLogo from "../assets/rocket-logo.png";
import heartLogo from "../assets/heart-logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import { jwtDecode } from "jwt-decode";

export default function LandingPage({ onClose, onSwitchToRegister, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestCourses, setLatestCourses] = useState([]);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const token = localStorage.getItem("token");


  // Add authentication check
  const isLoggedIn = !!localStorage.getItem("token");

  // Carousel data for programming languages
  const carouselSlides = [
    {
      title: "HTML & CSS",
      subtitle: "Build Beautiful Websites",
      description: "Master the fundamentals of web development with HTML structure and CSS styling",
      image: htmlLogo,
      bgGradient: "from-orange-500 to-red-600"
    },
    {
      title: "JavaScript",
      subtitle: "Interactive Web Development",
      description: "Create dynamic and interactive web applications with modern JavaScript",
      image: jsLogo,
      bgGradient: "from-yellow-400 to-orange-500"
    },
    {
      title: "C++",
      subtitle: "System Programming",
      description: "Learn powerful system programming and competitive programming concepts",
      image: cppLogo,
      bgGradient: "from-blue-600 to-purple-700"
    },
    {
      title: "Python",
      subtitle: "Data Science & Automation",
      description: "Learn Python for web development, data science, AI, and automation scripting",
      image: pythonLogo,
      bgGradient: "from-green-500 to-blue-600"
    },
    {
      title: "C#",
      subtitle: "Enterprise Development",
      description: "Build robust applications with C# for web, desktop, and game development",
      image: csharpLogo,
      bgGradient: "from-purple-600 to-indigo-700"
    },
    {
      title: "Java",
      subtitle: "Cross-Platform Development",
      description: "Build scalable enterprise applications with Java's write-once, run-anywhere philosophy",
      image: javaLogo,
      bgGradient: "from-blue-600 to-orange-600"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!isLoggedIn) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, carouselSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, categoriesResponse] = await Promise.all([
          fetch("https://backend-hosting-d4f6.onrender.com/api/course"),
          fetch("https://backend-hosting-d4f6.onrender.com/api/category"),
        ]);

        if (!coursesResponse.ok || !categoriesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const coursesData = await coursesResponse.json();
        const categoriesData = await categoriesResponse.json();

        setCourses(coursesData);
        setCategories(categoriesData);
        setFilteredCourses(coursesData);
        if (token) {
          const decoded = jwtDecode(token);
          const userId = decoded.userId;

          // Fetch all enrollments in a single request
          const res = await axios.get(
            `https://backend-hosting-d4f6.onrender.com/api/enrollment/user/${userId}`
          );

          const statusMap = {};
          console.log(res.data.data);
          if (res.data?.data?.length) {
            res.data.data.forEach((enrollment) => {
              const courseId = enrollment.course?._id || enrollment.course_id;
              if (courseId) {
                statusMap[courseId] = enrollment.payment_status;
              }
            });
          }

          setEnrollmentStatuses(statusMap);
          console.log("Enrollment statuses:", statusMap);
      }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sorted = [...courses].sort((a, b) => {
      const aTime = new Date(a.createAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.createAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
    setLatestCourses(sorted.slice(0, 1));
  }, [courses]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) => {
        const categoryId =
          typeof course.category_id === "object"
            ? course.category_id?._id
            : course.category_id;
        return categoryId === selectedCategory;
      });
      setFilteredCourses(filtered);
    }
  }, [selectedCategory, courses]);

  const handleSignUpClick = (e) => {
    if (onSwitchToRegister) {
      e.preventDefault();
      onClose?.();
      onSwitchToRegister();
    } else {
      navigate("/register");
    }
  };

   // Helper function to check course access status
  const getCourseAccessStatus = (course) => {
    // Free courses are always accessible
    if (course.course_price === 0) {
      return 'free';
    }
    
    // Check enrollment status for paid courses
    const enrollmentStatus = enrollmentStatuses[course._id];
    if (enrollmentStatus === 'paid') {
      return 'paid';
    } else if (enrollmentStatus === 'pending') {
      return 'pending';
    }
    
    // Not enrolled in paid course
    return 'not_enrolled';
  };

  const handleCourseClick = async (courseId) => {
    try {
       if(!token){
        onSwitchToLogin();
        return;
      }
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
  
      console.log("User ID:", userId);
      console.log("Course ID:", courseId);
      // Call your enroll API
  const res = await axios.post("https://backend-hosting-d4f6.onrender.com/api/enrollment", {
        user_id: userId,
        course_id: courseId,
      });
  
      const data = res.data;
      console.log("Enrollment result:", data);
      
      // Handle the improved response structure
      if (data.success) {
        // Check if it's a free course (code: 'free')
        if (data.code === 'free') {
          console.log("Free course access granted:", data.message);
          navigate(`/course/${courseId}`);
        } 
        // Check if user already enrolled or paid course with paid status
        else if (data.data.enrollment && data.data.enrollment.payment_status === "paid") {
          console.log("Access granted:", data.message);
          navigate(`/course/${courseId}`);
        }
        // Handle pending payment for paid courses
        else if (data.data.enrollment && data.data.enrollment.payment_status === "pending") {
          const course = data.data.course;
          const coursePrice = course.course_price || 0;
          const courseName = course.course_title || "the course";
          console.log("Payment required:", data.message);
          navigate(`/payment/${courseId}`, { state: { coursePrice, courseName } });
        }
      } else {
        console.error("Enrollment failed:", data.message);
        // Handle error case
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  const handleViewAllClick = () => {
    navigate("/all-courses");
  };

  return (
    <>
       {/* courousal section */}
      {!isLoggedIn && (
        <div className="bg-[#2C3E50] min-h-[500px] w-full px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 relative overflow-hidden">
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${carouselSlides[currentSlide].bgGradient} opacity-10 transition-all duration-1000`}></div>
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            {/* Left side - Text Content */}
            <div className="text-white w-full md:w-1/2 text-center md:text-left">
              <span className="text-sm sm:text-base mb-2 block opacity-90">
                Start learning
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 transition-all duration-500">
                {carouselSlides[currentSlide].title}
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-[#00AEEF] transition-all duration-500">
                {carouselSlides[currentSlide].subtitle}
              </h2>
              <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto md:mx-0 transition-all duration-500">
                {carouselSlides[currentSlide].description}
              </p>
              <button
                onClick={handleSignUpClick}
                className="bg-[#00AEEF] hover:bg-[#0095d5] text-white font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Start Learning {carouselSlides[currentSlide].title}
              </button>
            </div>

            {/* Right side - Programming Language Image */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
              <div className="relative">
                {/* Fixed container for consistent sizing */}
                <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <img
                    src={carouselSlides[currentSlide].image}
                    alt={carouselSlides[currentSlide].title}
                    className="max-w-[80%] max-h-[80%] object-contain transform hover:scale-110 transition-all duration-500"
                  />
                </div>
                {/* Floating animation circles */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#00AEEF] rounded-full opacity-60 animate-bounce"></div>
                <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-yellow-400 rounded-full opacity-70 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-[#00AEEF] scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Carousel Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300 z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-300 z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Divider Line */}
          <div className="max-w-xl mx-auto absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full px-8">
            <hr className="border-t border-gray-300/30" />
          </div>
        </div>
      )}
      

      {/* Journey Section */}
      <div className="bg-gradient-to-b from-[#2C3E50] to-[#34495E] w-full px-4 md:px-8 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Latest course Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-[#00AEEF]/10 text-[#00AEEF] rounded-full text-xs font-medium mb-2">
                Featured Course
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Latest Course
              </h2>
              <p className="text-gray-300 text-base max-w-xl mx-auto">
                Discover our newest addition and start your learning journey today
              </p>
            </div>
            {latestCourses.length > 0 && (
              <div className="w-full  mx-auto">
                <div className="bg-gradient-to-br from-[#34495E] to-[#2C3E50] rounded-2xl shadow-xl overflow-hidden border border-white/10 hover:shadow-[#00AEEF]/20 hover:shadow-xl transition-all duration-500">
                  <div className="flex flex-col lg:flex-row h-[500px] lg:h-[400px]">
                    {/* Left side - Course Image */}
                    <div className="h-[250px] lg:h-full lg:w-1/2 relative bg-gradient-to-br from-[#3A506B] to-[#34495E] overflow-hidden rounded-l-2xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                      <img
                        src={latestCourses[0].image}
                        alt={latestCourses[0].course_title}
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                      />
                      {/* Floating badge */}
                      <div className="absolute top-4 left-4 bg-[#00AEEF] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-20">
                        NEW
                      </div>
                    </div>
                    
                    {/* Right side - Course Info and Description */}
                    <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-xl lg:text-3xl font-bold text-white leading-tight mb-2">
                              {latestCourses[0].course_title}
                            </h3>
                            {latestCourses[0].category_id && (
                              <span className="inline-block bg-gradient-to-r from-[#00AEEF] to-[#0095d5] text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                                {typeof latestCourses[0].category_id === "object"
                                  ? latestCourses[0].category_id.category_name
                                  : latestCourses[0].category_id}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-white mb-3 flex items-center">
                            <div className="w-1 h-5 bg-[#00AEEF] rounded-full mr-3"></div>
                            Course Overview
                          </h4>
                          <p className="text-gray-200 text-base leading-relaxed line-clamp-4">
                            {latestCourses[0].course_description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm">Self-paced</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-sm">Interactive</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-sm">
                              {latestCourses[0].lessons?.length || Math.floor(Math.random() * 15) + 5} Lessons
                            </span>
                          </div>
                        </div>
                        <button
                          className="w-full bg-gradient-to-r from-[#00AEEF] to-[#0095d5] hover:from-[#0095d5] hover:to-[#007bb8] text-white py-3 px-6 rounded-full transition-all duration-300 font-semibold text-base hover:shadow-lg transform hover:-translate-y-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(latestCourses[0]._id);
                          }}
                        >
                          Start Learning Now
                          <span className="ml-2">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider Line with decorative elements */}
          <div className="max-w-3xl mx-auto mb-16 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-600"></div>
            <div className="w-2 h-2 bg-[#00AEEF] rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-[#00AEEF] rounded-full"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-600"></div>
          </div>

          {/* Category Filter */}
          <div className="mb-12">
            <div className="text-center mb-10">
             <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Available Courses
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Choose from our comprehensive collection of programming courses
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-8 py-3 rounded-full transition-all duration-300 font-semibold text-sm ${
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-[#00AEEF] to-[#0095d5] text-white shadow-lg transform scale-105"
                    : "bg-white/90 text-[#2C3E50] hover:bg-white hover:shadow-lg hover:scale-105"
                }`}
              >
                All Courses
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-8 py-3 rounded-full transition-all duration-300 font-semibold text-sm ${
                    selectedCategory === category._id
                      ? "bg-gradient-to-r from-[#00AEEF] to-[#0095d5] text-white shadow-lg transform scale-105"
                      : "bg-white/90 text-[#2C3E50] hover:bg-white hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {category.category_name}
                </button>
              ))}
            </div>
          </div>

          {/* Course Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center text-white py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00AEEF]/30 border-t-[#00AEEF] mx-auto mb-6"></div>
                  <div className="absolute inset-0 rounded-full bg-[#00AEEF]/10 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Loading Amazing Courses</h3>
                <p className="text-gray-400">Preparing your learning journey...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center text-red-400 py-16">
                <div className="bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
                <p className="text-gray-400">Error: {error}</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full text-center text-white py-16">
                <div className="bg-[#00AEEF]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-gray-400">Try selecting a different category to explore more courses</p>
              </div>
            ) : (
              filteredCourses.slice(0, 6).map((course, index) => (
                <div
                  key={course._id || index}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 flex flex-col h-full group cursor-pointer border border-gray-100"
                  onClick={() => handleCourseClick(course._id)}
                >
                  <div className="h-48 overflow-hidden flex-shrink-0 relative">
                    <img
                      src={course.image}
                      alt={course.course_title}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Enhanced price badge */}
                    {course.course_price > 0 && (
                      <div className="absolute top-4 right-4 backdrop-blur-md bg-black/70 text-white text-sm px-3 py-2 rounded-full flex items-center gap-2 shadow-xl border border-white/20">
                        {enrollmentStatuses[course._id] === "paid" ? (
                          <>
                            <LockOpen size={16} className="text-green-400" />
                           
                          </>
                        ) : (
                          <>
                            <Lock size={16} className="text-yellow-400" />
                            <span className="font-bold">${course.course_price}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Free badge for free courses */}
                    {course.course_price === 0 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm px-3 py-2 rounded-full font-bold shadow-xl">
                        FREE
                      </div>
                    )}

                    {/* Hover overlay with course info */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="bg-[#00AEEF]/95 backdrop-blur-sm rounded-2xl p-6 transform scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/20 shadow-2xl">
                        <div className="text-center text-white">
                          <div className="mb-3">
                            <svg className="w-10 h-10 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span className="font-bold text-lg">
                                {course.lessons?.length || Math.floor(Math.random() * 15) + 5} Lessons
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg> */}
                              {/* <span className="font-semibold">
                                {Math.floor(Math.random() * 8) + 2}h Duration
                              </span> */}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-semibold">Certificate</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/30">
                            <p className="text-sm font-medium">Click to start learning!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-[#2C3E50] line-clamp-2 group-hover:text-[#00AEEF] transition-colors duration-300 leading-tight">
                        {course.course_title}
                      </h3>
                      {course.category_id && (
                        <span className="bg-gradient-to-r from-[#00AEEF]/10 to-[#0095d5]/10 text-[#00AEEF] px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ml-3 border border-[#00AEEF]/20">
                          {typeof course.category_id === "object"
                            ? course.category_id.category_name
                            : course.category_id}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                      {course.course_description}
                    </p>

                    {/* Course features */}
                 

                    <button
                      className="w-full bg-gradient-to-r from-[#00AEEF] to-[#0095d5] hover:from-[#0095d5] hover:to-[#007bb8] text-white py-3.5 px-6 rounded-xl transition-all duration-300 font-bold text-base hover:shadow-xl transform hover:-translate-y-1 mt-auto group-hover:shadow-[#00AEEF]/30 relative overflow-hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course._id);
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {(() => {
                          const accessStatus = getCourseAccessStatus(course);
                          switch (accessStatus) {
                            case 'free':
                              return 'Start Learning';
                            case 'paid':
                              return 'Continue Learning';
                            case 'pending':
                              return 'Complete Payment';
                            default:
                              return course.course_price > 0 ? 'Buy Now' : 'Start Learning';
                          }
                        })()}
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>

                  {/* Card bottom accent */}
                  <div className="h-1 bg-gradient-to-r from-[#00AEEF] to-[#0095d5] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              ))
            )}
          </div>

          {/* See More Button */}
          {!loading && !error && filteredCourses.length > 6 && (
            <div className="text-center mt-12">
              <button
                onClick={handleViewAllClick}
                className="bg-gradient-to-r from-[#00AEEF] to-[#0095d5] hover:from-[#0095d5] hover:to-[#007bb8] text-white font-semibold py-3 px-8 rounded-full text-base transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-[#00AEEF]/30 border border-[#00AEEF]/20"
              >
                See All Courses
                <span className="ml-2">→</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Our Goals Section */}
      <div className="bg-[#2C3E50] w-full px-4 md:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Divider Line */}
          <div className="max-w-xl mx-auto mb-16">
            <hr className="border-t border-gray-300" />
          </div>
          {/* Main Title and Description */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-4">Our Goals</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              This website is built to provide free and structured learning
              content for students and beginners who want to explore programming
            </p>
          </div>

          {/* Goals Grid */}
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {/* Improve Coding Skills */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 pb-16 border-b border-gray-600">
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Improve{" "}
                  <span className="text-[#00AEEF]">coding skills</span>
                </h3>
                <p className="text-gray-300 mt-3 sm:mt-4 max-w-xl mx-auto md:mx-0 text-sm sm:text-base">
                  Help learners strengthen their coding abilities through clear
                  explanations, real-world examples, and step-by-step learning
                  paths in programming.
                </p>
              </div>
              <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
                <img
                  src={bookLogo}
                  alt="Stack of Books"
                  className="w-36 sm:w-48 md:w-64 h-36 sm:h-48 md:h-64 object-contain transform hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Foster Tech Community */}
            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 sm:gap-8 pb-16 border-b border-gray-600">
              <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
                <img
                  src={heartLogo}
                  alt="Heart Icon"
                  className="w-32 sm:w-40 md:w-52 h-32 sm:h-40 md:h-52 object-contain transform hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Foster an Online
                  <br />
                  <span className="text-[#00AEEF]">Tech Community</span>
                </h3>
                <p className="text-gray-300 mt-3 sm:mt-4 max-w-xl mx-auto md:mx-0 text-sm sm:text-base">
                  Build a space where learners can connect, ask questions, share
                  projects, and support one another as they grow their skills.
                </p>
              </div>
            </div>

            {/* Self-Paced Learning */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Support{" "}
                  <span className="text-[#00AEEF]">Self-Paced</span>
                  <br />
                  <span className="text-[#00AEEF]">Learning</span>
                </h3>
                <p className="text-gray-300 mt-3 sm:mt-4 max-w-xl mx-auto md:mx-0 text-sm sm:text-base">
                  Let learners move at their own speed, with clearly organized
                  modules they can follow anytime, anywhere.
                </p>
              </div>
              <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
                <img
                  src={rocketLogo}
                  alt="Rocket"
                  className="w-28 sm:w-32 md:w-40 h-28 sm:h-32 md:h-40 object-contain transform hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
