// src/components/CourseSection.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import axios from 'axios';

export default function CourseSection({ courses: propCourses }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propCourses && propCourses.length > 0) {
      setCourses(propCourses);
      setFilteredCourses(propCourses);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [propCourses]);

  const fetchData = async () => {
    try {
      const [coursesResponse, categoriesResponse] = await Promise.all([
  fetch("https://backend-hosting-d4f6.onrender.com/api/course"),
  fetch("https://backend-hosting-d4f6.onrender.com/api/category")
      ]);

      if (!coursesResponse.ok || !categoriesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const coursesData = await coursesResponse.json();
      const categoriesData = await categoriesResponse.json();
      
      setCourses(coursesData);
      setCategories(categoriesData);
      setFilteredCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => {
        const categoryId = typeof course.category_id === 'object' 
          ? course.category_id._id 
          : course.category_id;
        return categoryId === selectedCategory;
      });
      setFilteredCourses(filtered);
    }
  }, [selectedCategory, courses]);

  const handleEnrollClick = async (courseId) => {
  try {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userId = decoded.userId;


    // Call your enroll API
  const res = await axios.post("https://backend-hosting-d4f6.onrender.com/api/enrollment", {
      user_id: userId,
      course_id: courseId,
    });

    const data = res.data;
    console.log("Enrollment result:", data);

    // Navigate to course detail page
    navigate(`/course/${courseId}`);
  } catch (error) {
    console.error("Error enrolling in course:", error);
  }
};

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3E50] mx-auto mb-4"></div>
          <p>Loading courses...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-6xl mx-auto p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Available Courses</h2>
      
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category._id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category.category_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            <p>No courses found in this category.</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course._id || course.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              {course.image && (
                <img 
                  src={course.image} 
                  alt={course.course_title || course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{course.course_title || course.title}</h3>
                {course.category_id && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    {typeof course.category_id === 'object' 
                      ? course.category_id.category_name 
                      : course.category_id}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-4">{course.course_description || course.description}</p>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                onClick={() => handleEnrollClick(course._id || course.id)}
              >
                Enroll Now
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
