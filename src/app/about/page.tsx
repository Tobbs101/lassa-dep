"use client";

import { Button } from "@/components/ui/button";
import { UserCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";

export default function About() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-800/80 p-4 md:p-8 rounded-lg">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">About AI4Lassa</h1>
              <p className="text-sm md:text-lg lg:text-xl leading-relaxed">
                The AI4Lassa Project is funded by the Tertiary Education Trust Fund (TETFUND) under the National Research Fund (NRF) in 2024. It aims to raise early alarms and improve urban health awareness, preparedness, and response to Lassa Fever outbreaks in Nigeria using Artificial Intelligence (AI). AI4Lassa is a pioneering initiative addressing the persistent Lassa fever challenge by enhancing early detection, enabling rapid response, and improving public health awareness. This effort invites collaboration for a sustainable and impactful public health revolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-lassa-red mb-6 slide-up">Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              A future where Lassa fever and similar outbreaks are detected and controlled swiftly, minimizing their socio-economic impact and promoting a healthier Nigeria and West Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-16 bg-gray-50 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-lassa-red mb-6 slide-up">Objectives</h2>
            <ul className="text-lg text-gray-700 space-y-3 list-disc list-inside">
              <li>Develop an AI-powered application for early Lassa fever detection and localized outbreak identification.</li>
              <li>Implement automated alert systems to inform public health authorities promptly.</li>
              <li>Monitor outbreak trends and provide control/treatment recommendations.</li>
              <li>Disseminate public health guidance on hygiene and food safety.</li>
              <li>Support efficient distribution of medical resources to affected areas.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Research Framework Section */}
      <section className="py-16 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-lassa-red mb-6 slide-up">Research Framework</h2>
            <p className="text-lg text-gray-700 mb-4">Our research addresses critical questions in AI-based health crisis management:</p>
            <ul className="text-lg text-gray-700 space-y-3 list-disc list-inside">
              <li>How can AI detect early warning signs of Lassa fever outbreaks?</li>
              <li>What data sources are essential for accurate early detection?</li>
              <li>Which ML/NLP techniques are most effective for outbreak prediction?</li>
              <li>How can the system be made accessible and usable for stakeholders?</li>
              <li>What ethical and legal frameworks must be considered?</li>
              <li>How can limitations in AI4Lassa be identified and overcome?</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Research Output and Outcomes Section */}
      <section className="py-16 bg-gray-50 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-lassa-red mb-6 slide-up">Research Output and Outcomes</h2>
            <ul className="text-lg text-gray-700 space-y-3 list-disc list-inside">
              <li>Stronger policy alignment through collaboration with health institutions.</li>
              <li>National application connecting government and academic sectors.</li>
              <li>Establishment of state-of-the-art AI labs at FUTMinna.</li>
              <li>Verified access to clean, reliable health datasets.</li>
              <li>An online platform for inter-university data sharing.</li>
              <li>Mentoring opportunities in AI for Nigerian students.</li>
              <li>Cross-sector synergy (government, industry, academia).</li>
              <li>Stakeholder engagement and ownership of data centers.</li>
              <li>Support for Nigeria&apos;s development via shared infrastructure.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Project Impact Section */}
      <section className="py-16 bg-white fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-lassa-red mb-6 slide-up">Project Impact</h2>
            <ul className="text-lg text-gray-700 space-y-3 list-disc list-inside">
              <li><strong>Cybersecurity:</strong> Protection of health data and digital infrastructure.</li>
              <li><strong>Economic Efficiency:</strong> Improved resource management boosting productivity.</li>
              <li><strong>Health Access:</strong> Promotion of equity and support for SDG 3 (Good Health and Well-Being).</li>
              <li><strong>Job Creation:</strong> Enhancement of industrial growth and economic stability.</li>
              <li><strong>Education:</strong> Facilitation of research and Lassa fever education through AI tools.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 bg-gray-50 fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-lassa-red mb-6 slide-up">Our Team</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Our multidisciplinary team includes AI researchers, software developers, epidemiologists, and public health professionals from various institutions, committed to improving Nigeria&apos;s health resilience.
            </p>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Meet Our Research Team</h3>
                  <p className="text-gray-600">
                    Learn about the dedicated professionals behind AI4Lassa's mission to combat Lassa fever.
                  </p>
                </div>
                <a 
                  href="/team" 
                  className="bg-lassa-red text-white px-6 py-3 rounded-lg font-medium hover:bg-lassa-red-dark transition-all duration-200 flex items-center gap-2"
                >
                  Meet Our Team
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action / Footer */}
      <footer className="bg-lassa-red text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Us in Making a Difference</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            AI4Lassa sets a new benchmark for epidemic preparedness. Collaborate with us in building a safer, healthier future across Nigeria and beyond.
          </p>
          <Button className="bg-white text-lassa-red hover:bg-gray-100 border border-gray-300 px-8 py-3 btn-hover">Contact Us</Button>
          <div className="mt-12">
            <p className="text-sm">© 2025 AI4Lassa Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
