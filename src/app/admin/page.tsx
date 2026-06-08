// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // 1. Ambil data booking dari API Backend
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookings');
      const result = await res.json();
      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 2. Fungsi Approve (Mengubah status jadi approved)
  const handleApprove = async (bookingId: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, newStatus: 'approved' }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Booking berhasil diapprove! 🎉');
        fetchBookings(); // Refresh data
      }
    } catch (error) {
      console.error('Gagal approve:', error);
    }
  };

  // 3. Fungsi Cancel/Delete (Menghapus data)
  const handleDelete = async (bookingId: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus/membatalkan booking ini?')) return;
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Booking berhasil dihapus/dicancel! 🗑️');
        fetchBookings(); // Refresh data
      }
    } catch (error) {
      console.error('Gagal menghapus:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🔒 Admin Booking Dashboard</h1>
          <button 
            onClick={fetchBookings} 
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          >
            🔄 Refresh Data
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm font-medium">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-10">Sedang memuat data booking...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Belum ada data booking masuk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-white border border-gray-200 rounded-md">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  <th className="px-6 py-3">Nama Tamu</th>
                  <th className="px-6 py-3">Kontak</th>
                  <th className="px-6 py-3">Tanggal & Jam (WITA)</th>
                  <th className="px-6 py-3">Waktu UTC (Aman)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{booking.customerName}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div>{booking.customerEmail}</div>
                      <div className="text-xs text-gray-400">{booking.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="font-semibold">{booking.bookingDate}</span> @ {booking.bookingTime}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-purple-600">
                      {booking.utcDateTime || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      {booking.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}