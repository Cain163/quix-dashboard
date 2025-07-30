import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingUp, Globe, Clock, RefreshCw, Shield, Activity, Satellite, Menu, X } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://29abe117e0df.ngrok-free.app';

const App = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Regional time zones
  const timeZones = [
    { city: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, flag: '🏛️' },
    { city: 'Jerusalem', timezone: 'Asia/Jerusalem', flag: '🇮🇱' },
    { city: 'Damascus', timezone: 'Asia/Damascus', flag: '🇸🇾' },
    { city: 'Tehran', timezone: 'Asia/Tehran', flag: '🇮🇷' },
    { city: 'Baghdad', timezone: 'Asia/Baghdad', flag: '🇮🇶' },
    { city: 'Cairo', timezone: 'Africa/Cairo', flag: '🇪🇬' }
  ];

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events?limit=20`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/summary`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchEvents(), fetchSummary()]);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const triggerCollection = async () => {
    try {
      await fetch(`${API_BASE_URL}/collect`, { method: 'POST' });
      setTimeout(refreshData, 3000);
    } catch (error) {
      console.error('Error triggering collection:', error);
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
      <div className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-1 sm:py-2">
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
        <div id="threat-level" className="rounded-lg border p-4 sm:p-6 mb-6 sm:mb-8 backdrop-blur-sm bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 mr-3 sm:mr-4 text-slate-300" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-mono">CURRENT THREAT LEVEL</h2>
                <p className="text-xs sm:text-sm text-slate-400 font-mono">24-HOUR ASSESSMENT WINDOW</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-4xl sm:text-6xl font-bold font-mono text-green-400">
                42.0
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-mono">/ 100 SCALE</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div id="summary" className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-mono">DAILY INTELLIGENCE SUMMARY</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg border border-slate-600/30">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono">0</div>
              <div className="text-xs sm:text-sm text-slate-400 font-mono">EVENTS PROCESSED</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg border border-slate-600/30">
              <div className="text-2xl sm:text-3xl font-bold text-orange-400 font-mono">0.0</div>
              <div className="text-xs sm:text-sm text-slate-400 font-mono">AVG THREAT SCORE</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-lg border border-slate-600/30">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 font-mono">0</div>
              <div className="text-xs sm:text-sm text-slate-400 font-mono">KEY ENTITIES</div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4 border border-slate-700/30">
            <h3 className="text-sm sm:text-md font-bold text-slate-200 mb-3 font-mono">SITUATION REPORT:</h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              No data available. Execute "COLLECT" to initialize intelligence gathering operations.
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div id="charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 sm:p-6 shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-4 font-mono">7-DAY THREAT ANALYSIS</h3>
            <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400 font-mono text-sm">
              No threat data available
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/50 p-4 sm:p-6 shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-4 font-mono">ENTITY FREQUENCY ANALYSIS</h3>
            <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400 font-mono text-sm">
              No entity data available
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div id="events" className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-xl">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700/50 bg-slate-700/30">
            <div className="flex items-center">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-400" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-mono">RECENT INTELLIGENCE REPORTS</h3>
            </div>
          </div>
          <div className="p-6 sm:p-8 text-center text-slate-400">
            <Satellite className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-slate-600" />
            <p className="font-mono text-sm sm:text-base">NO ACTIVE INTELLIGENCE FEEDS</p>
            <p className="text-xs sm:text-sm mt-2 font-mono">Execute "COLLECT" to initialize data gathering operations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;