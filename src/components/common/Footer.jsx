import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#3E2723] text-white mt-8 sm:mt-10 md:mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 font-display">Mochint Beauty</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 leading-relaxed">
              Klinik kecantikan terpercaya dengan teknologi AI untuk analisis kulit terbaik.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="text-[#8D6E63] hover:text-[#FDFBF7] transition p-1">
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-[#8D6E63] hover:text-[#FDFBF7] transition p-1">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-[#8D6E63] hover:text-[#FDFBF7] transition p-1">
                <Twitter size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-[#8D6E63] hover:text-[#FDFBF7] transition p-1">
                <Linkedin size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4 font-display uppercase tracking-wider">Menu Cepat</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/treatment" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                  Perawatan
                </Link>
              </li>
              <li>
                <Link to="/product" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                  Produk Skincare
                </Link>
              </li>
              <li>
                <Link to="/ai-skin-analysis" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                  Skin Reveal AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Member Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4 font-display uppercase tracking-wider">Member</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/member-app" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                  Daftar Member
                </Link>
              </li>
              <li>
                <Link to="/member/booking/step-1" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                  Reservasi
                </Link>
              </li>
              <li>
                <Link to="/promo" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                  Promo & Reseller
                </Link>
              </li>
              <li>
                <Link to="/information" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                  Blog & Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4 font-display uppercase tracking-wider">Hubungi Kami</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={14} className="sm:w-4 sm:h-4 text-[#8D6E63] mt-0.5 sm:mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">+62 (XXX) XXXX-XXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="sm:w-4 sm:h-4 text-[#8D6E63] mt-0.5 sm:mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">info@mochintbeauty.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="sm:w-4 sm:h-4 text-[#8D6E63] mt-0.5 sm:mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#5D4037] py-6 sm:py-8">
          {/* Bottom Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-300 text-center sm:text-left">
              &copy; 2024 Mochint Beauty. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
