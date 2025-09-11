import { Link } from 'react-router-dom';
import bitCampusLogo from '../assets/bit-campus.png';
import facebookLogo from '../assets/fackbook-logo.png';
import instagramLogo from '../assets/instagram-logo.png';
import discordLogo from '../assets/discord-log.png';
import twitterLogo from '../assets/twitter-logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#2C3E50] text-white py-8 sm:py-12 lg:py-16">
      {/* Top Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-16">
        <div className="border-b border-gray-600"></div>
      </div>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* About Us Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">About us</h3>
            <div className="mb-4 sm:mb-6">
              <Link to="/">
                <img
                  src={bitCampusLogo}
                  alt="BitCampus Logo"
                  className="h-12 sm:h-16 object-contain"
                />
              </Link>
            </div>
            <p className="text-gray-300 mb-4 text-sm sm:text-base leading-relaxed">
              A virtual campus where we believe that learning to code should be simple and
              accessible for everyone.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} Bitcampus. All Right Reserved.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Navigations</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/learn" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">Learn</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white text-sm sm:text-base transition-colors duration-200">About us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Contact us</h3>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-gray-300 text-sm sm:text-base">bitcampus@bit.com</p>
              <p className="text-gray-300 text-sm sm:text-base">012345678</p>
              {/* Social Media Icons */}
              <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <img src={facebookLogo} alt="Facebook" className="w-6 h-6 sm:w-8 sm:h-8" />
                </a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <img src={instagramLogo} alt="Instagram" className="w-6 h-6 sm:w-8 sm:h-8" />
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <img src={discordLogo} alt="Discord" className="w-6 h-6 sm:w-8 sm:h-8" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <img src={twitterLogo} alt="Twitter" className="w-6 h-6 sm:w-8 sm:h-8" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
