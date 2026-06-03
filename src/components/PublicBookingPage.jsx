"use client";

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import '@/app/calendar.css';

function PublicBookingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(''); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Available time slots
  const availableTimes = ['09:00', '11:00', '14:00', '16:00'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTime) {
      alert("Please select a meeting time first!");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // DI SINI PERUBAHANNYA: Mengirim data tamu lewat API Route Poin 6 kemarin
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          bookingDate: formattedDate,
          bookingTime: selectedTime,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
      } else {
        alert(`Failed: ${result.error || 'Something went wrong'}`);
      }

    } catch (error) {
      console.error("Error submitting guest form: ", error);
      alert("Oops, something went wrong while processing your booking. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial' }}>
        <h2>🎉 Booking Successfully Requested!</h2>
        <p>Thank you, <strong>{name}</strong>. Your meeting request has been recorded.</p>
        <p>Please wait for further confirmation from us via WhatsApp or Email.</p>
        <button 
          onClick={() => { setIsSuccess(false); setSelectedTime(''); setName(''); setEmail(''); setPhone(''); }} 
          style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
        >
          Book Another Meeting
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '25px', border: '1px solid #ccc', borderRadius: '12px', fontFamily: 'Arial', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>Public Appointment Form</h2>
      <p style={{ textAlign: 'center', color: '#666', marginTop: '0', marginBottom: '25px' }}>Please fill in your details and choose a preferred time.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Guest Information Input Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name:</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)} 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', color: '#000', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address:</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', color: '#000', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>WhatsApp Number:</label>
            <input 
              type="tel" required placeholder="e.g., 08123456789" value={phone} onChange={(e) => setPhone(e.target.value)} 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', color: '#000', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />

        {/* Calendar & Time Grid Section */}
        <div className="booking-container">
          
          {/* Left Column: Inline Calendar */}
          <div className="calendar-box">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Date:</label>
            <DatePicker 
              selected={selectedDate} 
              onChange={(date) => setSelectedDate(date)} 
              minDate={new Date()} 
              inline 
            />
          </div>

          {/* Right Column: Time Slots Grid */}
          <div className="time-grid-box">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Time (WITA):</label>
            <div className="time-grid">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  type="button" 
                  className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            marginTop: '15px',
            padding: '12px', 
            backgroundColor: isSubmitting ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isSubmitting ? 'Processing...' : 'Request Appointment'}
        </button>

      </form>
    </div>
  );
}

export default PublicBookingPage;