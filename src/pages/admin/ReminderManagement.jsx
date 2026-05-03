/**
 * Example: Admin Reminder Management Component
 * 
 * This is a React component example for managing appointment reminders
 * Can be added to admin dashboard
 * 
 * Path: src/pages/admin/ReminderManagement.jsx
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReminderManagement = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const API_BASE = 'http://localhost:5000/api/reminders';

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [statsRes, pendingRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data.data);
      setPending(pendingRes.data.data);
      setHistory(historyRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('error', 'Failed to fetch reminder data');
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const handleSendAll = async () => {
    if (!window.confirm(`Send ${pending.length} reminder email(s)?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/send-all`, 
        { hours: 2 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('success', `${response.data.sent} reminders sent successfully!`);
      fetchAllData();
    } catch (error) {
      showNotification('error', 'Failed to send reminders');
    }
  };

  const handleSendSingle = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/${appointmentId}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification('success', 'Reminder sent successfully!');
      fetchAllData();
    } catch (error) {
      showNotification('error', 'Failed to send reminder');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Appointment Reminder Management</h1>
        <p className="text-gray-600 mt-2">Manage automatic reminder emails for appointments</p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-4 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Total Appointments</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total_appointments}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Reminders Sent</div>
            <div className="text-3xl font-bold text-green-600">{stats.reminders_sent}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Pending Reminders</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending_reminders}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-medium">Today Sent</div>
            <div className="text-3xl font-bold text-blue-600">{stats.today_reminders}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'pending'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pending Reminders ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sent History
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'pending' && (
            <div>
              {pending.length > 0 && (
                <button
                  onClick={handleSendAll}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send All ({pending.length})
                </button>
              )}

              {pending.length === 0 ? (
                <p className="text-gray-500">No pending reminders</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Appointment No</th>
                      <th className="text-left py-3">Customer</th>
                      <th className="text-left py-3">Treatment</th>
                      <th className="text-left py-3">Date & Time</th>
                      <th className="text-left py-3">Email</th>
                      <th className="text-left py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((apt) => (
                      <tr key={apt.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">{apt.appointment_id}</td>
                        <td className="py-3">{apt.member_name}</td>
                        <td className="py-3">{apt.treatment_name}</td>
                        <td className="py-3">{apt.date} {apt.time}</td>
                        <td className="py-3 text-sm">{apt.member_email}</td>
                        <td className="py-3">
                          <button
                            onClick={() => handleSendSingle(apt.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Send
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {history.length === 0 ? (
                <p className="text-gray-500">No reminder history</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Appointment No</th>
                      <th className="text-left py-3">Customer</th>
                      <th className="text-left py-3">Treatment</th>
                      <th className="text-left py-3">Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((apt) => (
                      <tr key={apt.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">{apt.appointment_id}</td>
                        <td className="py-3">{apt.member_name}</td>
                        <td className="py-3">{apt.treatment_name}</td>
                        <td className="py-3">{new Date(apt.reminder_sent_at).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderManagement;

/*
 * INTEGRATION STEPS:
 * 
 * 1. Add route di src/routes/adminRoutes.jsx:
 *    import ReminderManagement from '../pages/admin/ReminderManagement';
 *    <Route path="reminders" element={<ReminderManagement />} />
 * 
 * 2. Add menu item di admin sidebar:
 *    <Link to="/admin/reminders">
 *      <span>🔔</span> Reminders
 *    </Link>
 * 
 * 3. Component sudah siap digunakan!
 */
