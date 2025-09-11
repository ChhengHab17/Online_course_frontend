import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Lock, LockOpen } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";


export default function ListAllCourse({onSwitchToLogin}) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
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
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          const userId = decoded.userId;

          // Fetch all enrollments in a single request
          const res = await axios.get(
            `https://backend-hosting-d4f6.onrender.com/api/enrollment/user/${userId}`
          );

          const statusMap = {};
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
    let filtered = courses;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((course) => {
        const categoryId =
          typeof course.category_id === "object"
            ? course.category_id._id
            : course.category_id;
        return categoryId === selectedCategory;
      });
    }

    // Search filter 
    if (searchTerm.trim() !== "") {
      const cleanSearchTerm = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((course) => {
        return course?.course_title?.toLowerCase().includes(cleanSearchTerm);
      });
    }

    setFilteredCourses(filtered);
  }, [selectedCategory, searchTerm, courses]);

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
      const token = localStorage.getItem("token");
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

  return (
    <>
      <div className="bg-gradient-to-b from-[#2C3E50] to-[#34495E] min-h-screen w-full px-4 md:px-8 py-12 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-7">
          
            <h2 className="text-xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              All Courses
            </h2>
          
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-row justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
              {/* Search Input */}
              <div className="relative flex-1 max-w-[180px] sm:max-w-sm md:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 md:pl-4 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 md:pl-12 pr-2 sm:pr-3 md:pr-4 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none z-10">
                  <Filter className="text-gray-400" size={14} />
                </div>
                <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none z-10">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-7 sm:pl-9 pr-7 sm:pr-9 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-all duration-300 cursor-pointer w-[110px] sm:w-[140px] md:w-[180px] hover:bg-white/15 text-xs sm:text-sm"
                  style={{
                    backgroundImage: 'none',
                  }}
                >
                  <option value="all" className="bg-[#34495E] text-white py-1 px-2">All</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-[#34495E] text-white py-1 px-2">
                      {cat.category_name.length > 8 ? `${cat.category_name.substring(0, 8)}...` : cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Pills */}
          

            {/* Results Count */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-gray-300 text-sm sm:text-base">
                {loading ? "Loading..." : `Found ${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''}`}
                {selectedCategory !== "all" && !loading && (
                  <span className="ml-2 text-[#00AEEF]">
                    in {categories.find(cat => cat._id === selectedCategory)?.category_name}
                  </span>
                )}
              </p>
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
                <p className="text-gray-400">
                  {searchTerm ? `No courses match "${searchTerm}"` : "Try selecting a different category to explore more courses"}
                </p>
              </div>
            ) : (
              filteredCourses.map((course, index) => (
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
        </div>
      </div>
    </>
  );
}
