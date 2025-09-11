import { useState, useEffect } from "react";

export default function QuizModal({ isOpen, onClose, courseId, onQuizCreated }) {
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    questions: [],
  });
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizExists, setQuizExists] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [quizList, setQuizList] = useState([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [pendingDeleteQuestionIdx, setPendingDeleteQuestionIdx] = useState(null);
  const [pendingDeleteOption, setPendingDeleteOption] = useState(null); // {qIndex, oIndex}
  // Fetch quiz for courseId when modal opens
  useEffect(() => {
    if (!isOpen || !courseId) return;
    setLoading(true);
  fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/course/${courseId}`)
      .then(res => {
        if (!res.ok) throw new Error("No quiz found");
        return res.json();
      })
      .then(data => {
        // Always expect an array
        const quizzes = Array.isArray(data) ? data : [data];
        setQuizList(quizzes);
        if (quizzes.length === 1) {
          const quiz = quizzes[0];
          setQuizForm({
            title: quiz.title || "",
            description: quiz.description || "",
            questions: quiz.questions || [],
          });
          setActiveQuestionIndex(0);
          setQuizExists(true);
          setQuizId(quiz._id);
          setShowQuizForm(true);
        } else {
          setShowQuizForm(false);
        }
      })
      .catch(() => {
        setQuizList([]);
        setQuizForm({ title: "", description: "", questions: [] });
        setActiveQuestionIndex(0);
        setQuizExists(false);
        setQuizId(null);
        setShowQuizForm(false);
      })
      .finally(() => setLoading(false));
  }, [isOpen, courseId]);

  if (!isOpen) return null;
  // Show quiz list if more than one quiz
  if (!showQuizForm && quizList.length > 0) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center z-[1000]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
          <button className="absolute top-6 right-6 text-2xl text-gray-500 bg-transparent border-none cursor-pointer" onClick={onClose}>×</button>
          <h2 className="text-2xl font-bold mb-5 text-[#2C3E50]">Quizzes for this Course</h2>
          <div className="mb-6">
            {quizList.map((quiz, idx) => (
              <div key={quiz._id} className={`mb-3 p-3 border border-gray-200 rounded-lg ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}> 
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">{quiz.title}</div>
                    <div className="text-gray-500 text-sm">{quiz.description}</div>
                  </div>
                  <button className="bg-[#2C3E50] text-white rounded-lg px-4 py-2 font-medium border-none cursor-pointer"
                    onClick={() => {
                      setQuizForm({
                        title: quiz.title || "",
                        description: quiz.description || "",
                        questions: quiz.questions || [],
                      });
                      setActiveQuestionIndex(0);
                      setQuizExists(true);
                      setQuizId(quiz._id);
                      setShowQuizForm(true);
                    }}
                  >Edit</button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full bg-green-500 text-white rounded-lg py-3 font-bold text-lg border-none cursor-pointer"
            onClick={() => {
              setQuizForm({ title: "", description: "", questions: [] });
              setActiveQuestionIndex(0);
              setQuizExists(false);
              setQuizId(null);
              setShowQuizForm(true);
            }}
          >Add New Quiz</button>
        </div>
      </div>
    );
  }

  const handleQuizFormChange = (e) => {
    const { name, value } = e.target;
    setQuizForm((prev) => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: "",
          question_type: "single",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    }));
    setActiveQuestionIndex(quizForm.questions.length);
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      questions[index][field] = value;
      if (field === "question_type") {
        if (value === "truefalse") {
          questions[index].options = [
            { text: "True", isCorrect: false },
            { text: "False", isCorrect: false },
          ];
        } else if (value === "single") {
          questions[index].options = [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ];
        } else if (value === "multiple") {
          questions[index].options = [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ];
        }
      }
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      options[oIndex][field] = value;
      questions[qIndex].options = options;
      return { ...prev, questions };
    });
  };

  const addOption = (qIndex) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      if (questions[qIndex].question_type === "multiple") {
        questions[qIndex].options.push({ text: "", isCorrect: false });
      }
      return { ...prev, questions };
    });
  };

  const handleSaveQuiz = async () => {
    let updatedQuizForm = { ...quizForm };
    if (!quizId) {
      if (typeof pendingDeleteQuestionIdx === 'number') {
        updatedQuizForm.questions = updatedQuizForm.questions.filter((_, i) => i !== pendingDeleteQuestionIdx);
        setPendingDeleteQuestionIdx(null);
      }
      if (pendingDeleteOption && typeof pendingDeleteOption.qIndex === 'number' && typeof pendingDeleteOption.oIndex === 'number') {
        updatedQuizForm.questions = updatedQuizForm.questions.map((q, idx) => {
          if (idx !== pendingDeleteOption.qIndex) return q;
          return {
            ...q,
            options: q.options.filter((_, i) => i !== pendingDeleteOption.oIndex)
          };
        });
        setPendingDeleteOption(null);
      }
    }

    // Validation: every question must have at least one correct option
    const invalidQuestions = updatedQuizForm.questions.filter(q => !q.options.some(opt => opt.isCorrect));
    if (invalidQuestions.length > 0) {
      alert("Each question must have at least one correct option selected.");
      return;
    }

    try {
      let res;
      if (quizExists && quizId) {
        // Update existing quiz
  res = await fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/${quizId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: updatedQuizForm.title,
            description: updatedQuizForm.description,
            questions: updatedQuizForm.questions,
          }),
        });
      } else {
        // Create new quiz
  res = await fetch("https://backend-hosting-d4f6.onrender.com/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course_id: courseId,
            title: updatedQuizForm.title,
            description: updatedQuizForm.description,
            questions: updatedQuizForm.questions,
          }),
        });
      }
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Failed to save quiz: " + errorText);
      }
      setQuizForm({ title: "", description: "", questions: [] });
      setActiveQuestionIndex(0);
      setQuizId(null);
      if (typeof onQuizCreated === "function") onQuizCreated();
      if (typeof onClose === "function") onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add delete quiz handler
  const handleDeleteQuiz = async () => {
    if (!quizId) return;
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
  const res = await fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/${quizId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete quiz");
      setQuizForm({ title: "", description: "", questions: [] });
      setActiveQuestionIndex(0);
      setQuizId(null);
      if (typeof onQuizCreated === "function") onQuizCreated();
      if (typeof onClose === "function") onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler to delete a question (with confirmation)
const handleDeleteQuestion = (index) => {
  if (!window.confirm("Are you sure you want to delete this question?")) return;
  if (!quizId) {
    setPendingDeleteQuestionIdx(index); // Mark for deletion, only delete on Save
    return;
  }
  // For saved quiz, delete immediately
  const questionId = quizForm.questions[index]?._id;
  if (!questionId) {
    alert('Question ID not found');
    return;
  }
  fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/${quizId}/question/${questionId}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete question");
      return res.json();
    })
    .then(updatedQuiz => {
      setQuizForm({
        title: updatedQuiz.title || "",
        description: updatedQuiz.description || "",
        questions: updatedQuiz.questions || []
      });
      setActiveQuestionIndex(prevIdx => {
        if (updatedQuiz.questions.length === 0) return 0;
        if (index < prevIdx) return Math.max(0, prevIdx - 1);
        if (index === prevIdx) return Math.min(prevIdx, updatedQuiz.questions.length - 1);
        return prevIdx;
      });
    })
    .catch(err => alert(err.message));
};

// Handler to delete an option (with confirmation)
const handleDeleteOption = (qIndex, oIndex) => {
  if (!window.confirm("Are you sure you want to delete this option?")) return;
  if (!quizId) {
    setPendingDeleteOption({ qIndex, oIndex }); // Mark for deletion, only delete on Save
    return;
  }
  const questionId = quizForm.questions[qIndex]?._id;
  const optionId = quizForm.questions[qIndex]?.options[oIndex]?._id;
  if (!questionId || !optionId) {
    alert('Question or Option ID not found');
    return;
  }
  fetch(`https://backend-hosting-d4f6.onrender.com/api/quiz/${quizId}/question/${questionId}/option/${optionId}`, {
    method: "DELETE"
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete option");
      return res.json();
    })
    .then(updatedQuiz => {
      setQuizForm({
        title: updatedQuiz.title || "",
        description: updatedQuiz.description || "",
        questions: updatedQuiz.questions || []
      });
    })
    .catch(err => alert(err.message));
};

  return (
      <div className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 w-full max-w-6xl min-h-[600px] relative max-h-[90vh] overflow-y-auto">
          <button className="absolute top-6 right-6 text-2xl text-gray-500 bg-transparent border-none cursor-pointer" onClick={onClose}>×</button>
          <h2 className="text-3xl font-bold mb-5 text-[#2C3E50]">
            {quizExists ? "Edit Quiz" : "Create Quiz"}
          </h2>
          <label className="block text-slate-700 font-medium mb-1">Quiz Title</label>
          <input
            type="text"
            name="title"
            placeholder="Quiz Title"
            value={quizForm.title}
            onChange={handleQuizFormChange}
            className="w-full mb-3 p-3 rounded-lg border border-gray-200 text-base"
            disabled={loading}
          />
          <label className="block text-slate-700 font-medium mb-1">Quiz Description</label>
          <textarea
            name="description"
            placeholder="Quiz Description"
            value={quizForm.description}
            onChange={handleQuizFormChange}
            className="w-full mb-5 p-3 rounded-lg border border-gray-200 text-base resize-none"
            disabled={loading}
          />
          {/* Always wrap conditional in a parent */}
          <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 32 }}>
            </div>
          ) : (
            <>
              <div className="flex">
                <div className="min-w-[140px] mr-6">
                  {quizForm.questions.map((q, i) => (
                    <div key={i} className="mb-2 flex items-center">
                      <button
                        className={`flex-1 border border-gray-200 rounded-lg p-2 font-medium text-slate-800 cursor-pointer transition-colors ${i === activeQuestionIndex ? 'bg-[#2C3E50] border-[#2C3E50] text-white' : 'bg-white hover:bg-gray-100'}`}
                        onClick={() => setActiveQuestionIndex(i)}
                      >
                        Question {i + 1}
                      </button>
                      <button
                        className="ml-2 bg-red-500 border-none text-white text-lg cursor-pointer rounded-full w-7 h-7 flex items-center justify-center"
                        title="Delete Question"
                        onClick={() => handleDeleteQuestion(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button onClick={addQuestion} className="w-full bg-[#2C3E50] text-white rounded-lg p-2 font-semibold border-none cursor-pointer mt-2">Add Question</button>
                </div>
                <div className="flex-1">
                  {quizForm.questions[activeQuestionIndex] && (
                    <div className="border border-gray-200 rounded-xl p-5 mb-3 bg-gray-50">
                      <label className="block text-slate-700 font-medium mb-1">Question Text</label>
                      <input
                        type="text"
                        placeholder="Question Text"
                        value={quizForm.questions[activeQuestionIndex].question_text}
                        onChange={e => handleQuestionChange(activeQuestionIndex, "question_text", e.target.value)}
                        className="w-full mb-3 p-2 rounded-lg border border-gray-200 text-base h-12 min-h-[48px] max-h-[48px] overflow-hidden whitespace-pre-wrap break-words"
                      />
                      <label className="block text-slate-700 font-medium mb-1">Question Type</label>
                      <select
                        value={quizForm.questions[activeQuestionIndex].question_type}
                        onChange={e => handleQuestionChange(activeQuestionIndex, "question_type", e.target.value)}
                        className="mb-4 p-2 rounded-lg border border-gray-200 text-base"
                      >
                        <option value="single">Single</option>
                        <option value="multiple">Multiple</option>
                        <option value="truefalse">True/False</option>
                      </select>
                      {/* Options: 2 per row */}
                      <div className="flex flex-wrap gap-3">
                        {quizForm.questions[activeQuestionIndex].options.map((opt, j) => (
                          <div key={j} className="flex items-center w-[48%] mb-2">
                            {/* Single and True/False: allow only one selected, and allow unselect by clicking again */}
                            <input
                              type={quizForm.questions[activeQuestionIndex].question_type === "multiple" ? "checkbox" : "radio"}
                              checked={!!opt.isCorrect}
                              onChange={e => {
                                const type = quizForm.questions[activeQuestionIndex].question_type;
                                if (type === "multiple") {
                                  handleOptionChange(activeQuestionIndex, j, "isCorrect", e.target.checked);
                                } else {
                                  // If already selected, unselect
                                  if (opt.isCorrect) {
                                    handleOptionChange(activeQuestionIndex, j, "isCorrect", false);
                                  } else {
                                    // Unselect all others, select this
                                    const updatedOptions = quizForm.questions[activeQuestionIndex].options.map((o, idx) => ({
                                      ...o,
                                      isCorrect: idx === j
                                    }));
                                    handleQuestionChange(activeQuestionIndex, "options", updatedOptions);
                                  }
                                }
                              }}
                              className="mr-2"
                              disabled={false}
                            />
                            <input
                              type="text"
                              placeholder="Option text"
                              value={opt.text}
                              onChange={e => handleOptionChange(activeQuestionIndex, j, "text", e.target.value)}
                              className="flex-1 p-2 rounded-md border border-gray-200"
                              disabled={quizForm.questions[activeQuestionIndex].question_type === "truefalse"}
                            />
                            {/* Show delete icon for added options (index >= 4) in multiple type, outside the box */}
                            {quizForm.questions[activeQuestionIndex].question_type === "multiple" && j >= 4 && (
                              <button
                                className="ml-2 bg-red-500 border-none text-white text-lg cursor-pointer rounded-full w-7 h-7 flex items-center justify-center"
                                title="Delete Option"
                                onClick={() => handleDeleteOption(activeQuestionIndex, j)}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Add option for multiple only */}
                      {quizForm.questions[activeQuestionIndex].question_type === "multiple" && (
                        <button onClick={() => addOption(activeQuestionIndex)} className="mt-2 bg-[#2C3E50] text-white rounded-lg px-4 py-2 font-medium border-none cursor-pointer">Add Option</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveQuiz}
                  className="flex-1 bg-[#2C3E50] text-white rounded-lg py-3 font-bold text-lg border-none cursor-pointer"
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  onClick={handleDeleteQuiz}
                  className="flex-1 bg-red-500 text-white rounded-lg py-3 font-bold text-lg border-none cursor-pointer"
                  disabled={loading || !quizExists}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
