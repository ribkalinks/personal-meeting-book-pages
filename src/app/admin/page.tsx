"use client";

import React, { useEffect, useState } from 'react';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  createdAt: string | null;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const result = await response.json();
      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  // 1. Fungsi untuk PUT (Approve Status)
  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, newStatus }),
      });

      const result = await response.json();
      if (result.success) {
        setBookings(prev => 
          prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
        );
      } else {
        alert(`Gagal: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan sistem saat memperbarui status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. Fungsi untuk DELETE (Cancel / Hapus dari Firebase)
  const handleCancel = async (bookingId: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan dan menghapus booking ini?")) return;
    
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        alert('Booking berhasil dibatalkan dan dihapus!');
        // Hapus langsung dari state lokal agar data hilang dari tabel tanpa reload
        setBookings(prev => prev.filter(b => b.id !== bookingId));
      } else {
        alert('Gagal membatalkan: ' + result.error);
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Terjadi kesalahan sistem saat menghapus booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial' }}>
        <h3>Loading Dashboard Data...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '30px auto', padding: '20px', fontFamily: 'Arial' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Dashboard Admin — Appointment List</h2>
        <span style={{ backgroundColor: '#007bff', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
          {bookings.length} Total Requests
        </span>
      </div>

      {bookings.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', margin: '40px 0' }}>No appointment requests found yet.</p>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderRadius: '8px', border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '14px', color: '#555' }}>Customer Details</th>
                <th style={{ padding: '14px', color: '#555' }}>Requested Schedule</th>
                <th style={{ padding: '14px', color: '#555' }}>Status</th>
                <th style={{ padding: '14px', color: '#555', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #eee', verticalAlign: 'middle' }}>
                  
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 'bold', color: '#000', fontSize: '15px' }}>{booking.customerName}</div>
                    <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>📧 {booking.customerEmail}</div>
                    <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>📞 {booking.customerPhone}</div>
                  </td>
                  
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 'bold', color: '#000' }}>🗓️ {booking.bookingDate}</div>
                    <div style={{ fontSize: '14px', color: '#007bff', fontWeight: 'bold', marginTop: '4px' }}>⏰ {booking.bookingTime} WITA</div>
                  </td>
                  
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backgroundColor: booking.status === 'pending' ? '#fff3cd' : booking.status === 'approved' ? '#d4edda' : '#f8d7da',
                      color: booking.status === 'pending' ? '#856404' : booking.status === 'approved' ? '#155724' : '#721c24'
                    }}>
                      {booking.status}
                    </span>
                  </td>

                  {/* Kolom Aksi */}
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        disabled={updatingId !== null || booking.status === 'approved'}
                        onClick={() => handleStatusUpdate(booking.id, 'approved')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: booking.status === 'approved' ? '#ccc' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: booking.status === 'approved' ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        disabled={updatingId !== null}
                        onClick={() => handleCancel(booking.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
