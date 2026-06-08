// @ts-nocheck
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// ... sisa kode di bawahnya biarkan tetap sama ...
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Mengaktifkan plugin internal dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIMEZONE = 'Asia/Makassar'; // Mengunci standar waktu ke WITA (Bali)

/**
 * Mengonversi tanggal lokal pilihan user menjadi format UTC ISO String sebelum dikirim ke database/Prisma
 * @param localDateString Contoh: "2026-06-08 09:00"
 */
export const convertToUTC = (localDateString: string): string => {
  return dayjs.tz(localDateString, DEFAULT_TIMEZONE).utc().format();
};

/**
 * Mengonversi tanggal UTC dari database kembali menjadi waktu lokal WITA untuk ditampilkan di UI
 * @param utcDateString Contoh: "2026-06-08T01:00:00Z"
 */
export const convertToLocal = (utcDateString: string): string => {
  return dayjs(utcDateString).tz(DEFAULT_TIMEZONE).format('YYYY-MM-DD HH:mm');
};