export type Role = 'admin_wilayah' | 'admin_lokasi' | 'pengajar' | 'admin_keuangan';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';
export type StatusTindakLanjutKeuangan =
  | 'Belum Ada Keterangan'
  | 'Menunggu Tindak Lanjut'
  | 'Sedang Diproses'
  | 'Selesai Ditindaklanjuti'
  | 'Ditolak';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  identifier: string; // kode wilayah (misal 446), kode lokasi (misal 119), atau nopeg (misal 709027)
  unitName: string;
  phone?: string;
  status: ApprovalStatus;
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export interface UserSession {
  id: string;
  role: Role;
  name: string;
  identifier: string; // kode wilayah, kode lokasi, or nopeg
  unitName: string; // e.g. "Wilayah Bekasi Plus", "Lokasi Bekasi Timur", "Guru Matematika"
  email: string;
  phone?: string;
}

export interface LokasiInfo {
  kodeLokasi: string;
  namaLokasi: string;
  alamat: string;
  penanggungJawab: string;
  kontak: string;
}

export interface WilayahInfo {
  kodeWilayah: string;
  namaWilayah: string;
  kepalaWilayah: string;
  email: string;
  lokasiList: string[]; // list of kodeLokasi
}

export interface SesiMengajarRecord {
  id: string;
  
  // Format 24 Kolom Persis Sesuai Gambar User:
  periode: string;                  // 1. Periode
  nopeg: string;                    // 2. Nopeg
  namaPengajar: string;             // 3. Nama Pengajar
  kode: string;                     // 4. Kode (Kode Lokasi)
  lok: string;                      // 5. Lok (Nama Lokasi)
  
  // Kompatibilitas alias properti:
  kodeLokasi?: string;
  lokasi?: string;

  durMengajarNegeri: number;        // 6. Dur Mengajar Negeri
  sesiMengajarNegeri: number;       // 7. Sesi Mengajar Negeri
  menitSangsiMengajarNegeri: number; // 8. Menit Sangsi Mengajar Negeri
  insentifHadirMengajarNegeri: number; // 9. Insentif Hadir Mengajar Negeri (Font Merah)
  jagaTesNegeri: number;            // 10. Jaga Tes Negeri
  durMengajarSwasta: number;        // 11. Dur Mengajar Swasta
  menitSangsiMengajarSwasta: number; // 12. Menit Sangsi Mengajar Swasta
  insentifHadirMengajarSwasta: number; // 13. Insentif Hadir Mengajar Swasta (Font Merah)
  jagaTesSwasta: number;            // 14. Jaga TesSwasta
  sesiMengajarAhad: number;         // 15. Sesi Mengajar Ahad
  sesiTidakHadir: number;           // 16. Sesi Tidak Hadir
  sesiMengajarSwasta: number;       // 17. Sesi Mengajar Swasta
  durKonsultasiNegeri: number;      // 18. Dur Konsultasi Negeri
  sesiKonsultasiNegeri: number;     // 19. Sesi Konsultasi Negeri
  instKonsultasiNegeri: number;     // 20. Inst Konsultasi Negeri (Font Merah)
  durKonsultasiSwasta: number;      // 21. Dur Konsultasi Swasta
  sesiKonsultasiSwasta: number;     // 22. Sesi Konsultasi Swasta
  instKonsultasiSwasta: number;     // 23. Inst Konsultasi Swasta (Font Merah)
  belumPresensi: number;            // 24. Belum Presensi
  
  // Status Koreksi / Verifikasi oleh Lokasi:
  statusKoreksi: 'Belum Dicek' | 'Sudah Dikoreksi' | 'Perlu Perbaikan';
  korektor?: string;
  waktuKoreksi?: string;
  catatanKoreksi?: string;

  // Keterangan Pengajar & Monitoring Tindak Lanjut Admin Keuangan:
  keteranganPengajar?: string;                    // Input keterangan/kendala dari Guru Pengajar
  waktuKeteranganPengajar?: string;               // Waktu input keterangan pengajar
  statusTindakLanjutKeuangan?: StatusTindakLanjutKeuangan; // Status tindak lanjut admin keuangan
  catatanKeuangan?: string;                       // Tanggapan/tindak lanjut dari Admin Keuangan
  waktuTindakLanjutKeuangan?: string;             // Waktu tindak lanjut admin keuangan
  petugasKeuangan?: string;                       // Petugas/Admin Keuangan yang menindaklanjuti
}

export interface RekapPengajarSummary {
  nopeg: string;
  namaPengajar: string;
  lokasiList: string[];
  totalDurNegeri: number;
  totalSesiNegeri: number;
  totalMenitSangsiNegeri: number;
  totalInsentifNegeri: number;
  totalJagaTesNegeri: number;
  totalDurSwasta: number;
  totalSesiSwasta: number;
  totalMenitSangsiSwasta: number;
  totalInsentifSwasta: number;
  totalJagaTesSwasta: number;
  totalSesiAhad: number;
  totalSesiTidakHadir: number;
  totalDurKonsulNegeri: number;
  totalSesiKonsulNegeri: number;
  totalInstKonsulNegeri: number;
  totalDurKonsulSwasta: number;
  totalSesiKonsulSwasta: number;
  totalInstKonsulSwasta: number;
  totalBelumPresensi: number;
  statusKoreksiAll: 'Sudah Semua' | 'Sebagian' | 'Belum Dicek';
  records: SesiMengajarRecord[];
}
