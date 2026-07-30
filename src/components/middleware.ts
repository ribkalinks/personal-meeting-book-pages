import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 💡 UBAH KE 'false' JIKA HALAMAN /LOGIN SUDAH SIAP DAN MAU MENGAKTIFKAN PROTEKSI PENUH
const IS_TESTING_MODE = true;

export function middleware(request: NextRequest) {
  // 1. Ambil token session dan role dari cookies browser
  const sessionToken = request.cookies.get('session')?.value;
  const userRole = request.cookies.get('role')?.value; 

  const { pathname } = request.nextUrl;

  // 2. Proteksi khusus untuk rute yang dimulai dengan /admin
  if (pathname.startsWith('/admin')) {
    
    // Jika mode testing aktif, biarkan user lewat agar tidak error 404
    if (IS_TESTING_MODE) {
      return NextResponse.next();
    }

    // Jika TIDAK dalam mode testing, jalankan keamanan ketat
    if (!sessionToken || userRole !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      
      // Menyimpan URL asal (misal: /admin) agar setelah login bisa diarahkan balik ke sini
      loginUrl.searchParams.set('callbackUrl', pathname); 
      
      return NextResponse.redirect(loginUrl);
    }
  }

  // Izinkan akses jika memenuhi semua syarat atau mengakses rute umum
  return NextResponse.next();
}

// 3. Menentukan rute mana saja yang akan diawasi oleh middleware ini
export const config = {
  matcher: ['/admin/:path*'],
};