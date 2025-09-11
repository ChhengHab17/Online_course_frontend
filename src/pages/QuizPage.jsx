import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, RotateCcw, Award } from 'lucide-react';

const QuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizState, setQuizState] = useState('loading'); // 'loading', 'not-started', 'in-progress', 'completed'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [previousAttempt, setPreviousAttempt] = useState(null);

  // Get JWT from localStorage or cookie and decode userId claim
  const getAuthToken = () => {
    // Prefer the app's primary key
    const tokenKey = (localStorage.getItem('token') || '').trim();
    if (tokenKey) return tokenKey.replace(/^Bearer\s?/, '').replace(/^"|"$/g, '');

    // Fallback to alternate key if used elsewhere
    const alt = (localStorage.getItem('authToken') || '').trim();
    if (alt) return alt.replace(/^Bearer\s?/, '').replace(/^"|"$/g, '');

    // Fallback to cookie set by backend
    const cookieEntry = document.cookie.split('; ').find(c => c.startsWith('Authorization='));
    if (!cookieEntry) return null;
    const raw = decodeURIComponent((cookieEntry.split('=')[1] || '').trim());
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

  useEffect(() => {
    if (courseId) {
      fetchQuizAndAttempts();
    }
  }, [courseId]);

  const fetchQuizAndAttempts = async () => {
    try {
      setLoading(true);
      console.log('Fetching quiz for courseId:', courseId);
      
      // Fetch quiz data
  const quizResponse = await fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/course/${courseId}`);
      console.log('Quiz response status:', quizResponse.status);
      
      if (quizResponse.status === 404) {
        console.log('No quiz found for this course');
        setQuiz(null);
        setQuizState('no-quiz');
        return;
      }
      
      if (!quizResponse.ok) {
        throw new Error('Failed to fetch quiz');
      }
      
      const quizData = await quizResponse.json();
      console.log('Quiz data received:', quizData);
      setQuiz(quizData);

    // Check if user has previous attempts (only if authenticated)
    const uid = getUserIdFromToken();
    if (uid) {
        try {
  const attemptResponse = await fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/completion/${courseId}/${uid}`);
          if (attemptResponse.ok) {
            const attemptData = await attemptResponse.json();
            if (attemptData.completed) {
              setPreviousAttempt(attemptData);
            } else {
              setPreviousAttempt(null);
            }
          }
        } catch (attemptError) {
          console.log('No previous attempts found');
        }
      } else {
        setPreviousAttempt(null);
      }

      setQuizState('not-started');
      
      // Auto-start quiz if coming from QuizComponent
      // Check URL params or localStorage flag to determine if we should auto-start
      const autoStart = new URLSearchParams(window.location.search).get('autoStart');
      if (autoStart === 'true') {
        // Small delay to ensure state is set properly
        setTimeout(() => {
          startQuiz();
        }, 100);
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err.message);
      setQuizState('error');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    const uid = getUserIdFromToken();
    if (!uid) {
      alert('Please login to take the quiz.');
      return;
    }
    console.log('startQuiz called');
    console.log('Current quiz:', quiz);
    console.log('Quiz questions:', quiz?.questions);
    
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      console.error('No quiz data available');
      setError('Quiz data is not available. Please try refreshing the page.');
      return;
    }
    
    setQuizState('in-progress');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOptions([]);
    setShowAnswer(false);
    setScore(0);
  };

  const handleOptionSelect = (optionIndex) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    if (currentQuestion.question_type === 'multiple') {
      const newSelectedOptions = [...selectedOptions];
      if (newSelectedOptions.includes(optionIndex)) {
        setSelectedOptions(newSelectedOptions.filter(idx => idx !== optionIndex));
      } else {
        setSelectedOptions([...newSelectedOptions, optionIndex]);
      }
    } else {
      setSelectedOptions([optionIndex]);
    }
  };

  const submitAnswer = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const correctOptions = currentQuestion.options
      .map((opt, idx) => opt.isCorrect ? idx : null)
      .filter(idx => idx !== null);

    const isCorrect = 
      selectedOptions.length === correctOptions.length &&
      selectedOptions.every(idx => correctOptions.includes(idx)) &&
      correctOptions.every(idx => selectedOptions.includes(idx));

    const answerData = {
      questionIndex: currentQuestionIndex,
      selectedOptions: [...selectedOptions],
      correctOptions,
      isCorrect
    };

    setUserAnswers([...userAnswers, answerData]);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowAnswer(true);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptions([]);
      setShowAnswer(false);
    } else {
      finishQuiz();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOptions([]);
      setShowAnswer(false);
    }
  };

  const finishQuiz = async () => {
    try {
      const uid = getUserIdFromToken();
      if (!uid) {
        setError('Please login to submit the quiz.');
        setQuizState('error');
        return;
      }
      // Format answers to match backend expectations
      const formattedAnswers = userAnswers.map(answer => ({
        questionIndex: answer.questionIndex,
        selectedOptions: answer.selectedOptions
      }));

      const submitData = {
        answers: formattedAnswers,
        user_id: uid
      };

      console.log('Submitting quiz data:', submitData);

  const response = await fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/submit/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Quiz submission result:', result);
        setQuizState('completed');
      } else {
        const errorData = await response.json();
        console.error('Quiz submission error:', errorData);
        throw new Error(errorData.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(`Failed to submit quiz: ${error.message}. Please try again.`);
    }
  };

  const tryAgain = () => {
    // Reset all states and start immediately
    setQuizState('in-progress');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOptions([]);
    setShowAnswer(false);
    setScore(0);
  };

  const goBackToCourse = () => {
    navigate(`/course/${courseId}`);
    // Scroll to top after navigation
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  const getOptionClassName = (optionIndex, option) => {
    if (!showAnswer) {
      if (selectedOptions.includes(optionIndex)) {
        return 'bg-[#2C3E50]/20 border-[#2C3E50] text-[#2C3E50]';
      }
      return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400';
    } else {
      if (option.isCorrect) {
        return 'bg-green-50 border-green-500 text-green-700';
      } else if (selectedOptions.includes(optionIndex) && !option.isCorrect) {
        return 'bg-red-50 border-red-500 text-red-700';
      }
      return 'bg-gray-50 border-gray-300 text-gray-500';
    }
  };

  const getOptionIcon = (optionIndex, option) => {
    if (!showAnswer) return null;
    
    if (option.isCorrect) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (selectedOptions.includes(optionIndex) && !option.isCorrect) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return null;
  };

  if (quizState === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="bg-gray-50 rounded-xl shadow-2xl p-4 sm:p-8 border border-gray-200 w-full max-w-md">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-full mb-4"></div>
            <div className="h-3 sm:h-4 bg-gray-150 rounded-lg w-full mb-6"></div>
            <div className="h-10 sm:h-12 bg-gray-300 rounded-lg w-24 sm:w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="bg-gray-50 border border-red-200 rounded-xl p-4 sm:p-8 max-w-md shadow-2xl w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Error Loading Quiz</h2>
          <p className="text-red-700 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={goBackToCourse}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors shadow-lg"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'no-quiz') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="bg-gray-50 rounded-xl shadow-2xl p-6 sm:p-8 max-w-md text-center border border-gray-200 w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">No Quiz Available</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">There is no quiz available for this course yet.</p>
          <button
            onClick={goBackToCourse}
            className="w-full sm:w-auto bg-[#2C3E50] hover:bg-[#1E2B3A] text-white px-6 py-2 rounded-lg transition-colors shadow-lg"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 shadow-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goBackToCourse}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800 transition-colors group text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Course
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {quizState === 'not-started' && (
          <div className="bg-gray-50 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">{quiz.description}</p>
              )}
              
              {previousAttempt && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-4">Previous Attempt</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="text-center bg-white rounded-lg p-2 sm:p-3 shadow">
                      <div className="font-semibold text-blue-600 text-xs sm:text-sm">Score</div>
                      <div className="text-blue-800 text-base sm:text-lg">{previousAttempt.score}/{previousAttempt.total_questions}</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-2 sm:p-3 shadow">
                      <div className="font-semibold text-blue-600 text-xs sm:text-sm">Percentage</div>
                      <div className="text-blue-800 text-base sm:text-lg">{previousAttempt.percentage}%</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-2 sm:p-3 shadow">
                      <div className="font-semibold text-blue-600 text-xs sm:text-sm">Status</div>
                      <div className={`font-semibold text-base sm:text-lg ${previousAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {previousAttempt.passed ? 'Passed' : 'Failed'}
                      </div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-2 sm:p-3 shadow">
                      <div className="font-semibold text-blue-600 text-xs sm:text-sm">Attempts</div>
                      <div className="text-blue-800 text-base sm:text-lg">{previousAttempt.attempt_number}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 shadow">
                <div className="grid grid-cols-2 gap-4 sm:gap-6 text-center">
                  <div className="bg-[#2C3E50]/10 rounded-lg p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">{quiz.questions.length}</div>
                    <div className="text-gray-600 text-sm sm:text-base">Questions</div>
                  </div>
                  <div className="bg-[#2C3E50]/10 rounded-lg p-3 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">70%</div>
                    <div className="text-gray-600 text-sm sm:text-base">Passing Score</div>
                  </div>
                </div>
              </div>

              <button
                onClick={startQuiz}
                className="w-full sm:w-auto bg-gradient-to-r from-[#2C3E50] to-[#1E2B3A] text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl hover:from-[#1E2B3A] hover:to-[#34495E] transition-all duration-300 shadow-xl text-base sm:text-lg font-semibold transform hover:scale-105"
              >
                {previousAttempt ? 'Retake Quiz' : 'Start Quiz'}
              </button>
            </div>
          </div>
        )}

        {quizState === 'in-progress' && (
          <div className="bg-gray-50 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
            {/* Progress Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 bg-white rounded-xl p-4 shadow gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Question {currentQuestionIndex + 1}</h2>
              <div className="text-gray-600 text-sm sm:text-base">
                {currentQuestionIndex + 1} of {quiz.questions.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-6 sm:mb-8">
              <div 
                className="bg-gradient-to-r from-[#2C3E50] to-[#1E2B3A] h-2 sm:h-3 rounded-full transition-all duration-300 shadow-lg"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 leading-tight">
                {quiz.questions[currentQuestionIndex].question_text}
              </h3>

              {/* Question Type Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  quiz.questions[currentQuestionIndex].question_type === 'multiple' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : quiz.questions[currentQuestionIndex].question_type === 'truefalse'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {quiz.questions[currentQuestionIndex].question_type === 'multiple' 
                    ? 'Multiple Choice (Select all that apply)' 
                    : quiz.questions[currentQuestionIndex].question_type === 'truefalse'
                    ? 'True/False'
                    : 'Single Choice'}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {quiz.questions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showAnswer && handleOptionSelect(index)}
                    disabled={showAnswer}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-sm sm:text-base ${
                      getOptionClassName(index, option)
                    } ${!showAnswer ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex-shrink-0">
                      {quiz.questions[currentQuestionIndex].question_type === 'multiple' ? (
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(index)}
                          onChange={() => {}}
                          className="w-4 h-4 text-[#2C3E50] rounded bg-white border-gray-300"
                          disabled={showAnswer}
                        />
                      ) : (
                        <input
                          type="radio"
                          checked={selectedOptions.includes(index)}
                          onChange={() => {}}
                          className="w-4 h-4 text-[#2C3E50] bg-white border-gray-300"
                          disabled={showAnswer}
                        />
                      )}
                    </div>
                    <span className="flex-1 leading-relaxed">{option.text}</span>
                    {getOptionIcon(index, option)}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Feedback */}
         

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center gap-3">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0 || !showAnswer}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-sm md:text-base ${
                  currentQuestionIndex > 0 && showAnswer
                    ? 'bg-white hover:bg-gray-50 text-gray-700 shadow border border-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>

              <div className="text-center flex-shrink-0">
                <span className="text-xs sm:text-sm text-gray-600">
                  Score: {score}/{currentQuestionIndex + (showAnswer ? 1 : 0)}
                </span>
              </div>

              {!showAnswer ? (
                <button
                  onClick={submitAnswer}
                  disabled={selectedOptions.length === 0}
                  className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm md:text-base ${
                    selectedOptions.length > 0
                      ? 'bg-gradient-to-r from-[#2C3E50] to-[#1E2B3A] hover:from-[#1E2B3A] hover:to-[#34495E] text-white shadow-xl transform hover:scale-105'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  <span className="hidden xs:inline">Submit Answer</span>
                  <span className="xs:hidden">Submit</span>
                </button>
              ) : (
                <button
                  onClick={goToNextQuestion}
                  className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-[#2C3E50] to-[#1E2B3A] hover:from-[#1E2B3A] hover:to-[#34495E] text-white font-semibold rounded-xl transition-all duration-300 shadow-xl transform hover:scale-105 text-xs sm:text-sm md:text-base"
                >
                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <>
                      <span className="hidden xs:inline">Next</span>
                      <span className="xs:hidden">Next</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </>
                  ) : (
                    <>
                      <span className="hidden xs:inline">Finish Quiz</span>
                      <span className="xs:hidden">Finish</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {quizState === 'completed' && (
          <div className="bg-gray-50 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
            <div className="text-center">
              <div className="mb-6 sm:mb-8">
                <Award className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-[#2C3E50] mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
                
                <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-200 shadow">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">{score}</div>
                      <div className="text-gray-600 text-sm sm:text-base">Correct</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-2">{quiz.questions.length - score}</div>
                      <div className="text-gray-600 text-sm sm:text-base">Wrong</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 col-span-2 md:col-span-1">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        {Math.round((score / quiz.questions.length) * 100)}%
                      </div>
                      <div className="text-gray-600 text-sm sm:text-base">Score</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={tryAgain}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-[#2C3E50] to-[#1E2B3A] text-white font-semibold rounded-xl hover:from-[#1E2B3A] hover:to-[#34495E] transition-all duration-300 shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Try Again
                  </button>
                  <button
                    onClick={goBackToCourse}
                    className="px-6 sm:px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow border border-gray-200 text-sm sm:text-base"
                  >
                    Back to Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
