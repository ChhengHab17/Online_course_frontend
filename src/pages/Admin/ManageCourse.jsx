import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuizModal from "../../components/QuizModal";
import VideoAdmin from "../../components/VideoAdmin";

export default function ManageCourse() {
  // QUIZ MODAL STATE
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [language, setLanguage] = useState("python");

  // COURSE MODAL STATE
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showPrice, setShowPrice] = useState(false);
  const [formData, setFormData] = useState({
    course_title: "",
    image: "",
    course_description: "",
    category_id: "",
    course_price: null,
    language: "",
    isFree: true,
  });

  // LESSON MODAL STATE
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    sub_title: "",
    content: "",
    image: "",
  });
  const [editingLessonId, setEditingLessonId] = useState(null);

  // VIDEO MODAL STATE
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoCourseId, setSelectedVideoCourseId] = useState(null);

  // Fetch courses
  const fetchCourses = async () => {
    try {
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/course");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/category");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  // === COURSE HANDLERS ===
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setLanguage(course.language);
    setShowPrice(course.course_price > 0);
    setFormData({
      course_title: course.course_title,
      image: course.image,
      course_description: course.course_description,
      category_id: course.category_id._id || "",
      language: course.language,
      course_price: course.course_price,
    });
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
  await fetch(`https://backend-hosting-d4f6.onrender.com/api/course/${id}`, {
          method: "DELETE",
        });
        setCourses(courses.filter((c) => c._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmitCourse = async (e) => {
  e.preventDefault();
  if (!formData.category_id) {
    alert("Please select a category");
    return;
  }

  try {
    // Prepare payload: price is 0 if toggle is off
    const payload = {
      ...formData,
      course_price: showPrice ? formData.course_price : 0,
      isFree: !showPrice,
    };


    if (editingCourse) {
      const res = await fetch(
  `https://backend-hosting-d4f6.onrender.com/api/course/${editingCourse._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      const updatedCourse = {
        ...data,
        category_id: categories.find(cat => cat._id === data.category_id)
      };
      
      // Update courses array with proper category object
      setCourses(
        courses.map((c) => (c._id === editingCourse._id ? updatedCourse : c))
      );
    } else {
      setEditingCourse(null);
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setCourses([...courses, data]);
    }

    // Reset form and modal
    setEditingCourse(null);
    setShowCourseModal(false);
    setLanguage("python");
    if (!editingCourse) {
      setShowPrice(false); // only reset for new course
    }
    setFormData({
        course_title: "",
        image: "",
        course_description: "",
        category_id: "",
        course_price: 0,
        language: "",
      });
  } catch (err) {
    console.error(err);
  }
};


  const getCategoryName = (course) => {
    const categoryId =
      typeof course.category_id === "object"
        ? course.category_id._id
        : course.category_id;
    const category = categories.find((cat) => cat._id === categoryId);
    return category?.category_name || "Unassigned";
  };

  // === LESSON HANDLERS ===
  const openLessonModal = async (courseId) => {
    setCurrentCourseId(courseId);
    setShowLessonModal(true);
    try {
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/lessons");
      const data = await res.json();
      const courseLessons = data.filter((l) => l.course_id === courseId);
      setLessons(courseLessons);
      setEditingLessonId(null);
      setLessonForm({ title: "", sub_title: "", content: "", image: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson._id);
    setLessonForm({
      title: lesson.title,
      sub_title: lesson.sub_title,
      content: lesson.content,
      image: lesson.image || "",
    });
  };

  const handleCancelLessonEdit = () => {
    setEditingLessonId(null);
    setLessonForm({ title: "", sub_title: "", content: "", image: "" });
  };
  

  const handleDeleteLesson = async (id) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      try {
  await fetch(`https://backend-hosting-d4f6.onrender.com/api/lessons/${id}`, {
          method: "DELETE",
        });
        setLessons(lessons.filter((l) => l._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();

    const lessonData = {
      title: lessonForm.title,
      sub_title: lessonForm.sub_title,
      content: lessonForm.content,
      image: lessonForm.image,
      course_id: currentCourseId,
    };

    console.log("Submitting lesson data:", lessonData);
    console.log("Editing lesson ID:", editingLessonId);

    try {
      if (editingLessonId) {
        console.log("Updating lesson with ID:", editingLessonId);
        const res = await fetch(
          `https://backend-hosting-d4f6.onrender.com/api/lessons/${editingLessonId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(lessonData),
          }
        );
        const data = await res.json();
        console.log("Update response:", data);
        setLessons(lessons.map((l) => (l._id === editingLessonId ? data : l)));
        setEditingLessonId(null);
      } else {
        console.log("Creating new lesson");
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/lessons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonData),
        });
        const data = await res.json();
        console.log("Create response:", data);
        setLessons([...lessons, data]);
      }
      setLessonForm({ title: "", sub_title: "", content: "", image: "" });
    } catch (err) {
      console.error("Error saving lesson:", err);
      const errorMessage = err.message || "Unknown error";
      alert(`Failed to save lesson: ${errorMessage}`);
    }
  };
   const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setFormData({ ...formData, language: newLang });
  };

  return (
    <div className="min-h-screen bg-white from-slate-50 via-gray-100 to-slate-200">
      <div className="container mx-auto px-0 sm:px-6 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50]">
                Course Management
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Create, edit, and organize your educational content
              </p>
            </div>
            <button
              onClick={() => setShowCourseModal(true)}
              className="w-full sm:w-auto group relative bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl hover:from-[#1A252F] hover:to-[#2C3E50] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Course
              </span>
            </button>
          </div>
        </div>

        {/* Course Stats */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#2C3E50]/10">
                <svg className="w-8 h-8 text-[#2C3E50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-800">{courses.length}</p>
                <p className="text-slate-600">Total Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-800">{categories.length}</p>
                <p className="text-slate-600">Categories</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#2C3E50]/10">
                <svg className="w-8 h-8 text-[#2C3E50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-800">Active</p>
                <p className="text-slate-600">Status</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* COURSE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {courses.map((course) => (
            <div
              key={course._id}
              className="group bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.course_title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 line-clamp-2">
                  {course.course_title}
                </h2>
                <p className="text-slate-600 mb-4 line-clamp-3 text-sm sm:text-base">
                  {course.course_description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="flex items-center gap-2 bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 text-[#2C3E50] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                  <button
                    onClick={() => openLessonModal(course._id)}
                    className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Lessons
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course._id);
                      setIsQuizModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2l4-4m1-4h2a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h2m4-2h4a2 2 0 012 2v4"
                      />
                    </svg>
                    Quiz
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVideoCourseId(course._id);
                      setShowVideoModal(true);
                    }}
                    className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Videos
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 max-w-md mx-auto">
              <svg
                className="w-16 h-16 text-slate-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No courses yet
              </h3>
              <p className="text-slate-500 mb-6">
                Get started by creating your first course
              </p>
              <button
                onClick={() => setShowCourseModal(true)}
                className="bg-gradient-to-r from-[#2C3E50] to-gray-700 text-white px-6 py-2 rounded-lg hover:from-[#34495E] hover:to-gray-600 transition-all duration-300 font-medium"
              >
                Create Course
              </button>
            </div>
          </div>
        )}

        {/* COURSE MODAL */}
        {showCourseModal && formData &&(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-8 rounded-2xl w-full max-w-xs sm:max-w-6xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-[#2C3E50] bg-clip-text text-transparent">
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h2>
                <button
                  onClick={() => {
                    setShowCourseModal(false);
                    setEditingCourse(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitCourse} className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.course_title}
                    onChange={(e) =>
                      setFormData({ ...formData, course_title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    placeholder="Enter course title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.course_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course_description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 resize-none"
                    rows="4"
                    placeholder="Describe your course..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="language">Language</label>
                  <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  >
                  <option value="python">Python</option>
                  <option value="node">Node.js</option>
                  <option value="php">PHP</option>
                  <option value="java">java</option>
                  <option value="cpp">C++</option>
                  <option value="html">Html</option>
                  <option value="css">Css</option>
                  <option value="javascript">Js</option>
                </select>
              </div>
                {/* Toggle for showing price */}
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">
                    Enable Course Price
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrice(!showPrice);
                      setFormData({ ...formData, isFree: showPrice }); 
                      // If showPrice is true, turning off → isFree = true; if showPrice is false, turning on → isFree = false
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showPrice ? "bg-[#2C3E50]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showPrice ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Price field if toggle is on */}
                {showPrice && (
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Course Price
                    </label>
                    <input
                      type="number"
                      value={formData.course_price || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, course_price: parseFloat(e.target.value) })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70"
                      placeholder="Enter price in USD"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCourseModal(false);
                      setEditingCourse(null);
                    }}
                    className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white rounded-xl hover:from-[#1A252F] hover:to-[#2C3E50] transition-all duration-300 shadow-lg font-medium"
                  >
                    {editingCourse ? "Update Course" : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LESSON MODAL */}
        {showLessonModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-8 rounded-2xl w-full max-w-xs sm:max-w-6xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowLessonModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                aria-label="Close lesson modal"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Lesson List Sidebar */}
                <div className="w-full sm:w-2/5">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">
                    Existing Lessons
                  </h3>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson._id}
                        className="bg-white/70 backdrop-blur-sm border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="flex items-center justify-center w-8 h-8 bg-[#2C3E50]/10 text-[#2C3E50] rounded-full text-sm font-semibold flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-slate-800 text-sm truncate">
                                  {lesson.title}
                                </h4>
                                {lesson.sub_title && (
                                  <p className="text-xs text-slate-600 truncate">
                                    {lesson.sub_title}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 ml-2">
                              <button
                                className="flex items-center gap-1 bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 text-[#2C3E50] px-2 py-1 rounded-lg transition-colors text-xs font-medium"
                                onClick={() => handleEditLesson(lesson)}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>
                              <button
                                className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg transition-colors text-xs font-medium"
                                onClick={() => handleDeleteLesson(lesson._id)}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {lessons.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 rounded-xl">
                        <svg
                          className="w-8 h-8 text-slate-400 mx-auto mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <p className="text-slate-500 text-sm">
                          No lessons yet. Create your first lesson.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add/Edit Lesson Panel (80%) */}
                <div className="w-full sm:w-4/5 border-t sm:border-t-0 sm:border-l pl-0 sm:pl-6 pt-4 sm:pt-0">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">
                    {editingLessonId ? "Edit Lesson" : "Add New Lesson"}
                  </h3>
                  <form onSubmit={handleSubmitLesson} className="space-y-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Lesson Title
                      </label>
                      <input
                        type="text"
                        value={lessonForm.title}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter lesson title..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={lessonForm.sub_title}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            sub_title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter subtitle..."
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Content
                      </label>
                      <ReactQuill
                        value={lessonForm.content}
                        onChange={value =>
                          setLessonForm({
                            ...lessonForm,
                            content: value,
                          })
                        }
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ color: ["#2C3E50", "black", "red", "#00AEEF"] }],
                            [{ align: [ "justify", "center", "right" ]}],
                            ["blockquote", "code-block"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            ["link", "image"],
                            ["clean"],
                          ],
                        }}
                        formats={[
                          "header", "bold", "italic", "underline", "strike", "blockquote", "code-block",
                          "list", "bullet", "link", "image", "color", "align"
                        ]}
                        className="bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Image URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={lessonForm.image}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            image: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      {editingLessonId && (
                        <button
                          type="button"
                          onClick={handleCancelLessonEdit}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-xs sm:text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2C3E50] text-white rounded hover:bg-[#1A252F] flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {editingLessonId ? "Save Changes" : "Add Lesson"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ MODAL */}
          <QuizModal
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            courseId={selectedCourseId}
            onQuizCreated={fetchCourses}
          />

        {/* VIDEO MODAL */}
        <VideoAdmin
          courseId={selectedVideoCourseId}
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideoCourseId(null);
          }}
        />
      </div>
    </div>
  );
}
