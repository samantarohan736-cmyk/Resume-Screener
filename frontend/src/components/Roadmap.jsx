import React, { useState } from 'react';
import { Award, Compass, CheckCircle2, ChevronRight, BookOpen, ExternalLink, Flag } from 'lucide-react';

const Roadmap = ({ predictionData }) => {
  if (!predictionData) {
    return (
      <div className="neo-card flex flex-col items-center justify-center text-center gap-6 py-24 animate-fade-in">
        <div className="w-20 h-20 bg-[#ffe600] text-black border-3 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
          <Compass size={36} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase">No Roadmap Active</h3>
          <p className="text-xs font-bold text-gray-400 max-w-xs mx-auto">Please complete the Skill Profiler prediction first to generate your custom learning path.</p>
        </div>
      </div>
    );
  }

  const { role, lpa, skillGap, requiredSkills, roadmap, companies, studentProfile } = predictionData;
  const [completedSteps, setCompletedSteps] = useState(new Set());
  
  const toggleStep = (step) => {
    const newSteps = new Set(completedSteps);
    if (newSteps.has(step)) {
      newSteps.delete(step);
    } else {
      newSteps.add(step);
    }
    setCompletedSteps(newSteps);
  };

  const chartSkills = [
    { name: "DSA", key: "dsa", max: 10 },
    { name: "Web Dev", key: "web_dev", max: 10 },
    { name: "Java", key: "java", max: 10 },
    { name: "Python", key: "python", max: 10 },
    { name: "CGPA", key: "cgpa", max: 10 },
    { name: "Soft Skills", key: "communication", max: 10 }
  ];

  const cx = 150;
  const cy = 150;
  const r = 100;
  
  const getPointsStr = (isActual) => {
    return chartSkills.map((skill, index) => {
      const angle = (index * 2 * Math.PI) / chartSkills.length - Math.PI / 2;
      let val = 0;
      if (isActual) {
        val = skill.key === "cgpa" ? studentProfile.cgpa : studentProfile[skill.key];
      } else {
        val = requiredSkills[skill.key] || 5;
      }
      
      const valScaled = (val / skill.max) * r;
      const x = cx + valScaled * Math.cos(angle);
      const y = cy + valScaled * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  };

  const axisDetails = chartSkills.map((skill, index) => {
    const angle = (index * 2 * Math.PI) / chartSkills.length - Math.PI / 2;
    const xLine = cx + r * Math.cos(angle);
    const yLine = cy + r * Math.sin(angle);
    const xLabel = cx + (r + 22) * Math.cos(angle);
    const yLabel = cy + (r + 16) * Math.sin(angle);
    
    let textAnchor = "middle";
    if (Math.cos(angle) > 0.1) textAnchor = "start";
    else if (Math.cos(angle) < -0.1) textAnchor = "end";

    return { xLine, yLine, xLabel, yLabel, textAnchor, label: skill.name };
  });

  return (
    <div className="animate-fade-in space-y-8">
      {/* Overview Header */}
      <div className="neo-card neo-card-yellow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <span className="neo-badge neo-badge-pink mb-2">DYNAMIC ROADMAP</span>
          <h1 className="text-3xl font-black text-black uppercase">Custom Learning Path & Skill Gap</h1>
          <p className="text-black font-bold text-xs mt-1">
            Personalized learning milestones for <span className="underline">{role}</span> targets
          </p>
        </div>
        <div className="neo-badge neo-badge-cyan text-xs">
          Target Package: ₹{lpa} LPA
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT PANEL (3/5 cols): Learning Milestone Steps */}
        <div className="lg:col-span-3 neo-card space-y-6">
          <div>
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-2 bg-[#25283a] p-2 rounded border border-black shadow-[2px_2px_0px_#000]">
              <Flag className="text-[#ffe600]" size={16} />
              <span>Step-by-Step Learning Roadmap</span>
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-2">Mark steps completed as you learn. Completing milestones upgrades your profile readiness.</p>
          </div>

          <div className="space-y-4">
            {roadmap.map((step, idx) => {
              const isDone = completedSteps.has(step);
              return (
                <div 
                  key={idx}
                  onClick={() => toggleStep(step)}
                  className={`flex items-start gap-4 p-4 rounded-xl border-3 border-black transition-all cursor-pointer shadow-[4px_4px_0px_#000] ${
                    isDone 
                      ? 'bg-[#00ff66] text-black font-black' 
                      : 'bg-[#1a1b2a] text-gray-200 hover:bg-[#222438]'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <CheckCircle2 
                      size={22} 
                      className={`${isDone ? 'text-black fill-black/20' : 'text-gray-500'}`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                        isDone ? 'bg-black text-[#00ff66]' : 'bg-[#ffe600] text-black'
                      }`}>
                        MILESTONE {idx + 1}
                      </span>
                      <h4 className={`text-sm font-black ${isDone ? 'line-through text-black' : 'text-white'}`}>
                        {step}
                      </h4>
                    </div>
                    <p className={`text-xs font-semibold leading-relaxed ${isDone ? 'text-black' : 'text-gray-400'}`}>
                      Recommended milestone {idx + 1} for target role preparation. Learn core concepts, review guides, and complete hands-on projects.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resources panel */}
          <div className="border-t-3 border-black pt-6 space-y-4">
            <h4 className="text-xs font-black text-gray-300 uppercase tracking-wider">Suggested Preparation Courses</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="https://www.coursera.org" 
                target="_blank" 
                rel="noreferrer"
                className="neo-btn neo-btn-cyan text-xs justify-between"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span>Coursera Specialization</span>
                </div>
                <ExternalLink size={14} />
              </a>
              
              <a 
                href="https://www.udemy.com" 
                target="_blank" 
                rel="noreferrer"
                className="neo-btn neo-btn-purple text-xs justify-between"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span>Udemy Practical Bootcamps</span>
                </div>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (2/5 cols): Radar Chart & Skill Gap */}
        <div className="lg:col-span-2 neo-card space-y-6 flex flex-col items-center">
          <div className="text-center w-full">
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider bg-[#25283a] p-2 rounded border border-black shadow-[2px_2px_0px_#000]">
              Skill Comparison Radar
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">Your Ratings (Lime Green) vs Target Benchmarks (Yellow)</p>
          </div>

          {/* SVG Radar Chart */}
          <div className="w-full flex justify-center max-w-[280px]">
            <svg viewBox="0 0 300 300" className="w-full h-auto overflow-visible">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
                <polygon
                  key={i}
                  points={chartSkills.map((_, idx) => {
                    const angle = (idx * 2 * Math.PI) / chartSkills.length - Math.PI / 2;
                    const x = cx + r * scale * Math.cos(angle);
                    const y = cy + r * scale * Math.sin(angle);
                    return `${x},${y}`;
                  }).join(" ")}
                  className="fill-transparent stroke-gray-700"
                  strokeWidth="1.5"
                />
              ))}

              {axisDetails.map((axis, i) => (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={axis.xLine}
                  y2={axis.yLine}
                  className="stroke-gray-600"
                  strokeWidth="1.5"
                />
              ))}

              {/* Required Skills Area (Yellow) */}
              <polygon
                points={getPointsStr(false)}
                className="fill-[#ffe600]/20 stroke-[#ffe600]"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />

              {/* Actual Skills Area (Lime Green) */}
              <polygon
                points={getPointsStr(true)}
                className="fill-[#00ff66]/30 stroke-[#00ff66]"
                strokeWidth="3.5"
              />

              {axisDetails.map((axis, i) => (
                <text
                  key={i}
                  x={axis.xLabel}
                  y={axis.yLabel}
                  textAnchor={axis.textAnchor}
                  className="fill-[#00e5ff] text-[11px] font-black uppercase"
                  dominantBaseline="middle"
                >
                  {axis.label}
                </text>
              ))}
            </svg>
          </div>

          {/* Grid of skill gaps */}
          <div className="w-full space-y-3 bg-[#171826] p-4 rounded-xl border-3 border-black shadow-[3px_3px_0px_#000]">
            <h4 className="text-xs font-black text-[#ffe600] uppercase tracking-wider">Skill Gap Breakdown</h4>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {skillGap.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-bold bg-[#202235] p-2 rounded border border-black">
                  <span className="text-gray-200">{item.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[11px]">{item.actual} / {item.required}</span>
                    {item.gap > 0 ? (
                      <span className="neo-badge neo-badge-pink text-[10px]">
                        -{item.gap} NEEDED
                      </span>
                    ) : (
                      <span className="neo-badge neo-badge-green text-[10px]">
                        READY
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
