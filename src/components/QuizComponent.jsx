import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizComponent = ({ courseId }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousAttempt, setPreviousAttempt] = useState(null);
  const navigate = useNavigate();

  // Decode user id from JWT token stored in localStorage or cookie
  const getAuthToken = () => {
    // Prefer the app's primary key
    const tokenKey = (localStorage.getItem('token') || '').trim();
    if (tokenKey) return tokenKey.replace(/^Bearer\s?/, '').replace(/^"|"$/g, '');

    // Fallback to alternate key if used elsewhere
    const alt = (localStorage.getItem('authToken') || '').trim();
    if (alt) return alt.replace(/^Bearer\s?/, '').replace(/^"|"$/g, '');

    // Fallback to cookie set by backend
    const cookie = document.cookie.split('; ').find(c => c.startsWith('Authorization='));
    if (!cookie) return null;
    const raw = decodeURIComponent((cookie.split('=')[1] || '').trim());
    return raw.replace(/^Bearer\s?/, '').replace(/^"|"$/g, '');
  };

  const decodeUserIdFromToken = (token) => {
    try {
      const payload = jwtDecode(token);
      const id = payload?.userId || payload?.id || payload?._id;
      return /^[a-fA-F0-9]{24}$/.test(id) ? id : null;
    } catch {
      return null;
    }
  };

  const getUserIdFromToken = () => {
    const token = getAuthToken();
    if (!token) return null;
    return decodeUserIdFromToken(token);
  };

  // Fetch quiz data when component mounts
  useEffect(() => {
    if (courseId) {
      fetchQuizAndAttempts();
    }
  }, [courseId]);

  const fetchQuizAndAttempts = async () => {
    try {
      setLoading(true);
      const userId = getUserIdFromToken();
      
      // Fetch quiz data
  const response = await fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/course/${courseId}`);
      
      if (response.status === 404) {
        setQuiz(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }
      
      const quizData = await response.json();
      setQuiz(quizData);

  // Check if user has previous attempts
  if (userId) {
        try {
          const attemptResponse = await fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/completion/${courseId}/${userId}`);
          if (attemptResponse.ok) {
            const attemptData = await attemptResponse.json();
            if (attemptData.completed) {
              setPreviousAttempt(attemptData);
            }
          }
        } catch (attemptError) {
          console.log('No previous attempts found');
        }
      } else {
        setPreviousAttempt(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      alert('Please login to take the quiz.');
      return;
    }
    navigate(`/quiz/${courseId}?autoStart=true`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Quiz</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Quiz Available</h3>
        <p className="text-gray-500">There is no quiz available for this course yet.</p>
      </div>
    );
  }

  // Always show quiz intro - clicking Start Quiz navigates to QuizPage
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-[#2C3E50]">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-3">{quiz.title}</h3>
        {quiz.description && (
          <p className="text-gray-600 mb-6 leading-relaxed">{quiz.description}</p>
        )}
        
        <div className="bg-gray-40 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-slate-700">Questions</div>
              <div className="text-[#2C3E50] font-bold text-lg">{quiz.questions.length}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-700">Best Score</div>
              <div className="text-[#2C3E50] font-bold text-lg">
                {previousAttempt ? `${previousAttempt.percentage}%` : '0%'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-700">Passing Score</div>
              <div className="text-[#2C3E50] font-bold text-lg">70%</div>
            </div>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="flex items-center gap-3 mx-auto px-8 py-3 bg-[#2C3E50] text-white font-semibold rounded-lg hover:bg-[#1E2B3A] transition-all duration-200 shadow-lg"
        >
          <Play className="w-5 h-5" />
          {previousAttempt ? 'Try Again' : 'Start Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizComponent;
