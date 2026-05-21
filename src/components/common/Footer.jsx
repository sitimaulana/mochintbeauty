import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#3E2723] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 font-display">Mochint Beauty</h3>
            <p className="text-gray-300 text-sm mb-4">
              Klinik kecantikan terpercaya dengan teknologi AI untuk analisis kulit terbaik.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#8D6E63] hover:text-[#FDFBF7] transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-[#8D6E63] hover:text-[#FDFBF7] transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-[#8D6E63] hover:text-[#FDFBF7] transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-[#8D6E63] hover:text-[#FDFBF7] transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-display uppercase">Menu Cepat</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/treatment" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                  Perawatan
                </Link>
              </li>
              <li>
                <Link to="/product" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                  Produk Skincare
                </Link>
              </li>
              <li>
                <Link to="/ai-skin-analysis" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                  Skin Reveal AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Member Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-display uppercase">Member</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/member-app" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                  Daftar Member
                </Link>
              </li>
              <li>
                <Link to="/member/booking/step-1" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                  Reservasi
                </Link>
              </li>
              <li>
                <Link to="/promo" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                  Promo & Reseller
                </Link>
              </li>
              <li>
                <Link to="/information" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                  Blog & Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-display uppercase">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-[#8D6E63] mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+62 (XXX) XXXX-XXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-[#8D6E63] mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@mochintbeauty.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#8D6E63] mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#5D4037] py-8">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 text-sm">
              &copy; 2024 Mochint Beauty. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-gray-300 hover:text-[#8D6E63] transition text-sm">
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
