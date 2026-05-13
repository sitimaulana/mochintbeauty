import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Check, X, Trash2, Send, Edit2 } from 'lucide-react';
import { getReviews, deleteReview, addAdminReply, toggleFeatured, toggleApproved, updateAdminReply, deleteAdminReply } from '../../api/client';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  
  // Get admin user dari localStorage (coba multiple keys)
  const getAdminUser = () => {
    let adminUser = localStorage.getItem('admin_user');
    if (adminUser) return JSON.parse(adminUser);
    
    let user = localStorage.getItem('user');
    if (user) return JSON.parse(user);
    
    let activeUser = localStorage.getItem('active_user');
    if (activeUser) return JSON.parse(activeUser);
    
    return null;
  };
  
  const adminUser = getAdminUser();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await getReviews();
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      alert('Gagal mengambil data review');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReviews = () => {
    switch (filter) {
      case 'pending':
        return reviews.filter(r => !r.adminReply);
      case 'featured':
        return reviews.filter(r => r.isFeatured);
      default:
        return reviews;
    }
  };

  const handleAddReply = async (reviewId) => {
    if (!replyText.trim()) {
      alert('Balasan tidak boleh kosong');
      return;
    }

    if (!adminUser || !adminUser.id) {
      alert('Error: Data admin tidak ditemukan. Silakan login kembali.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await addAdminReply(reviewId, {
        adminId: adminUser.id,
        adminReply: replyText
      });

      if (response.success) {
        alert('Balasan berhasil ditambahkan');
        setReplyText('');
        setSelectedReview(null);
        fetchReviews();
      }
    } catch (error) {
      alert('Gagal menambahkan balasan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeatured = async (reviewId, currentStatus) => {
    try {
      const response = await toggleFeatured(reviewId, !currentStatus);
      if (response.success) {
        alert(!currentStatus ? 'Review ditampilkan di homepage' : 'Review disembunyikan');
        fetchReviews();
      }
    } catch (error) {
      alert('Gagal mengubah status featured');
    }
  };

  const handleToggleApproved = async (reviewId, currentStatus) => {
    try {
      const response = await toggleApproved(reviewId, !currentStatus);
      if (response.success) {
        alert(!currentStatus ? 'Review disetujui' : 'Review ditolak');
        fetchReviews();
      }
    } catch (error) {
      alert('Gagal mengubah status approved');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Yakin ingin menghapus review ini?')) return;

    try {
      const response = await deleteReview(reviewId);
      if (response.success) {
        alert('Review berhasil dihapus');
        fetchReviews();
      }
    } catch (error) {
      alert('Gagal menghapus review');
    }
  };

  const handleEditAdminReply = (reviewId, currentReply) => {
    setEditingReplyId(reviewId);
    setEditReplyText(currentReply);
  };

  const handleUpdateAdminReply = async (reviewId) => {
    if (!editReplyText.trim()) {
      alert('Balasan tidak boleh kosong');
      return;
    }

    setSubmitting(true);
    try {
      const response = await updateAdminReply(reviewId, {
        adminReply: editReplyText
      });

      if (response.success) {
        alert('Balasan berhasil diperbarui');
        setEditingReplyId(null);
        setEditReplyText('');
        fetchReviews();
      }
    } catch (error) {
      alert('Gagal memperbarui balasan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdminReply = async (reviewId) => {
    if (!confirm('Yakin ingin menghapus balasan ini?')) return;

    try {
      const response = await deleteAdminReply(reviewId);
      if (response.success) {
        alert('Balasan berhasil dihapus');
        fetchReviews();
      }
    } catch (error) {
      alert('Gagal menghapus balasan');
    }
  };

  const filteredReviews = getFilteredReviews();

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#3E2723] mb-2">Review Management</h1>
        <p className="text-[#8D6E63]">Kelola review customer, balasan admin, dan tampilan di homepage</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 font-semibold transition-all ${
            filter === 'all'
              ? 'text-[#3E2723] border-b-2 border-[#3E2723]'
              : 'text-[#A1887F] hover:text-[#3E2723]'
          }`}
        >
          Semua ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-3 font-semibold transition-all ${
            filter === 'pending'
              ? 'text-[#3E2723] border-b-2 border-[#3E2723]'
              : 'text-[#A1887F] hover:text-[#3E2723]'
          }`}
        >
          Belum Dibalas ({reviews.filter(r => !r.adminReply).length})
        </button>
        <button
          onClick={() => setFilter('featured')}
          className={`px-6 py-3 font-semibold transition-all ${
            filter === 'featured'
              ? 'text-[#3E2723] border-b-2 border-[#3E2723]'
              : 'text-[#A1887F] hover:text-[#3E2723]'
          }`}
        >
          Featured ({reviews.filter(r => r.isFeatured).length})
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-[#A1887F]">Memuat review...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-[#A1887F]">Tidak ada review</div>
        ) : (
          filteredReviews.map(review => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[#3E2723]">{review.name}</h3>
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
                  <p className="text-sm text-[#A1887F]">
                    {new Date(review.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {/* Featured Button */}
                  <button
                    onClick={() => handleToggleFeatured(review.id, review.isFeatured)}
                    className={`p-2 rounded-lg transition-all ${
                      review.isFeatured
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-[#A1887F] hover:bg-yellow-100'
                    }`}
                    title={review.isFeatured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star size={18} />
                  </button>

                  {/* Approved Button */}
                  <button
                    onClick={() => handleToggleApproved(review.id, review.isApproved)}
                    className={`p-2 rounded-lg transition-all ${
                      review.isApproved
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                    title={review.isApproved ? 'Reject' : 'Approve'}
                  >
                    {review.isApproved ? <Check size={18} /> : <X size={18} />}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Review Comment */}
              <div className="bg-[#FDFBF7] rounded-xl p-4 mb-4 border border-gray-100">
                <p className="text-[#3E2723]">{review.comment}</p>
              </div>

              {/* Admin Reply Section */}
              {review.adminReply ? (
                <div className="bg-[#E8DDD9] rounded-xl p-4 mb-4 border-l-4 border-[#3E2723]">
                  {editingReplyId === review.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editReplyText}
                        onChange={(e) => setEditReplyText(e.target.value)}
                        placeholder="Edit balasan Anda di sini..."
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#8D6E63] outline-none resize-none"
                        rows="3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateAdminReply(review.id)}
                          disabled={submitting}
                          className="flex-1 bg-[#3E2723] text-white py-2 rounded-lg hover:bg-[#8D6E63] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Send size={16} /> Simpan Perubahan
                        </button>
                        <button
                          onClick={() => {
                            setEditingReplyId(null);
                            setEditReplyText('');
                          }}
                          className="px-4 py-2 bg-gray-300 text-[#3E2723] rounded-lg hover:bg-gray-400 transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 mb-3">
                        <MessageSquare size={18} className="text-[#3E2723] mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-[#3E2723] text-sm">
                            Balasan dari {review.adminName || 'Admin'}
                          </p>
                          <p className="text-[#3E2723] mt-2">{review.adminReply}</p>
                          <p className="text-xs text-[#A1887F] mt-2">
                            {new Date(review.repliedAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleEditAdminReply(review.id, review.adminReply)}
                          className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAdminReply(review.id)}
                          className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} /> Hapus Balasan
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-[#FFF3E0] rounded-xl p-4 border border-orange-200 mb-4">
                  {selectedReview === review.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan Anda di sini..."
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#8D6E63] outline-none resize-none"
                        rows="3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddReply(review.id)}
                          disabled={submitting}
                          className="flex-1 bg-[#3E2723] text-white py-2 rounded-lg hover:bg-[#8D6E63] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Send size={16} /> Kirim Balasan
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReview(null);
                            setReplyText('');
                          }}
                          className="px-4 py-2 bg-gray-300 text-[#3E2723] rounded-lg hover:bg-gray-400 transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedReview(review.id)}
                      className="text-[#3E2723] font-semibold flex items-center gap-2 hover:underline"
                    >
                      <MessageSquare size={16} /> Balas Review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
