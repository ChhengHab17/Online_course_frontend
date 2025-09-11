import { useState, useEffect } from "react";
import { getVideosByCourseId } from "../services/api";
import { Play, BookOpen } from "lucide-react";

export default function VideoViewer({ courseId, course, activeTab, setActiveTab }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videosByLesson, setVideosByLesson] = useState({});
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchVideos();
    }
  }, [courseId]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessonId(expandedLessonId === lessonId ? null : lessonId);
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="flex gap-10 w-full">
      {/* Left Sidebar - Video List */}
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
            <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2C3E50] scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full max-h-[calc(100vh-12rem)]">
              {loading ? (
                <div className="text-center text-gray-500">Loading videos...</div>
              ) : course && course.lessons && course.lessons.length > 0 ? (
                <ul className="space-y-2">
                  {course.lessons.map((lesson, index) => {
                    const lessonVideos = videosByLesson[lesson._id] || [];
                    const hasVideos = lessonVideos.length > 0;
                    
                    return (
                      <li key={lesson._id}>
                        <div
                          className={`flex items-center justify-between p-2 rounded-2xl border transition-colors cursor-pointer hover:shadow-md hover:shadow-[#2C3E50]/30 ${
                            hasVideos ? "hover:bg-gray-200 border-gray-200" : "bg-gray-100 border-gray-300 cursor-not-allowed opacity-50"
                          }`}
                          onClick={() => hasVideos && toggleLesson(lesson._id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                              hasVideos ? 'bg-[#2C3E50]/10 text-[#2C3E50]' : 'bg-gray-200 text-gray-400'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{lesson.title}</span>
                              <span className="text-xs text-gray-500">
                                {hasVideos ? `${lessonVideos.length} video${lessonVideos.length !== 1 ? 's' : ''}` : 'No videos'}
                              </span>
                            </div>
                          </div>
                          {hasVideos && (
                            <div className="text-gray-400">
                              {expandedLessonId === lesson._id ? '−' : '+'}
                            </div>
                          )}
                        </div>

                        {/* Videos for this lesson */}
                        {expandedLessonId === lesson._id && hasVideos && (
                          <ul className="ml-6 mt-2 space-y-1">
                            {lessonVideos.map((video, videoIndex) => (
                              <li
                                key={video._id}
                                className={`cursor-pointer p-2 rounded-2xl flex items-center gap-2 border transition-colors hover:shadow-md hover:shadow-[#2C3E50]/30 ${
                                  selectedVideo && selectedVideo._id === video._id
                                    ? "bg-[#2C3E50] text-white border-[#2C3E50]"
                                    : "hover:bg-gray-200 border-gray-200"
                                }`}
                                onClick={() => setSelectedVideo(video)}
                              >
                                <Play
                                  className={`w-4 h-4 ${
                                    selectedVideo && selectedVideo._id === video._id
                                      ? "text-white"
                                      : "text-[#2C3E50]"
                                  }`}
                                />
                                <span className="text-sm font-medium">
                                  {video.title || `Video ${videoIndex + 1}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-gray-500 text-center">No lessons available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Video Player */}
      <div className="flex-1 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-b from-white to-gray-50">
        {selectedVideo ? (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-slate-800 border-b border-gray-200 pb-2">
              {selectedVideo.title || 'Video'}
            </h1>
            
            {selectedVideo.description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {selectedVideo.description}
              </p>
            )}

            {/* Video Player */}
            <div className="w-full">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
                  src={getEmbedUrl(selectedVideo.url)}
                  title={selectedVideo.title || 'Video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Video Info
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Video Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Lesson:</span> {selectedVideo.lesson_id?.title || 'Unknown Lesson'}</p>
                {selectedVideo.description && (
                  <p><span className="font-medium">Description:</span> {selectedVideo.description}</p>
                )}
                <p>
                  <span className="font-medium">Watch on Platform:</span>{' '}
                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2C3E50] hover:text-[#1E2B3A] underline"
                  >
                    Open in new tab
                  </a>
                </p>
              </div>
            </div> */}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <Play className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No Video Selected</h3>
            <p className="text-gray-400">
              {videos.length === 0 
                ? "No videos available for this course yet." 
                : "Select a video from the lessons on the left to start watching."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
