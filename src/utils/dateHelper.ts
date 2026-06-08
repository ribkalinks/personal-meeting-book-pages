// @ts-nocheck
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Mengaktifkan plugin internal dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIMEZONE = 'Asia/Makassar'; // Mengunci standar waktu ke WITA (Bali)

/**
 * Mengonversi tanggal lokal pilihan user menjadi format UTC ISO String sebelum dikirim ke database
 * @param localDateString Contoh: "2026-06-08 09:00"
 */
export const convertToUTC = (localDateString: string): string => {
  return dayjs.tz(localDateString, DEFAULT_TIMEZONE).utc().format();
};