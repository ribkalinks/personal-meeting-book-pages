// @ts-nocheck
import { sendWhatsAppNotification } from '@/lib/notifications';
import { sendEmailNotification } from '@/lib/email';
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

const formatPhoneNumber = (phone: string) => {
  let formatted = phone.replace(/\D/g, '');
  if (formatted.startsWith('0')) {
    return '62' + formatted.substring(1);
  }
  return formatted;
};

export async function GET() {
  try {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const bookings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null,
    }));

    return NextResponse.json({ success: true, data: bookings }, { status: 200 });
  } catch (error) {
    console.error("Error pada API GET /api/bookings:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data booking" }, { status: 500 });
  }
}

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

    const docRef = await addDoc(collection(db, 'bookings'), {
      customerName,
      customerEmail,
      customerPhone,
      bookingDate, 
      bookingTime,
      utcDateTime: convertToUTC(`${bookingDate} ${bookingTime}`), 
      status: 'pending',
      createdAt: serverTimestamp()
    });

    await sendWhatsAppNotification(
      "6282336566741",
      `Halo Admin, ada booking baru!\nNama: ${customerName}\nTanggal: ${bookingDate}\nJam: ${bookingTime}\nID: ${docRef.id}`
    );

    await sendWhatsAppNotification(
      formatPhoneNumber(customerPhone),
      `Halo ${customerName}, terima kasih sudah booking. Permintaan kamu untuk tanggal ${bookingDate} jam ${bookingTime} sedang kami proses ya!`
    );

    await sendEmailNotification(
      customerEmail,
      "Konfirmasi Booking Anda",
      `<h1>Halo ${customerName}</h1><p>Terima kasih sudah booking. Jadwal kamu pada ${bookingDate} jam ${bookingTime} telah kami terima.</p>`
    );

    await sendEmailNotification(
      "admin@ribka.dev",
      "Ada Booking Baru!",
      `<p>Booking baru dari <strong>${customerName}</strong> pada ${bookingDate} jam ${bookingTime}</p>`
    );

    return NextResponse.json({ 
      success: true, 
      message: "Booking created and notifications sent!", 
      bookingId: docRef.id 
    }, { status: 201 });

  } catch (error) {
    console.error("Error pada API POST /api/bookings:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses booking baru" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { bookingId, newStatus } = await request.json();
    if (!bookingId || !newStatus) {
      return NextResponse.json({ success: false, error: "Booking ID dan status baru wajib dikirim!" }, { status: 400 });
    }
    
    await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
    return NextResponse.json({ success: true, message: `Status berhasil diperbarui ke ${newStatus}!` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal memperbarui status" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID wajib disertakan" }, { status: 400 });
    }

    await deleteDoc(doc(db, 'bookings', bookingId));
    return NextResponse.json({ success: true, message: "Booking berhasil dihapus!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal menghapus booking" }, { status: 500 });
  }
}