import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  FileText, 
  Map, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck,
  TrendingUp,
  Search,
  Bell,
  ChevronDown
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import SkillProfiler from './components/SkillProfiler';
import ResumeAnalyser from './components/ResumeAnalyser';
import Roadmap from './components/Roadmap';
import MockTests from './components/MockTests';
import InterviewPrep from './components/InterviewPrep';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [predictionData, setPredictionData] = useState(null);
  const [mockScore, setMockScore] = useState(-1);
  const [globalSearch, setGlobalSearch] = useState('');

  const handlePredictionComplete = (data) => {
    setPredictionData(data);
  };

  const handleTestSubmit = (scorePercentage) => {
    setMockScore(scorePercentage);
    if (predictionData && predictionData.studentProfile) {
      triggerRePredict(predictionData.studentProfile, scorePercentage);
    }
  };

  const triggerRePredict = async (profile, currentMockScore) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...profile,
          mock_score: currentMockScore
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPredictionData(prev => ({
          ...prev,
          role: data.recommended_role,
          lpa: data.package_lpa,
          skillGap: data.skill_gap,
          requiredSkills: data.required_skills,
          roadmap: data.learning_path,
          companies: data.companies
        }));
      }
    } catch (err) {
      console.error("Re-prediction error:", err);
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'profile', name: 'Skill Profiler', icon: <UserCheck size={18} /> },
    { id: 'resume', name: 'Resume Analyser', icon: <FileText size={18} /> },
    { id: 'roadmap', name: 'Career Roadmap', icon: <Map size={18} /> },
    { id: 'test', name: 'Mock Tests', icon: <BookOpen size={18} /> },
    { id: 'interview', name: 'Interview Prep', icon: <MessageSquare size={18} /> }
  ];

  return (
    <div className="app-container">
      {/* Left Sidebar Navigation */}
      <aside className="app-sidebar">
        {/* Brand Header */}
        <div style={{ padding: '24px', borderBottom: 'var(--neo-border-thick)', backgroundColor: '#ffe600', color: '#000000', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#000000', color: '#ffe600', border: '2.5px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px #000' }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', lineHeight: 1, color: '#000000' }}>
              SkillPath
            </h2>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: '#00e5ff', color: '#000000', padding: '2px 6px', borderRadius: '4px', border: '1.5px solid #000000', boxShadow: '1px 1px 0px #000', display: 'inline-block', marginTop: '3px' }}>
              AI Analytics
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`neo-btn ${isActive ? 'neo-btn-cyan' : 'neo-btn-secondary'}`}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  boxShadow: isActive ? '4px 4px 0px #000' : '3px 3px 0px #000',
                  transform: isActive ? 'translateX(4px)' : 'none',
                  color: '#000000'
                }}
              >
                <div style={{ color: '#000000' }}>
                  {item.icon}
                </div>
                <span style={{ fontWeight: 900, color: '#000000' }}>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Widget */}
        {predictionData ? (
          <div className="neo-card neo-card-pink" style={{ margin: '16px', padding: '16px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: '#ffe600', color: '#000', padding: '2px 6px', borderRadius: '4px', border: '1px solid #000', boxShadow: '1px 1px 0px #000' }}>
              <TrendingUp size={12} />
              <span>ACTIVE TARGET</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#ffffff' }}>{predictionData.role}</h4>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#00ff66', textShadow: '1px 1px 0px #000' }}>
                ₹{predictionData.lpa} LPA
              </span>
            </div>
            {mockScore >= 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontWeight: 900, color: '#000', borderTop: '2px solid #000', paddingTop: '6px', marginTop: '6px', backgroundColor: 'rgba(255,255,255,0.3)', padding: '4px 8px', borderRadius: '4px' }}>
                <span>Mock Score:</span>
                <span style={{ backgroundColor: '#000', color: '#00e5ff', padding: '1px 6px', borderRadius: '4px', fontWeight: 900 }}>{mockScore}%</span>
              </div>
            )}
          </div>
        ) : (
          <div className="neo-card neo-card-yellow" style={{ margin: '16px', padding: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: '#000', color: '#ffe600', padding: '2px 6px', borderRadius: '4px', border: '1px solid #000' }}>
              QUICK START
            </span>
            <p style={{ fontSize: '11px', fontWeight: 900, marginTop: '4px', color: '#000' }}>Fill Skill Profiler to unlock career predictions.</p>
          </div>
        )}
      </aside>

      {/* Main Stage Area */}
      <main className="app-main">
        {/* Top Header Bar */}
        <header className="app-header">
          {/* Left Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#000000' }} size={16} />
            <input 
              type="text" 
              placeholder="Search student, skill, or role..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="neo-input"
              style={{ paddingLeft: '42px', fontSize: '12px', textTransform: 'uppercase', color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notification Bell Badge */}
            <div className="neo-btn neo-btn-secondary" style={{ padding: '10px', position: 'relative', borderRadius: '12px', backgroundColor: '#ffffff' }}>
              <Bell size={18} style={{ color: '#000000' }} />
              <span style={{ position: 'absolute', top: '4px', right: '4px', width: '10px', height: '10px', backgroundColor: '#ff007a', border: '1px solid #000', borderRadius: '50%' }}></span>
            </div>

            {/* Admin Profile Pill */}
            <div className="neo-card neo-card-yellow" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#000', color: '#ffe600', border: '1.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px' }}>
                A
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#000', textTransform: 'uppercase', display: 'block' }}>Admin</span>
                <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(0,0,0,0.8)', textTransform: 'uppercase', display: 'block' }}>Supervisor</span>
              </div>
              <ChevronDown size={14} style={{ color: '#000' }} />
            </div>
          </div>
        </header>

        {/* Tab Content Stage */}
        <div className="app-content">
          {activeTab === 'dashboard' && <Dashboard apiBaseUrl={API_BASE_URL} globalSearch={globalSearch} />}
          {activeTab === 'profile' && (
            <SkillProfiler 
              apiBaseUrl={API_BASE_URL} 
              onPredictionComplete={handlePredictionComplete} 
              mockScore={mockScore}
            />
          )}
          {activeTab === 'resume' && <ResumeAnalyser apiBaseUrl={API_BASE_URL} />}
          {activeTab === 'roadmap' && <Roadmap predictionData={predictionData} />}
          {activeTab === 'test' && (
            <MockTests 
              apiBaseUrl={API_BASE_URL} 
              currentRole={predictionData ? predictionData.role : 'Java Developer'} 
              onTestSubmit={handleTestSubmit}
            />
          )}
          {activeTab === 'interview' && (
            <InterviewPrep 
              apiBaseUrl={API_BASE_URL} 
              currentRole={predictionData ? predictionData.role : 'Java Developer'} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
