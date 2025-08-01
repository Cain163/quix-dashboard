import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingUp, Globe, Clock, RefreshCw, Shield, Activity, Satellite, Menu, X } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://quix.ngrok.app';

// Headers to bypass ngrok warning page
const defaultHeaders = {
  'ngrok-skip-browser-warning': 'true'
};

const App = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('news'); // Default to News Reports tab
  const [casualtyEvents, setCasualtyEvents] = useState([]);
  const [reportExpanded, setReportExpanded] = useState(false);

  // Regional time zones
  const timeZones = [
    { city: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, flag: '🏛️' },
    { city: 'Jerusalem', timezone: 'Asia/Jerusalem', flag: '🇮🇱' },
    { city: 'Damascus', timezone: 'Asia/Damascus', flag: '🇸🇾' },
    { city: 'Tehran', timezone: 'Asia/Tehran', flag: '🇮🇷' },
    { city: 'Baghdad', timezone: 'Asia/Baghdad', flag: '🇮🇶' }
  ];

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: defaultHeaders
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      // Fetch both news and chatter separately
      const [newsResponse, chatterResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/events/news?limit=10`, { headers: defaultHeaders }),
        fetch(`${API_BASE_URL}/events/chatter?limit=10`, { headers: defaultHeaders })
      ]);
      
      const newsData = await newsResponse.json();
      const chatterData = await chatterResponse.json();
      
      // Combine and sort by timestamp for the general events state
      const allEvents = [...newsData, ...chatterData].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/summary`, {
        headers: defaultHeaders
      });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchEvents(), fetchSummary(), fetchCasualtyEvents()]);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const triggerCollection = async () => {
    try {
      await fetch(`${API_BASE_URL}/collect`, { 
        method: 'POST',
        headers: defaultHeaders
      });
      setTimeout(refreshData, 3000);
    } catch (error) {
      console.error('Error triggering collection:', error);
    }
  };

  const fetchCasualtyEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/actual-events`, {
        headers: defaultHeaders
      });
      const data = await response.json();
      console.log('Fetched casualty events:', data); 
      setCasualtyEvents(data);
    } catch (error) {
      console.error('Error fetching casualty events:', error);
    }
  };
  
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Update clocks every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getThreatLevelColor = (score) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getThreatLevelBg = (score) => {
    if (score >= 70) return 'bg-red-900/20 border-red-500/30 shadow-red-500/10';
    if (score >= 40) return 'bg-yellow-900/20 border-yellow-500/30 shadow-yellow-500/10';
    return 'bg-green-900/20 border-green-500/30 shadow-green-500/10';
  };

  const getThreatLevelGlow = (score) => {
    if (score >= 70) return 'shadow-lg shadow-red-500/20';
    if (score >= 40) return 'shadow-lg shadow-yellow-500/20';
    return 'shadow-lg shadow-green-500/20';
  };

  const formatTime = (timezone) => {
    return currentTime.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
            <RefreshCw className="relative animate-spin h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-blue-400" />
          </div>
          <p className="text-slate-400 font-mono text-sm sm:text-base">INITIALIZING QUIX INTELLIGENCE SYSTEM...</p>
          <div className="mt-2 h-1 w-48 sm:w-64 bg-slate-700 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900" style={{
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgb(15 23 42 / 0.8) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgb(15 23 42 / 0.8) 0%, transparent 50%),
        linear-gradient(135deg, rgb(15 23 42) 0%, rgb(2 6 23) 100%)
      `
    }}>
      {/* Regional Clocks Banner */}
      <div className="bg-slate-700/80 backdrop-blur-sm border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-8 py-2 sm:py-3 overflow-x-auto">
            {timeZones.map((tz, index) => (
              <div key={index} className="text-center flex-shrink-0">
                <div className="text-xs text-slate-400 font-mono">{tz.flag} {tz.city}</div>
                <div className="text-xs sm:text-sm font-mono text-slate-200 font-bold">
                  {formatTime(tz.timezone)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-0.5 sm:py-0.1">
            <div className="flex items-center">
              {/* Mobile Logo - Smaller */}
              <svg width="120" height="60" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" className="mr-2 sm:mr-4 sm:hidden">
                <defs>
                  <linearGradient id="logoGradientMobile" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:"#1E40AF", stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#94A3B8", stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <text x="60" y="37" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" 
                      fontSize="36" fontWeight="900" fill="url(#logoGradientMobile)" letterSpacing="1px" 
                      textAnchor="middle">QUIX</text>
              </svg>
              
              {/* Desktop Logo */}
              <svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="mr-4 hidden sm:block lg:mr-6">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:"#1E40AF", stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#94A3B8", stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <text x="100" y="62" fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" 
                      fontSize="65" fontWeight="900" fill="url(#logoGradient)" letterSpacing="1px" 
                      textAnchor="middle">QUIX</text>
              </svg>
              
              <div className="flex flex-col justify-center">
                <span className="block text-sm sm:text-base lg:text-lg text-slate-400">Middle East Threat Predictor</span>
                <span className="block text-xs sm:text-sm text-slate-500 italic mt-1">Ὅρα τὸ μέλλον</span>
                <div className="text-xs text-slate-400 font-mono mt-1 sm:mt-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    ACTIVE
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Desktop Controls */}
            <div className="hidden sm:flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button
                  onClick={triggerCollection}
                  className="flex items-center px-2 py-1.5 lg:px-3 lg:py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-md text-xs lg:text-sm font-mono transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <Satellite className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  COLLECT
                </button>
                <button
                  onClick={refreshData}
                  className="flex items-center px-2 py-1.5 lg:px-3 lg:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs lg:text-sm font-mono transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  <RefreshCw className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  REFRESH
                </button>
              </div>
              <div className="text-xs text-slate-400 font-mono text-left">
                LAST SYNC: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-slate-700/90 backdrop-blur-sm rounded-lg mt-2 mb-4 p-4 border border-slate-600/50">
              <div className="flex flex-col space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={triggerCollection}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-md text-sm font-mono"
                  >
                    <Satellite className="h-4 w-4 mr-2" />
                    COLLECT
                  </button>
                  <button
                    onClick={refreshData}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-mono"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    REFRESH
                  </button>
                </div>
                <div className="text-xs text-slate-400 font-mono text-center">
                  LAST SYNC: {lastUpdated.toLocaleTimeString()}
                </div>
                <div className="border-t border-slate-600 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => scrollToSection('threat-level')}
                      className="flex items-center justify-center p-3 bg-slate-600 hover:bg-red-400 rounded-lg text-xs font-mono text-white transition-colors duration-200"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      THREAT
                    </button>
                    <button 
                      onClick={() => scrollToSection('summary')}
                      className="flex items-center justify-center p-3 bg-slate-600 hover:bg-blue-400 rounded-lg text-xs font-mono text-white transition-colors duration-200"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      SUMMARY
                    </button>
                    <button 
                      onClick={() => scrollToSection('charts')}
                      className="flex items-center justify-center p-3 bg-slate-600 hover:bg-green-400 rounded-lg text-xs font-mono text-white transition-colors duration-200"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      CHARTS
                    </button>
                    <button 
                      onClick={() => scrollToSection('events')}
                      className="flex items-center justify-center p-3 bg-slate-600 hover:bg-purple-400 rounded-lg text-xs font-mono text-white transition-colors duration-200"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      EVENTS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 relative">
        {/* Desktop Mini Navigation Menu */}
        <div className="hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700/50 p-3 shadow-xl">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => scrollToSection('threat-level')}
                className="w-10 h-10 rounded-lg bg-slate-600 hover:bg-red-400 transition-colors duration-200 flex items-center justify-center"
                title="Threat Level"
              >
                <Shield className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => scrollToSection('summary')}
                className="w-10 h-10 rounded-lg bg-slate-600 hover:bg-blue-400 transition-colors duration-200 flex items-center justify-center"
                title="Summary"
              >
                <Activity className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => scrollToSection('charts')}
                className="w-10 h-10 rounded-lg bg-slate-600 hover:bg-green-400 transition-colors duration-200 flex items-center justify-center"
                title="Charts"
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => scrollToSection('events')}
                className="w-10 h-10 rounded-lg bg-slate-600 hover:bg-purple-400 transition-colors duration-200 flex items-center justify-center"
                title="Events"
              >
                <Globe className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Threat Level */}
        {dashboardData && (
          <div id="threat-level" className={`rounded-lg border p-4 sm:p-6 mb-6 sm:mb-8 backdrop-blur-sm bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 shadow-xl ${getThreatLevelBg(dashboardData.current_threat_level)} ${getThreatLevelGlow(dashboardData.current_threat_level)}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 mr-3 sm:mr-4 text-slate-300" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-mono">CURRENT THREAT LEVEL</h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-mono">24-HOUR ASSESSMENT WINDOW</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className={`text-4xl sm:text-6xl font-bold font-mono ${getThreatLevelColor(dashboardData.current_threat_level)}`}>
                  {dashboardData.current_threat_level.toFixed(1)}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-mono">/ 100 SCALE</div>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div id="summary" className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-mono">DAILY INTELLIGENCE SUMMARY</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg border border-slate-600/30">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono">{summary.event_count}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-mono">EVENTS PROCESSED</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg border border-slate-600/30">
                <div className="text-2xl sm:text-3xl font-bold text-orange-400 font-mono">{summary.avg_threat_score.toFixed(1)}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-mono">AVG THREAT SCORE</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg border border-slate-600/30">
                <div className="text-2xl sm:text-3xl font-bold text-green-400 font-mono">{summary.key_entities?.length || 0}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-mono">KEY ENTITIES</div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4 border border-slate-700/30">
                <h3 className="text-sm sm:text-md font-bold text-slate-200 mb-3 font-mono">SITUATION REPORT:</h3>
                
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                    {(() => {
                    const fullText = summary.summary;
                    
                    // Extract the threat level line
                    const threatLevelMatch = fullText.match(/\*\*THREAT LEVEL:.*?\*\*/);
                    const threatLevelLine = threatLevelMatch ? threatLevelMatch[0] : '';
                    
                    // Extract executive summary (everything after EXECUTIVE ASSESSMENT until next ** section)
                    const execMatch = fullText.match(/\*\*EXECUTIVE ASSESSMENT:\*\*(.*?)(?=\*\*[A-Z])/s);
                    const executiveSummary = execMatch ? execMatch[1].trim() : fullText.split('\n\n')[0];
                    
                    // Get everything after the executive summary for expanded view
                    const afterExecMatch = fullText.match(/\*\*EXECUTIVE ASSESSMENT:\*\*.*?(\*\*[A-Z].*)/s);
                    const remainingContent = afterExecMatch ? afterExecMatch[1] : '';
                    
                    return (
                        <div>
                        {/* Always show threat level */}
                        {threatLevelLine && (
                            <div className="mb-4 pb-3 border-b border-slate-600/30" dangerouslySetInnerHTML={{
                            __html: threatLevelLine.replace(/\*\*(.*?)\*\*/g, '<span class="text-yellow-400 font-bold">$1</span>')
                            }} />
                        )}
                        
                        {/* Show only Executive Summary when collapsed */}
                        <div dangerouslySetInnerHTML={{
                            __html: executiveSummary
                            .replace(/\*\*(.*?)\*\*/g, '<span class="text-yellow-400 font-bold">$1</span>')
                            .replace(/\n/g, '<br/>')
                            .replace(/• /g, '<span class="text-blue-400">▸</span> ')
                        }} />
                        
                        {/* Expand/Collapse Button */}
                        <button
                            onClick={() => setReportExpanded(!reportExpanded)}
                            className="mt-4 flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xs font-mono bg-slate-700/30 px-3 py-2 rounded-md"
                        >
                            <span className="mr-2">
                            {reportExpanded ? '▼' : '▶'}
                            </span>
                            {reportExpanded ? 'HIDE DETAILED ANALYSIS' : 'VIEW DETAILED ANALYSIS'}
                        </button>
                        
                        {/* Show remaining content when expanded (without repeating executive summary) */}
                        {reportExpanded && remainingContent && (
                            <div className="mt-4 pt-4 border-t border-slate-600/50">
                            <div dangerouslySetInnerHTML={{
                                __html: remainingContent
                                .replace(/\*\*(.*?)\*\*/g, '<span class="text-yellow-400 font-bold">$1</span>')
                                .replace(/\n/g, '<br/>')
                                .replace(/• /g, '<span class="text-blue-400">▸</span> ')
                            }} />
                            </div>
                        )}
                        </div>
                    );
                    })()}
                </div>
                </div>
          </div>
        )}

        {/* Charts Row */}
        <div id="charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
          {/* Threat Trend Chart */}
          {dashboardData?.threat_trend && (
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-4 font-mono">7-DAY THREAT ANALYSIS</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={(() => {
                    // Merge threat trend data with casualty events
                    const trendData = [...dashboardData.threat_trend].reverse();
                    
                    // Add casualty events to the corresponding dates
                    if (Array.isArray(casualtyEvents)) {
                    casualtyEvents.forEach(event => {
                        const eventDate = new Date(event.date_occurred).toISOString().split('T')[0];
                        const trendPoint = trendData.find(trend => trend.date === eventDate);
                        if (trendPoint) {
                        trendPoint.actual_score = event.actual_score;
                        trendPoint.casualties = event.casualties;
                        trendPoint.event_title = event.title;
                        }
                    });
                    }
                    
                    return trendData;
                })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#475569' }}
                    />
                    <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#475569' }}
                    />
                    <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#f1f5f9'
                    }}
                    formatter={(value, name, props) => {
                        if (name === 'threat_score') return [`${value}`, 'Predicted Threat'];
                        if (name === 'actual_score') {
                        const casualties = props.payload?.casualties;
                        return [`${value}${casualties ? ` (${casualties} casualties)` : ''}`, 'Casualty Event'];
                        }
                        return [value, name];
                    }}
                    />
                    <Line 
                    type="monotone" 
                    dataKey="threat_score" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#60A5FA' }}
                    name="Predicted Threat"
                    />
                    <Line 
                    type="monotone" 
                    dataKey="actual_score" 
                    stroke="#EF4444" 
                    strokeWidth={0}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 8 }}
                    activeDot={{ r: 10, stroke: '#EF4444', strokeWidth: 3, fill: '#FCA5A5' }}
                    name="Actual Event"
                    connectNulls={false}
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
          )}

          {/* Top Entities */}
          {dashboardData?.top_entities && (
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-4 font-mono">ENTITY FREQUENCY ANALYSIS</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.top_entities.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      color: '#f1f5f9'
                    }}
                  />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div id="events" className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-xl">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700/50 bg-slate-700/30">
            <div className="flex items-center">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-400" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-mono">RECENT REPORTS & CHATTER</h3>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-slate-700/50">
            <div className="flex">
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 sm:px-6 py-3 text-sm font-mono font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === 'news'
                    ? 'border-blue-400 text-blue-400 bg-slate-700/20'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/10'
                }`}
              >
                📰 NEWS REPORTS
              </button>
              <button
                onClick={() => setActiveTab('chatter')}
                className={`px-4 sm:px-6 py-3 text-sm font-mono font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === 'chatter'
                    ? 'border-blue-400 text-blue-400 bg-slate-700/20'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/10'
                }`}
              >
                💬 CHATTER
              </button>
            </div>
          </div>
            {/* Tab Content */}
            <div className="divide-y divide-slate-700/50">
            {(() => {
                // Filter events by tab
                let filteredEvents = [];
                if (activeTab === 'news') {
                filteredEvents = events.filter(event => 
                    event.platform === 'rss' || event.platform === 'gdelt'
                );
                } else {
                filteredEvents = events.filter(event => 
                    event.platform === 'reddit' || event.platform === 'telegram' || event.platform === 'discord'
                );
                }

                if (filteredEvents.length === 0) {
                return (
                    <div className="p-6 sm:p-8 text-center text-slate-400">
                    <Satellite className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-slate-600" />
                    <p className="font-mono text-sm sm:text-base">
                        {activeTab === 'news' ? 'NO NEWS REPORTS AVAILABLE' : 'NO CHATTER DATA AVAILABLE'}
                    </p>
                    <p className="text-xs sm:text-sm mt-2 font-mono">
                        Execute "COLLECT" to initialize {activeTab === 'news' ? 'news feed' : 'social media'} monitoring
                    </p>
                    </div>
                );
                }

                return filteredEvents.map((event, index) => (
                <div key={event.id || index} className="p-4 sm:p-6 hover:bg-slate-700/20 transition-colors duration-200">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="text-sm font-semibold text-slate-100 font-mono flex-1 pr-3">
                        {event.title}
                        </h4>
                        <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold font-mono ${
                            event.threat_score >= 70 ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                            event.threat_score >= 40 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-900/30 text-green-400 border border-green-500/30'
                        }`}>
                            {event.threat_score.toFixed(1)}
                        </span>
                        {event.url && (
                            <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors duration-200"
                            >
                            VIEW SOURCE
                            </a>
                        )}
                        </div>
                    </div>
                    
                    {/* Full width description on mobile */}
                    <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                        {event.content && event.content.length > 200 
                        ? event.content.substring(0, 200) + '...'
                        : event.content || 'No content available'
                        }
                    </p>
                    
                    <div className="flex items-center text-xs text-slate-500 space-x-4 font-mono mb-3">
                        <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        {event.platform?.toUpperCase()} // {event.source}
                        </span>
                        <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(event.timestamp)}
                        </span>
                    </div>
                    
                    {event.entities && event.entities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                        {event.entities.slice(0, 5).map((entity, i) => (
                            <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium bg-blue-900/30 text-blue-300 border border-blue-500/30"
                            >
                            {entity}
                            </span>
                        ))}
                        </div>
                    )}
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                        <div className="flex items-center mb-3">
                            <h4 className="text-md font-semibold text-slate-100 mr-4 font-mono">
                            {event.title}
                            </h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-mono ${
                            event.threat_score >= 70 ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                            event.threat_score >= 40 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-900/30 text-green-400 border border-green-500/30'
                            }`}>
                            THREAT: {event.threat_score.toFixed(1)}
                            </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                            {event.content && event.content.length > 200 
                            ? event.content.substring(0, 200) + '...'
                            : event.content || 'No content available'
                            }
                        </p>
                        <div className="flex items-center text-xs text-slate-500 space-x-6 font-mono">
                            <span className="flex items-center">
                            <Globe className="h-3 w-3 mr-2" />
                            SOURCE: {event.platform?.toUpperCase()} // {event.source}
                            </span>
                            <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-2" />
                            {formatTimestamp(event.timestamp)}
                            </span>
                        </div>
                        {event.entities && event.entities.length > 0 && (
                            <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                                {event.entities.slice(0, 5).map((entity, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium bg-blue-900/30 text-blue-300 border border-blue-500/30"
                                >
                                    {entity}
                                </span>
                                ))}
                            </div>
                            </div>
                        )}
                        </div>
                        {event.url && (
                        <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors duration-200"
                        >
                            VIEW SOURCE
                        </a>
                        )}
                    </div>
                    </div>
                </div>
                ));
            })()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;