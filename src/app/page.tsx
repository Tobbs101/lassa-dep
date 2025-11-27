"use client";

import { Button } from "@/components/ui/button";
import {
  UserCircleIcon,
  ArrowRightIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setStatusMessage("");

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setStatusMessage(data.message || "Successfully subscribed!");
        setEmail("");
        
        // Close modal after 3 seconds
        setTimeout(() => {
          setIsSubscribeModalOpen(false);
          setSubmitStatus(null);
          setStatusMessage("");
        }, 3000);
      } else {
        setSubmitStatus("error");
        setStatusMessage(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setSubmitStatus("error");
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
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

            {/* Subscribe Icon */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsSubscribeModalOpen(true)}
                className="flex items-center space-x-2 text-white nav-link-hover cursor-pointer icon-hover p-2 rounded-md"
                aria-label="Subscribe to updates"
              >
                <BellIcon className="w-8 h-8" />
              </button>
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
          <div className="flex flex-col md:flex-row items-center">
            {/* Left side - Text content */}
            <div className="w-full md:w-1/2">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 text-center md:text-left">
                Welcome Back
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-center md:text-left">
                You&apos;re now subscribed to real-time Lassa Fever alerts based on your location.
              </p>
              <div className="text-center md:text-left">
                <Button size="lg" className="bg-lassa-red text-white hover:bg-lassa-red-dark btn-hover" onClick={() => window.location.href = '/live-alerts'}>View Latest Alerts</Button>
              </div>
            </div>

            {/* Right side - Virus image */}
            <div className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0">
              <Image
                src="/virus.png"
                alt="Virus illustration"
                width={400}
                height={400}
                className="object-contain w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 transition-smooth hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-left slide-up">About AI4Lassa</h2>
            <div className="text-base md:text-lg text-gray-600 max-w-4xl space-y-4 text-left">
              <p className="text-justify">
                AI4Lassa is a digital platform developed to combat Lassa Fever by providing real-time awareness,
                geo-targeted AI solutions for early alarm, urban health awareness, preparedness, and quick response
                to outbreaks. The project is funded by the Tertiary Education Trust Fund (TETFUND) under the
                National Research Fund (NRF) in 2024.
              </p>
              <p className="text-justify">
                AI4Lassa is a pioneering initiative addressing Lassa fever outbreaks in Nigeria through artificial
                intelligence (AI), focusing on early detection, rapid response, and community health awareness.
                AI4Lassa aims to revolutionize Nigeria&apos;s healthcare infrastructure by empowering public health
                stakeholders and communities.
              </p>
            </div>
            <div className="mt-8 text-left">
              <Button className="bg-white border border-gray-900 text-lassa-red hover:bg-gray-50 flex items-center gap-2 rounded-full px-6 py-2 btn-hover" onClick={() => window.location.href = '/about'}>
                Learn more
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Critical Section */}
      <section className="py-16 bg-gray-50 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-left slide-up">Why curbing Lassa fever is Critical</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-4xl text-left text-justify">
              Lassa fever is a viral hemorrhagic fever caused by the Lassa virus, primarily transmitted through contact with
              infected rodents or their excreta. Early detection and rapid response are crucial for preventing widespread
              outbreaks and reducing mortality rates. Our AI-powered system helps identify potential outbreaks before
              they become widespread, enabling timely intervention and resource allocation.
            </p>
            <div className="mt-8 text-left">
              <Button className="bg-white border border-gray-900 text-lassa-red hover:bg-gray-50 flex items-center gap-2 rounded-full px-6 py-2 btn-hover" onClick={() => window.location.href = '/contact'}>
                Reach out to us
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Alerts Section */}
      <section className="py-16 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 slide-up">Live Alerts</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              View real-time outbreak notifications based on your current location. Stay alert and informed when
              Lassa Fever is detected in your area.
            </p>
            <div className="mt-8">
              <Button className="bg-lassa-red text-white hover:bg-lassa-red-dark btn-hover" onClick={() => window.location.href = '/live-alerts'}>Go to Alerts Page</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Outbreak Data Section */}
      <section className="py-16 bg-gray-50 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 slide-up">Explore Outbreak Data</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Our database holds verified epidemiological records including outbreak trends, survival/death rates,
              and demographic/geographic data.
            </p>
            <div className="mt-8">
              <Button className="bg-lassa-red text-white hover:bg-lassa-red-dark btn-hover" onClick={() => window.location.href = '/database'}>Explore Database</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">Reach out to us with your questions or feedback.</p>
            <div className="mt-8">
              <Button className="bg-lassa-red text-white hover:bg-lassa-red-dark" onClick={() => window.location.href = '/contact'}>Contact Support</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partners on the project</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              We are proud to collaborate with a diverse range of partners who share our vision and values.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center items-center">
            <div className="text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mb-2">
                <Image src="/tetfund.jpg" alt="Tertiary Education Trust Fund" width={150} height={150} className="object-contain max-w-full max-h-full" />
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Tertiary Education Trust Fund</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center mb-2">
                <Image src="/fut.jpg" alt="Federal University of Technology, Minna" width={120} height={120} className="object-contain max-w-full max-h-full" />
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Federal University of Technology, Minna</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mb-2">
                <Image src="/veritas.jpg" alt="Veritas University" width={150} height={150} className="object-contain max-w-full max-h-full" />
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Veritas University</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center mb-2">
                <Image src="/olabisi.jpg" alt="Olabisi Onabanjo University" width={120} height={120} className="object-contain max-w-full max-h-full" />
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">Olabisi Onabanjo University</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center mb-2">
                <Image src="/plateau.jpg" alt="University of Jos" width={120} height={120} className="object-contain max-w-full max-h-full" />
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium">University of Jos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-lassa-red text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">© 2025 AI4Lassa Project. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Subscribe Modal */}
      {isSubscribeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
            {/* Close button */}
            <button
              onClick={() => {
                setIsSubscribeModalOpen(false);
                setSubmitStatus(null);
                setStatusMessage("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-lassa-red rounded-full flex items-center justify-center mb-4">
                <BellIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Stay Updated
              </h2>
              <p className="text-gray-600">
                Subscribe to receive notifications about new features, updates, and alerts from AI4Lassa
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting || submitStatus === "success"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lassa-red focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{statusMessage}</p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{statusMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || submitStatus === "success"}
                className="w-full bg-lassa-red text-white py-2 px-4 rounded-md hover:bg-lassa-red-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Subscribing..." : submitStatus === "success" ? "Subscribed!" : "Subscribe"}
              </button>
            </form>

            {/* Privacy note */}
            <p className="mt-4 text-xs text-gray-500 text-center">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
