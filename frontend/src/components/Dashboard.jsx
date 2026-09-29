import React, { useEffect, useState } from 'react';
import { Database, TrendingUp, Briefcase, Award, Search, Info, Users, Edit3, MoreHorizontal } from 'lucide-react';

const Dashboard = ({ apiBaseUrl, globalSearch }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [stats, setStats] = useState({
    totalCount: 0,
    avgLpa: 0,
    topRole: 'N/A',
    topLpa: 0
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        if (data.length > 0) setSelectedStudent(data[1] || data[0]);
        calculateStats(data);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) return;
    
    const count = data.length;
    const totalLpa = data.reduce((sum, item) => sum + item.package_lpa, 0);
    const avg = (totalLpa / count).toFixed(2);
    
    const rolesMap = {};
    let topR = 'N/A';
    let maxRoleCount = 0;
    let maxL = 0;
    
    data.forEach(item => {
      rolesMap[item.recommended_role] = (rolesMap[item.recommended_role] || 0) + 1;
      if (rolesMap[item.recommended_role] > maxRoleCount) {
        maxRoleCount = rolesMap[item.recommended_role];
        topR = item.recommended_role;
      }
      if (item.package_lpa > maxL) {
        maxL = item.package_lpa;
      }
    });

    setStats({
      totalCount: count,
      avgLpa: avg,
      topRole: topR,
      topLpa: maxL.toFixed(1)
    });
  };

  const effectiveSearch = globalSearch || searchQuery;

  const filteredStudents = students.filter(student => {
    const matchesQuery = 
      student.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      student.recommended_role.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      student.branch.toLowerCase().includes(effectiveSearch.toLowerCase());
      
    if (!matchesQuery) return false;
    
    if (ratingFilter === 'high_lpa') return student.package_lpa >= 10;
    if (ratingFilter === 'high_cgpa') return student.cgpa >= 8.5;
    return true;
  });

  const chartSkills = [
    { name: "Java", val: selectedStudent ? selectedStudent.java : 7 },
    { name: "Python", val: selectedStudent ? selectedStudent.python : 8 },
    { name: "Web Dev", val: selectedStudent ? selectedStudent.web_dev : 6 },
    { name: "DSA", val: selectedStudent ? selectedStudent.dsa : 9 },
    { name: "Problem Solving", val: selectedStudent ? selectedStudent.cgpa : 8 },
    { name: "Soft Skills", val: selectedStudent ? selectedStudent.communication : 7 }
  ];

  const cx = 130;
  const cy = 120;
  const r = 75;

  const getPolygonPoints = () => {
    return chartSkills.map((skill, index) => {
      const angle = (index * 2 * Math.PI) / chartSkills.length - Math.PI / 2;
      const valScaled = (skill.val / 10) * r;
      const x = cx + valScaled * Math.cos(angle);
      const y = cy + valScaled * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  };

  const axisDetails = chartSkills.map((skill, index) => {
    const angle = (index * 2 * Math.PI) / chartSkills.length - Math.PI / 2;
    const xLine = cx + r * Math.cos(angle);
    const yLine = cy + r * Math.sin(angle);
    const xLabel = cx + (r + 18) * Math.cos(angle);
    const yLabel = cy + (r + 12) * Math.sin(angle);
    
    let textAnchor = "middle";
    if (Math.cos(angle) > 0.1) textAnchor = "start";
    else if (Math.cos(angle) < -0.1) textAnchor = "end";

    return { xLine, yLine, xLabel, yLabel, textAnchor, label: skill.name };
  });

  const getAvatarColor = (idx) => {
    const colors = [
      { bg: '#ffe600', text: '#000' },
      { bg: '#00e5ff', text: '#000' },
      { bg: '#ff007a', text: '#fff' },
      { bg: '#00ff66', text: '#000' },
      { bg: '#a855f7', text: '#fff' }
    ];
    return colors[idx % colors.length];
  };

  const getStatusBadge = (student) => {
    if (student.package_lpa >= 12) {
      return <span className="neo-badge neo-badge-green" style={{ fontSize: '10px' }}>Top Tier</span>;
    }
    if (student.package_lpa >= 8) {
      return <span className="neo-badge neo-badge-cyan" style={{ fontSize: '10px' }}>Solid</span>;
    }
    return <span className="neo-badge neo-badge-yellow" style={{ fontSize: '10px' }}>Review</span>;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Dashboard Main Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1, color: '#000000' }}>
            Student Skill Analysis Dashboard
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 900, color: '#334155', marginTop: '6px' }}>
            Welcome, Admin! ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
          </p>
        </div>
        <div className="neo-badge neo-badge-yellow">
          <span>AI BATCH ACTIVE</span>
        </div>
      </div>

      {/* Top 4 Stat Cards Row */}
      <div className="grid-4-cols">
        {/* Card 1: Enrolled Students */}
        <div className="neo-card neo-card-purple" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', backgroundColor: '#000000', border: '2.5px solid #000000', borderRadius: '12px', boxShadow: '2px 2px 0px #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} style={{ color: '#a855f7' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #000' }}>
              Total Count
            </span>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', textShadow: '2px 2px 0px #000', lineHeight: 1 }}>
              {stats.totalCount || 40} Students
            </h3>
            <p style={{ fontSize: '11px', fontWeight: 900, color: '#f1f5f9', marginTop: '4px' }}>Total Enrolled Profiles</p>
          </div>
        </div>

        {/* Card 2: Average Expected LPA */}
        <div className="neo-card neo-card-cyan" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', backgroundColor: '#000000', border: '2.5px solid #000000', borderRadius: '12px', boxShadow: '2px 2px 0px #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} style={{ color: '#00e5ff' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'rgba(255,255,255,0.7)', color: '#000', padding: '2px 6px', borderRadius: '4px', border: '1px solid #000' }}>
              Placement Avg
            </span>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <h3 style={{ fontSize: '26px', fontWeight: 900, textShadow: '2px 2px 0px #fff', color: '#000', lineHeight: 1 }}>
              ₹{stats.avgLpa || '9.5'} Avg LPA
            </h3>
            <p style={{ fontSize: '11px', fontWeight: 900, color: '#000000', marginTop: '4px' }}>Average Placement Package</p>
          </div>
        </div>

        {/* Card 3: Top Job Role */}
        <div className="neo-card neo-card-yellow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', backgroundColor: '#000000', border: '2.5px solid #000000', borderRadius: '12px', boxShadow: '2px 2px 0px #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} style={{ color: '#ffe600' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'rgba(255,255,255,0.7)', color: '#000', padding: '2px 6px', borderRadius: '4px', border: '1px solid #000' }}>
              Top Demand
            </span>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', display: 'block' }}>Top Role:</span>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#000000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>
              {stats.topRole || 'Java Developer'}
            </h3>
            <p style={{ fontSize: '10px', fontWeight: 900, color: '#000000', marginTop: '2px' }}>Most In-Demand Skill Profile</p>
          </div>
        </div>

        {/* Card 4: Highest Package */}
        <div className="neo-card neo-card-pink" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', backgroundColor: '#000000', border: '2.5px solid #000000', borderRadius: '12px', boxShadow: '2px 2px 0px #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} style={{ color: '#ff007a' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #000' }}>
              Peak Package
            </span>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', textShadow: '2px 2px 0px #000', lineHeight: 1 }}>
              ₹{stats.topLpa || '18.0'} LPA
            </h3>
            <p style={{ fontSize: '11px', fontWeight: 900, color: '#f1f5f9', marginTop: '4px' }}>Highest Offered Target</p>
          </div>
        </div>
      </div>

      {/* Middle Content Grid */}
      <div className="grid-dashboard-main">
        
        {/* LEFT PANEL (2/3 width): Student Skill Ratings Table */}
        <div className="neo-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '3px solid #000', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', color: '#000000' }}>Student Skill Ratings</h2>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginTop: '2px' }}>Select any student row to inspect overall skill radar on the right</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select 
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="neo-input"
                style={{ padding: '6px 12px', fontSize: '12px', textTransform: 'uppercase', width: '150px', backgroundColor: '#ffffff', color: '#000000' }}
              >
                <option value="all">All Ratings</option>
                <option value="high_lpa">LPA &gt; 10</option>
                <option value="high_cgpa">CGPA &gt; 8.5</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #000', borderTopColor: '#ffe600', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#000000' }}>Loading student dataset...</p>
            </div>
          ) : (
            <div className="neo-table-container">
              <table className="neo-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th style={{ textAlign: 'center' }}>Java</th>
                    <th style={{ textAlign: 'center' }}>Python</th>
                    <th style={{ textAlign: 'center' }}>Web Dev</th>
                    <th style={{ textAlign: 'center' }}>DSA</th>
                    <th style={{ textAlign: 'center' }}>Comm.</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '32px', fontWeight: 800, color: '#475569' }}>
                        No matching records found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const isSelected = selectedStudent && selectedStudent.id === student.id;
                      const avatarStyle = getAvatarColor(idx);
                      return (
                        <tr 
                          key={student.id || idx}
                          onClick={() => setSelectedStudent(student)}
                          style={{ cursor: 'pointer', backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.25)' : 'transparent' }}
                        >
                          <td style={{ fontFamily: 'monospace', fontWeight: 900, color: '#000000', fontSize: '12px' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 900, color: '#000000' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: avatarStyle.bg, color: avatarStyle.text, border: '1.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', boxShadow: '1px 1px 0px #000' }}>
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <span style={{ display: 'block', lineHeight: 1.1, fontSize: '12px', fontWeight: 900, color: '#000000' }}>{student.name}</span>
                                <span style={{ fontSize: '10px', color: '#475569', fontWeight: 800, display: 'block' }}>{student.branch}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#000000' }}>{student.java.toFixed(1)}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#000000' }}>{student.python.toFixed(1)}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#000000' }}>{student.web_dev.toFixed(1)}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#000000' }}>{student.dsa.toFixed(1)}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#000000' }}>{student.communication.toFixed(1)}</td>
                          <td>{getStatusBadge(student)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <button className="neo-btn neo-btn-secondary" style={{ padding: '6px', fontSize: '10px', backgroundColor: '#ffffff' }} title="Edit Rating">
                                <Edit3 size={12} />
                              </button>
                              <button className="neo-btn neo-btn-secondary" style={{ padding: '6px', fontSize: '10px', backgroundColor: '#ffffff' }} title="More Options">
                                <MoreHorizontal size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT PANEL (1/3 width): Overall Skill Assessment Radar Chart */}
        <div className="neo-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '3px solid #000', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', color: '#000000' }}>Overall Skill Assessment</h3>
                <p style={{ fontSize: '10px', fontWeight: 800, color: '#475569', marginTop: '2px' }}>
                  {selectedStudent ? `${selectedStudent.name}'s progress` : "Select a student from table"}
                </p>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#00e5ff', color: '#000', border: '1.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', boxShadow: '2px 2px 0px #000' }}>
                {selectedStudent ? selectedStudent.name.charAt(0) : "S"}
              </div>
            </div>

            {/* SVG Skill Radar Chart */}
            <div style={{ width: '100%', maxWidth: '260px', margin: '0 auto' }}>
              <svg viewBox="0 0 260 240" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
                  <polygon
                    key={i}
                    points={chartSkills.map((_, idx) => {
                      const angle = (idx * 2 * Math.PI) / chartSkills.length - Math.PI / 2;
                      const x = cx + r * scale * Math.cos(angle);
                      const y = cy + r * scale * Math.sin(angle);
                      return `${x},${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#94a3b8"
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
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Polygon Fill */}
                <polygon
                  points={getPolygonPoints()}
                  fill="rgba(0, 229, 255, 0.35)"
                  stroke="#ff007a"
                  strokeWidth="3.5"
                />

                {chartSkills.map((skill, index) => {
                  const angle = (index * 2 * Math.PI) / chartSkills.length - Math.PI / 2;
                  const valScaled = (skill.val / 10) * r;
                  const x = cx + valScaled * Math.cos(angle);
                  const y = cy + valScaled * Math.sin(angle);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#ffe600"
                      stroke="#000000"
                      strokeWidth="2"
                    />
                  );
                })}

                {axisDetails.map((axis, i) => (
                  <text
                    key={i}
                    x={axis.xLabel}
                    y={axis.yLabel}
                    textAnchor={axis.textAnchor}
                    fill="#000000"
                    fontSize="10"
                    fontWeight="900"
                    textTransform="uppercase"
                    dominantBaseline="middle"
                  >
                    {axis.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Selected Student Card */}
          {selectedStudent && (
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '3px solid #000', boxShadow: '3px 3px 0px #000', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 900, color: '#334155' }}>Target Role:</span>
                <span className="neo-badge neo-badge-yellow" style={{ fontSize: '10px' }}>{selectedStudent.recommended_role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 900, color: '#334155' }}>Expected Package:</span>
                <span style={{ fontWeight: 900, color: '#000000', fontSize: '14px', backgroundColor: '#00ff66', padding: '2px 8px', borderRadius: '4px', border: '1px solid #000' }}>₹{selectedStudent.package_lpa.toFixed(1)} LPA</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Explainer: Random Forest ML Decision Model */}
      <div className="neo-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="neo-badge neo-badge-yellow" style={{ width: 'fit-content' }}>
            <Info size={14} />
            <span>ALGORITHM INSIGHTS</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', color: '#000000' }}>Random Forest Decision Model</h2>
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#334155', lineHeight: 1.6 }}>
            Our backend utilizes Python's <strong style={{ color: '#000000', backgroundColor: '#00e5ff', padding: '1px 4px', borderRadius: '4px' }}>Scikit-Learn</strong> library to run a Random Forest Classifier and Regressor. The model is trained dynamically on the student dataset. When you input your CGPA, technical skills (Java, Python, Web Dev, DSA), and soft skills (Communication, Leadership), the algorithm traces decision trees to classify you into the most matching job role and project your estimated market salary package.
          </p>
        </div>
        <div className="neo-card neo-card-yellow" style={{ border: '3px solid #000', boxShadow: '3px 3px 0px #000', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000000', borderBottom: '2px solid #000', paddingBottom: '6px' }}>
            Sample Path Matching
          </h4>
          <div style={{ fontSize: '12px', fontWeight: 900, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1.5px solid #000' }}>
              <span style={{ color: '#000000', fontSize: '11px' }}>Java + DSA (Ratings 8+)</span>
              <span className="neo-badge neo-badge-dark" style={{ fontSize: '9px' }}>Java Dev</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1.5px solid #000' }}>
              <span style={{ color: '#000000', fontSize: '11px' }}>Python + Statistics</span>
              <span className="neo-badge neo-badge-cyan" style={{ fontSize: '9px' }}>Data Scientist</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1.5px solid #000' }}>
              <span style={{ color: '#000000', fontSize: '11px' }}>MERN Stack (Web 8+)</span>
              <span className="neo-badge neo-badge-green" style={{ fontSize: '9px' }}>Full Stack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
