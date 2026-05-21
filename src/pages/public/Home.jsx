import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MapPin, Phone, Star, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Preloader from '../../components/common/Preloader';

const Home = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageContent, setPageContent] = useState({
    hero: null,
    about: null,
    services: null,
    promo_banner: null,
    footer_contact: null
  });

  // --- API URL ---
  const API_URL_PRODUCTS = '/api/products';
  const API_URL_REVIEWS = '/api/reviews';
  const API_URL_PAGE_INFO = '/api/page-info/public';

  //  Format harga konsisten dengan Product.jsx
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(price);
  };

  // --- LOAD DATA DARI DATABASE ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        console.log('Loading data from API...');
        
        // Mengambil data Produk, Testimoni, dan Page Content secara paralel
        const [resProducts, resReviews, resPageInfo] = await Promise.all([
          axios.get(API_URL_PRODUCTS),
          axios.get(API_URL_REVIEWS),
          axios.get(`${API_URL_PAGE_INFO}?page_type=home`)
        ]);

        console.log('Products response:', resProducts.data);
        console.log('Reviews response:', resReviews.data);
        console.log('Page Info response:', resPageInfo.data);

        // Ambil 4 produk terbaru untuk ditampilkan di Home
        const productsData = resProducts.data.data || resProducts.data || [];
        setProducts(productsData.slice(0, 4));
        
        // Set page content
        const pageInfoData = resPageInfo.data.data || [];
        const contentMap = {
          hero: pageInfoData.find(item => item.section_key === 'hero'),
          about: pageInfoData.find(item => item.section_key === 'about'),
          services: pageInfoData.find(item => item.section_key === 'services'),
          promo_banner: pageInfoData.find(item => item.section_key === 'promo_banner'),
          footer_contact: pageInfoData.find(item => item.section_key === 'footer_contact')
        };
        setPageContent(contentMap);
        
        // Set testimoni dari database - pastikan data valid
        const reviewsData = resReviews.data.data || resReviews.data || [];
        console.log('Raw reviews data:', reviewsData);
        
        // Debug setiap review
        reviewsData.forEach((review, index) => {
          console.log(`Review ${index + 1}:`, {
            name: review.name,
            location: review.location,
            member_address: review.member_address,
            display_location: review.display_location,
            comment: review.comment,
            rating: review.rating
          });
        });
        
        // Filter dan sort reviews (terbaru dulu)
        // Tampilkan SEMUA review yang punya data lengkap (langsung tampil tanpa perlu approve)
        const validReviews = reviewsData
          .filter(review => {
            const isValid = review.name && review.comment && review.rating;
            if (!isValid) {
              console.log('Invalid review filtered out:', review);
            }
            return isValid;
          })
          .map(review => ({
            ...review,
            // Prioritas: location > member_address > display_location > default
            location: review.location || review.member_address || review.display_location || 'Member Terverifikasi'
          }))
          .sort((a, b) => {
            const dateA = new Date(b.createdAt || b.date || 0);
            const dateB = new Date(a.createdAt || a.date || 0);
            return dateA - dateB;
          });
        
        console.log('Valid reviews after processing:', validReviews);
        console.log('Valid reviews count:', validReviews.length);
        
        setTestimonials(validReviews);
        
        console.log("âœ… Data loaded successfully from database");
      } catch (error) {
        console.error("âŒ Gagal memuat data dari database:", error);
        console.error("Error details:", error.response?.data || error.message);
        // Set empty array jika gagal
        setTestimonials([]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- HANDLERS ---
  const handleBookingClick = () => {
    navigate('/member-app', { state: { openLogin: true } });
  };

  const handleAboutClick = () => navigate('/about');
  const handleProductMoreClick = () => navigate('/product');
  const handlePromoClick = () => navigate('/promo');

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 350;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return <Preloader type="fullscreen" text="Mempersiapkan Layanan Terbaik..." />;
  }

  return (
    <div className="min-h-screen font-sans text-gray-700 bg-white">
      
      {/* Hero Section - Responsive */}
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 bg-[#FDFBF7] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${pageContent.hero?.image_url || 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=2000&q=80'}')`
          }}
        ></div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7]/95 via-[#FDFBF7]/90 to-[#FDFBF7]/85"></div>
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10 text-center max-w-[1400px]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-[#5D4037] mb-4 sm:mb-6 tracking-tight">
            {pageContent.hero?.title || 'Mochint Beauty Care'}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#8D6E63] mb-6 sm:mb-10 max-w-2xl mx-auto font-medium font-sans">
            {pageContent.hero?.subtitle || 'Klinik kecantikan terpercaya dengan teknologi terkini dan bahan premium untuk perawatan kulit Anda.'}
          </p>
          <button onClick={handleBookingClick} className="font-display inline-flex items-center px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 bg-[#8D6E63] text-white text-sm sm:text-base md:text-lg font-bold rounded-full hover:bg-[#6D4C41] transition-all shadow-lg transform hover:-translate-y-1 mx-auto">
            Reservasi Sekarang <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </section>

      {/* About Section - Responsive */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-white text-left">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1400px] flex flex-col lg:flex-row items-center gap-8 sm:gap-12 md:gap-16">
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute top-4 left-4 w-full h-full border-2 border-[#8D6E63] rounded-[20px] sm:rounded-[30px] -z-10 hidden sm:block"></div>
            <div className="bg-gray-100 rounded-[20px] sm:rounded-[30px] h-64 sm:h-80 md:h-96 flex items-center justify-center border border-gray-200 overflow-hidden">
              <img 
                src={pageContent.about?.image_url || 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80'} 
                alt={pageContent.about?.title || 'Clinic'} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="font-display inline-block px-3 py-1 bg-[#FDFBF7] text-[#8D6E63] text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4 rounded-md">
              {pageContent.about?.subtitle || 'Kenali Mochint Lebih Dekat'}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-[#3E2723] mb-4 sm:mb-6 tracking-tight leading-tight">
              {pageContent.about?.title || 'Rumah Cantik Mochint Beauty Care'}
            </h2>
            <p className="font-sans text-sm sm:text-base md:text-lg text-gray-500 mb-6 sm:mb-8 leading-relaxed font-normal">
              {pageContent.about?.content || 'Selamat datang di Mochint Beauty Care, salon kecantikan yang berlokasi di Pandaan Pasuruan Jawa Timur. Kami hadir sebagai solusi bagi Anda yang ingin merawat kulit dengan teknologi terkini dan bahan premium.'}
            </p>
            <button onClick={handleAboutClick} className="font-display px-6 sm:px-8 py-2 sm:py-3 border-2 border-[#8D6E63] text-[#8D6E63] font-bold text-sm sm:text-base rounded-full hover:bg-[#8D6E63] hover:text-white transition-all">Tentang Kami</button>
          </div>
        </div>
      </section>

      {/* Rekomendasi Produk - Responsive */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1400px] text-center">
          <div className="mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-[#5D4037] tracking-tight text-center">Rekomendasi Produk</h2>
            <p className="font-sans text-[#8D6E63] text-xs sm:text-sm mt-2 sm:mt-3 tracking-widest uppercase font-bold text-center">Terbaik Untuk Anda</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {products.map((product) => (
              <div key={product._id || product.id} className="group cursor-pointer flex flex-col items-center">
                <div className="w-full aspect-[4/5] bg-white mb-3 sm:mb-4 md:mb-6 overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm relative" onClick={() => navigate(`/product`)}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out" />
                  <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <span className="bg-white/90 text-[#5D4037] px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-bold font-sans">
                      Rp {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-display font-bold text-[#3E2723] group-hover:text-[#8D6E63] transition-colors line-clamp-2">{product.name}</h3>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-sans text-gray-400 mt-1 uppercase tracking-widest font-bold">{product.category}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12 md:mt-16">
            <button onClick={handleProductMoreClick} className="font-display inline-flex items-center text-xs sm:text-sm md:text-base text-[#8D6E63] font-bold hover:text-[#5D4037] transition-colors border-b-2 border-[#8D6E63] pb-1 mx-auto">
              Lihat Selengkapnya <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Promo Banner - Responsive */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1400px] text-left">
          <div className="relative rounded-[20px] sm:rounded-[25px] md:rounded-[30px] overflow-hidden bg-[#5D4037] text-white py-8 sm:py-12 md:py-16 lg:py-20 px-6 sm:px-8 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between shadow-2xl gap-6 md:gap-0">
            {/* Background Image jika ada */}
            {pageContent.promo_banner?.image_url && (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{ backgroundImage: `url('${pageContent.promo_banner.image_url}')` }}
              ></div>
            )}
            <div className="absolute top-0 right-0 w-40 sm:w-56 md:w-64 h-40 sm:h-56 md:h-64 bg-[#8D6E63] rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 w-full md:max-w-xl">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 leading-tight tracking-tight text-white">
                {pageContent.promo_banner?.title || 'Buka Peluang Bisnis'} <br/> 
                <span className="text-[#D7CCC8]">{pageContent.promo_banner?.subtitle || 'Bersama Mochint!'}</span>
              </h2>
              <p className="font-sans text-[#D7CCC8]/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 font-normal">
                {pageContent.promo_banner?.content || 'Buka peluang penghasilan tambahan dengan menjadi Reseller resmi Mochint Beauty Care. Modal ringan, keuntungan pasti.'}
              </p>
              <button onClick={handlePromoClick} className="font-display px-6 sm:px-8 py-2 sm:py-3 bg-white text-[#5D4037] font-bold text-sm sm:text-base rounded-full hover:bg-gray-100 transition shadow-lg">
                {pageContent.promo_banner?.additional_data?.button_text || 'Gabung Mitra'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Responsive */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 pb-0 bg-white overflow-hidden relative text-center">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1400px]">
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-[#3E2723] tracking-tighter">Apa Kata Mereka?</h2>
            <p className="font-sans text-[#8D6E63] mt-2 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
              {testimonials.length > 0 
                ? `${testimonials.length} Ulasan dari pelanggan kami` 
                : 'Belum ada ulasan'}
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <button 
              onClick={() => scroll('left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white border border-gray-200 p-3 rounded-full shadow-md text-[#5D4037] hover:bg-[#FDFBF7] transition hidden md:block"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div 
              ref={scrollRef} 
              className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-6 sm:pb-8 px-2 sm:px-4 snap-x snap-mandatory no-scrollbar" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isLoading ? (
                <div className="w-full text-center py-12">
                  <p className="text-[#D7CCC8]">Memuat ulasan...</p>
                </div>
              ) : testimonials.length > 0 ? (
                testimonials.map((item, index) => {
                  console.log(`Rendering review ${index + 1}:`, {
                    name: item.name,
                    location: item.location,
                    comment: item.comment
                  });
                  
                  return (
                    <div 
                      key={item.id || item._id || index} 
                      className="min-w-[260px] sm:min-w-[300px] md:min-w-[350px] bg-[#FDFBF7] p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[30px] md:rounded-[40px] border border-gray-100 shadow-sm snap-center flex-shrink-0 text-left transition-all duration-300 hover:shadow-xl"
                    >
                      {/* User Info - Responsive */}
                      <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-100">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3E2723] rounded-lg sm:rounded-2xl flex items-center justify-center text-white font-bold shrink-0 font-display text-sm">
                          {(item.name || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-[#3E2723] text-xs sm:text-sm truncate">
                            {item.name || 'Anonim'}
                          </h4>
                          <p className="font-sans text-[8px] sm:text-[10px] text-[#A1887F] font-black uppercase tracking-widest truncate">
                            {item.location || item.member_address || item.display_location || 'Member Terverifikasi'}
                          </p>
                        </div>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex gap-1 text-yellow-400 mb-3 sm:mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < Math.floor(item.rating) ? "currentColor" : "none"} 
                            className={i < Math.floor(item.rating) ? "" : "text-gray-200"} 
                          />
                        ))}
                      </div>
                      
                      {/* Review Comment */}
                      <p className="font-sans text-[#4E342E] italic mb-4 sm:mb-6 leading-relaxed font-medium text-xs sm:text-sm line-clamp-3">
                        "{item.comment}"
                      </p>

                      {/* Admin Reply (jika ada) */}
                      {item.adminReply && (
                        <div className="bg-[#E8DDD9] rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-[#3E2723]">
                          <div className="flex items-start gap-2 mb-2">
                            <p className="font-semibold text-[#3E2723] text-[10px] sm:text-xs">Balasan dari Mochint</p>
                          </div>
                          <p className="text-[#3E2723] text-xs sm:text-sm leading-relaxed line-clamp-2">
                            {item.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star size={32} className="text-gray-300" />
                  </div>
                  <p className="text-[#D7CCC8] italic text-center font-sans">
                    Belum ada ulasan saat ini. Jadilah yang pertama memberikan review!
                  </p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => scroll('right')} 
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white border border-gray-200 p-3 rounded-full shadow-md text-[#5D4037] hover:bg-[#FDFBF7] transition hidden md:block"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section - Responsive */}
      <footer className="pt-0 pb-12 sm:pb-16 md:pb-20 lg:pb-28 bg-[#3E2723] text-white rounded-t-[30px] sm:rounded-t-[40px] md:rounded-t-[50px] text-left">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            
            <div className="bg-white/5 p-3 sm:p-4 rounded-2xl sm:rounded-3xl">
              {/* Real-Time Interactive Map */}
              <div className="w-full h-60 sm:h-72 md:h-80 bg-gray-300 rounded-lg sm:rounded-2xl overflow-hidden relative shadow-2xl">
                <iframe
                  title={pageContent.footer_contact?.title || 'Mochint Beauty Care Pandaan'}
                  src={pageContent.footer_contact?.additional_data?.map_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.269438012674!2d112.69176317586522!3d-7.653118975718693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7d91f72a480ad%3A0xe42c73733290811b!2sMOCHINT%20BEAUTY%20CARE%20Salon%20Kecantikan%20Di%20Pandaan%20Pasuruan%20Jawa%20Timur%20Mochint%20Beauty%20Skin%20Care!5e0!3m2!1sid!2sid!4v1706436000000!5m2!1sid!2sid'}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale-[15%] contrast-[1.1] hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
            </div>
            
            <div className="space-y-6 sm:space-y-8 flex flex-col justify-center">
              <div 
                className="space-y-2 group cursor-pointer"
                onClick={() => window.open(pageContent.footer_contact?.additional_data?.maps_url || 'https://maps.app.goo.gl/your-maps-link', '_blank')}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
                  {pageContent.footer_contact?.title || 'Kunjungi Kami'}
                </h2>
                <div className="flex items-start gap-3 sm:gap-4 md:gap-5">
                  <div className="bg-[#8D6E63] p-3 sm:p-4 rounded-lg sm:rounded-2xl shadow-lg shrink-0 group-hover:bg-[#6D4C41] transition-colors">
                    <MapPin size={20} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <p className="font-sans text-xs sm:text-sm md:text-base text-[#D7CCC8] font-medium opacity-80 leading-relaxed">
                    {pageContent.footer_contact?.content || 'Jl. Sidomukti No.13 RT03, RW.04, Pesantren, Pandaan, Kec. Pandaan, Pasuruan, Jawa Timur 67156'}
                  </p>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-3 sm:gap-4 md:gap-5 group cursor-pointer" 
                onClick={() => window.open(pageContent.footer_contact?.additional_data?.whatsapp_url || 'https://wa.me/6281994204009')}
              >
                <div className="bg-[#8D6E63] p-3 sm:p-4 rounded-lg sm:rounded-2xl shadow-lg shrink-0 group-hover:bg-[#6D4C41] transition-colors">
                  <MessageCircle size={20} className="text-white sm:w-6 sm:h-6" /> 
                </div>
                <div className="font-sans">
                  <h4 className="font-black text-[8px] sm:text-[10px] md:text-xs uppercase tracking-widest text-[#D7CCC8]">
                    {pageContent.footer_contact?.subtitle || 'WhatsApp'}
                  </h4>
                  <p className="text-base sm:text-lg md:text-xl font-display font-bold text-white">
                    {pageContent.footer_contact?.additional_data?.phone_display || '+62 819-9420-4009'}
                  </p>
                </div>
              </div>
            </div>

          </div>
          <div className="border-t border-white/5 mt-10 sm:mt-12 md:mt-16 pt-6 sm:pt-8 text-center text-[#A1887F] text-[10px] sm:text-xs font-sans font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
