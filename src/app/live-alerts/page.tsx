"use client";

import { Button } from "@/components/ui/button";
import { UserCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState, useEffect } from "react";

interface AlertData {
  lga: string;
  state: string;
  cases: number;
  deaths: number;
  recovery_rate_percent: number;
  last_update: string | null;
}

interface OutbreakData {
  lga_breakdown: AlertData[];
  timestamp: string;
}

export default function LiveAlerts() {
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
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Live Lassa Fever Alerts</h1>
            <p className="text-sm md:text-lg lg:text-xl">Stay updated with the latest outbreak information across Nigeria.</p>
          </div>
        </div>
      </section>

      {/* Recent Alerts Section */}
      <section className="py-16 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 slide-up">Recent Alerts</h2>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lassa-red"></div>
                <span className="ml-2 text-gray-600">Loading alerts...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">Error: {error}</p>
                <Button onClick={fetchOutbreakData} className="mt-2 bg-lassa-red text-white">
                  Retry
                </Button>
              </div>
            )}

            {/* Dynamic Alert Cards */}
            {outbreakData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {outbreakData.lga_breakdown
                  .filter(lga => lga.cases > 0) // Only show LGAs with cases
                  .sort((a, b) => b.cases - a.cases) // Sort by case count
                  .slice(0, 6) // Show top 6
                  .map((lga, index) => {
                    const riskLevel = lga.cases > 50 ? 'High' : lga.cases > 20 ? 'Moderate' : 'Low';
                    const riskColor = lga.cases > 50 ? 'text-lassa-red' : lga.cases > 20 ? 'text-orange-600' : 'text-green-600';
                    
                    return (
                      <div key={`${lga.lga}-${lga.state}`} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 card-animate">
                        <h3 className="text-xl font-bold text-lassa-red mb-2">{lga.lga}, {lga.state}</h3>
                        <p className="text-gray-500 text-sm mb-3">
                          Cases: {lga.cases} | Deaths: {lga.deaths}
                        </p>
                        <div className="mb-3">
                          <span className="text-gray-900 font-semibold">Risk Level: </span>
                          <span className={`${riskColor} font-bold`}>{riskLevel}</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          Recovery Rate: {lga.recovery_rate_percent.toFixed(1)}%
                        </p>
                        {lga.last_update && (
                          <p className="text-gray-500 text-xs mt-2">
                            Updated: {new Date(lga.last_update).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

          </div>
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
