"use client";

import { Button } from "@/components/ui/button";
import { 
  Bars3Icon, 
  XMarkIcon, 
  LockClosedIcon, 
  ArrowDownTrayIcon, 
  ShieldCheckIcon, 
  ArrowUpTrayIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  HomeIcon,
  BellIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [downloadType, setDownloadType] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Real data states
  const [outbreakData, setOutbreakData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch real data from ML API
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch('/api/ml/predict');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setOutbreakData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication - in production, use proper auth
    if (username === "admin" && password === "ai4lassa2025") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials. Contact system administrator.");
    }
  };

  const handleDownload = async (type: string) => {
    setDownloadType(type);
    
    try {
      const response = await fetch('/api/admin/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          downloadType: type,
          filters: {
            dateRange: '2025-01-01 to 2025-01-31',
            states: ['Niger', 'Osun', 'Benue'],
            riskLevel: 'all'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai4lassa_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadType("");
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadType) {
      setUploadError("Please select a file and upload type");
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('uploadType', uploadType);

    try {
      setUploadStatus("Uploading...");
      setUploadError("");

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Upload failed');
      }

      setUploadStatus("Upload successful! Refreshing dashboard...");
      setUploadFile(null);
      setUploadType("");
      
      // Refresh dashboard data after successful upload
      try {
        const dataResponse = await fetch('/api/ml/predict');
        if (dataResponse.ok) {
          const freshData = await dataResponse.json();
          setOutbreakData(freshData);
          setUploadStatus("Upload successful! Dashboard updated.");
        } else {
          setUploadStatus("Upload successful! Dashboard will update shortly.");
        }
      } catch (refreshError) {
        console.error('Dashboard refresh error:', refreshError);
        setUploadStatus("Upload successful! Please refresh page to see updates.");
      }
      
      // Reset status after 5 seconds
      setTimeout(() => setUploadStatus(""), 5000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus("");
    }
  };

  const handleGuideDownload = async () => {
    try {
      const response = await fetch('/api/admin/guide');
      
      if (!response.ok) {
        throw new Error('Guide download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AI4Lassa_ML_Requirements_Guide.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Guide download error:', error);
      alert('Guide download failed. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-lassa-red rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">AI4Lassa</h1>
                  <p className="text-xs text-gray-500">Admin Portal</p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Login Form */}
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-lassa-red rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Access</h2>
              <p className="mt-2 text-sm text-gray-600">Enter your credentials to access the admin panel</p>
              </div>

            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-lassa-red focus:border-lassa-red focus:z-10 sm:text-sm"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-lassa-red focus:border-lassa-red focus:z-10 sm:text-sm"
                    placeholder="Enter password"
                  />
                </div>
                </div>

              <div>
                <Button 
                  type="submit" 
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-lassa-red hover:bg-lassa-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lassa-red transition-all duration-200"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-white" />
                  </span>
                  Access Admin Panel
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Demo credentials: <span className="font-medium">admin</span> / <span className="font-medium">ai4lassa2025</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-600 p-2"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-lassa-red rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">AI4Lassa</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-lassa-red focus:border-lassa-red sm:text-sm"
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-600 p-2">
                <BellIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                onClick={() => setIsAuthenticated(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'fixed inset-0 z-50 w-full md:relative md:inset-auto md:w-64' : 'hidden'} bg-white shadow-sm border-r border-gray-200`}>
          <div className="p-4">
            {/* Close button for mobile */}
            <div className="md:hidden flex justify-end mb-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
        </div>
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === "dashboard" 
                    ? "bg-lassa-red text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <HomeIcon className="w-5 h-5 mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab("data");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === "data" 
                    ? "bg-lassa-red text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChartBarIcon className="w-5 h-5 mr-3" />
                Data Management
              </button>
              <button
                onClick={() => {
                  setActiveTab("upload");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === "upload" 
                    ? "bg-lassa-red text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ArrowUpTrayIcon className="w-5 h-5 mr-3" />
                Data Upload
              </button>
              <button
                onClick={() => {
                  setActiveTab("users");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === "users" 
                    ? "bg-lassa-red text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <UsersIcon className="w-5 h-5 mr-3" />
                User Management
              </button>
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === "settings" 
                    ? "bg-lassa-red text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <CogIcon className="w-5 h-5 mr-3" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-4 md:space-y-6">
              {/* Dashboard Header */}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, {username}. Here's what's happening with your system.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {loading ? (
                  // Loading state
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg animate-pulse">
                          <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        </div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                      <div>
                        <p className="text-red-800 font-medium">Error loading data</p>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : outbreakData ? (
                  // Real data
                  <>
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                        </div>
                        <div className="ml-3 md:ml-4">
                          <p className="text-xs md:text-sm font-medium text-gray-500">Total Records</p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900">{outbreakData.metadata?.total_records || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <UsersIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                        </div>
                        <div className="ml-3 md:ml-4">
                          <p className="text-xs md:text-sm font-medium text-gray-500">Confirmed Cases</p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900">{outbreakData.kpi?.confirmed_cases || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <ArrowUpTrayIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                        </div>
                        <div className="ml-3 md:ml-4">
                          <p className="text-xs md:text-sm font-medium text-gray-500">States Affected</p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900">{outbreakData.kpi?.states_affected || 0}</p>
                        </div>
                      </div>
                    </div>

            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <ExclamationTriangleIcon className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                        </div>
                        <div className="ml-3 md:ml-4">
                          <p className="text-xs md:text-sm font-medium text-gray-500">LGAs Affected</p>
                          <p className="text-xl md:text-2xl font-bold text-gray-900">{outbreakData.kpi?.lgas_affected || 0}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // No data state
                  <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="text-center">
                      <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-full animate-pulse">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : outbreakData ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Data updated from ML API</p>
                          <p className="text-xs text-gray-500">
                            {outbreakData.metadata?.generated_at 
                              ? new Date(outbreakData.metadata.generated_at).toLocaleString()
                              : 'Recently'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <ChartBarIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {outbreakData.kpi?.confirmed_cases || 0} confirmed cases processed
                          </p>
                          <p className="text-xs text-gray-500">From {outbreakData.kpi?.states_affected || 0} states</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <ClockIcon className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">System monitoring active</p>
                          <p className="text-xs text-gray-500">Real-time data processing</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Data Management</h1>
                  <p className="text-gray-600">Download and manage your datasets</p>
                </div>
                <Button 
                  onClick={handleGuideDownload}
                  className="bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2 mt-4 md:mt-0 py-2 md:py-2 text-sm"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  Download ML Requirements Guide
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Full Dataset */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ChartBarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 ml-3">Full Dataset</h3>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm mb-4">Complete dataset with all records and metadata</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">Records:</span>
                      <span className="font-medium">{outbreakData?.metadata?.total_records || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">Confirmed Cases:</span>
                      <span className="font-medium">{outbreakData?.kpi?.confirmed_cases || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="font-medium">
                        {outbreakData?.metadata?.generated_at 
                          ? new Date(outbreakData.metadata.generated_at).toLocaleDateString()
                          : 'Unknown'
                        }
                      </span>
                    </div>
              </div>
              <Button 
                onClick={() => handleDownload("full_dataset")}
                disabled={downloadType === "full_dataset"}
                    className="w-full bg-lassa-red text-white hover:bg-lassa-red-dark flex items-center justify-center gap-2 py-2 md:py-2 text-sm"
                  >
                    {downloadType === "full_dataset" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download CSV
                      </>
                    )}
              </Button>
            </div>

            {/* Filtered Data */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ChartBarIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Filtered Data</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Data filtered by specific criteria and date ranges</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Recoveries:</span>
                      <span className="font-medium">{outbreakData?.kpi?.recoveries || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Recovery Rate:</span>
                      <span className="font-medium">{outbreakData?.kpi?.recovery_rate_percent?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium">Active</span>
              </div>
              </div>
              <Button 
                onClick={() => handleDownload("filtered_data")}
                disabled={downloadType === "filtered_data"}
                    className="w-full bg-lassa-red text-white hover:bg-lassa-red-dark flex items-center justify-center gap-2"
                  >
                    {downloadType === "filtered_data" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download CSV
                      </>
                    )}
              </Button>
            </div>

            {/* Research Data */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ChartBarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 ml-3">Research Data</h3>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm mb-4">Anonymized data suitable for research purposes</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">Deaths:</span>
                      <span className="font-medium">{outbreakData?.kpi?.deaths || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">Fatality Rate:</span>
                      <span className="font-medium">{outbreakData?.kpi?.fatality_rate_percent?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">Privacy:</span>
                      <span className="font-medium">Protected</span>
              </div>
              </div>
              <Button 
                onClick={() => handleDownload("research_data")}
                disabled={downloadType === "research_data"}
                    className="w-full bg-lassa-red text-white hover:bg-lassa-red-dark flex items-center justify-center gap-2 py-2 md:py-2 text-sm"
                  >
                    {downloadType === "research_data" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download CSV
                      </>
                    )}
              </Button>
            </div>

            {/* Public Reports */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ChartBarIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 ml-3">Public Reports</h3>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm mb-4">Public-facing reports and summaries</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">LGAs:</span>
                      <span className="font-medium">{outbreakData?.kpi?.lgas_affected || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">States:</span>
                      <span className="font-medium">{outbreakData?.kpi?.states_affected || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium">Published</span>
              </div>
              </div>
              <Button 
                onClick={() => handleDownload("public_reports")}
                disabled={downloadType === "public_reports"}
                    className="w-full bg-lassa-red text-white hover:bg-lassa-red-dark flex items-center justify-center gap-2 py-2 md:py-2 text-sm"
                  >
                    {downloadType === "public_reports" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download CSV
                      </>
                    )}
              </Button>
            </div>
          </div>
        </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Data Upload</h1>
                <p className="text-gray-600">Upload new datasets to the system</p>
              </div>

              {/* Upload Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-3 md:p-6 border-b border-gray-200">
                  <h3 className="text-sm md:text-lg font-medium text-gray-900">Upload New Dataset</h3>
                  <p className="text-xs md:text-sm text-gray-500">Select a file and specify the upload type</p>
                </div>
                <div className="p-3 md:p-6">
                  <form onSubmit={handleFileUpload} className="space-y-4 md:space-y-6">
                    <div>
                      <label htmlFor="uploadType" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Upload Type
                      </label>
                      <select
                        id="uploadType"
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value)}
                        className="w-full px-3 py-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lassa-red focus:border-lassa-red text-sm md:text-sm"
                        required
                      >
                        <option value="">Select upload type</option>
                        <option value="outbreak_data">Outbreak Data</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="file" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        File
                      </label>
                      <input
                        type="file"
                        id="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        accept=".csv,.json,.xlsx"
                        className="w-full px-3 py-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lassa-red focus:border-lassa-red text-sm md:text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Supported formats: CSV, JSON, XLSX (Max 10MB)</p>
                    </div>

                    {/* Status Messages */}
                    {uploadStatus && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-green-800 font-medium">Upload successful!</p>
                          <p className="text-green-700 text-sm">{uploadStatus}</p>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="text-red-800 font-medium">Upload failed</p>
                          <p className="text-red-700 text-sm">{uploadError}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={!uploadFile || !uploadType || uploadStatus === "Uploading..."}
                      className="w-full bg-lassa-red text-white hover:bg-lassa-red-dark flex items-center justify-center gap-2 py-4 md:py-2 text-sm md:text-sm font-medium"
                    >
                      {uploadStatus === "Uploading..." ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="w-4 h-4" />
                          Upload File
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Sample Data Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-3 md:p-6 border-b border-gray-200">
                  <h3 className="text-sm md:text-lg font-medium text-gray-900">Outbreak Data Format</h3>
                  <p className="text-xs md:text-sm text-gray-500">Reference for proper outbreak data format and structure</p>
                </div>
                <div className="p-3 md:p-6">
                  <div className="space-y-3 md:space-y-6">
                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                      <h4 className="text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">CSV Format Example</h4>
                      <div className="bg-gray-900 text-green-400 p-3 md:p-4 rounded-md overflow-x-auto">
                        <pre className="text-xs md:text-sm whitespace-pre-wrap break-words">{`Patient_ID,Age,Sex,Admission_Date,Ward_ICU,Outcome,Temperature_C,Heart_Rate_bpm,Respiratory_Rate,Systolic_BP,Diastolic_BP,SpO2,GCS,Oxygen_Support,Bleeding,State,LGA,Case_Status,Last_Update
P001,59,Male,2025-09-01,Ward,Discharged,37.3,88,22,94,65,96,11,No,No,Borno,Maiduguri,Confirmed,2025-09-15
P002,40,Male,2025-09-03,ICU,Deceased,36.5,62,18,141,96,86,10,No,No,Borno,Jere,Confirmed,2025-09-16
P003,63,Female,2025-09-05,ICU,Referred,39.8,121,12,144,87,100,14,Yes,Yes,Kano,Dala,Suspected,2025-09-17`}</pre>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                      <h4 className="text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3">JSON Format Example</h4>
                      <div className="bg-gray-900 text-green-400 p-3 md:p-4 rounded-md overflow-x-auto">
                        <pre className="text-xs md:text-sm whitespace-pre-wrap break-words">{`[
  {
    "Patient_ID": "P001",
    "Age": 59,
    "Sex": "Male",
    "Admission_Date": "2025-09-01",
    "Ward_ICU": "Ward",
    "Outcome": "Discharged",
    "Temperature_C": 37.3,
    "Heart_Rate_bpm": 88,
    "Respiratory_Rate": 22,
    "Systolic_BP": 94,
    "Diastolic_BP": 65,
    "SpO2": 96,
    "GCS": 11,
    "Oxygen_Support": "No",
    "Bleeding": "No",
    "State": "Borno",
    "LGA": "Maiduguri",
    "Case_Status": "Confirmed",
    "Last_Update": "2025-09-15"
  }
]`}</pre>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                        <h5 className="text-sm md:text-base font-medium text-blue-900 mb-2">Required Fields</h5>
                        <ul className="text-xs md:text-sm text-blue-800 space-y-1">
                          <li>• Patient_ID (unique identifier)</li>
                          <li>• Age (0-120 years)</li>
                          <li>• Sex (Male/Female/Other)</li>
                          <li>• Admission_Date (YYYY-MM-DD)</li>
                          <li>• Ward_ICU (Ward/ICU)</li>
                          <li>• Outcome (Discharged/Referred/Deceased/etc)</li>
                          <li>• Temperature_C, Heart_Rate_bpm, etc.</li>
                          <li>• State (Nigerian state)</li>
                          <li>• LGA (Local Government Area)</li>
                          <li>• Case_Status (Confirmed/Probable/Suspected)</li>
                          <li>• Last_Update (YYYY-MM-DD)</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-medium text-green-900 mb-2">Validation Rules</h5>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• File size: Max 50MB</li>
                          <li>• Formats: CSV, JSON, XLSX</li>
                          <li>• Age: 0-120 years only</li>
                          <li>• Sex: Male, Female, or Other</li>
                          <li>• Temperature: 30-45°C range</li>
                          <li>• States: Must be valid Nigerian states</li>
                          <li>• No missing required fields</li>
                          <li>• Unique Patient_ID values recommended</li>
                </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage system users and permissions</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">System Users</h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-500">User management features will be available in future updates.</p>
              </div>
            </div>
          </div>
        </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Configure system settings and preferences</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
                    <p className="text-gray-500">Settings configuration will be available in future updates.</p>
                  </div>
                </div>
              </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

