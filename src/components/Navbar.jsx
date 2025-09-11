import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import bitCampusLogo from "../assets/bit-campus.png";
import { jwtDecode } from "jwt-decode";

export default function Navbar({ onRegisterClick, onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);

  // Navigation items
  const navItems = [
    { path: "/all-courses", label: "Learn" },
    { path: "/about", label: "About Us" },
    { path: "/codetest", label: "Online IDE" },
    { path: "/codepen", label: "Code Pen" }
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  const getUsername = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.username || "User";
    } catch {
      return null;
    }
  };

  const username = getUsername();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    window.location.reload();
  };

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `relative px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out rounded-md ${
      isActive
        ? "text-[#00AEEF] bg-white/10"
        : "text-gray-200 hover:text-[#00AEEF] hover:bg-white/5"
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#2C3E50] to-[#34495E] shadow-lg backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={bitCampusLogo}
                alt="BitCampus"
                className="h-8 sm:h-10 w-auto object-contain hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-1 xl:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getNavLinkClass(item.path)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:block">
            <div className="ml-4 flex items-center space-x-4">
              {isLoggedIn() ? (
                <div ref={profileRef} className="relative">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-200 hidden lg:block">
                      Welcome, {username}
                    </span>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[#00AEEF] to-[#0095d5] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-200 transition-transform duration-200 ${
                          isProfileOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-700">{username}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onLoginClick}
                    className="text-gray-200 hover:text-white px-4 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onRegisterClick}
                    className="bg-gradient-to-r from-[#00AEEF] to-[#0095d5] hover:from-[#0095d5] hover:to-[#007bb5] text-white font-semibold px-6 py-2 rounded-full text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#2C3E50]/95 backdrop-blur-sm border-t border-gray-600/50">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "text-[#00AEEF] bg-white/10"
                    : "text-gray-200 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Mobile Auth Section */}
          <div className="border-t border-gray-600/50 px-4 py-3">
            {isLoggedIn() ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 pb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#00AEEF] to-[#0095d5] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-200 text-sm">Welcome, {username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-gray-200 hover:text-white border border-gray-500 hover:border-gray-400 font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onRegisterClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#00AEEF] to-[#0095d5] hover:from-[#0095d5] hover:to-[#007bb5] text-white font-semibold py-2 px-4 rounded-full transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}