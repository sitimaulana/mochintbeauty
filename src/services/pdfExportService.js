import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/**
 * Draw simple table on PDF without autoTable plugin
 */
const drawTable = (pdf, columns, rows, startY, margin) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const colWidth = (pageWidth - 2 * margin) / columns.length;
  let yPosition = startY;
  const rowHeight = 8;
  const headerHeight = 10;

  // Draw header
  pdf.setFillColor(101, 67, 33); // brown
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);

  columns.forEach((col, i) => {
    pdf.rect(margin + i * colWidth, yPosition, colWidth, headerHeight, 'F');
    const text = col.toString();
    pdf.text(text, margin + i * colWidth + 2, yPosition + 6, { maxWidth: colWidth - 4 });
  });

  yPosition += headerHeight;

  // Draw rows
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  rows.forEach((row, rowIdx) => {
    // Check if need new page
    if (yPosition + rowHeight > pageHeight - 10) {
      pdf.addPage();
      yPosition = 20;
      
      // Redraw header on new page
      pdf.setFillColor(101, 67, 33);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      
      columns.forEach((col, i) => {
        pdf.rect(margin + i * colWidth, yPosition, colWidth, headerHeight, 'F');
        const text = col.toString();
        pdf.text(text, margin + i * colWidth + 2, yPosition + 6, { maxWidth: colWidth - 4 });
      });
      
      yPosition += headerHeight;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
    }

    // Alternate row colors
    if (rowIdx % 2 === 0) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');
    }

    // Draw row borders
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight);

    // Draw cell content
    pdf.setTextColor(0, 0, 0);
    row.forEach((cell, i) => {
      const text = cell.toString();
      pdf.text(text, margin + i * colWidth + 2, yPosition + 5, { maxWidth: colWidth - 4 });
    });

    yPosition += rowHeight;
  });

  return yPosition;
};

/**
 * Export dashboard data ke PDF dengan date range
 * @param {Array} appointments - Array data appointment
 * @param {Array} members - Array data members
 * @param {Array} therapists - Array data therapists
 * @param {String} startDate - Tanggal mulai (format: YYYY-MM-DD)
 * @param {String} endDate - Tanggal akhir (format: YYYY-MM-DD)
 */
export const generateDashboardPDF = async (
  appointments,
  members,
  therapists,
  startDate,
  endDate
) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    const margin = 15;

    // Set default font
    pdf.setFont('helvetica');

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(101, 67, 33); // brown color
    pdf.text('Laporan Dashboard', margin, yPosition);

    // Date range info
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const dateRangeText = `Periode: ${format(new Date(startDate), 'dd MMMM yyyy', { locale: idLocale })} - ${format(new Date(endDate), 'dd MMMM yyyy', { locale: idLocale })}`;
    pdf.text(dateRangeText, margin, yPosition);
    pdf.text(`Generated: ${format(new Date(), 'dd MMMM yyyy HH:mm:ss', { locale: idLocale })}`, margin, yPosition + 5);

    // Filter data berdasarkan date range
    const filteredAppointments = filterAppointmentsByDateRange(appointments, startDate, endDate);
    const filteredMembers = members;

    // Statistics Section
    yPosition += 15;
    pdf.setFontSize(14);
    pdf.setTextColor(101, 67, 33);
    pdf.text('Statistik Ringkasan', margin, yPosition);

    yPosition += 8;

    const stats = calculateStatistics(filteredAppointments, filteredMembers);

    const statsColumns = ['Metrik', 'Nilai'];
    const statsRows = [
      ['Total Member', stats.totalMembers.toString()],
      ['Member Aktif', stats.activeMembers.toString()],
      ['Total Janji Temu', stats.totalAppointments.toString()],
      ['Janji Temu Confirmed', stats.confirmedAppointments.toString()],
      ['Janji Temu Completed', stats.completedAppointments.toString()],
      ['Total Pendapatan', `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`],
      ['Rata-rata Pendapatan', `Rp ${stats.averageRevenue.toLocaleString('id-ID')}`]
    ];

    yPosition = drawTable(pdf, statsColumns, statsRows, yPosition, margin);

    // Top Therapists Section
    if (therapists.length > 0) {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      } else {
        yPosition += 10;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(101, 67, 33);
      pdf.text('Terapis Teratas', margin, yPosition);

      yPosition += 8;

      const topTherapistsData = generateTopTherapistsData(filteredAppointments, therapists);
      const therapistColumns = ['Nama', 'Janji Selesai', 'Total Janji', 'Status'];
      const therapistRows = topTherapistsData.map(t => [
        t.name,
        t.completedAppointments.toString(),
        t.totalAppointments.toString(),
        t.status || 'Aktif'
      ]);

      yPosition = drawTable(pdf, therapistColumns, therapistRows, yPosition, margin);
    }

    // Appointments Section
    if (filteredAppointments.length > 0) {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      } else {
        yPosition += 10;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(101, 67, 33);
      pdf.text('Detail Janji Temu (Max 30 baris)', margin, yPosition);

      yPosition += 8;

      const appointmentColumns = ['Tanggal', 'Jam', 'Pasien', 'Perawatan', 'Terapis', 'Status', 'Biaya'];
      const appointmentRows = filteredAppointments.slice(0, 30).map(a => [
        a.date ? format(new Date(a.date), 'dd/MM/yyyy', { locale: idLocale }) : '-',
        a.time || '-',
        (a.customer_name || '-').substring(0, 15),
        (a.treatment || '-').substring(0, 12),
        (a.therapist_name || a.therapist || '-').substring(0, 12),
        a.status || '-',
        `Rp ${(parseFloat(a.amount) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
      ]);

      yPosition = drawTable(pdf, appointmentColumns, appointmentRows, yPosition, margin);
    }

    // Download PDF
    const fileName = `Dashboard_${format(new Date(startDate), 'yyyy-MM-dd')}_sampai_${format(new Date(endDate), 'yyyy-MM-dd')}.pdf`;
    pdf.save(fileName);

    return { success: true, message: 'PDF berhasil diunduh' };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, message: 'Gagal membuat PDF: ' + error.message };
  }
};

/**
 * Filter appointments berdasarkan date range
 */
const filterAppointmentsByDateRange = (appointments, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return appointments.filter(app => {
    if (!app.date) return false;
    
    try {
      let appDate = new Date(app.date);
      return appDate >= start && appDate <= end;
    } catch {
      return false;
    }
  });
};

/**
 * Calculate statistics dari data
 */
const calculateStatistics = (appointments, members) => {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status?.toLowerCase() === 'active').length;
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status?.toLowerCase() === 'confirmed').length;
  const completedAppointments = appointments.filter(a => a.status?.toLowerCase() === 'completed').length;

  const totalRevenue = appointments
    .filter(a => a.status?.toLowerCase() === 'completed')
    .reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

  const averageRevenue = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

  return {
    totalMembers,
    activeMembers,
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    totalRevenue: Math.round(totalRevenue),
    averageRevenue: Math.round(averageRevenue)
  };
};

/**
 * Generate top therapists data
 */
const generateTopTherapistsData = (appointments, therapists) => {
  const therapistStats = {};

  appointments
    .filter(app => app.status?.toLowerCase() === 'completed')
    .forEach(app => {
      const therapistName = (app.therapist_name || app.therapist)?.toString().trim();
      if (therapistName) {
        if (!therapistStats[therapistName]) {
          therapistStats[therapistName] = {
            name: therapistName,
            completedAppointments: 0,
            totalAppointments: 0
          };
        }
        therapistStats[therapistName].completedAppointments++;
      }
    });

  appointments.forEach(app => {
    const therapistName = (app.therapist_name || app.therapist)?.toString().trim();
    if (therapistName && therapistStats[therapistName]) {
      therapistStats[therapistName].totalAppointments++;
    }
  });

  const sortedTherapists = Object.values(therapistStats)
    .sort((a, b) => b.completedAppointments - a.completedAppointments)
    .slice(0, 10);

  return sortedTherapists.map(therapistStat => {
    const therapistFromDb = therapists.find(t =>
      t.name?.toString().trim().toLowerCase() === therapistStat.name.toLowerCase()
    );

    return {
      ...therapistStat,
      status: therapistFromDb?.status || 'Aktif'
    };
  });
};

export default generateDashboardPDF;
