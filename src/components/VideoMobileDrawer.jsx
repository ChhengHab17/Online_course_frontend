import { Play, X, BookOpen } from "lucide-react";

export default function VideoMobileDrawer({ 
  isOpen, 
  onClose, 
  course, 
  videosByLesson, 
  selectedVideo, 
  setSelectedVideo, 
  expandedLessonId, 
  toggleLesson 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex">
      <div className="w-3/4 p-4 rounded-r-2xl shadow-xl bg-white flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
          <h2 className="font-semibold text-lg text-slate-800">Course Videos</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2C3E50] scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
          {course && course.lessons && course.lessons.length > 0 ? (
            <ul className="space-y-2">
              {course.lessons.map((lesson, index) => {
                const lessonVideos = videosByLesson[lesson._id] || [];
                const hasVideos = lessonVideos.length > 0;
                
                return (
                  <li key={lesson._id}>
                    <div
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-colors cursor-pointer hover:shadow-md hover:shadow-[#2C3E50]/30 ${
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
                        <BookOpen
                          className={`w-4 h-4 ${hasVideos ? "text-gray-500" : "text-gray-300"}`}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {lesson.title}
                          </span>
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
                            onClick={() => {
                              setSelectedVideo(video);
                              onClose();
                            }}
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
            <div className="text-gray-500 text-center py-8">No lessons available</div>
          )}
        </div>
      </div>
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
}
