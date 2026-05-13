import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Eye, Search, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const MedicalRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        '/api/medical-records',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data) {
        setRecords(response.data.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError('Gagal memuat data rekam medis');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchSearch = 
      (record.member_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.treatment_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || record.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'draft':
        return 'Draft';
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-[#8D6E63]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8D6E63] mb-2">Rekam Medis</h1>
          <p className="text-gray-600">Kelola data rekam medis dan foto treatment member</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari member, nama, atau treatment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="completed">Selesai</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchMedicalRecords}
              className="px-4 py-2 bg-[#8D6E63] text-white rounded-lg hover:bg-[#6D4C41] transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Tidak ada rekam medis yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Member</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Treatment</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Foto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{record.member_name || record.customer_name}</p>
                          <p className="text-xs text-gray-500">{record.member_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{record.treatment_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {record.before_image_url && (
                            <a
                              href={record.before_image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                            >
                              <ImageIcon size={14} />
                              Before
                            </a>
                          )}
                          {record.after_image_url && (
                            <a
                              href={record.after_image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                            >
                              <ImageIcon size={14} />
                              After
                            </a>
                          )}
                          {!record.before_image_url && !record.after_image_url && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                          {getStatusLabel(record.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.created_at 
                          ? new Date(record.created_at).toLocaleDateString('id-ID')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-[#8D6E63]/10 text-[#8D6E63] rounded hover:bg-[#8D6E63]/20 transition-colors"
                        >
                          <Eye size={16} />
                          <span className="text-sm">Lihat</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Detail Rekam Medis</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-white hover:opacity-80 transition-opacity"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Member Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informasi Member</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Nama</p>
                      <p className="font-semibold text-gray-900">{selectedRecord.member_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{selectedRecord.member_email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Treatment</p>
                      <p className="font-semibold text-gray-900">{selectedRecord.treatment_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRecord.status)}`}>
                        {getStatusLabel(selectedRecord.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medical Notes */}
                {selectedRecord.medical_notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Catatan Medis</h3>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {selectedRecord.medical_notes}
                    </p>
                  </div>
                )}

                {/* Diagnosis */}
                {selectedRecord.diagnosis && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Diagnosis</h3>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {selectedRecord.diagnosis}
                    </p>
                  </div>
                )}

                {/* Treatment Detail */}
                {selectedRecord.treatment_detail && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Detail Treatment</h3>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {selectedRecord.treatment_detail}
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                {selectedRecord.recommendations && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Rekomendasi</h3>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {selectedRecord.recommendations}
                    </p>
                  </div>
                )}

                {/* Images */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Foto Treatment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRecord.before_image_url && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">📷 Foto Before</p>
                        <img
                          src={selectedRecord.before_image_url}
                          alt="Before"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <a
                          href={selectedRecord.before_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-[#8D6E63] hover:underline"
                        >
                          Buka Fullsize
                        </a>
                      </div>
                    )}
                    {selectedRecord.after_image_url && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">📷 Foto After</p>
                        <img
                          src={selectedRecord.after_image_url}
                          alt="After"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <a
                          href={selectedRecord.after_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-[#8D6E63] hover:underline"
                        >
                          Buka Fullsize
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Dibuat: {selectedRecord.created_at 
                      ? new Date(selectedRecord.created_at).toLocaleString('id-ID')
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
