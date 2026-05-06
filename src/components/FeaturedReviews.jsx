import React, { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { getFeaturedReviews } from '../../api/client';

/**
 * FeaturedReviews Component
 * 
 * Menampilkan featured reviews dari admin di homepage
 * Diambil dari endpoint GET /api/reviews/featured
 * 
 * Features:
 * - Display customer name, rating, dan comment
 * - Tampilkan admin reply jika ada
 * - Responsive grid layout
 * - Loading state
 */

const FeaturedReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  const fetchFeaturedReviews = async () => {
    try {
      setLoading(true);
      const response = await getFeaturedReviews();
      if (response.success) {
        setReviews(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <div className="text-center text-[#A1887F] animate-pulse">
          Memuat review...
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-[#FDFBF7] to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-[#3E2723] mb-2">
            ⭐ Testimoni Pelanggan
          </h2>
          <p className="text-[#8D6E63] text-lg max-w-2xl mx-auto">
            Dengarkan pengalaman pelanggan kami yang telah merasakan transformasi kecantikan bersama Mochint Beauty
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <a
            href="/member/review"
            className="inline-block px-8 py-4 bg-[#3E2723] text-white font-display font-bold rounded-full hover:bg-[#8D6E63] transition-all shadow-lg hover:shadow-xl"
          >
            ✨ Bagikan Pengalaman Anda
          </a>
        </div>
      </div>
    </section>
  );
};

/**
 * ReviewCard Component
 * Individual review card dengan info customer, rating, comment, dan admin reply
 */
function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col">
      {/* Customer Info & Rating */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-[#3E2723] text-lg">{review.name}</h3>
            <p className="text-xs text-[#A1887F]">
              {review.location || 'Verified Member'}
            </p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < review.rating ? '#FACC15' : '#e0e0e0'}
              className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
      </div>

      {/* Customer Comment */}
      <div className="mb-4 flex-grow">
        <p className="text-[#3E2723] text-sm leading-relaxed italic">
          "{review.comment}"
        </p>
      </div>

      {/* Admin Reply (if exists) */}
      {review.adminReply && (
        <div className="bg-[#E8DDD9] rounded-xl p-4 border-l-4 border-[#3E2723] mt-4">
          <div className="flex gap-2 mb-2">
            <MessageCircle size={16} className="text-[#3E2723] flex-shrink-0 mt-1" />
            <p className="font-semibold text-[#3E2723] text-xs">
              Balasan dari Mochint
            </p>
          </div>
          <p className="text-[#3E2723] text-sm leading-relaxed">
            {review.adminReply}
          </p>
          <p className="text-xs text-[#A1887F] mt-2">
            {new Date(review.repliedAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      )}

      {/* Review Date */}
      <p className="text-xs text-[#A1887F] mt-4 pt-4 border-t border-gray-200">
        {new Date(review.createdAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
    </div>
  );
}

export default FeaturedReviews;

/**
 * Cara Menggunakan Component Ini di Homepage:
 * 
 * import FeaturedReviews from './components/FeaturedReviews';
 * 
 * export default function Home() {
 *   return (
 *     <>
 *       ... hero section ...
 *       <FeaturedReviews />
 *       ... features section ...
 *       ... footer ...
 *     </>
 *   );
 * }
 * 
 * Component akan otomatis:
 * 1. Fetch featured reviews dari API
 * 2. Display di grid responsif (1 kolom mobile, 3 kolom desktop)
 * 3. Show admin replies jika ada
 * 4. Handle loading state
 * 5. Hide section jika tidak ada reviews
 */
