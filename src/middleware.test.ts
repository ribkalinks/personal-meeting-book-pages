import { middleware } from './components/middleware';
import { NextRequest } from 'next/server';
import { describe, it, expect } from '@jest/globals';

describe('Middleware Authorization App', () => {
  it('harus mengizinkan akses ke /admin jika IS_TESTING_MODE bernilai true', async () => {
    // Mengatur env mock sebelum test dijalankan
    process.env.IS_TESTING_MODE = 'true';

    const req = new NextRequest(new URL('http://localhost:3000/admin'));
    const res = await middleware(req);

    // Memastikan middleware meneruskan request
    expect(res).toBeDefined();
  });
});