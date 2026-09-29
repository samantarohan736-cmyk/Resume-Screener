import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Check, X, Clock, RefreshCw, Award, ArrowRight } from 'lucide-react';

const MockTests = ({ apiBaseUrl, currentRole, onTestSubmit }) => {
  const [role, setRole] = useState(currentRole || 'Java Developer');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [quizActive, setQuizActive] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (currentRole) {
      setRole(currentRole);
    }
  }, [currentRole]);

  const loadQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setQuizActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      const res = await fetch(`${apiBaseUrl}/api/mock-test?role=${encodeURIComponent(role)}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Error loading quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizActive(true);
    setTimeLeft(600);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectOption = (qId, optionIdx) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmit(null, true);
  };

  const handleSubmit = (e, autoSubmit = false) => {
    if (e) e.preventDefault();
    if (timerRef.current) clearInterval(timerRef.current);
    
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(percentage);
    setSubmitted(true);
    setQuizActive(false);

    if (onTestSubmit) {
      onTestSubmit(percentage);
    }

    if (!autoSubmit) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    loadQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [role]);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Banner */}
      <div className="neo-card neo-card-cyan flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <span className="neo-badge neo-badge-yellow mb-2">ASSESSMENT ENGINE</span>
          <h1 className="text-3xl font-black text-black uppercase">Domain Skill Mock Tests</h1>
          <p className="text-black font-bold text-xs mt-1">Take a timed mock assessment and review explanations to boost predicted LPA</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-black uppercase">Domain:</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            disabled={quizActive}
            className="neo-input text-xs font-bold uppercase w-48 py-1.5 bg-black text-[#00e5ff]"
          >
            <option value="Java Developer">Java Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Data Scientist">Data Scientist</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-[#00e5ff] rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase text-gray-400">Fetching assessment quiz...</p>
        </div>
      ) : !quizActive && !submitted ? (
        /* Start Screen */
        <div className="neo-card neo-card-yellow text-center max-w-xl mx-auto py-12 px-8 space-y-6">
          <div className="w-20 h-20 bg-black text-[#ffe600] border-3 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_#000]">
            <BookOpen size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-black uppercase">{role} MCQ Assessment</h2>
            <p className="text-xs font-bold text-black leading-relaxed">
              This assessment evaluates your proficiency in {role} concepts. Completing this test updates your skills records and raises your expected LPA package based on your final score!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left bg-black text-white p-4 rounded-xl text-xs font-bold border-2 border-black shadow-[3px_3px_0px_#000] max-w-sm mx-auto">
            <div><strong className="text-[#ffe600]">Questions:</strong> 10 MCQs</div>
            <div><strong className="text-[#ffe600]">Duration:</strong> 10 Mins</div>
            <div><strong className="text-[#ffe600]">Timer:</strong> Dynamic</div>
            <div><strong className="text-[#ffe600]">Effect:</strong> Upgrades LPA</div>
          </div>
          <button onClick={startQuiz} className="neo-btn neo-btn-cyan text-sm px-8 py-4">
            <span>START TEST NOW</span>
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        /* Quiz Active or Submitted Screen */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT PANEL (1/4 cols): Sticky Assessment Controls & Timer */}
          <div className="lg:col-span-1 space-y-6">
            <div className="neo-card sticky top-24 space-y-6 text-center">
              <div className="space-y-1">
                <span className="neo-badge neo-badge-yellow text-[10px]">ASSESSMENT TIMER</span>
                {quizActive ? (
                  <div className="flex items-center justify-center gap-2 text-3xl font-black font-mono text-[#ff3344] mt-3 bg-black p-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                    <Clock size={24} className="animate-pulse" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                ) : (
                  <div className="text-base font-black text-gray-500 mt-2 uppercase">Inactive</div>
                )}
              </div>

              {quizActive && (
                <div className="text-xs font-bold text-gray-400 border-t-2 border-black pt-4 text-left">
                  Do not refresh or navigate away from this tab, or your current test progress will reset.
                </div>
              )}

              {submitted && (
                <div className="space-y-3 border-t-2 border-black pt-4">
                  <div className="neo-badge neo-badge-green text-xs w-full justify-center">
                    SCORE: {score}%
                  </div>
                  <button onClick={loadQuiz} className="neo-btn neo-btn-yellow text-xs w-full">
                    <RefreshCw size={14} />
                    <span>RETAKE QUIZ</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL (3/4 cols): Question Stream & Score Banner */}
          <div className="lg:col-span-3 space-y-6">
            {submitted && (
              /* Score Overlay Banner */
              <div className="neo-card neo-card-green flex flex-col sm:flex-row items-center justify-between gap-6 p-8">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="neo-badge neo-badge-dark text-[10px]">
                    ASSESSMENT COMPLETED
                  </span>
                  <h2 className="text-4xl font-black text-black uppercase mt-1">Your Score: {score}%</h2>
                  <p className="text-xs font-bold text-black">
                    {score >= 80 ? "Stellar work! Your predicted LPA has been boosted on your active profile." : 
                     score >= 50 ? "Solid effort. Revise target roadmap steps to increase scoring." : 
                     "Review correctness below and try again to improve your score."}
                  </p>
                </div>
              </div>
            )}

            {/* Questions Listing */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="neo-card space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <span className="neo-badge neo-badge-dark text-[10px]">
                      QUESTION {idx + 1} OF {questions.length}
                    </span>
                    {submitted && (
                      answers[q.id] === q.answer ? (
                        <span className="neo-badge neo-badge-green text-[10px]">
                          <Check size={12} /> CORRECT
                        </span>
                      ) : (
                        <span className="neo-badge neo-badge-pink text-[10px]">
                          <X size={12} /> INCORRECT
                        </span>
                      )
                    )}
                  </div>
                  <h3 className="text-base font-black text-white leading-snug">{q.question}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = answers[q.id] === oIdx;
                      const isCorrect = q.answer === oIdx;
                      
                      let optionStyle = "bg-[#1e2030] text-gray-200 hover:bg-[#282a3f]";
                      if (isSelected) {
                        optionStyle = "bg-[#00e5ff] text-black font-black border-3 border-black shadow-[3px_3px_0px_#000]";
                      }
                      if (submitted) {
                        if (isCorrect) {
                          optionStyle = "bg-[#00ff66] text-black font-black border-3 border-black shadow-[3px_3px_0px_#000]";
                        } else if (isSelected) {
                          optionStyle = "bg-[#ff3344] text-white font-black border-3 border-black shadow-[3px_3px_0px_#000]";
                        } else {
                          optionStyle = "bg-[#151624] text-gray-500 opacity-50";
                        }
                      }
                      
                      return (
                        <div 
                          key={oIdx}
                          onClick={() => selectOption(q.id, oIdx)}
                          className={`flex items-center gap-3 p-4 border-2 border-black rounded-xl cursor-pointer text-xs font-bold transition-all shadow-[2px_2px_0px_#000] ${optionStyle}`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center shrink-0 text-xs font-black ${
                            isSelected ? 'bg-black text-[#00e5ff]' : 'bg-black text-white'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="mt-4 pt-4 border-t-2 border-black text-xs font-bold text-gray-300 bg-[#161726] p-3 rounded-lg border border-black">
                      <strong className="text-[#ffe600]">EXPLANATION:</strong> The correct answer is option <strong>{q.options[q.answer]}</strong>. 
                      Review concepts around this topic in your Career Roadmap reference tools.
                    </div>
                  )}
                </div>
              ))}

              {quizActive && (
                <button type="submit" className="neo-btn neo-btn-yellow w-full justify-center py-4 text-sm">
                  <span>SUBMIT ASSESSMENT ANSWERS</span>
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTests;
