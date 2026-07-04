// Arsitektur Produk & Layanan kerjaKU.click (V2 - Full Scale)
// Kalkulasi pre-computed berdasarkan rumus: Komisi % x (Harga - Biaya Bahan - Biaya Tech)

export const SKEMA_KEUANGAN: Record<string, any> = {
  // =======================================================================
  // 1. CUCI KENDARAAN PADDOCK (Hak Ksatria 45%, Hak Platform/Paddock/Tim 55%)
  // =======================================================================
  'CP-MTR-K': { nama: 'Cuci Motor Kecil (Paddock)', harga: 20000, fee: 7975, tech: 3000, bahan: 2500, isDual: false },
  'CP-MTR-B': { nama: 'Cuci Motor Besar (Paddock)', harga: 25000, fee: 10725, tech: 3000, bahan: 2500, isDual: false },
  'CP-MBL-S': { nama: 'Cuci Mobil Small (Paddock)', harga: 50000, fee: 20350, tech: 3000, bahan: 10000, isDual: false },
  'CP-MBL-M': { nama: 'Cuci Mobil Medium (Paddock)', harga: 60000, fee: 25850, tech: 3000, bahan: 10000, isDual: false },

  // =======================================================================
  // 2. CUCI KENDARAAN PANGGILAN (Hak Ksatria 80%, Hak Platform/Paddock 20%)
  // =======================================================================
  'CR-MTR-K': { nama: 'Cuci Motor Kecil (Panggilan)', harga: 35000, fee: 5400, tech: 3000, bahan: 5000, isDual: false },
  'CR-MTR-B': { nama: 'Cuci Motor Besar (Panggilan)', harga: 45000, fee: 7400, tech: 3000, bahan: 5000, isDual: false },
  'CR-MBL-S': { nama: 'Cuci Mobil Mini (Panggilan)', harga: 75000, fee: 11400, tech: 3000, bahan: 15000, isDual: false },
  'CR-MBL-M': { nama: 'Cuci Mobil Medium (Panggilan)', harga: 95000, fee: 15400, tech: 3000, bahan: 15000, isDual: false },

  // =======================================================================
  // 3. SETRIKA PAKAIAN (Hak Ksatria 85%, Hak Platform 15%)
  // =======================================================================
  'S-FAST': { nama: 'Setrika FAST (25 Pcs / 1.5 Jam)', harga: 65000, fee: 8925, tech: 3000, bahan: 2500, isDual: false },
  'S-PRO': { nama: 'Setrika PRO (40 Pcs / 2.5 Jam)', harga: 95000, fee: 13425, tech: 3000, bahan: 2500, isDual: false },

  // =======================================================================
  // 4. CLEANING HOME (Hak Ksatria 85%, Hak Platform 15%)
  // =======================================================================
  'C-FAST': { nama: 'Cleaning FAST (1.5 Jam)', harga: 85000, fee: 9300, tech: 3000, bahan: 20000, isDual: false },
  'C-PRO': { nama: 'Cleaning PRO (2.5 Jam)', harga: 125000, fee: 15300, tech: 3000, bahan: 20000, isDual: false },
};

export const getHargaLayanan = (paketId: string): number => {
  const skema = SKEMA_KEUANGAN[paketId];
  if (!skema) throw new Error("Paket layanan tidak ditemukan atau tidak valid.");
  return skema.harga;
};
