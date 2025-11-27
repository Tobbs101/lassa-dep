"use client";

import { Button } from "@/components/ui/button";
import { UserCircleIcon, LockClosedIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState, useEffect } from "react";

// Weekly Trend Chart Component
function WeeklyTrendChart({ data }: { data: any[] }) {
  // Process the weekly trend data from ML API
  const processWeeklyData = (weeklyData: any[]) => {
    if (!weeklyData || weeklyData.length === 0) {
      return { weeks: [], cases: [], maxCases: 1 };
    }
    
    // Sort by year_week to ensure chronological order
    const sortedData = weeklyData.sort((a, b) => a.year_week.localeCompare(b.year_week));
    
    const weeks = sortedData.map(item => item.year_week);
    const cases = sortedData.map(item => item.confirmed_cases || 0);
    const maxCases = cases.length > 0 ? Math.max(...cases) : 1;
    
    return {
      weeks,
      cases,
      maxCases: maxCases || 1
    };
  };

  const { weeks, cases, maxCases } = processWeeklyData(data);

  // If no weekly data available, show a message
  if (weeks.length === 0) {
    return (
      <div className="relative h-48 md:h-64 bg-white rounded-lg p-2 md:p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No weekly trend data available</p>
          <p className="text-sm text-gray-500">Data is being processed from the latest updates</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions and data points
  const chartWidth = 100;
  const chartHeight = 100;
  const padding = 10;
  const innerWidth = chartWidth - (padding * 2);
  const innerHeight = chartHeight - (padding * 2);

  // Generate SVG path for the line chart
  const generatePath = () => {
    if (weeks.length < 2) return "";
    
    const points = weeks.map((week, index) => {
      const x = padding + (index / Math.max(weeks.length - 1, 1)) * innerWidth;
      const y = padding + innerHeight - ((cases[index] || 0) / Math.max(maxCases, 1)) * innerHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate area under the curve
  const generateArea = () => {
    if (weeks.length < 2) return "";
    
    const points = weeks.map((week, index) => {
      const x = padding + (index / Math.max(weeks.length - 1, 1)) * innerWidth;
      const y = padding + innerHeight - ((cases[index] || 0) / Math.max(maxCases, 1)) * innerHeight;
      return `${x},${y}`;
    });
    
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const bottomRight = `${padding + innerWidth},${padding + innerHeight}`;
    const bottomLeft = `${padding},${padding + innerHeight}`;
    
    return `M ${firstPoint} L ${points.slice(1).join(' L ')} L ${bottomRight} L ${bottomLeft} Z`;
  };

  return (
    <div className="relative h-48 md:h-64 bg-white rounded-lg p-2 md:p-4">
      {/* Grid lines */}
      <div className="absolute inset-4">
        <div className="h-full flex flex-col justify-between">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-t border-gray-200"></div>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="absolute inset-4">
        <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          {/* Shaded area under the line */}
          <path
            d={generateArea()}
            fill="rgba(220, 38, 38, 0.1)"
          />
          {/* Line chart */}
          <path
            d={generatePath()}
            stroke="#dc2626"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          {weeks.map((week, index) => {
            const x = padding + (index / Math.max(weeks.length - 1, 1)) * innerWidth;
            const y = padding + innerHeight - ((cases[index] || 0) / Math.max(maxCases, 1)) * innerHeight;
            // Ensure we have valid numbers
            const validX = isNaN(x) ? padding : x;
            const validY = isNaN(y) ? padding + innerHeight : y;
            return (
              <circle key={week} cx={validX} cy={validY} r="2" fill="#dc2626" />
            );
          })}
        </svg>
      </div>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
        <span className="hidden sm:inline">{Math.round(maxCases)}</span>
        <span className="hidden sm:inline">{Math.round(maxCases * 0.8)}</span>
        <span className="hidden sm:inline">{Math.round(maxCases * 0.6)}</span>
        <span className="hidden sm:inline">{Math.round(maxCases * 0.4)}</span>
        <span className="hidden sm:inline">{Math.round(maxCases * 0.2)}</span>
        <span>0</span>
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2 md:px-4">
        {weeks.map((week) => (
          <span key={week} className="hidden sm:inline">{week}</span>
        ))}
      </div>
    </div>
  );
}

interface OutbreakData {
  kpi: {
    confirmed_cases: number;
    recoveries: number;
    deaths: number;
    fatality_rate_percent: number;
    recovery_rate_percent: number;
    states_affected: number;
    lgas_affected: number;
  };
  demographics: {
    age_groups: Array<{ category: string; count: number; percentage: number }>;
    gender: Array<{ category: string; count: number; percentage: number }>;
  };
  lga_breakdown: Array<{
    lga: string;
    state: string;
    cases: number;
    deaths: number;
    recovery_rate_percent: number;
    last_update: string | null;
  }>;
  weekly_trend: Array<{
    year_week: string;
    total_cases: number;
    confirmed_cases: number;
    deaths: number;
    recoveries: number;
  }>;
  timestamp: string;
}

export default function Database() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [outbreakData, setOutbreakData] = useState<OutbreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOutbreakData();
  }, []);

  const fetchOutbreakData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ml/predict');
      if (!response.ok) {
        throw new Error('Failed to fetch outbreak data');
      }
      const data = await response.json();
      setOutbreakData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-lassa-red shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Hamburger Menu (Mobile) */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-gray-200 p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Logo - Centered on mobile, left on desktop */}
            <div className="flex-1 md:flex-none flex justify-center md:justify-start">
              <h1 className="text-2xl font-bold text-white">AI4Lassa</h1>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-white nav-link-hover px-3 py-2 rounded-md text-sm font-medium">Home</a>
              <a href="/about" className="text-white nav-link-hover px-3 py-2 rounded-md text-sm font-medium">About</a>
              <a href="/live-alerts" className="text-white nav-link-hover px-3 py-2 rounded-md text-sm font-medium">Live Alerts</a>
              <a href="/database" className="text-white nav-link-hover px-3 py-2 rounded-md text-sm font-medium">Database</a>
              <a href="/contact" className="text-white nav-link-hover px-3 py-2 rounded-md text-sm font-medium">Contact</a>
            </div>

            {/* Profile Icon */}
            <div className="flex-shrink-0">
              <UserCircleIcon className="w-8 h-8 text-white nav-link-hover cursor-pointer icon-hover" />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mobile-menu-slide">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-lassa-red border-t border-red-700">
                <a href="/" className="text-white nav-link-hover block px-3 py-2 rounded-md text-base font-medium">Home</a>
                <a href="/about" className="text-white nav-link-hover block px-3 py-2 rounded-md text-base font-medium">About</a>
                <a href="/live-alerts" className="text-white nav-link-hover block px-3 py-2 rounded-md text-base font-medium">Live Alerts</a>
                <a href="/database" className="text-white nav-link-hover block px-3 py-2 rounded-md text-base font-medium">Database</a>
                <a href="/contact" className="text-white nav-link-hover block px-3 py-2 rounded-md text-base font-medium">Contact</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/doc.jpg"
            alt="Medical professionals background"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Lassa Fever Outbreak Data</h1>
            <p className="text-sm md:text-lg lg:text-xl">Explore verified statistics and epidemiological trends across Nigeria.</p>
          </div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="py-16 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Loading State */}
            {loading && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lassa-red"></div>
                <span className="ml-2 text-gray-600">Loading outbreak data...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">Error: {error}</p>
                <Button onClick={fetchOutbreakData} className="mt-2 bg-lassa-red text-white">
                  Retry
                </Button>
              </div>
            )}

            {/* Real Data Metrics */}
            {outbreakData && (
              <>
                {/* Confirmed Cases */}
                <div className="bg-white border-l-4 border-yellow-500 shadow-sm p-4 md:p-6 card-animate">
                  <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">Confirmed Cases</h3>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-500">
                    {outbreakData.kpi.confirmed_cases.toLocaleString()}
                  </p>
                </div>

                {/* Recoveries */}
                <div className="bg-white border-l-4 border-green-500 shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">Recoveries</h3>
                  <p className="text-2xl md:text-3xl font-bold text-green-500">
                    {outbreakData.kpi.recoveries.toLocaleString()}
                  </p>
                </div>

                {/* Deaths */}
                <div className="bg-white border-l-4 border-gray-700 shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">Deaths</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-700">
                    {outbreakData.kpi.deaths.toLocaleString()}
                  </p>
                </div>

                {/* States Affected */}
                <div className="bg-white border-l-4 border-purple-500 shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">States Affected</h3>
                  <p className="text-2xl md:text-3xl font-bold text-purple-500">
                    {outbreakData.kpi.states_affected}
                  </p>
                </div>

                {/* LGAs Affected */}
                <div className="bg-white border-l-4 border-blue-500 shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">LGAs Affected</h3>
                  <p className="text-2xl md:text-3xl font-bold text-blue-500">
                    {outbreakData.kpi.lgas_affected}
                  </p>
                </div>

                {/* Fatality Rate */}
                <div className="bg-white border-l-4 border-red-500 shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">Fatality Rate</h3>
                  <p className="text-2xl md:text-3xl font-bold text-red-500">
                    {outbreakData.kpi.fatality_rate_percent.toFixed(1)}%
                  </p>
                </div>

                {/* Recovery Rate */}
                <div className="bg-white border-l-4 border-cyan-500 shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">Recovery Rate</h3>
                  <p className="text-2xl md:text-3xl font-bold text-cyan-500">
                    {outbreakData.kpi.recovery_rate_percent.toFixed(1)}%
                  </p>
                </div>

                {/* Last Updated */}
                <div className="bg-white border-l-4 border-indigo-500 shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300">
                  <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">Last Updated</h3>
                  <p className="text-sm font-bold text-indigo-500">
                    {new Date(outbreakData.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Outbreak Trends Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Outbreak Trends (Weekly)</h2>

          {/* Chart Container */}
          <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-lassa-red rounded"></div>
                <span className="text-xs md:text-sm font-medium">Confirmed Cases</span>
              </div>
            </div>

            {/* Dynamic Chart Based on Real Data */}
            {outbreakData && outbreakData.weekly_trend ? (
              <WeeklyTrendChart data={outbreakData.weekly_trend} />
            ) : (
              <div className="relative h-48 md:h-64 bg-white rounded-lg p-2 md:p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lassa-red mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading trend data...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Demographics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Demographics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {/* Loading State */}
            {loading && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lassa-red"></div>
                <span className="ml-2 text-gray-600">Loading demographics...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">Error loading demographics: {error}</p>
              </div>
            )}

            {/* Real Demographics Data */}
            {outbreakData && (
              <>
                {/* Age Groups */}
                {outbreakData.demographics.age_groups.map((ageGroup, index) => {
                  const colors = ['border-green-500', 'border-yellow-500', 'border-blue-500', 'border-purple-500', 'border-pink-500'];
                  const textColors = ['text-green-500', 'text-yellow-500', 'text-blue-500', 'text-purple-500', 'text-pink-500'];
                  const colorIndex = index % colors.length;
                  
                  return (
                    <div key={ageGroup.category} className={`bg-white border-l-4 ${colors[colorIndex]} shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300`}>
                      <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">Age Group: {ageGroup.category}</h3>
                      <p className={`text-lg md:text-2xl font-bold ${textColors[colorIndex]}`}>
                        {ageGroup.count.toLocaleString()} cases ({ageGroup.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                })}

                {/* Gender */}
                {outbreakData.demographics.gender.map((gender, index) => {
                  const colors = ['border-pink-500', 'border-purple-500', 'border-cyan-500'];
                  const textColors = ['text-pink-500', 'text-purple-500', 'text-cyan-500'];
                  const colorIndex = index % colors.length;
                  
                  return (
                    <div key={gender.category} className={`bg-white border-l-4 ${colors[colorIndex]} shadow-sm p-4 md:p-6 card-animate hover:shadow-md transition-all duration-300`}>
                      <h3 className="text-gray-600 text-xs md:text-sm font-medium mb-2">{gender.category}</h3>
                      <p className={`text-lg md:text-2xl font-bold ${textColors[colorIndex]}`}>
                        {gender.count.toLocaleString()} ({gender.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </section>

      {/* LGA Breakdown Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">LGA Breakdown</h2>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lassa-red"></div>
              <span className="ml-2 text-gray-600">Loading LGA data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error loading LGA data: {error}</p>
            </div>
          )}

          {/* Real LGA Data Table */}
          {outbreakData && (
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LGA</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cases</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deaths</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recovery %</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {outbreakData.lga_breakdown
                    .filter(lga => lga.cases > 0) // Only show LGAs with cases
                    .sort((a, b) => b.cases - a.cases) // Sort by case count
                    .slice(0, 20) // Show top 20 LGAs
                    .map((lga, index) => (
                      <tr key={`${lga.lga}-${lga.state}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                          {lga.lga}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                          {lga.state}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                          {lga.cases.toLocaleString()}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                          {lga.deaths.toLocaleString()}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                          {lga.recovery_rate_percent.toFixed(1)}%
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                          {lga.last_update ? new Date(lga.last_update).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              
              {/* Summary Stats */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap justify-between items-center text-sm text-gray-600">
                  <span>Showing top {Math.min(outbreakData.lga_breakdown.filter(lga => lga.cases > 0).length, 20)} LGAs with cases</span>
                  <span>Total LGAs affected: {outbreakData.lga_breakdown.filter(lga => lga.cases > 0).length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dataset Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-4">Dataset access restricted to authorized admins only.</p>
          <Button 
            className="bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2 mx-auto"
            onClick={() => window.location.href = '/admin'}
          >
            <LockClosedIcon className="w-4 h-4" />
            Download Dataset (Admin Only)
          </Button>
        </div>
      </section>

      {/* Call to Action / Footer */}
      <footer className="bg-lassa-red text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">WANT TO EXPLORE DETAILED OUTBREAK TRENDS?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">Check our full database for epidemiological breakdowns.</p>
          <Button className="bg-white text-lassa-red hover:bg-gray-100 border border-gray-300 px-8 py-3" onClick={() => window.location.href = '/database'}>Go to Outbreak Database</Button>
          <div className="mt-12">
            <p className="text-sm">© 2025 AI4Lassa Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
