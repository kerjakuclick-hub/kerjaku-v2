import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Inisialisasi Koneksi Supabase
// Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah ada di Environment Variables Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_klien, no_wa_klien, layanan, alamat_detail, slot_waktu } = body;

    // ==========================================
    // FASE A: SIMPAN DATA KE SUPABASE DATABASE
    // ==========================================
    const { data: dbData, error: dbError } = await supabase
      .from('pesanan') // ⚠️ PENTING: Ganti 'pesanan' dengan nama tabel asli di database Supabase Anda
      .insert([
        {
          nama_klien: nama_klien,
          no_wa_klien: no_wa_klien,
          layanan: layanan,
          alamat_detail: alamat_detail,
          slot_waktu: slot_waktu,
        }
      ]);

    if (dbError) {
      console.error("Gagal simpan ke Supabase:", dbError);
      // Kita log errornya, tapi biarkan proses lanjut ke pengiriman WA agar klien tetap dilayani
    } else {
      console.log("Sukses simpan ke Supabase!");
    }


    // ==========================================
    // FASE B: KIRIM NOTIFIKASI KE WHATSAPP FONNTE
    // ==========================================
    const targetNumber = process.env.WA_ADMIN_NUMBER; 
    const fonnteToken = process.env.FONNTE_TOKEN;

    const message = `🚨 *ORDERAN MASUK BARU!* 🚨\n\n*Nama:* ${nama_klien}\n*WA Klien:* ${no_wa_klien}\n*Layanan:* ${layanan}\n*Jadwal:* ${slot_waktu}\n*Alamat:* ${alamat_detail}\n\n*Aksi:* Segera hubungi klien untuk konfirmasi kedatangan!`;

    const formData = new FormData();
    formData.append('target', targetNumber!);
    formData.append('message', message);
    formData.append('countryCode', '62');

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': fonnteToken!, 
      },
      body: formData,
    });

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
