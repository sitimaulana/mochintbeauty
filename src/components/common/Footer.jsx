import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
  const [footerData, setFooterData] = useState({
    company_description: 'Klinik kecantikan terpercaya dengan teknologi AI untuk analisis kulit terbaik.',
    phone: '+62 (XXX) XXXX-XXXX',
    email: 'info@mochintbeauty.com',
    address: 'Jakarta, Indonesia',
    social_links: [
      { platform: 'facebook', url: '#' },
      { platform: 'instagram', url: '#' },
      { platform: 'twitter', url: '#' },
      { platform: 'linkedin', url: '#' }
    ],
    quick_links: [
      { label: 'Beranda', url: '/' },
      { label: 'Perawatan', url: '/treatment' },
      { label: 'Produk Skincare', url: '/product' },
      { label: 'Skin Reveal AI', url: '/ai-skin-analysis' }
    ],
    member_links: [
      { label: 'Daftar Member', url: '/member-app' },
      { label: 'Reservasi', url: '/member/booking/step-1' },
      { label: 'Promo & Reseller', url: '/promo' },
      { label: 'Blog & Tips', url: '/information' }
    ],
    copyright: '© 2024 Mochint Beauty. All rights reserved.'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await axios.get('/api/page-info/public?page_type=footer');
        const data = response.data.data?.[0];
        
        if (data?.additional_data) {
          setFooterData(prevData => ({
            company_description: data.additional_data.company_description || prevData.company_description,
            phone: data.additional_data.phone || prevData.phone,
            email: data.additional_data.email || prevData.email,
            address: data.additional_data.address || prevData.address,
            social_links: data.additional_data.social_links || prevData.social_links,
            quick_links: data.additional_data.quick_links || prevData.quick_links,
            member_links: data.additional_data.member_links || prevData.member_links,
            copyright: data.additional_data.copyright || prevData.copyright
          }));
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
        // Use default data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  const getSocialIcon = (platform) => {
    const icons = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      linkedin: Linkedin
    };
    return icons[platform] || Facebook;
  };

  if (loading) {
    return null; // Or return a loading skeleton
  }
  return (
    <footer className="bg-[#3E2723] text-white mt-8 sm:mt-10 md:mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 font-display">Mochint Beauty</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 leading-relaxed">
              {footerData.company_description}
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {footerData.social_links?.map((link) => {
                const IconComponent = getSocialIcon(link.platform);
                return (
                  <a 
                    key={link.platform}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#8D6E63] hover:text-[#FDFBF7] transition p-1"
                  >
                    <IconComponent size={18} className="sm:w-5 sm:h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4 font-display uppercase tracking-wider">Menu Cepat</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerData.quick_links?.map((link, index) => (
                <li key={index}>
                  <Link to={link.url} className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Member Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4 font-display uppercase tracking-wider">Member</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerData.member_links?.map((link, index) => (
                <li key={index}>
                  <Link to={link.url} className="text-xs sm:text-sm text-gray-300 hover:text-[#8D6E63] transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4 font-display uppercase tracking-wider">Hubungi Kami</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={14} className="sm:w-4 sm:h-4 text-[#8D6E63] mt-0.5 sm:mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">{footerData.phone}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="sm:w-4 sm:h-4 text-[#8D6E63] mt-0.5 sm:mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">{footerData.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="sm:w-4 sm:h-4 text-[#8D6E63] mt-0.5 sm:mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-300">{footerData.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#5D4037] py-6 sm:py-8">
          {/* Bottom Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-300 text-center sm:text-left">
              {footerData.copyright}
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
