import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Star,     
  Info,
  ChevronLeft,
  ChevronRight,
  Plus,
  Hash,
  X
} from 'lucide-react';
import Preloader from '../../components/common/Preloader';
import AdminMedicalRecordsModal from '../../components/admin/AdminMedicalRecordsModal';

const Appointment = () => {
  // API URLs
  const APPOINTMENTS_API_URL = '/api/appointments';
  const MEMBERS_API_URL = '/api/members';
  const THERAPISTS_API_URL = '/api/therapists';
  const TREATMENTS_API_URL = '/api/treatments';
  const MEMBER_HISTORY_API_URL = '/api/members/history';

  const Token = localStorage.getItem('token')

  // Check token on mount
  useEffect(() => {
    if (!Token) {
      setError('⚠️ Token tidak ditemukan. Silakan login kembali.');
      console.warn('❌ No token in localStorage for admin access');
    }
  }, [Token]);
  const [appointments, setAppointments] = useState([]);
  const [members, setMembers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [stats, setStats] = useState({
    confirmed_count: 0,
    completed_count: 0,
    total_count: 0,
    total_revenue: 0,
    completed_revenue: 0
  });
  
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  

  
  const [formData, setFormData] = useState({
    customer_name: '', member_id: '', treatment: '', treatment_id: '', therapist: '', therapist_id: '',
    date: '', time: '', amount: 0, status: 'confirmed', reminder_hours_before: 2
  });
  
  const [amountInput, setAmountInput] = useState('');
  const [loading, setLoading] = useState({
    appointments: true,
    members: true,
    therapists: true,
    treatments: true,
    stats: false
  });
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  
  // State untuk reminder management
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedAppointmentForReminder, setSelectedAppointmentForReminder] = useState(null);
  const [reminderStatus, setReminderStatus] = useState(null);
  const [reminderHours, setReminderHours] = useState(2);
  const [reminderSending, setReminderSending] = useState(false);
  
  // State untuk medical records management
  const [medicalRecordsModalOpen, setMedicalRecordsModalOpen] = useState(false);
  const [selectedAppointmentForMedical, setSelectedAppointmentForMedical] = useState(null);
  const [medicalRecordsCounts, setMedicalRecordsCounts] = useState({}); // Track medical records count per appointment
  
  // State untuk notification modal
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    title: '',
    message: ''
  });

  useEffect(() => { 
    fetchAllData(); 
  }, [refreshKey]);

  // Auto-hide notification setelah 3 detik
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchAllData = async () => {
    try {
      setLoading({
        appointments: true,
        members: true,
        therapists: true,
        treatments: true,
        stats: false
      });

      const [appointmentsRes, membersRes, therapistsRes, treatmentsRes] = await Promise.all([
        axios.get(APPOINTMENTS_API_URL,{headers: {Authorization: `Bearer ${Token}`}}),
        axios.get(MEMBERS_API_URL,{headers: {Authorization: `Bearer ${Token}`}}),
        axios.get(THERAPISTS_API_URL,{headers: {Authorization: `Bearer ${Token}`}}),
        axios.get(TREATMENTS_API_URL,{headers: {Authorization: `Bearer ${Token}`}})
      ]);
     
      const appointmentsData = appointmentsRes.data.data.map(app => ({ 
        ...app, 
        status: app.status || 'confirmed',
        amount: parseFloat(app.amount) || 0
      }));
      
      setAppointments(appointmentsData);
      setMembers(membersRes.data.data ? membersRes.data : { data: membersRes.data });
      setTherapists(therapistsRes.data.data ? therapistsRes.data : { data: therapistsRes.data });
      setTreatments(treatmentsRes.data.data ? treatmentsRes.data : { data: treatmentsRes.data });
      
      calculateStatistics(appointmentsData);
      
      // Fetch medical records count for each appointment
      await fetchMedicalRecordsCounts(appointmentsData);
      
      setError(null);
    } catch (err) { 
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Gagal memuat data';
      setError(`❌ ${errorMessage}`);
      console.error('Error fetching data:', {
        status: err.response?.status,
        message: err.message,
        data: err.response?.data,
        token: Token ? 'ada' : 'tidak ada'
      });
    } finally { 
      setLoading({
        appointments: false,
        members: false,
        therapists: false,
        treatments: false,
        stats: false
      });
    }
  };

  // Fetch medical records count for all appointments
  const fetchMedicalRecordsCounts = async (appointmentsData) => {
    try {
      const counts = {};
      
      // Fetch count for each appointment
      const countPromises = appointmentsData.map(app =>
        axios.get(`/api/medical-records/appointment/${app.id}/count`, {
          headers: { Authorization: `Bearer ${Token}` }
        })
        .then(res => {
          if (res.data.success) {
            counts[app.id] = res.data.data.count;
          }
        })
        .catch(err => {
          console.warn(`Could not fetch medical records count for appointment ${app.id}:`, err.message);
          counts[app.id] = 0;
        })
      );
      
      await Promise.all(countPromises);
      setMedicalRecordsCounts(counts);
      console.log('📊 Medical records counts fetched:', counts);
    } catch (error) {
      console.error('Error fetching medical records counts:', error);
    }
  };

  const calculateStatistics = (appointmentsData) => {
    const confirmed_count = appointmentsData.filter(app => app.status === 'confirmed').length;
    const completed_count = appointmentsData.filter(app => app.status === 'completed').length;
    const total_count = appointmentsData.length;
    
    const total_revenue = appointmentsData.reduce((sum, app) => sum + (app.amount || 0), 0);
    const completed_revenue = appointmentsData
      .filter(app => app.status === 'completed')
      .reduce((sum, app) => sum + (app.amount || 0), 0);
    
    setStats({
      confirmed_count,
      completed_count,
      total_count,
      total_revenue,
      completed_revenue
    });
  };

  // Reminder Management Functions
  const openReminderModal = async (appointment) => {
    setSelectedAppointmentForReminder(appointment);
    setReminderHours(appointment.reminder_hours_before || 2);
    
    try {
      const response = await axios.get(
        `/api/reminders/${appointment.appointment_id || appointment.id}/status`,
        { headers: { Authorization: `Bearer ${Token}` } }
      );
      setReminderStatus(response.data);
    } catch (err) {
      setReminderStatus({
        reminder_sent: appointment.reminder_sent || false,
        reminder_sent_at: appointment.reminder_sent_at || null
      });
    }
    
    setReminderModalOpen(true);
  };

  const closeReminderModal = () => {
    setReminderModalOpen(false);
    setSelectedAppointmentForReminder(null);
    setReminderStatus(null);
    setReminderHours(2);
  };

  const sendReminderNow = async () => {
    if (!selectedAppointmentForReminder) return;
    
    setReminderSending(true);
    try {
      const appointmentId = selectedAppointmentForReminder.appointment_id || selectedAppointmentForReminder.id;
      
      const response = await axios.post(
        `/api/reminders/${appointmentId}/send`,
        {},
        { headers: { Authorization: `Bearer ${Token}` } }
      );
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Reminder Terkirim!',
        message: `Email reminder berhasil dikirim ke pelanggan`
      });
      
      // Update local state
      const updatedAppointments = appointments.map(app => 
        app.id === selectedAppointmentForReminder.id 
          ? { ...app, reminder_sent: true, reminder_sent_at: new Date().toISOString() }
          : app
      );
      setAppointments(updatedAppointments);
      
      setReminderStatus({
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString()
      });
      
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Mengirim Reminder',
        message: err.response?.data?.message || 'Terjadi kesalahan saat mengirim reminder'
      });
    } finally {
      setReminderSending(false);
    }
  };

  const resetReminder = async () => {
    if (!selectedAppointmentForReminder) return;
    
    setReminderSending(true);
    try {
      const appointmentId = selectedAppointmentForReminder.appointment_id || selectedAppointmentForReminder.id;
      
      await axios.put(
        `/api/reminders/${appointmentId}/reset`,
        {},
        { headers: { Authorization: `Bearer ${Token}` } }
      );
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Reminder Direset!',
        message: `Status reminder berhasil direset`
      });
      
      // Update local state
      const updatedAppointments = appointments.map(app => 
        app.id === selectedAppointmentForReminder.id 
          ? { ...app, reminder_sent: false, reminder_sent_at: null }
          : app
      );
      setAppointments(updatedAppointments);
      
      setReminderStatus({
        reminder_sent: false,
        reminder_sent_at: null
      });
      
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Mereset Reminder',
        message: err.response?.data?.message || 'Terjadi kesalahan saat mereset reminder'
      });
    } finally {
      setReminderSending(false);
    }
  };

  // Medical Records Management Functions
  const openMedicalRecordsModal = (appointment) => {
    setSelectedAppointmentForMedical(appointment);
    setMedicalRecordsModalOpen(true);
  };

  const closeMedicalRecordsModal = () => {
    setMedicalRecordsModalOpen(false);
    setSelectedAppointmentForMedical(null);
  };

  const handleMedicalRecordsSaved = (medicalRecord) => {
    // Refresh appointment data
    setRefreshKey(prev => prev + 1);
    
    setNotification({
      show: true,
      type: 'success',
      title: 'Rekam Medis Tersimpan!',
      message: 'Data rekam medis berhasil disimpan'
    });
  };

  const addToMemberHistory = async (appointment) => {
    try {
      if (appointment.status !== 'completed' || !appointment.member_id) {
        return;
      }

      const member = members.find(m => m.id == appointment.member_id);
      if (!member) {
        return;
      }

      const historyData = {
        member_id: appointment.member_id,
        appointment_id: appointment.id,
        customer_name: appointment.customer_name,
        treatment_name: appointment.treatment,
        therapist: appointment.therapist,
        date: appointment.date,
        time: appointment.time,
        amount: appointment.amount,
        status: 'completed',
        notes: `Appointment selesai pada ${appointment.date}`
      };

      await axios.post(MEMBER_HISTORY_API_URL, historyData);
    } catch (err) {
      // Silent fail
    }
  };

  const updateMemberData = async (memberId, appointment) => {
    try {
      const memberResponse = await axios.get(`${MEMBERS_API_URL}/${memberId}`);
      const member = memberResponse.data;
      
      const currentVisits = member.total_visits || 0;
      const newTotalVisits = currentVisits + 1;
      
      await axios.put(`${MEMBERS_API_URL}/${memberId}`, {
        total_visits: newTotalVisits,
        last_visit: appointment.date
      });
      
      setMembers(prevMembers => 
        prevMembers.map(m => 
          m.id == memberId 
            ? { ...m, total_visits: newTotalVisits, last_visit: appointment.date }
            : m
        )
      );
      
      await addToMemberHistory(appointment);
    } catch (err) {
      // Silent fail
    }
  };

  const updateTherapistStatistics = async (therapistName, oldStatus, newStatus) => {
    try {
      if (!therapistName) return;
      
      const therapistsList = therapists.data || therapists || [];
      const therapist = therapistsList.find(t => t.name === therapistName);
      if (!therapist) {
        return;
      }

      await axios.put(`${THERAPISTS_API_URL}/${therapist.id}`, {
        total_confirmed: calculateTherapistConfirmed(therapist, oldStatus, newStatus),
        total_completed: calculateTherapistCompleted(therapist, oldStatus, newStatus),
        total_treatments: newStatus === 'completed' ? (therapist.total_treatments || 0) + 1 : therapist.total_treatments
      });

      const therapistsResponse = await axios.get(THERAPISTS_API_URL);
      setTherapists(therapistsResponse.data);
      
    } catch (err) {
      // Silent fail
    }
  };

  const calculateTherapistConfirmed = (therapist, oldStatus, newStatus) => {
    let confirmed = therapist.total_confirmed || 0;
    
    if (oldStatus === 'confirmed' && newStatus !== 'confirmed') {
      confirmed = Math.max(0, confirmed - 1);
    } else if (oldStatus !== 'confirmed' && newStatus === 'confirmed') {
      confirmed = confirmed + 1;
    } else if (!oldStatus && newStatus === 'confirmed') {
      confirmed = confirmed + 1;
    }
    
    return confirmed;
  };

  const calculateTherapistCompleted = (therapist, oldStatus, newStatus) => {
    let completed = therapist.total_completed || 0;
    
    if (oldStatus === 'completed' && newStatus !== 'completed') {
      completed = Math.max(0, completed - 1);
    } else if (oldStatus !== 'completed' && newStatus === 'completed') {
      completed = completed + 1;
    } else if (!oldStatus && newStatus === 'completed') {
      completed = completed + 1;
    }
    
    return completed;
  };

  const handleQuickStatusUpdate = async (id, currentStatus) => {
    let nextStatus;
    
    if (currentStatus === 'confirmed') {
      nextStatus = 'completed';
    } else if (currentStatus === 'completed') {
      nextStatus = 'confirmed';
    }
    
    setActionLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) return;
      
      await axios.put(`${APPOINTMENTS_API_URL}/${id}/complete`, {
        status: nextStatus
      }, { headers: { Authorization: `Bearer ${Token}` } });
      
      const updatedAppointments = appointments.map(app => 
        app.id === id ? { ...app, status: nextStatus } : app
      );
      setAppointments(updatedAppointments);
      
      calculateStatistics(updatedAppointments);
      
      if (appointment.therapist_name || appointment.therapist) {
        await updateTherapistStatistics(appointment.therapist_name || appointment.therapist, currentStatus, nextStatus);
      }
      
      if (nextStatus === 'completed' && currentStatus !== 'completed') {
        if (appointment.member_id) {
          await updateMemberData(appointment.member_id, appointment);
        }
      }
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Status Berhasil Diperbarui!',
        message: `Appointment berhasil diubah menjadi ${getStatusText(nextStatus)}`
      });
      
    } catch (err) { 
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Memperbarui Status',
        message: err.response?.data?.message || 'Terjadi kesalahan saat memperbarui status'
      });
    } finally { 
      setActionLoading(prev => ({ ...prev, [id]: false })); 
    }
  };

  const filteredMembersResults = useMemo(() => {
    if (!memberSearch) return [];
    
    const membersList = members.data || members || [];
    if (!Array.isArray(membersList)) return [];
       
    return membersList.filter(m => 
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
      m.id.toString().includes(memberSearch)
    ).slice(0, 5);
  }, [members, memberSearch]);

  const selectMember = (member) => {
    setFormData({ ...formData, member_id: member.id, customer_name: member.name });
    setMemberSearch(member.name);
    setShowSearchDropdown(false);
  };

  const filteredAppointments = useMemo(() => {
    if (selectedStatus === 'all') return appointments;
    return appointments.filter(app => app.status === selectedStatus);
  }, [appointments, selectedStatus]);

  const handleAdd = () => {
    setIsAdding(true);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setFormData({
      customer_name: '', member_id: '', treatment: '', treatment_id: '', therapist: '', therapist_id: '',
      date: today,
      time: time, amount: 0, status: 'confirmed'
    });
    setAmountInput('0');
    setMemberSearch('');
  };

  const handleEdit = (app) => {
    setEditingAppointment(app.id);
    
    setFormData({ 
      customer_name: app.customer_name || '',
      member_id: app.member_id || '',
      treatment: app.treatment_name || app.treatment || '',
      treatment_id: app.treatment_id || '',
      therapist: app.therapist_name || app.therapist || '',
      therapist_id: app.therapist_id || '',
      date: app.date || '',
      time: app.time || '',
      amount: parseFloat(app.amount) || 0,
      status: app.status || 'confirmed',
      reminder_hours_before: app.reminder_hours_before || 2
    });
    setAmountInput(app.amount.toString());
    setMemberSearch(app.customer_name || '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const numericValue = parseFloat(value) || 0;
      setFormData({ ...formData, amount: numericValue });
      setAmountInput(value);
    } else if (name === 'treatment') {
      const treatmentsList = treatments.data || treatments || [];
      const tr = treatmentsList.find(t => t.name === value);
      
      // PERBAIKAN: Pastikan price dari treatment diambil dengan benar
      const treatmentPrice = tr ? parseInt(tr.price) || 0 : 0;
      
      setFormData({ 
        ...formData, 
        treatment: value,
        treatment_id: tr ? tr.id : '',
        amount: treatmentPrice // Set amount dari harga treatment
      });
      setAmountInput(treatmentPrice.toString());
    } else if (name === 'therapist') {
      const therapistsList = therapists.data || therapists || [];
      const th = therapistsList.find(t => t.name === value);
      setFormData({ 
        ...formData, 
        therapist: value,
        therapist_id: th ? th.id : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!formData.customer_name.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama pelanggan wajib diisi'
      });
      return;
    }
    
    if (!formData.treatment.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Perawatan wajib diisi'
      });
      return;
    }
    
    if (!formData.therapist.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Terapis wajib diisi'
      });
      return;
    }

    try {
      const dataToSend = {
        member_id: formData.member_id,
        customer_name: formData.customer_name,
        treatment_id: formData.treatment_id,
        therapist_id: formData.therapist_id,
        date: formData.date,
        time: formData.time,
        amount: formData.amount,
        status: formData.status,
        reminder_hours_before: formData.reminder_hours_before || 2
      };

      let response;
      if (isAdding) {
        response = await axios.post(APPOINTMENTS_API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        const newAppointment = response.data.data || response.data;
        const updatedAppointments = [newAppointment, ...appointments];
        setAppointments(updatedAppointments);
        calculateStatistics(updatedAppointments);
        
        if (formData.therapist) {
          await updateTherapistStatistics(formData.therapist, null, formData.status);
        }
        
        setIsAdding(false);
        
        if (formData.status === 'completed' && formData.member_id) {
          await updateMemberData(formData.member_id, newAppointment);
        }
        
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil Menambahkan!',
          message: 'Janji temu baru berhasil ditambahkan'
        });
      } else {
        const oldAppointment = appointments.find(a => a.id === editingAppointment);
        
        response = await axios.put(`${APPOINTMENTS_API_URL}/${editingAppointment}`, dataToSend, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        const updatedAppointment = response.data.data || response.data;
        const updatedAppointments = appointments.map(app => 
          app.id === editingAppointment ? updatedAppointment : app
        );
        setAppointments(updatedAppointments);
        calculateStatistics(updatedAppointments);
        
        const oldTherapistName = oldAppointment?.therapist_name || oldAppointment?.therapist;
        const newTherapistName = formData.therapist;
        
        if (oldAppointment && (oldAppointment.status !== formData.status || oldTherapistName !== newTherapistName)) {
          if (oldTherapistName) {
            await updateTherapistStatistics(oldTherapistName, oldAppointment.status, null);
          }
          
          if (newTherapistName) {
            await updateTherapistStatistics(newTherapistName, null, formData.status);
          }
        }
        
        if (oldAppointment?.status !== 'completed' && formData.status === 'completed' && formData.member_id) {
          await updateMemberData(formData.member_id, updatedAppointment);
        }
        
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil Memperbarui!',
          message: 'Data janji temu berhasil diperbarui'
        });
      }
      
      handleCancel();
    } catch (err) { 
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data'
      });
    }
  };

  const handleCancel = () => {
    setEditingAppointment(null);
    setIsAdding(false);
    setMemberSearch('');
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val || 0);

  // Format date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date from DD/MM/YYYY to YYYY-MM-DD for storage
  const formatDateForStorage = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const formatDisplayDate = (dateStr, timeStr) => {
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}, ${timeStr}`;
    } catch (e) {
      return `${dateStr}, ${timeStr}`;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'confirmed';
    switch(normalizedStatus) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'confirmed': 'Dikonfirmasi',
      'completed': 'Selesai'
    };
    return statusMap[status] || status;
  };

  // Generate time slots (30 min interval, 08:00-20:00)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 20;
    const interval = 30;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const isLoading = Object.values(loading).some(l => l === true);

  if (isLoading) {
    return <Preloader type="partial" text="Memuat data appointment..." />;
  }

  if (error && appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Janji Temu</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola, konfirmasi, dan selesaikan perawatan janji temu.</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="bg-gray-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors duration-200 w-full sm:w-auto"
        >
          + Tambah Janji Temu
        </button>
      </div>

      {/* Statistik Janji Temu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.confirmed_count}</div>
              <div className="text-xs sm:text-sm text-gray-600">Dikonfirmasi</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm sm:text-base font-bold">✓</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-gray-500">Janji temu disetujui</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed_count}</div>
              <div className="text-xs sm:text-sm text-gray-600">Selesai</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="text-green-600" size={20} />
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-gray-500">Perawatan selesai (Ditambahkan ke Riwayat)</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-brown-600">{stats.total_count}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brown-100 rounded-full flex items-center justify-center">
              <Hash className="text-brown-600" size={20} />
            </div>
          </div>
          <div className="mt-2 text-[10px] sm:text-xs text-gray-500">Semua janji temu</div>
        </div>
      </div>

      {/* Legenda Status & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-4">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2"></div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-800">Dikonfirmasi</span>
                <div className="text-[9px] sm:text-[10px] text-gray-500 leading-none">Janji temu disetujui</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-gray-800">Selesai</span>
                <div className="text-[9px] sm:text-[10px] text-gray-500 leading-none">Perawatan selesai (Ditambahkan ke Riwayat)</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brown-500"
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="completed">Selesai</option>
            </select>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-200 transition-colors duration-200"
            >
              Segarkan
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Pendapatan */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-3 sm:p-4 border border-green-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800">Ringkasan Pendapatan</h3>
            <div className="text-[10px] sm:text-xs text-gray-600">Hanya janji temu yang selesai</div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-lg sm:text-2xl font-bold text-green-700">{formatRupiah(stats.completed_revenue)}</div>
            <div className="text-[10px] sm:text-xs text-gray-600">Total Pendapatan</div>
          </div>
        </div>
      </div>

      {/* Tabel Utama */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500 uppercase text-[9px] sm:text-[10px] font-black tracking-widest">
                <th className="p-2 sm:p-4">ID</th>
                <th className="p-2 sm:p-4">Pelanggan</th>
                <th className="p-2 sm:p-4">Perawatan</th>
                <th className="p-2 sm:p-4">Jadwal</th>
                <th className="p-2 sm:p-4">Jumlah</th>
                <th className="p-2 sm:p-4 text-center">Status</th>
                <th className="p-2 sm:p-4 text-center">Reminder</th>
                <th className="p-2 sm:p-4 text-center">Aksi Cepat</th>
                <th className="p-2 sm:p-4 text-center">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 sm:p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-xs sm:text-base text-gray-400">Tidak ada janji temu ditemukan</p>
                      {selectedStatus !== 'all' && (
                        <button 
                          onClick={() => setSelectedStatus('all')}
                          className="mt-2 text-brown-600 hover:text-brown-700 text-xs sm:text-sm"
                        >
                          Tampilkan semua janji temu
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2 sm:p-4 font-medium text-gray-600 text-[10px] sm:text-sm">
                      {app.appointment_id || `APT-${app.id}`}
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="font-medium text-[11px] sm:text-base">{app.customer_name}</div>
                      {app.member_id && (
                        <div className="text-[9px] sm:text-[10px] text-gray-500">
                          ID Member: {app.member_id}
                        </div>
                      )}
                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="text-[11px] sm:text-base">{app.treatment_name}</div>
                      <div className="text-[9px] sm:text-[10px] text-brown-600 font-bold uppercase">{app.therapist_name}</div>
                    </td>
                    <td className="p-2 sm:p-4 text-gray-500 text-[10px] sm:text-sm">
                      <div>{formatDisplayDate(app.date, app.time)}</div>
                    </td>
                    <td className="p-2 sm:p-4 font-bold text-green-700 text-[10px] sm:text-sm">
                      {formatRupiah(app.amount)}
                    </td>
                    <td className="p-2 sm:p-4 text-center font-bold">
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] uppercase ${
                        getStatusColor(app.status)
                      }`}>
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 text-center">
                      <button 
                        onClick={() => openReminderModal(app)}
                        className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase transition-all ${
                          app.reminder_sent 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                        title={app.reminder_sent ? 'Reminder sudah dikirim' : 'Kirim reminder'}
                      >
                        {app.reminder_sent ? '✓ Terkirim' : 'Belum kirim'}
                      </button>
                    </td>
                    <td className="p-2 sm:p-4 text-center">
                      {app.status === 'confirmed' && (
                        <button 
                          onClick={() => handleQuickStatusUpdate(app.id, 'confirmed')} 
                          disabled={actionLoading[app.id]}
                          className="bg-green-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase shadow-sm hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
                        >
                          {actionLoading[app.id] ? 'Proses...' : 'Selesai'}
                        </button>
                      )}
                      {app.status === 'completed' && (
                        <span className="text-green-500 text-[9px] sm:text-[10px] font-bold italic tracking-wider px-2 py-1">
                          SELESAI
                        </span>
                      )}
                    </td>
                    <td className="p-2 sm:p-4 text-center">
                      <div className="flex justify-center gap-1 sm:gap-2 flex-nowrap items-center">
                        <button 
                          onClick={() => handleEdit(app)} 
                          className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => openMedicalRecordsModal(app)}
                          className="bg-purple-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-700 transition-colors duration-200 relative whitespace-nowrap flex-shrink-0"
                          title="Manage medical records for this appointment"
                        >
                          Rekam Medis
                          {medicalRecordsCounts[app.id] > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {medicalRecordsCounts[app.id]}
                            </span>
                          )}
                        </button>
                        <button 
                          onClick={async () => { 
                            if(window.confirm('Apakah Anda yakin ingin menghapus janji temu ini?')) {
                              try {
                                const token = localStorage.getItem('token');

                                await axios.delete(`${APPOINTMENTS_API_URL}/${app.id}`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                const updatedAppointments = appointments.filter(a => a.id !== app.id);
                                setAppointments(updatedAppointments);
                                calculateStatistics(updatedAppointments);
                                
                                if (app.therapist_name) {
                                  await updateTherapistStatistics(app.therapist_name, app.status, null);
                                }
                                
                                setNotification({
                                  show: true,
                                  type: 'success',
                                  title: 'Berhasil Menghapus!',
                                  message: 'Janji temu berhasil dihapus'
                                });
                              } catch (err) {
                                setNotification({
                                  show: true,
                                  type: 'error',
                                  title: 'Gagal Menghapus',
                                  message: err.response?.data?.message || 'Terjadi kesalahan saat menghapus data'
                                });
                              }
                            }
                          }} 
                          className="bg-red-100 text-red-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm hover:bg-red-200 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
                          title="Hapus appointment"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right max-w-[90vw] sm:max-w-md">
          <div className={`rounded-lg shadow-2xl p-3 sm:p-4 min-w-[280px] sm:min-w-[320px] ${
            notification.type === 'success' 
              ? 'bg-green-50 border-l-4 border-green-500' 
              : 'bg-red-50 border-l-4 border-red-500'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${
                notification.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-2 sm:ml-3 flex-1">
                <h3 className={`text-xs sm:text-sm font-bold ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.title}
                </h3>
                <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className={`ml-2 sm:ml-3 flex-shrink-0 ${
                  notification.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Management Modal */}
      {reminderModalOpen && selectedAppointmentForReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md space-y-4 sm:space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Manajemen Reminder</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedAppointmentForReminder.appointment_id || selectedAppointmentForReminder.id}</p>
              </div>
              <button 
                onClick={closeReminderModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Appointment Info */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
              <div className="text-sm">
                <div className="text-xs text-gray-600">Pelanggan:</div>
                <div className="font-bold text-gray-800">{selectedAppointmentForReminder.customer_name}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs text-gray-600">Jadwal:</div>
                <div className="font-bold text-gray-800">
                  {formatDisplayDate(selectedAppointmentForReminder.date, selectedAppointmentForReminder.time)}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-xs text-gray-600">Email Member:</div>
                <div className="font-bold text-gray-800 text-xs break-all">
                  {selectedAppointmentForReminder.member_id ? `ID: ${selectedAppointmentForReminder.member_id}` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Reminder Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Status Reminder</h4>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                {reminderStatus?.reminder_sent ? (
                  <div className="flex items-start gap-2">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <div>
                      <div className="text-xs font-bold text-green-700">Reminder Sudah Dikirim</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Waktu: {new Date(reminderStatus.reminder_sent_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="text-orange-600 mt-0.5">⚠</div>
                    <div>
                      <div className="text-xs font-bold text-orange-700">Reminder Belum Dikirim</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Klik "Kirim Sekarang" untuk mengirim reminder manual
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reminder Hours Setting */}
            <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <label className="block text-xs font-bold text-blue-900 uppercase tracking-wide">
                Atur Jam Reminder
              </label>
              <select 
                value={reminderHours}
                onChange={(e) => setReminderHours(parseInt(e.target.value))}
                className="w-full border border-blue-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={1}>1 Jam sebelumnya</option>
                <option value={2}>2 Jam sebelumnya</option>
                <option value={3}>3 Jam sebelumnya</option>
                <option value={4}>4 Jam sebelumnya</option>
                <option value={24}>1 Hari sebelumnya</option>
              </select>
              <div className="text-xs text-blue-700 bg-white p-2 rounded border border-blue-100">
                <strong>Dipilih:</strong> Reminder akan dikirim {reminderHours} jam sebelum appointment
              </div>
            </div>

            {/* Notes */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800">
              <strong>Catatan:</strong> Kirim reminder secara manual atau biarkan sistem otomatis mengirim sesuai jadwal
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {reminderStatus?.reminder_sent && (
                <button 
                  onClick={resetReminder}
                  disabled={reminderSending}
                  className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors text-sm"
                >
                  {reminderSending ? '⏳ Proses...' : 'Reset Reminder'}
                </button>
              )}
              <button 
                onClick={closeReminderModal}
                className="flex-1 py-2 px-3 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Tutup
              </button>
              <button 
                onClick={sendReminderNow}
                disabled={reminderSending || reminderStatus?.reminder_sent}
                className={`flex-1 py-2 px-3 font-bold rounded-lg transition-colors text-sm ${
                  reminderStatus?.reminder_sent
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                }`}
              >
                {reminderSending ? '⏳ Mengirim...' : reminderStatus?.reminder_sent ? 'Sudah Terkirim' : '📧 Kirim Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {(editingAppointment || isAdding) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md space-y-3 sm:space-y-4 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">{isAdding ? 'Booking Baru' : 'Perbarui Booking'}</h3>
              <button 
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4 text-left">
              {/* Cari Member */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Cari Member
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {editingAppointment ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50">
                    <div className="font-medium text-gray-800">{formData.customer_name || 'N/A'}</div>
                    {formData.member_id && (
                      <div className="text-xs text-gray-500 mt-1">ID Member: {formData.member_id}</div>
                    )}
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                      value={memberSearch}
                      onChange={(e) => { 
                        const value = e.target.value;
                        setMemberSearch(value); 
                        setFormData({ ...formData, customer_name: value });
                        setShowSearchDropdown(true); 
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      placeholder="Ketik nama atau ID..."
                    />
                    <div className="text-xs text-gray-500 mt-1">Cari berdasarkan nama atau ID member</div>
                    {showSearchDropdown && filteredMembersResults.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredMembersResults.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => selectMember(m)} 
                            className="p-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium">{m.name}</div>
                              <div className="text-xs text-gray-500">ID: {m.id} | Kunjungan: {m.total_visits || 0}</div>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              Pilih
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Tanggal */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Tanggal Janji Temu
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {editingAppointment ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50">
                    <div className="font-medium text-gray-800">{formatDateForDisplay(formData.date) || 'N/A'}</div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="date" 
                        value={formData.date ? formatDateForDisplay(formData.date) : ''} 
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers and forward slashes
                          const filtered = value.replace(/[^0-9/]/g, '');
                          
                          // Auto-add slashes
                          let formatted = filtered;
                          if (filtered.length === 2 && !filtered.includes('/')) {
                            formatted = filtered + '/';
                          } else if (filtered.length === 5 && filtered.split('/').length === 2) {
                            formatted = filtered + '/';
                          }
                          
                          // Update display value
                          e.target.value = formatted;
                          
                          // If complete date format (DD/MM/YYYY), convert and save
                          if (formatted.length === 10) {
                            const storageDate = formatDateForStorage(formatted);
                            setFormData({ ...formData, date: storageDate });
                          } else {
                            setFormData({ ...formData, date: '' });
                          }
                        }} 
                        placeholder="DD/MM/YYYY"
                        maxLength="10"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                      />
                      {/* Hidden date input for calendar picker */}
                      <input 
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="absolute right-0 top-0 w-10 h-full opacity-0 cursor-pointer"
                        style={{ zIndex: 2 }}
                      />
                      {/* Calendar icon */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Ketik manual (DD/MM/YYYY) atau klik icon kalender</div>
                  </>
                )}
              </div>

              {/* Waktu */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Waktu Janji Temu
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {editingAppointment ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50">
                    <div className="font-medium text-gray-800">{formData.time || 'N/A'}</div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                      {generateTimeSlots().map((time) => {
                        const isSelected = formData.time === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setFormData({ ...formData, time })}
                            className={`p-2 rounded-lg border-2 transition-all text-xs font-bold ${
                              isSelected 
                                ? 'bg-brown-600 border-brown-600 text-white shadow-md' 
                                : 'bg-white border-gray-200 text-gray-700 hover:border-brown-400 hover:bg-brown-50'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500">Pilih waktu janji temu (Jam operasional: 08:00 - 20:00)</div>
                    {formData.time && (
                      <div className="text-xs font-bold text-brown-600 bg-brown-50 px-3 py-2 rounded-md">
                        ✓ Waktu dipilih: {formData.time}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Perawatan */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Pilih Perawatan
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {editingAppointment ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50">
                    <div className="font-medium text-gray-800">{formData.treatment || 'N/A'}</div>
                  </div>
                ) : (
                  <>
                    <select 
                      name="treatment" 
                      value={formData.treatment} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                    >
                      <option value="">Pilih Perawatan</option>
                      {(treatments.data || treatments || []).map(t => (
                        <option key={t.id} value={t.name}>
                          {t.name} - {formatRupiah(t.price)}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500">Pilih jenis perawatan</div>
                  </>
                )}
              </div>

              {/* Terapis */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Pilih Terapis
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select 
                  name="therapist" 
                  value={formData.therapist} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                >
                  <option value="">Pilih Terapis</option>
                  {(therapists.data || therapists || []).map(th => (
                    <option key={th.id} value={th.name}>
                      {th.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500">Pilih terapis</div>
              </div>

              {/* Jumlah */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Jumlah Perawatan (IDR)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {editingAppointment ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50">
                    <div className="font-bold text-green-700">{formatRupiah(formData.amount)}</div>
                  </div>
                ) : (
                  <>
                    <input 
                      type="number" 
                      name="amount" 
                      value={amountInput} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-green-700 focus:ring-2 focus:ring-brown-500 outline-none" 
                      min="0"
                    />
                    <div className="text-xs text-gray-500">Masukkan jumlah perawatan dalam IDR</div>
                    <div className="text-sm font-bold text-green-700">
                      {formatRupiah(formData.amount)}
                    </div>
                  </>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Status Janji Temu
                </label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                >
                  <option value="confirmed">Dikonfirmasi - Janji temu disetujui</option>
                  <option value="completed">Selesai - Perawatan selesai</option>
                </select>
                
                <div className="text-xs text-gray-500">
                  Catatan: Mengubah status akan memperbarui statistik terapis
                </div>
              </div>

              {/* Reminder Hours */}
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">
                  Setting Reminder (Jam sebelum appointment)
                </label>
                <div className="flex items-center gap-3">
                  <select 
                    name="reminder_hours_before" 
                    value={formData.reminder_hours_before || 2} 
                    onChange={(e) => setFormData({ ...formData, reminder_hours_before: parseInt(e.target.value) })}
                    className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={1}>1 Jam sebelumnya</option>
                    <option value={2}>2 Jam sebelumnya</option>
                    <option value={3}>3 Jam sebelumnya</option>
                    <option value={4}>4 Jam sebelumnya</option>
                    <option value={24}>1 Hari sebelumnya</option>
                  </select>
                </div>
                <div className="text-xs text-blue-700 bg-white p-2 rounded border border-blue-100">
                  <strong>Dipilih:</strong> Reminder akan dikirim {formData.reminder_hours_before || 2} jam sebelum appointment
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button 
                onClick={handleCancel} 
                className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-md transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                className={`flex-1 py-2 text-white rounded-md font-bold transition-colors ${
                  isAdding 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isAdding ? 'Buat Janji Temu' : 'Perbarui Janji Temu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Records Modal */}
      <AdminMedicalRecordsModal
        isOpen={medicalRecordsModalOpen}
        onClose={closeMedicalRecordsModal}
        appointment={selectedAppointmentForMedical}
        onSuccess={handleMedicalRecordsSaved}
        token={Token}
      />
    </div>
  );
};

export default Appointment;

