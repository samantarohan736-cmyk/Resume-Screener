import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, Star, Building, HelpCircle as QIcon, Sparkles } from 'lucide-react';

const InterviewPrep = ({ apiBaseUrl, currentRole }) => {
  const [role, setRole] = useState(currentRole || 'Java Developer');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (currentRole) {
      setRole(currentRole);
    }
  }, [currentRole]);

  useEffect(() => {
    fetchQuestions();
  }, [role]);

  const fetchQuestions = async () => {
    setLoading(true);
    setSelectedIndex(0);
    try {
      const res = await fetch(`${apiBaseUrl}/api/interview-prep?role=${encodeURIComponent(role)}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeQuestion = questions[selectedIndex];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Banner */}
      <div className="neo-card neo-card-cyan flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <span className="neo-badge neo-badge-yellow mb-2">MASTER-DETAIL STUDIO</span>
          <h1 className="text-3xl font-black text-black uppercase">Interview Prep & Model Answers</h1>
          <p className="text-black font-bold text-xs mt-1">Review target interview questions and solutions compiled for your role</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-black uppercase">Role Filter:</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="neo-input text-xs font-bold uppercase w-48 py-1.5 bg-black text-[#00e5ff]"
          >
            <option value="Java Developer">Java Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Machine Learning Engineer">Machine Learning Engineer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Project Manager">Project Manager</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-[#ffe600] rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase text-gray-400">Fetching interview questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="neo-card text-center py-12 text-gray-400 font-bold">
          No specific questions loaded for this role yet. Showing default questions.
        </div>
      ) : (
        /* Dual Column Studio Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (1/3 cols): Question Index List */}
          <div className="lg:col-span-1 neo-card space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider bg-[#25283a] p-2 rounded border border-black shadow-[2px_2px_0px_#000]">
              Question Index ({questions.length})
            </h3>
            
            <div className="space-y-3">
              {questions.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3.5 rounded-xl border-2 border-black cursor-pointer transition-all shadow-[3px_3px_0px_#000] flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-[#ffe600] text-black font-black -translate-y-0.5' 
                        : 'bg-[#181928] text-gray-300 hover:bg-[#202236]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                        isSelected ? 'bg-black text-[#ffe600]' : 'bg-[#00e5ff] text-black'
                      }`}>
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-extrabold truncate max-w-[180px]">
                        {item.q}
                      </span>
                    </div>
                    <ChevronRight size={16} className={isSelected ? 'text-black' : 'text-gray-500'} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN (2/3 cols): Active Question Detail Card */}
          <div className="lg:col-span-2 space-y-6">
            {activeQuestion && (
              <div className="neo-card space-y-6 animate-fade-in">
                
                {/* Question Header */}
                <div className="space-y-2 border-b-3 border-black pb-4">
                  <div className="flex items-center gap-2">
                    <span className="neo-badge neo-badge-yellow">
                      ACTIVE QUESTION {selectedIndex + 1}
                    </span>
                    <span className="neo-badge neo-badge-cyan">
                      {role}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white leading-snug">
                    {activeQuestion.q}
                  </h2>
                </div>

                {/* Model Answer Key */}
                <div className="space-y-2">
                  <div className="neo-badge neo-badge-green text-[10px]">
                    MODEL ANSWER KEY
                  </div>
                  <p className="text-gray-200 text-sm font-semibold whitespace-pre-wrap leading-relaxed bg-[#141524] p-5 rounded-xl border-3 border-black shadow-[4px_4px_0px_#000]">
                    {activeQuestion.a}
                  </p>
                </div>

                {/* Pro Prep Tips */}
                {activeQuestion.tips && (
                  <div className="neo-card neo-card-yellow p-4 flex items-start gap-3 text-black">
                    <Sparkles size={20} className="shrink-0 mt-0.5" />
                    <div className="text-xs font-black">
                      <span className="uppercase">Pro Prep Tips: </span>
                      <span className="font-bold">{activeQuestion.tips}</span>
                    </div>
                  </div>
                )}

                {/* Target Companies */}
                {activeQuestion.companies && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Top Target Companies Asking This</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeQuestion.companies.map((company, index) => (
                        <span key={index} className="neo-badge neo-badge-purple text-[11px]">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
