import { useState, useEffect } from "react";
import { 
  createVideo, 
  updateVideo, 
  getVideosByCourseId, 
  deleteVideo 
} from "../services/api";

export default function VideoAdmin({ 
  courseId, 
  isOpen, 
  onClose 
}) {
  const [videos, setVideos] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    url: "",
    lesson_id: ""
  });

  // Fetch videos and lessons when modal opens
  useEffect(() => {
    if (courseId && isOpen) {
      fetchVideos();
      fetchLessons();
    }
  }, [courseId, isOpen]);

  const fetchVideos = async () => {
    try {
      const response = await getVideosByCourseId(courseId);
      setVideos(response.data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const fetchLessons = async () => {
    try {
  const res = await fetch("https://backend-hosting-d4f6.onrender.com/api/lessons");
      const data = await res.json();
      const courseLessons = data.filter((l) => l.course_id === courseId);
      setLessons(courseLessons);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  const handleEditVideo = (video) => {
    setEditingVideoId(video._id);
    setVideoForm({
      title: video.title || "",
      description: video.description || "",
      url: video.url || "",
      lesson_id: video.lesson_id?._id || video.lesson_id || ""
    });
  };

  const handleCancelVideoEdit = () => {
    setEditingVideoId(null);
    setVideoForm({ title: "", description: "", url: "", lesson_id: "" });
  };

  const handleDeleteVideo = async (id) => {
    if (confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideo(id);
        setVideos(videos.filter((v) => v._id !== id));
      } catch (err) {
        console.error("Error deleting video:", err);
      }
    }
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    
    if (!videoForm.title || !videoForm.url || !videoForm.lesson_id) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const videoData = {
        ...videoForm,
        course_id: courseId
      };

      if (editingVideoId) {
        const response = await updateVideo(editingVideoId, videoData);
        setVideos(videos.map((v) => (v._id === editingVideoId ? response.data : v)));
      } else {
        const response = await createVideo(videoData);
        setVideos([...videos, response.data]);
      }

      // Reset form
      setEditingVideoId(null);
      setVideoForm({ title: "", description: "", url: "", lesson_id: "" });
      
      // Refresh videos to get populated data
      fetchVideos();
    } catch (err) {
      console.error("Error saving video:", err);
      alert("Failed to save video. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl w-full max-w-6xl shadow-2xl border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-[#2C3E50]">
            Manage Videos
          </h2>
          <button
            onClick={onClose}
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

        <div className="flex gap-6">
          {/* Left Side - Existing Videos */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Existing Videos</h3>
            
            {videos.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No videos added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div
                    key={video._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="bg-[#2C3E50]/10 text-[#2C3E50] w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {video.title || "Untitled Video"}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {video.lesson_id?.title || "Unknown Lesson"}
                          </p>
                          {video.description && (
                            <p className="text-sm text-gray-500 mb-2">{video.description}</p>
                          )}
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#2C3E50] hover:text-[#1A252F] text-sm"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            Watch Video
                          </a>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVideo(video)}
                          className="bg-[#2C3E50] font-medium text-white text-sm px-3 py-1 rounded hover:bg-[#1A252F] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          className="bg-red-600 font-medium text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Add/Edit Video Form */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              {editingVideoId ? "Edit Video" : "Add New Video"}
            </h3>
            
            <form onSubmit={handleSubmitVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="Enter video title..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson
                </label>
                <select
                  value={videoForm.lesson_id}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, lesson_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  required
                >
                  <option value="">Select a lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoForm.url}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) =>
                    setVideoForm({ ...videoForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
                  rows="3"
                  placeholder="Enter video description..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#2C3E50] text-white py-2 px-4 rounded-md hover:bg-[#1A252F] transition-colors duration-200 font-medium"
                >
                  {editingVideoId ? "Update Video" : "Add Video"}
                </button>
                {editingVideoId && (
                  <button
                    type="button"
                    onClick={handleCancelVideoEdit}
                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
