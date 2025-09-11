import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { ChevronDown, ChevronRight, Menu, X, BookOpen, Play } from "lucide-react";
import { ProcessedContent } from "../components/CodeBlock";
import QuizComponent from "../components/QuizComponent";
import CustomizedSnackbars from "../components/SnackBar";
import VideoViewer from "../components/VideoViewer";
import VideoMobileDrawer from "../components/VideoMobileDrawer";
import { getVideosByCourseId } from "../services/api";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Video state
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videosByLesson, setVideosByLesson] = useState({});
  const [expandedVideoLessonId, setExpandedVideoLessonId] = useState(null);
  const [isVideoDrawerOpen, setIsVideoDrawerOpen] = useState(false);

  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await api.getCourseById(id);
        setCourse(courseData);
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const userId = decoded.userId;
        console.log(course);
        const courseId = courseData?._id;
        localStorage.setItem("currentCourseId", courseId);
        const coursePrice = courseData.course_price || 0;
        if (coursePrice === 0) {
          setIsPaid(true);
          return;
        }
        if (!token) {
          navigate("/");
        }
  const enrollment = await axios.get(`https://backend-hosting-d4f6.onrender.com/api/enrollment/user/${userId}`);
        const enrollments = enrollment.data.data;

        console.log("Enrollments:", enrollments);
        console.log("Current Course ID:", courseId);

        // find the enrollment for the specific course
        const userEnrollment = enrollments.find(
          e => e.course?._id === courseId
        );

        if (!userEnrollment) {
          setSnackbarMessage("You are not enrolled in this course!");
          setSnackbarSeverity("error");
          setOpen(true);

          setTimeout(() => {
            navigate("/");
          }, 1000);
          return;
        }

        // update paid state
        setIsPaid(userEnrollment.payment_status === "paid");

        if (userEnrollment.payment_status !== "paid") {
          setSnackbarMessage("You need to pay to access this course!");
          setSnackbarSeverity("error");
          setOpen(true);

          setTimeout(() => {
            navigate("/");
          }, 1000);
        }

        if (courseData.lessons && courseData.lessons.length > 0) {
          setSelectedLesson(courseData.lessons[0]);
        }
        
        // Fetch videos for this course
        fetchVideos(courseId);
        
        console.log(courseData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const fetchVideos = async (courseId) => {
    try {
      const response = await getVideosByCourseId(courseId);
      const videosData = response.data || [];
      setVideos(videosData);

      // Group videos by lesson
      const groupedVideos = {};
      videosData.forEach(video => {
        const lessonId = video.lesson_id?._id || video.lesson_id;
        if (!groupedVideos[lessonId]) {
          groupedVideos[lessonId] = [];
        }
        groupedVideos[lessonId].push(video);
      });
      setVideosByLesson(groupedVideos);

      // Set first video as selected if available
      if (videosData.length > 0) {
        setSelectedVideo(videosData[0]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessonId(expandedLessonId === lessonId ? null : lessonId);
  };

  const toggleVideoLesson = (lessonId) => {
    setExpandedVideoLessonId(expandedVideoLessonId === lessonId ? null : lessonId);
  };

  // Navigation functions
  const getCurrentLessonIndex = () => {
    if (!course?.lessons || !selectedLesson) return -1;
    return course.lessons.findIndex(lesson => lesson._id === selectedLesson._id);
  };

  const goToPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0 && course?.lessons) {
      setSelectedLesson(course.lessons[currentIndex - 1]);
      // Scroll to top of lesson content
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const goToNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < (course?.lessons?.length - 1) && course?.lessons) {
      setSelectedLesson(course.lessons[currentIndex + 1]);
      // Scroll to top of lesson content
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const canGoToPrevious = () => {
    return getCurrentLessonIndex() > 0;
  };

  const canGoToNext = () => {
    const currentIndex = getCurrentLessonIndex();
    return currentIndex < (course?.lessons?.length - 1);
  };

  const isLastLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    return currentIndex === (course?.lessons?.length - 1);
  };

  return (
    <>
      {/* Add Custom CSS for lesson content styling */}
      <style>{`
        .lesson-content h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 1.5rem 0;
          color: #1e293b;
          line-height: 1.2;
        }
        @media (min-width: 640px) {
          .lesson-content h1 {
            font-size: 2.25rem;
          }
        }
        .lesson-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.25rem 0;
          color: #1e293b;
          line-height: 1.3;
        }
        @media (min-width: 640px) {
          .lesson-content h2 {
            font-size: 1.875rem;
          }
        }
        .lesson-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0;
          color: #1e293b;
          line-height: 1.4;
        }
        @media (min-width: 640px) {
          .lesson-content h3 {
            font-size: 1.5rem;
          }
        }
        .lesson-content p {
          margin: 0.75rem 0;
          line-height: 1.625;
          color: #374151;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .lesson-content strong {
          font-weight: 600;
          color: #1e293b;
        }
        .lesson-content em {
          font-style: italic;
          color: #4b5563;
        }
        .lesson-content u {
          text-decoration: underline;
        }
        .lesson-content ol, .lesson-content ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        @media (min-width: 640px) {
          .lesson-content ol, .lesson-content ul {
            padding-left: 2rem;
          }
        }
        /* Ensure list markers show (Tailwind preflight removes them) */
        .lesson-content ul {
          list-style: disc outside !important;
        }
        .lesson-content ol {
          list-style: decimal outside !important;
        }
        .lesson-content li > p { /* Quill sometimes wraps list text in p */
          margin: 0 !important;
        }
        .lesson-content li > ul,
        .lesson-content li > ol { /* nested lists spacing */
          margin-top: 0.5rem;
        }
        /* Quill indent support - responsive */
        .lesson-content .ql-indent-1 { margin-left: 1rem; }
        .lesson-content .ql-indent-2 { margin-left: 2rem; }
        .lesson-content .ql-indent-3 { margin-left: 3rem; }
        .lesson-content .ql-indent-4 { margin-left: 4rem; }
        .lesson-content .ql-indent-5 { margin-left: 5rem; }
        .lesson-content .ql-indent-6 { margin-left: 6rem; }
        .lesson-content .ql-indent-7 { margin-left: 7rem; }
        .lesson-content .ql-indent-8 { margin-left: 8rem; }
        .lesson-content .ql-indent-9 { margin-left: 9rem; }
        @media (min-width: 640px) {
          .lesson-content .ql-indent-1 { margin-left: 1.5rem; }
          .lesson-content .ql-indent-2 { margin-left: 3rem; }
          .lesson-content .ql-indent-3 { margin-left: 4.5rem; }
          .lesson-content .ql-indent-4 { margin-left: 6rem; }
          .lesson-content .ql-indent-5 { margin-left: 7.5rem; }
          .lesson-content .ql-indent-6 { margin-left: 9rem; }
          .lesson-content .ql-indent-7 { margin-left: 10.5rem; }
          .lesson-content .ql-indent-8 { margin-left: 12rem; }
          .lesson-content .ql-indent-9 { margin-left: 13.5rem; }
        }
        .lesson-content li {
          margin: 0.5rem 0;
          line-height: 1.5;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .lesson-content blockquote {
          border-left: 4px solid #3b82f6;
          background: #f9fafb;
          padding: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #4b5563;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        @media (min-width: 640px) {
          .lesson-content blockquote {
            padding: 1.5rem;
            margin: 1.5rem 0;
          }
        }
        .lesson-content a {
          color: #3b82f6;
          text-decoration: underline;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .lesson-content a:hover {
          color: #1d4ed8;
        }
        .lesson-content img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: block;
        }
        
        /* Hide default pre/code blocks from Quill */
        .lesson-content pre.ql-syntax {
          display: none;
        }
        
        /* Responsive code styling */
        .lesson-content code {
          background: #f3f4f6 !important;
          color: #dc2626 !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
          font-size: 0.875rem !important;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
        }
        @media (min-width: 640px) {
          .lesson-content code {
            font-size: 0.95rem !important;
          }
        }
        
        /* Responsive pre blocks */
        .lesson-content pre {
          background: #f8f9fa !important;
          border: 1px solid #e9ecef !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem !important;
          margin: 1rem 0 !important;
          overflow-x: auto !important;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
          font-size: 0.75rem !important;
          line-height: 1.4 !important;
          white-space: pre !important;
          word-wrap: normal !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        @media (min-width: 640px) {
          .lesson-content pre {
            padding: 1rem !important;
            font-size: 0.875rem !important;
          }
        }
        
        /* Code blocks container */
        .lesson-content .code-block-container {
          margin: 1rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        /* Tables responsive */
        .lesson-content table {
          width: 100%;
          max-width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.875rem;
          overflow-x: auto;
          display: block;
          white-space: nowrap;
        }
        @media (min-width: 640px) {
          .lesson-content table {
            display: table;
            font-size: 1rem;
          }
        }
        .lesson-content th,
        .lesson-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        @media (min-width: 640px) {
          .lesson-content th,
          .lesson-content td {
            padding: 0.75rem;
          }
        }
        .lesson-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        /* Color text styling */
        .lesson-content [style*="color: rgb(44, 62, 80)"], 
        .lesson-content [style*="color:#2C3E50"] {
          color: #2C3E50 !important;
        }
        .lesson-content [style*="color: black"], 
        .lesson-content [style*="color:#000000"] {
          color: black !important;
        }
        .lesson-content [style*="color: red"], 
        .lesson-content [style*="color:#ff0000"] {
          color: red !important;
        }
        .lesson-content [style*="color: rgb(0, 174, 239)"], 
        .lesson-content [style*="color:#00AEEF"] {
          color: #2C3E50 !important;
        }
        
        /* Text alignment */
        .lesson-content .ql-align-center {
          text-align: center !important;
        }
        .lesson-content .ql-align-right {
          text-align: right !important;
        }
        .lesson-content .ql-align-justify {
          text-align: justify !important;
        }
        .lesson-content [style*="text-align: center"] {
          text-align: center !important;
        }
        .lesson-content [style*="text-align: right"] {
          text-align: right !important;
        }
        .lesson-content [style*="text-align: justify"] {
          text-align: justify !important;
        }
        
        /* Prevent horizontal overflow */
        .lesson-content {
          overflow-x: hidden;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        /* Responsive container for wide content */
        .lesson-content > * {
          max-width: 100%;
          box-sizing: border-box;
        }
      `}</style>

      {/* Hero Section */}
      <div className="bg-white min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] w-full py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Back + Title + Tabs aligned with logo; mobile button on right */}
          {/* Header Section - Sticky */}
          <div className=" top-0 z-40 bg-gradient-to-r from-[#2C3E50] to-[#34495E] shadow-lg mb-6">
            <div className="backdrop-blur-sm bg-white/5 border-b border-white/10">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        navigate('/');
                        setTimeout(() => window.scrollTo(0, 0), 0);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm text-white font-semibold border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Back to Home</span>
                      <span className="sm:hidden">Back</span>
                    </button>
                    
                    <div className="flex flex-col">
                      {/* <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-[#00AEEF] text-white text-xs font-bold rounded-full">
                          COURSE
                        </span>
                        {course?.category_id && (
                          <span className="px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-full">
                            {typeof course.category_id === "object" 
                              ? course.category_id.category_name 
                              : course.category_id}
                          </span>
                        )}
                      </div> */}
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                        {course ? course.course_title : (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Loading...
                          </div>
                        )}
                      </h1>
                    </div>
                  </div>

                  <button
                    onClick={() => activeTab === 'lessons' ? setIsDrawerOpen(true) : setIsVideoDrawerOpen(true)}
                    className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm text-white font-semibold border border-white/20 hover:bg-white/25 transition-all duration-300 shadow-md"
                  >
                    <Menu className="w-4 h-4" />
                    <span className="text-sm">{activeTab === 'lessons' ? 'Lessons' : 'Videos'}</span>
                  </button>
                </div>

                {/* Course Progress Bar */}
                {course && (
                  <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between text-white/90 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">{course.lessons?.length || 0} Lessons</span>
                          <span className="xs:hidden">{course.lessons?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Interactive</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="hidden sm:inline">Certificate</span>
                        </div>
                      </div>
                      {selectedLesson && course?.lessons && (
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="text-xs">Progress:</span>
                          <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#00AEEF] transition-all duration-300"
                              style={{ 
                                width: `${((getCurrentLessonIndex() + 1) / course.lessons.length) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {getCurrentLessonIndex() + 1}/{course.lessons.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Subtle bottom accent */}
              <div className="h-0.5 bg-gradient-to-r from-[#00AEEF] to-[#0095d5]"></div>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="md:hidden mb-4 sm:mb-6">
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setActiveTab('lessons')}
                className={`flex-1 px-3 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'lessons'
                    ? 'bg-[#2C3E50] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
                Lessons
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 px-3 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'videos'
                    ? 'bg-[#2C3E50] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
                Videos
              </button>
            </div>
          </div>

          {/* Main Layout - Conditional based on active tab */}
          {activeTab === 'lessons' ? (
            <div className="flex gap-4 sm:gap-6 lg:gap-10 w-full">
              {/* Left Sidebar - Lessons */}
              <div className="hidden md:block w-[20%]">
                <div className="sticky top-24">
                  {/* Tab Navigation - Fixed at top of sidebar */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveTab('lessons')}
                        className={`flex-1 px-3 py-2 rounded-md font-medium transition-all duration-200 ${
                          activeTab === 'lessons'
                            ? 'bg-[#2C3E50] text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 inline-block mr-2" />
                        Lessons
                      </button>
                      <button
                        onClick={() => setActiveTab('videos')}
                        className={`flex-1 px-3 py-2 rounded-md font-medium transition-all duration-200 ${
                          activeTab === 'videos'
                            ? 'bg-[#2C3E50] text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <Play className="w-4 h-4 inline-block mr-2" />
                        Videos
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl shadow-inner bg-gray-50">
                    <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2C3E50] scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full max-h-[calc(100vh-12rem)]" role="region" aria-label="Lessons list">
                  {loading ? (
                    <div className="text-center text-gray-500">Loading lessons...</div>
                  ) : course && course.lessons && course.lessons.length > 0 ? (
                    <ul className="space-y-2">
                      {course.lessons.map((lesson, index) => (
                        <li key={lesson._id}>
                          <div
                            className={`flex items-center p-2 rounded-2xl border transition-colors cursor-pointer hover:shadow-md hover:shadow-[#2C3E50]/30 ${
                              selectedLesson && selectedLesson._id === lesson._id
                                ? "bg-[#2C3E50] text-white border-[#2C3E50]"
                                : "hover:bg-gray-200 border-gray-200"
                            }`}
                            onClick={() => {
                              setSelectedLesson(lesson);
                              toggleLesson(lesson._id);
                              // Scroll to top when selecting a lesson
                              setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }, 100);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                                selectedLesson && selectedLesson._id === lesson._id ? 'bg-white text-[#2C3E50]' : 'bg-[#2C3E50]/10 text-[#2C3E50]'
                              }`}>
                                {index + 1}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{lesson.title}</span>
                                {index === course.lessons.length - 1 && (
                                  <span className="text-xs font-medium flex items-center gap-1">
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Sub-lessons */}
                          {expandedLessonId === lesson._id && lesson.sub_lessons && (
                            <ul className="ml-6 mt-2 space-y-1">
                              {lesson.sub_lessons.map((sub) => (
                                <li
                                  key={sub._id}
                                  className={`cursor-pointer p-1 rounded-2xl flex items-center gap-2 border transition-colors hover:shadow-md hover:shadow-[#2C3E50]/30 ${
                                    selectedLesson && selectedLesson._id === sub._id
                                      ? "bg-[#2C3E50] text-white border-[#2C3E50]"
                                      : "hover:bg-gray-200 border-gray-200"
                                  }`}
                                  onClick={() => {
                                    setSelectedLesson(sub);
                                    // Scroll to top when selecting a sub-lesson
                                    setTimeout(() => {
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }, 100);
                                  }}
                                >
                                  <BookOpen
                                    className={`w-4 h-4 ${
                                      selectedLesson && selectedLesson._id === sub._id
                                        ? "text-white"
                                        : "text-gray-500"
                                    }`}
                                  />
                                  <span className="text-sm">{sub.title}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 text-center">No lessons available</div>
                  )}
                    </div>
                  </div>
                </div>
              </div>
              

              {/* Right Content - Lessons */}
              <div className="flex-1 p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-b from-white to-gray-50 flex flex-col relative">
                <div className="pr-1 sm:pr-2">
                  {selectedLesson ? (
                    <div className="space-y-3 sm:space-y-4">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 border-b border-gray-200 pb-2 leading-tight">
                        {selectedLesson.title}
                      </h1>
                      {selectedLesson.sub_title && (
                        <p className="text-base sm:text-lg text-gray-600 leading-relaxed italic">
                          {selectedLesson.sub_title}
                        </p>
                      )}
                      {selectedLesson.image && (
                        <img
                          src={selectedLesson.image}
                          alt={selectedLesson.title}
                          className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl shadow-lg"
                        />
                      )}
                      
                      {/* Use ProcessedContent component to handle code blocks */}
                      <ProcessedContent 
                        content={selectedLesson.content}
                        className="lesson-content prose prose-sm sm:prose-base md:prose-lg max-w-none"
                        language={course.language}
                      />

                      {/* Quiz Section - Only show at the bottom of the last lesson */}
                      {isLastLesson() && (
                        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-[#2C3E50]">
                          <div className="mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#2C3E50] rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs sm:text-sm">🎯</span>
                              </div>
                              Course Quiz
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600">
                              Test your knowledge with this comprehensive quiz covering all the lessons in this course.
                            </p>
                          </div>
                          
                          {/* Use QuizComponent */}
                          <QuizComponent courseId={id} />
                        </div>
                      )}
                      
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px]">
                      <p className="text-gray-500 text-base sm:text-lg">Select a lesson to see the content.</p>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons at Bottom for Lessons */}
                {selectedLesson && (
                  <div className="mt-6 sm:mt-8 bg-white border-t border-gray-200 p-3 sm:p-4 rounded-b-3xl">
                    <div className="flex justify-between items-center gap-3 sm:gap-4">
                      <button
                        onClick={goToPreviousLesson}
                        disabled={!canGoToPrevious()}
                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                          canGoToPrevious()
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Previous Lesson</span>
                        <span className="sm:hidden">Previous</span>
                      </button>

                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Lesson {getCurrentLessonIndex() + 1} of {course?.lessons?.length || 0}
                          {isLastLesson() && (
                            <span className="block text-[#2C3E50] font-semibold text-xs sm:text-sm">
                              Quiz Available Below!
                            </span>
                          )}
                        </p>
                      </div>

                      <button
                        onClick={goToNextLesson}
                        disabled={!canGoToNext()}
                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                          canGoToNext()
                            ? 'bg-[#2C3E50] hover:bg-[#1E2B3A] text-white'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span className="hidden sm:inline">Next Lesson</span>
                        <span className="sm:hidden">Next</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Videos Tab Content */
            <VideoViewer 
              courseId={id} 
              course={course}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Mobile Drawer for Lessons */}
          {isDrawerOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex">
              <div className="w-3/4 p-4 rounded-r-2xl shadow-xl bg-white flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                  <h2 className="font-semibold text-lg text-slate-800">Lessons</h2>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2C3E50] scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                  {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading lessons...</div>
                  ) : course && course.lessons && course.lessons.length > 0 ? (
                    <ul className="space-y-2">
                      {course.lessons.map((lesson, index) => (
                        <li key={lesson._id}>
                          <div
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-colors cursor-pointer hover:shadow-md hover:shadow-[#2C3E50]/30 ${
                              selectedLesson && selectedLesson._id === lesson._id
                                ? "bg-[#2C3E50] text-white border-[#2C3E50]"
                                : "hover:bg-gray-200 border-gray-200"
                            }`}
                            onClick={() => {
                              setSelectedLesson(lesson);
                              toggleLesson(lesson._id);
                              setIsDrawerOpen(false);
                              // Scroll to top when selecting a lesson from mobile drawer
                              setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }, 100);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                                selectedLesson && selectedLesson._id === lesson._id ? 'bg-white text-[#2C3E50]' : 'bg-[#2C3E50]/10 text-[#2C3E50]'
                              }`}>
                                {index + 1}
                              </span>
                              <BookOpen
                                className={`w-4 h-4 ${
                                  selectedLesson && selectedLesson._id === lesson._id
                                    ? "text-white"
                                    : "text-gray-500"
                                }`}
                              />
                              <span className="font-medium text-sm">
                                {lesson.title}
                                {index === course.lessons.length - 1 && (
                                  <span className="ml-2 text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <span className="bg-[#2C3E50] text-white px-2 py-1 rounded text-xs">
                                      Quiz Available
                                    </span>
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 text-center py-8">No lessons available</div>
                  )}
                </div>
              </div>
              <div className="flex-1" onClick={() => setIsDrawerOpen(false)}></div>
            </div>
          )}

          {/* Mobile Drawer for Videos */}
          <VideoMobileDrawer
            isOpen={isVideoDrawerOpen}
            onClose={() => setIsVideoDrawerOpen(false)}
            course={course}
            videosByLesson={videosByLesson}
            selectedVideo={selectedVideo}
            setSelectedVideo={setSelectedVideo}
            expandedLessonId={expandedVideoLessonId}
            toggleLesson={toggleVideoLesson}
          />

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
        <CustomizedSnackbars open={open} handleClose={handleClose} message={snackbarMessage} severity={snackbarSeverity} />
      </div>
    </>
  );
}