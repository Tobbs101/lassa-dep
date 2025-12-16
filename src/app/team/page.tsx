"use client";

import { UserCircleIcon, Bars3Icon, XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";

export default function Team() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const teamMembers = [
    {
      id: 1,
      name: "UMARU, Emmanuel Tanko",
      role: "Principal Research/Investigator",
      title: "Professor of Urban and Regional Planning/Urban health Department of Urban and Regional Planning/Doctoral Research Programme on Climate Change and Human Habitat (CC & HH), West African Science Service Centre on Climate Change and Adapted Land Use (WASCAL) Federal University of Technology Minna, Niger State, Nigeria.",
      photo: "/umaru_emmanuel.png"
    },
    {
      id: 2,
      name: "CHINGLE, MOSES PETER",
      role: "Co-Investigator",
      title: "Professor of Epidemiology and Primary Health Care, University of Jos",
      photo: "/chingle_moses.png"
    },
    {
      id: 3,
      name: "James Garba Ambafi (PhD)",
      role: "Co-Investigator",
      title: "Senior Lecturer in the Department of Electrical & Electronics Engineering at the Federal University of Technology, Minna",
      photo: "/james_garba.png"
    },
    {
      id: 4,
      name: "Dr. Rakiya Gambo Musa",
      role: "Co-Investigator",
      title: "Senior Medical Officer at the University Clinic of the Federal University of Technology, Minna",
      photo: "/rakiya_gambo.png"
    },
    {
      id: 5,
      name: "GBENGA MORENIKEJI",
      role: "Co-Investigator",
      title: "Academic staff member in the Department of Estate Management at the Federal University of Technology, Minna",
      photo: "/gbenga_morenikeji.png"
    },
    {
      id: 6,
      name: "Adeleye Bamiji Michael (PhD)",
      role: "Co-Investigator",
      title: "Lecturer in the Department of Urban and Regional Planning at the Federal University of Technology Minna",
      photo: "/adeleye_bamiji.png"
    },
    {
      id: 7,
      name: "Henry Ohiani Ohize (PhD)",
      role: "Co-Investigator",
      title: "Associate Professor of Electrical and Electronics Engineering at the Federal University of Technology Minna",
      photo: "/henry_ohlani.png"
    },
    {
      id: 8,
      name: "Chibueze Valentine Ikpo (PhD)",
      role: "Co-Investigator",
      title: "Lecturer in Software Engineering at Veritas University, Nigeria",
      photo: "/chibueze.png"
    },
    {
      id: 9,
      name: "Taliha Abiodun Folorunso (PhD)",
      role: "Co-Investigator",
      title: "Senior Lecturer at Mechatronics Engineering. Team lead at Advanced Engineering Innovation Research Group",
      photo: "/tahila_abiodun.png"
    },
    {
      id: 10,
      name: "Sakinat Folorunso",
      role: "Co-Investigator",
      title: "Computer Science lecturer at Olabisi Onabanjo University",
      photo: "/sakinat_folorunso.png"
    }
  ];

  const technicalTeam = [
    {
      id: 1,
      name: "Dr. O. A. Ojerinde",
      role: "Head of Operations",
      title: "Operations Director",
      photo: "/ojerinde.jpg"
    },
    {
      id: 2,
      name: "Kareem-Ojo Abubakry",
      role: "Lead UI Designer",
      title: "User Interface & Experience Designer",
      photo: "/Kareem-Ojo Abubakry .jpg"
    },
    {
      id: 3,
      name: "Johnson Oluwafemi Adedokun",
      role: "Full Stack Developer",
      title: "Software Development Lead",
      photo: "/johnson_adedokun.jpg"
    },
    {
      id: 4,
      name: "Enoch Dani Mida",
      role: "Machine Learning Expert",
      title: "AI/ML Specialist",
      photo: "/enoch.JPG"
    }
  ];

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
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 transition-all duration-300">Meet Our Team</h1>
            <p className="text-sm md:text-lg lg:text-xl transition-all duration-300">The dedicated professionals behind AI4Lassa's mission to combat Lassa fever</p>
            <div className="mt-6">
              <a 
                href="/about" 
                className="inline-flex items-center gap-2 bg-white text-lassa-red px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to About
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Research Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Research Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A multidisciplinary team of experts working together to advance Lassa fever research and develop innovative AI solutions for outbreak prevention and management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200">
                <div className="text-center">
                  {/* Team Member Photo */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-full"
                        priority={member.id <= 4} // Prioritize first 4 images for faster loading
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <UserCircleIcon className="w-24 h-24 text-gray-400 hidden" />
                    </div>
                  </div>

                  {/* Member Info */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-lassa-red font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Technical Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The technical experts behind the AI4Lassa platform, ensuring robust development, seamless user experience, and cutting-edge machine learning implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalTeam.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200">
                <div className="text-center">
                  {/* Team Member Photo */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-full"
                        priority={member.id <= 4} // Prioritize first 4 images for faster loading
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <UserCircleIcon className="w-24 h-24 text-gray-400 hidden" />
                    </div>
                  </div>

                  {/* Member Info */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-lassa-red font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Interested in contributing to Lassa fever research? We welcome collaborations with researchers, healthcare professionals, and technology experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-lassa-red text-white px-8 py-3 rounded-lg font-medium hover:bg-lassa-red-dark transition-all duration-200"
            >
              Get in Touch
            </a>
            <a 
              href="/about" 
              className="border border-lassa-red text-lassa-red px-8 py-3 rounded-lg font-medium hover:bg-lassa-red hover:text-white transition-all duration-200"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-lassa-red text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs md:text-sm transition-all duration-300">© 2025 AI4Lassa Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
