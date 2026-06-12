// @ts-nocheck
import { sendWhatsAppNotification } from '@/lib/notifications';
import { convertToUTC } from '../../../utils/dateHelper';
import { NextResponse } from 'next/server';
import { db } from '@/app/firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  orderBy, 
  query, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

// ==========================================
// 1. GET: Mengambil semua data untuk Admin
// ==========================================
export async function GET() {
  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const bookings = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        bookingDate: data.bookingDate,
        bookingTime: data.bookingTime,
        status: data.status || 'pending',
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      });
    });

    return NextResponse.json({ success: true, data: bookings }, { status: 200 });
  } catch (error) {
    console.error("Error pada API GET /api/bookings:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data booking" }, { status: 500 });
  }
}

// ==========================================
// 2. POST: Menerima data dari Form Tamu
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, bookingDate, bookingTime } = body;

    if (!customerName || !customerEmail || !customerPhone || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { success: false, error: "Semua kolom data diri dan waktu wajib diisi!" },
        { status: 400 }
      );
    }

    const combinedDateTime = `${bookingDate} ${bookingTime}`;
    const utcDateTimeString = convertToUTC(combinedDateTime);

    const docRef = await addDoc(collection(db, 'bookings'), {
      customerName,
      customerEmail,
      customerPhone,
      bookingDate, 
      bookingTime,
      utcDateTime: utcDateTimeString, 
      status: 'pending',
      createdAt: serverTimestamp()
    });

    // perintah untuk mengirim WA setelah data masuk ke database
    await sendWhatsAppNotification(
      "6282336566741",
      `Halo Admin, ada booking baru!\nNama: ${customerName}\nTanggal: ${bookingDate}\nJam: ${bookingTime}\nID: ${docRef.id}`
    );
    // ----------------------------

    return NextResponse.json({ 
      success: true, 
      message: "Booking successfully created through API!", 
      bookingId: docRef.id 
    }, { status: 201 });

  } catch (error) {
    console.error("Error pada API POST /api/bookings:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses booking baru" }, { status: 500 });
  }
}

// ==========================================
// 3. PUT: Memperbarui Status Booking / Approve (Admin)
// ==========================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, newStatus } = body;

    if (!bookingId || !newStatus) {
      return NextResponse.json(
        { success: false, error: "Booking ID dan status baru wajib dikirim!" },
        { status: 400 }
      );
    }
    
    const bookingDocRef = doc(db, 'bookings', bookingId);
    
    await updateDoc(bookingDocRef, {
      status: newStatus
    });

    return NextResponse.json({ 
      success: true, 
      message: `Status booking berhasil diperbarui menjadi ${newStatus}!` 
    }, { status: 200 });

  } catch (error) {
    console.error("Error pada API PUT /api/bookings:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui status" }, { status: 500 });
  }
}

// ==========================================
// 4. DELETE: Menghapus / Cancel Booking (Admin)
// ==========================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID wajib disertakan di URL query (?id=...)" },
        { status: 400 }
      );
    }

    const bookingDocRef = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingDocRef);

    return NextResponse.json({
      success: true,
      message: `Booking dengan ID ${bookingId} berhasil dihapus/dicancel!`
    }, { status: 200 });

  } catch (error) {
    console.error("Error pada API DELETE /api/bookings:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus/membatalkan booking" }, { status: 500 });
  }
}