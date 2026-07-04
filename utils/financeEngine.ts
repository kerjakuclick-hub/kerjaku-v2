// utils/financeEngine.ts
// Financial Architecture for kerjaKU.click (PWA/Backend Validation)

export interface LayananFinancial {
  id: string;
  hargaJual: number;
  totalPotonganPlatform: number; // Minimal Saldo Total
  isDualKsatria: boolean;
  pendapatanKsatriaTotal: number;
  
  // Khusus Dual Ksatria (Paket MAX)
  minSaldoUtama?: number;
  minSaldoPendamping?: number;
  pendapatanUtama?: number;
  pendapatanPendamping?: number;
}

export const hitungKeuanganPesanan = (paketId: string): LayananFinancial | null => {
  switch (paketId) {
    // ----------------------------------------
    // DIVISI SETRIKAKU
    // ----------------------------------------
    case 'S-FAST':
      return {
        id: 'S-FAST',
        hargaJual: 65000,
        totalPotonganPlatform: 15250, // Platform 9.750 + Tech 3.000 + Produk 2.500
        isDualKsatria: false,
        pendapatanKsatriaTotal: 49750
      };
      
    case 'S-PRO':
      return {
        id: 'S-PRO',
        hargaJual: 100000,
        totalPotonganPlatform: 23000, // Platform 15.000 + Tech 3.000 + Produk 5.000
        isDualKsatria: false,
        pendapatanKsatriaTotal: 77000
      };
      
    case 'S-MAX':
      return {
        id: 'S-MAX',
        hargaJual: 350000,
        totalPotonganPlatform: 70500, // Platform 52.500 + Tech 3.000 + Produk 15.000
        isDualKsatria: true,
        pendapatanKsatriaTotal: 279500, // 350.000 - 70.500
        // Rasio 55 : 45
        minSaldoUtama: 38775,      // 55% dari 70.500
        minSaldoPendamping: 31725, // 45% dari 70.500
        pendapatanUtama: 153725,   // 55% dari 279.500
        pendapatanPendamping: 125775 // 45% dari 279.500
      };

    // ----------------------------------------
    // DIVISI CLEANINGKU
    // ----------------------------------------
    case 'C-FAST':
      return {
        id: 'C-FAST',
        hargaJual: 95000,
        totalPotonganPlatform: 40250, // Platform 14.250 + Tech 3.000 + Produk 23.000
        isDualKsatria: false,
        pendapatanKsatriaTotal: 54750
      };
      
    case 'C-PRO':
      return {
        id: 'C-PRO',
        hargaJual: 125000,
        totalPotonganPlatform: 42250, // Platform (13%) 16.250 + Tech 3.000 + Produk 23.000
        isDualKsatria: false,
        pendapatanKsatriaTotal: 82750
      };
      
    case 'C-MAX':
      return {
        id: 'C-MAX',
        hargaJual: 375000,
        totalPotonganPlatform: 94000, // Platform (12%) 45.000 + Tech 3.000 + Produk 46.000
        isDualKsatria: true,
        pendapatanKsatriaTotal: 281000, // 375.000 - 94.000
        // Rasio 55 : 45
        minSaldoUtama: 51700,      // 55% dari 94.000
        minSaldoPendamping: 42300, // 45% dari 94.000
        pendapatanUtama: 154550,   // 55% dari 281.000
        pendapatanPendamping: 126450 // 45% dari 281.000
      };
      
    default:
      return null;
  }
};