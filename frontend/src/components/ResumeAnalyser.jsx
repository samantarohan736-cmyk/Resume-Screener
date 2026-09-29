import React, { useState } from 'react';
import { 
  FileText, CheckCircle, XCircle, AlertTriangle, Sparkles, Check, 
  RefreshCw, Upload, Users, Award, TrendingUp, Trash2, FileType
} from 'lucide-react';

const ResumeAnalyser = ({ apiBaseUrl }) => {
  const [inputMode, setInputMode] = useState('pdf'); // 'pdf' or 'text'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Java Developer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);
  const [showDifference, setShowDifference] = useState(false);

  // File select handler
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0 && files.length > 0) {
      alert("Please upload PDF files only (.pdf format).");
      return;
    }

    setSelectedFiles(prev => [...prev, ...pdfFiles]);
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
      if (pdfFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...pdfFiles]);
      } else {
        alert("Please drop PDF files only.");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  // Submit Handler
  const handleAnalyze = async () => {
    if (inputMode === 'text') {
      if (!resumeText.trim()) {
        alert("Please paste your resume text first.");
        return;
      }
    } else {
      if (selectedFiles.length === 0) {
        alert("Please select at least one PDF CV file to analyze.");
        return;
      }
    }

    setLoading(true);
    setResult(null);
    setSelectedCandidateIndex(0);
    setShowDifference(false);

    try {
      let res;
      if (inputMode === 'pdf') {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('resumes', file);
        });
        formData.append('target_role', targetRole);

        res = await fetch(`${apiBaseUrl}/api/analyze-resume`, {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch(`${apiBaseUrl}/api/analyze-resume`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            resume_text: resumeText,
            target_role: targetRole
          })
        });
      }

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json();
        alert(errData.error || "Analysis failed. Please try again.");
      }
    } catch (err) {
      console.error("Resume analysis failed:", err);
      alert("Error analyzing resume. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleResume = () => {
    setInputMode('text');
    setResumeText(
      `RAHUL KUMAR\nEmail: rahul.kumar@gmail.com\nBranch: CSE\n\nOBJECTIVE\nHighly motivated student seeking a Software Development role to apply programming skills.\n\nEDUCATION\nB.Tech in Computer Science - CGPA: 8.5\n\nEXPERIANCE (Typo check)\nWeb Intern at LocalTech: Worked on frontend layouts and handled server-side data.\nCreated responsive layouts using HTML5 and CSS.\n\nPROJECTS\n1. E-Commerce Platform: Built using Java and Spring Boot. Handled database connections.\n2. Coding Practice: Solved 200+ data structures problems.\n\nSKILLS\nJava, SQL, Data Structures, Git, CSS, Basic HTML`
    );
  };

  // Determine active candidate data
  const currentCandidate = result
    ? (result.candidates && result.candidates.length > 0
        ? result.candidates[selectedCandidateIndex] || result.candidates[0]
        : result)
    : null;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Banner */}
      <div className="neo-card neo-card-cyan flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="neo-badge neo-badge-yellow">PDF & TEXT ATS SCANNER</span>
            <span className="neo-badge neo-badge-pink">ML MODEL READY</span>
          </div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">
            Resume Analyser & ATS Optimizer
          </h1>
          <p className="text-black font-bold text-xs mt-1">
            Upload PDF CV(s) or paste raw text. Scans section formatting, spelling mistakes, ATS keywords, and predicts ML career roles & salary packages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT PANEL (3/5 cols): ATS Analysis & Results */}
        <div className="lg:col-span-3 space-y-6">
          {result ? (
            <div className="space-y-6">

              {/* BATCH HR RECRUITER OVERVIEW SUMMARY (Visible if multiple PDFs uploaded) */}
              {result.is_batch && result.candidates && result.candidates.length > 1 && (
                <div className="neo-card bg-[#1a1c2e] border-3 border-black p-6 space-y-4 shadow-[4px_4px_0px_#000]">
                  <div className="flex justify-between items-center border-b-2 border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="text-[#00ff66]" size={22} />
                      <h3 className="text-sm font-black uppercase text-white tracking-wider">
                        HR Multi-CV Screening Dashboard ({result.total_candidates} Resumes)
                      </h3>
                    </div>
                    <span className="neo-badge neo-badge-green text-xs font-black">
                      BATCH PROCESSED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-[#0f111a] p-3 rounded-xl border-2 border-black">
                      <span className="text-[10px] font-black uppercase text-gray-400">Total Analyzed</span>
                      <p className="text-2xl font-black text-[#00e5ff] mt-1">{result.total_candidates}</p>
                    </div>
                    <div className="bg-[#0f111a] p-3 rounded-xl border-2 border-black">
                      <span className="text-[10px] font-black uppercase text-gray-400">Avg ATS Score</span>
                      <p className="text-2xl font-black text-[#ffe600] mt-1">{result.average_score}%</p>
                    </div>
                    <div className="bg-[#0f111a] p-3 rounded-xl border-2 border-black">
                      <span className="text-[10px] font-black uppercase text-gray-400">Top Candidate</span>
                      <p className="text-sm font-black text-[#00ff66] truncate mt-2">{result.top_candidate}</p>
                    </div>
                  </div>

                  {/* Candidate Comparison Table */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-black uppercase text-gray-300">Candidate Ranking & Comparison Table</h4>
                    <div className="overflow-x-auto border-2 border-black rounded-xl bg-[#0d0e15]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#23263b] text-gray-300 border-b-2 border-black font-black uppercase">
                            <th className="p-3">Rank & Name</th>
                            <th className="p-3 text-center">ATS Score</th>
                            <th className="p-3 text-center">ML Rec. Role</th>
                            <th className="p-3 text-center">Est. Package</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {result.candidates.map((cand, idx) => (
                            <tr 
                              key={idx}
                              className={`transition-colors ${
                                selectedCandidateIndex === idx ? 'bg-[#00ff66]/15 font-bold' : 'hover:bg-[#1e2133]'
                              }`}
                            >
                              <td className="p-3">
                                <div className="font-black text-white flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full border border-black flex items-center justify-center text-[10px] ${
                                    idx === 0 ? 'bg-[#ffe600] text-black font-black' : 'bg-gray-700 text-white'
                                  }`}>
                                    #{idx + 1}
                                  </span>
                                  <span>{cand.candidate_name}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 truncate block max-w-[150px]">
                                  {cand.filename}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`neo-badge ${
                                  cand.overall_score >= 70 ? 'neo-badge-green' : cand.overall_score >= 50 ? 'neo-badge-yellow' : 'neo-badge-pink'
                                }`}>
                                  {cand.overall_score}%
                                </span>
                              </td>
                              <td className="p-3 text-center text-gray-200 font-bold">
                                {cand.ml_prediction?.recommended_role || targetRole}
                              </td>
                              <td className="p-3 text-center text-[#00ff66] font-black">
                                ₹{cand.ml_prediction?.package_lpa || '6.5'} LPA
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setSelectedCandidateIndex(idx)}
                                  className={`neo-btn text-[10px] py-1 px-2.5 ${
                                    selectedCandidateIndex === idx ? 'neo-btn-green' : 'neo-btn-cyan'
                                  }`}
                                >
                                  {selectedCandidateIndex === idx ? "VIEWING" : "INSPECT"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CURRENT CANDIDATE DETAILED BREAKDOWN */}
              {currentCandidate && (
                <div className="space-y-6">
                  
                  {/* Scores Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Overall Score */}
                    <div className="neo-card neo-card-green flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-xs font-black uppercase text-black">Overall Score</span>
                      <span className="text-5xl font-black text-black mt-2 drop-shadow-[2px_2px_0px_#fff]">
                        {currentCandidate.overall_score}%
                      </span>
                      <div className="w-full bg-black h-3 rounded-full overflow-hidden border border-black mt-4">
                        <div 
                          className="h-full bg-white transition-all duration-700"
                          style={{ width: `${currentCandidate.overall_score}%` }}
                        />
                      </div>
                    </div>

                    {/* ATS Keyword Score */}
                    <div className="neo-card neo-card-cyan flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-xs font-black uppercase text-black">ATS Keyword Match</span>
                      <span className="text-5xl font-black text-black mt-2 drop-shadow-[2px_2px_0px_#fff]">
                        {currentCandidate.ats_score}%
                      </span>
                      <div className="w-full bg-black h-3 rounded-full overflow-hidden border border-black mt-4">
                        <div 
                          className="h-full bg-white transition-all duration-700"
                          style={{ width: `${currentCandidate.ats_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Mistakes Found */}
                    <div className="neo-card neo-card-pink flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-xs font-black uppercase text-white">Spelling Mistakes</span>
                      <span className="text-5xl font-black text-white mt-2 drop-shadow-[2px_2px_0px_#000]">
                        {currentCandidate.mistakes ? currentCandidate.mistakes.length : 0}
                      </span>
                      <span className="text-xs font-bold text-white mt-4 bg-black/40 px-2 py-0.5 rounded border border-black">
                        {!currentCandidate.mistakes || currentCandidate.mistakes.length === 0 ? "Perfect Spelling!" : "Review Suggestions"}
                      </span>
                    </div>
                  </div>

                  {/* ML Model Predictions Display */}
                  {currentCandidate.ml_prediction && (
                    <div className="neo-card neo-card-cyan p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center border-2 border-black shrink-0">
                          <Award size={24} className="text-[#ffe600]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-black uppercase tracking-wider block">ML Model Recommended Role</span>
                          <span className="text-base font-black text-black uppercase block">
                            {currentCandidate.ml_prediction.recommended_role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-black/10 p-3 rounded-xl border border-black/20">
                        <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center border border-black shrink-0">
                          <TrendingUp size={20} className="text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-black uppercase tracking-wider block">Predicted Package</span>
                          <span className="text-xl font-black text-black block">
                            ₹{currentCandidate.ml_prediction.package_lpa} LPA
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sections Checklist */}
                  <div className="neo-card space-y-4">
                    <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider bg-[#25283a] p-2 rounded border border-black shadow-[2px_2px_0px_#000]">
                      Required Resume Sections Checklist
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {Object.entries(currentCandidate.section_check || {}).map(([sec, present]) => (
                        <div 
                          key={sec} 
                          className={`flex flex-col items-center p-3 rounded-xl border-3 border-black shadow-[3px_3px_0px_#000] text-center transition-all ${
                            present ? 'bg-[#00ff66] text-black font-black' : 'bg-[#ff3344] text-white font-black'
                          }`}
                        >
                          {present ? <CheckCircle size={20} className="mb-1 text-black" /> : <XCircle size={20} className="mb-1 text-white" />}
                          <span className="text-xs uppercase">{sec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions / Improvements */}
                  <div className="neo-card space-y-4">
                    <h3 className="text-xs font-black text-[#ffe600] uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle size={16} />
                      <span>Prioritized ATS Recommendations</span>
                    </h3>
                    <ul className="space-y-2.5">
                      {(currentCandidate.improvements || []).map((imp, idx) => (
                        <li key={idx} className="flex gap-3 items-center text-xs font-bold text-gray-200 bg-[#1e2030] p-2.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                          <div className="w-2.5 h-2.5 bg-[#ffe600] border border-black rounded-full shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Corrections Board */}
                  {currentCandidate.mistakes && currentCandidate.mistakes.length > 0 && (
                    <div className="neo-card space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider">Grammar & Typing Corrections</h3>
                        <button 
                          onClick={() => setShowDifference(!showDifference)}
                          className="neo-btn neo-btn-cyan text-[11px] py-1.5 px-3"
                        >
                          {showDifference ? "SHOW MISTAKE LIST" : "SHOW CORRECTED TEXT"}
                        </button>
                      </div>

                      {showDifference ? (
                        <div className="bg-[#0c0d14] border-3 border-black rounded-xl p-4 max-h-[300px] overflow-y-auto shadow-[3px_3px_0px_#000]">
                          <h4 className="text-xs font-black text-[#00ff66] uppercase mb-2 border-b-2 border-black pb-1">Formatted Output</h4>
                          <pre className="text-xs font-mono whitespace-pre-wrap text-[#00ff66] leading-relaxed">
                            {currentCandidate.corrected_text}
                          </pre>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentCandidate.mistakes.map((mistake, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-4 p-3 bg-[#ff3344]/15 border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000]">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#ff3344] line-through bg-black px-2 py-0.5 rounded border border-black">{mistake.wrong}</span>
                                  <span className="text-gray-400">➔</span>
                                  <span className="neo-badge neo-badge-green">
                                    <Check size={12} />
                                    {mistake.correct}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-[11px]">{mistake.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Missing Keywords Details */}
                  {currentCandidate.missing_keywords && currentCandidate.missing_keywords.length > 0 && (
                    <div className="neo-card space-y-4">
                      <h3 className="text-xs font-black text-[#00e5ff] uppercase tracking-wider">Missing ATS Keywords</h3>
                      <p className="text-xs font-bold text-gray-400">Incorporate these skills naturally into your summary, skills, or project bullets to boost search visibility:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentCandidate.missing_keywords.map((kw, idx) => (
                          <span key={idx} className="neo-badge neo-badge-pink text-[11px]">
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="neo-card flex flex-col items-center justify-center text-center gap-6 h-full py-28">
              <div className="w-20 h-20 bg-[#00e5ff] text-black border-3 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
                <FileText size={36} />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-xl font-black uppercase">Ready for Analysis</h3>
                <p className="text-xs font-bold text-gray-400 mx-auto">
                  Upload single or multiple PDF CVs on the right panel (or paste text), choose your target job role, and run ATS & ML career analysis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL (2/5 cols): Input Modes & File Uploader */}
        <div className="lg:col-span-2 neo-card space-y-6 h-fit">
          
          {/* Target Role Selector */}
          <div className="space-y-2">
            <label className="neo-label">Target Role Optimization</label>
            <select 
              value={targetRole} 
              onChange={(e) => setTargetRole(e.target.value)}
              className="neo-input text-xs font-bold uppercase"
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

          {/* Mode Switcher Tabs */}
          <div className="flex border-2 border-black rounded-xl p-1 bg-[#131522] gap-1">
            <button
              onClick={() => setInputMode('pdf')}
              className={`flex-1 py-2.5 text-xs font-black uppercase rounded-lg flex items-center justify-center gap-2 transition-all ${
                inputMode === 'pdf'
                  ? 'bg-[#00e5ff] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileType size={15} />
              <span>UPLOAD PDF CV(S)</span>
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 py-2.5 text-xs font-black uppercase rounded-lg flex items-center justify-center gap-2 transition-all ${
                inputMode === 'text'
                  ? 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText size={15} />
              <span>PASTE TEXT</span>
            </button>
          </div>

          {/* INPUT FORM ACCORDING TO TAB */}
          {inputMode === 'pdf' ? (
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-3 border-dashed border-[#00e5ff] bg-[#0c0e18] p-6 rounded-2xl text-center space-y-3 hover:bg-[#121526] transition-all cursor-pointer relative"
              >
                <input 
                  type="file" 
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-14 h-14 bg-[#00e5ff]/20 text-[#00e5ff] rounded-full flex items-center justify-center mx-auto border-2 border-[#00e5ff]">
                  <Upload size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-white">Drag & Drop PDF CV Files Here</h4>
                  <p className="text-[11px] text-gray-400 font-bold mt-1">Supports single or multiple PDF CVs for students & HR</p>
                </div>
                <span className="neo-badge neo-badge-yellow text-[10px] inline-block">
                  BROWSE FILES (.PDF)
                </span>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-gray-300 uppercase">
                      Selected CV Files ({selectedFiles.length})
                    </span>
                    <button 
                      onClick={clearFiles}
                      className="text-[10px] text-pink-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={12} /> CLEAR ALL
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 border-2 border-black p-2 rounded-xl bg-[#090a10]">
                    {selectedFiles.map((file, idx) => (
                      <div 
                        key={idx}
                        className="flex justify-between items-center p-2 bg-[#1b1e2e] border border-black rounded-lg text-xs font-bold text-white"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileType size={16} className="text-[#00e5ff] shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button 
                          onClick={() => removeFile(idx)}
                          className="text-gray-400 hover:text-red-400 shrink-0"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="neo-label mb-0">Paste Resume Text</label>
                <button 
                  type="button" 
                  onClick={loadSampleResume}
                  className="neo-btn neo-btn-cyan text-[11px] py-1 px-3"
                >
                  LOAD SAMPLE
                </button>
              </div>
              <textarea 
                rows="14"
                placeholder="Paste plain text of your resume here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="neo-input text-xs font-mono resize-y min-h-[300px]"
              />
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="neo-btn neo-btn-yellow w-full justify-center py-4 text-sm font-black"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>EXTRACTING & SCANNING CV(S)...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>
                  {inputMode === 'pdf' 
                    ? `RUN ATS & ML SCAN ON ${selectedFiles.length > 0 ? selectedFiles.length : '1+'} PDF(S)`
                    : 'RUN ATS ANALYSIS & SCAN'}
                </span>
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyser;
