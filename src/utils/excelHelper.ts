import * as XLSX from 'xlsx';
import { SesiMengajarRecord } from '../types';
import { LOKASI_DATA, TEACHERS_LIST } from '../data/mockData';

// 24 Kolom Persis Sesuai Gambar Pengguna
export const REQUIRED_COLUMNS_LABEL = [
  'Periode',
  'Nopeg',
  'Nama Pengajar',
  'Kode',
  'Lok',
  'Dur Mengajar Negeri',
  'Sesi Mengajar Negeri',
  'Menit Sangsi Mengajar Negeri',
  'Insentif Hadir Mengajar Negeri',
  'Jaga Tes Negeri',
  'Dur Mengajar Swasta',
  'Menit Sangsi Mengajar Swasta',
  'Insentif Hadir Mengajar Swasta',
  'Jaga Tes Swasta',
  'Sesi Mengajar Ahad',
  'Sesi Tidak Hadir',
  'Sesi Mengajar Swasta',
  'Dur Konsultasi Negeri',
  'Sesi Konsultasi Negeri',
  'Inst Konsultasi Negeri',
  'Dur Konsultasi Swasta',
  'Sesi Konsultasi Swasta',
  'Inst Konsultasi Swasta',
  'Belum Presensi'
];

export interface ColumnMappingConfig {
  periode: string;
  nopeg: string;
  namaPengajar: string;
  kode: string;
  lok: string;
  defaultLokasi: string;
  durMengajarNegeri: string;
  sesiMengajarNegeri: string;
  menitSangsiMengajarNegeri: string;
  insentifHadirMengajarNegeri: string;
  jagaTesNegeri: string;
  durMengajarSwasta: string;
  menitSangsiMengajarSwasta: string;
  insentifHadirMengajarSwasta: string;
  jagaTesSwasta: string;
  sesiMengajarAhad: string;
  sesiTidakHadir: string;
  sesiMengajarSwasta: string;
  durKonsultasiNegeri: string;
  sesiKonsultasiNegeri: string;
  instKonsultasiNegeri: string;
  durKonsultasiSwasta: string;
  sesiKonsultasiSwasta: string;
  instKonsultasiSwasta: string;
  belumPresensi: string;
}

export interface SystemFieldDefinition {
  key: keyof ColumnMappingConfig;
  label: string;
  category: 'identitas' | 'negeri' | 'swasta' | 'konsul' | 'presensi';
  isNumeric: boolean;
  isRedHeader?: boolean;
  aliases: string[];
}

export const SYSTEM_FIELDS: SystemFieldDefinition[] = [
  {
    key: 'periode',
    label: 'Periode',
    category: 'identitas',
    isNumeric: false,
    aliases: ['periode', 'bulan', 'waktu', 'period', 'periode mengajar']
  },
  {
    key: 'nopeg',
    label: 'Nopeg',
    category: 'identitas',
    isNumeric: false,
    aliases: ['nopeg', 'no pegawai', 'nip', 'nik', 'id guru', 'id pengajar', 'kode guru', 'id', 'nrp', 'nomor induk', 'kode pegawai', 'staff id']
  },
  {
    key: 'namaPengajar',
    label: 'Nama Pengajar',
    category: 'identitas',
    isNumeric: false,
    aliases: ['nama pengajar', 'nama guru', 'nama', 'guru', 'pengajar', 'nama pendidik', 'teacher', 'instruktur', 'tutor', 'pegawai', 'nama karyawan']
  },
  {
    key: 'kode',
    label: 'Kode',
    category: 'identitas',
    isNumeric: false,
    aliases: ['kode', 'kode lokasi', 'kode cabang', 'id lokasi', 'kd lok', 'kd']
  },
  {
    key: 'lok',
    label: 'Lok',
    category: 'identitas',
    isNumeric: false,
    aliases: ['lok', 'lokasi', 'nama lokasi', 'cabang', 'unit', 'kampus', 'tempat', 'outlet', 'kantor', 'wilayah kerja']
  },
  {
    key: 'durMengajarNegeri',
    label: 'Dur Mengajar Negeri',
    category: 'negeri',
    isNumeric: true,
    aliases: ['dur mengajar negeri', 'durasi mengajar negeri', 'dur negeri', 'jam negeri', 'mengajar negeri', 'jam ajar negeri', 'durasi negeri', 'tatap muka negeri']
  },
  {
    key: 'sesiMengajarNegeri',
    label: 'Sesi Mengajar Negeri',
    category: 'negeri',
    isNumeric: true,
    aliases: ['sesi mengajar negeri', 'sesi negeri', 'jumlah sesi negeri', 'sesi ajar negeri', 'frekuensi negeri']
  },
  {
    key: 'menitSangsiMengajarNegeri',
    label: 'Menit Sangsi Mengajar Negeri',
    category: 'negeri',
    isNumeric: true,
    aliases: ['menit sangsi mengajar negeri', 'sangsi negeri', 'menit sangsi negeri', 'keterlambatan negeri', 'menit telat negeri', 'potongan negeri', 'denda negeri', 'telat negeri', 'sanksi negeri']
  },
  {
    key: 'insentifHadirMengajarNegeri',
    label: 'Insentif Hadir Mengajar Negeri',
    category: 'negeri',
    isNumeric: true,
    isRedHeader: true,
    aliases: ['insentif hadir mengajar negeri', 'insentif negeri', 'inst hadir negeri', 'uang hadir negeri', 'honor hadir negeri', 'transport negeri', 'kehadiran negeri']
  },
  {
    key: 'jagaTesNegeri',
    label: 'Jaga Tes Negeri',
    category: 'negeri',
    isNumeric: true,
    aliases: ['jaga tes negeri', 'tes negeri', 'jaga ujian negeri', 'pengawas negeri', 'ujian negeri', 'sesi tes negeri', 'pengawas tes negeri', 'jaga to negeri']
  },
  {
    key: 'durMengajarSwasta',
    label: 'Dur Mengajar Swasta',
    category: 'swasta',
    isNumeric: true,
    aliases: ['dur mengajar swasta', 'durasi mengajar swasta', 'dur swasta', 'jam swasta', 'mengajar swasta', 'jam ajar swasta', 'durasi swasta']
  },
  {
    key: 'menitSangsiMengajarSwasta',
    label: 'Menit Sangsi Mengajar Swasta',
    category: 'swasta',
    isNumeric: true,
    aliases: ['menit sangsi mengajar swasta', 'sangsi swasta', 'menit sangsi swasta', 'keterlambatan swasta', 'menit telat swasta', 'potongan swasta', 'denda swasta']
  },
  {
    key: 'insentifHadirMengajarSwasta',
    label: 'Insentif Hadir Mengajar Swasta',
    category: 'swasta',
    isNumeric: true,
    isRedHeader: true,
    aliases: ['insentif hadir mengajar swasta', 'insentif swasta', 'inst hadir swasta', 'uang hadir swasta', 'honor hadir swasta', 'transport swasta', 'kehadiran swasta']
  },
  {
    key: 'jagaTesSwasta',
    label: 'Jaga TesSwasta',
    category: 'swasta',
    isNumeric: true,
    aliases: ['jaga tesswasta', 'jaga tes swasta', 'tes swasta', 'jaga ujian swasta', 'pengawas swasta', 'ujian swasta', 'sesi tes swasta']
  },
  {
    key: 'sesiMengajarAhad',
    label: 'Sesi Mengajar Ahad',
    category: 'swasta',
    isNumeric: true,
    aliases: ['sesi mengajar ahad', 'sesi ahad', 'mengajar ahad', 'sesi minggu', 'jam ahad', 'ahad']
  },
  {
    key: 'sesiTidakHadir',
    label: 'Sesi Tidak Hadir',
    category: 'swasta',
    isNumeric: true,
    aliases: ['sesi tidak hadir', 'tidak hadir', 'alpha', 'absen', 'izin', 'tidak masuk', 'sesi mangkir']
  },
  {
    key: 'sesiMengajarSwasta',
    label: 'Sesi Mengajar Swasta',
    category: 'swasta',
    isNumeric: true,
    aliases: ['sesi mengajar swasta', 'sesi swasta', 'jumlah sesi swasta', 'sesi ajar swasta', 'frekuensi swasta']
  },
  {
    key: 'durKonsultasiNegeri',
    label: 'Dur Konsultasi Negeri',
    category: 'konsul',
    isNumeric: true,
    aliases: ['dur konsultasi negeri', 'konsultasi negeri', 'dur konsul negeri', 'jam konsul negeri', 'konsul negeri', 'bimbingan negeri', 'durasi konsultasi negeri']
  },
  {
    key: 'sesiKonsultasiNegeri',
    label: 'Sesi Konsultasi Negeri',
    category: 'konsul',
    isNumeric: true,
    aliases: ['sesi konsultasi negeri', 'sesi konsul negeri', 'jumlah konsul negeri', 'konsul negeri (sesi)']
  },
  {
    key: 'instKonsultasiNegeri',
    label: 'Inst Konsultasi Negeri',
    category: 'konsul',
    isNumeric: true,
    isRedHeader: true,
    aliases: ['inst konsultasi negeri', 'insentif konsultasi negeri', 'insentif konsul negeri', 'honor konsul negeri', 'uang konsul negeri', 'transport konsul negeri']
  },
  {
    key: 'durKonsultasiSwasta',
    label: 'Dur Konsultasi Swasta',
    category: 'konsul',
    isNumeric: true,
    aliases: ['dur konsultasi swasta', 'konsultasi swasta', 'dur konsul swasta', 'jam konsul swasta', 'konsul swasta', 'bimbingan swasta', 'durasi konsultasi swasta']
  },
  {
    key: 'sesiKonsultasiSwasta',
    label: 'Sesi Konsultasi Swasta',
    category: 'konsul',
    isNumeric: true,
    aliases: ['sesi konsultasi swasta', 'sesi konsul swasta', 'jumlah konsul swasta', 'konsul swasta (sesi)']
  },
  {
    key: 'instKonsultasiSwasta',
    label: 'Inst Konsultasi Swasta',
    category: 'konsul',
    isNumeric: true,
    isRedHeader: true,
    aliases: ['inst konsultasi swasta', 'insentif konsultasi swasta', 'insentif konsul swasta', 'honor konsul swasta', 'uang konsul swasta', 'transport konsul swasta']
  },
  {
    key: 'belumPresensi',
    label: 'Belum Presensi',
    category: 'presensi',
    isNumeric: true,
    aliases: ['belum presensi', 'belum hadir', 'sesi belum presensi', 'pending presensi', 'belum absen', 'tidak presensi', 'blm presensi', 'missing scan']
  }
];

// Helper to round to 2 decimals
export function roundToTwo(val: number): number {
  return Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;
}

/**
 * Format angka dengan tampilan standar Indonesia: tepat 2 angka di belakang koma (misal: "19,75" atau "3,00" atau "2.776,98").
 * Menghilangkan angka desimal berlebih akibat perhitungan pecahan JavaScript.
 */
export function formatDecimal(val: number | string | undefined | null, decimals: number = 2): string {
  if (val === undefined || val === null || val === '') {
    return (0).toLocaleString('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }
  const num = typeof val === 'number' ? val : parseNumber(val);
  if (isNaN(num)) {
    return (0).toLocaleString('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Helper to format numeric values (jumlah/count, format Indonesia 2 desimal jika pecahan)
export function formatJumlah(num: number): string {
  if (num === 0 || isNaN(num)) return '0,00';
  return formatDecimal(num, 2);
}
export const formatRupiah = formatJumlah;

// Convert Sesi Records into rows matching exact 24 columns format
export function mapRecordsToExportRows(records: SesiMengajarRecord[]) {
  return records.map((r) => ({
    'Periode': r.periode || '2026-08-25 sd 2026-09-24',
    'Nopeg': r.nopeg,
    'Nama Pengajar': r.namaPengajar,
    'Kode': r.kode || r.kodeLokasi || '',
    'Lok': r.lok || r.lokasi || '',
    'Dur Mengajar Negeri': Number(r.durMengajarNegeri) || 0,
    'Sesi Mengajar Negeri': Number(r.sesiMengajarNegeri) || 0,
    'Menit Sangsi Mengajar Negeri': Number(r.menitSangsiMengajarNegeri) || 0,
    'Insentif Hadir Mengajar Negeri': Number(r.insentifHadirMengajarNegeri) || 0,
    'Jaga Tes Negeri': Number(r.jagaTesNegeri) || 0,
    'Dur Mengajar Swasta': Number(r.durMengajarSwasta) || 0,
    'Menit Sangsi Mengajar Swasta': Number(r.menitSangsiMengajarSwasta) || 0,
    'Insentif Hadir Mengajar Swasta': Number(r.insentifHadirMengajarSwasta) || 0,
    'Jaga TesSwasta': Number(r.jagaTesSwasta) || 0,
    'Sesi Mengajar Ahad': Number(r.sesiMengajarAhad) || 0,
    'Sesi Tidak Hadir': Number(r.sesiTidakHadir) || 0,
    'Sesi Mengajar Swasta': Number(r.sesiMengajarSwasta) || 0,
    'Dur Konsultasi Negeri': Number(r.durKonsultasiNegeri) || 0,
    'Sesi Konsultasi Negeri': Number(r.sesiKonsultasiNegeri) || 0,
    'Inst Konsultasi Negeri': Number(r.instKonsultasiNegeri) || 0,
    'Dur Konsultasi Swasta': Number(r.durKonsultasiSwasta) || 0,
    'Sesi Konsultasi Swasta': Number(r.sesiKonsultasiSwasta) || 0,
    'Inst Konsultasi Swasta': Number(r.instKonsultasiSwasta) || 0,
    'Belum Presensi': Number(r.belumPresensi) || 0,
    'Keterangan Pengajar': r.keteranganPengajar || '-',
    'Status Tindak Lanjut Keuangan': r.statusTindakLanjutKeuangan || 'Belum Ada Keterangan',
    'Respon Keuangan': r.catatanKeuangan || '-'
  }));
}

// Export records to Excel (.xlsx) file download matching exact 24 columns
export function exportToExcelFile(records: SesiMengajarRecord[], fileName: string = 'Rekap_Sesi_Mengajar') {
  const data = mapRecordsToExportRows(records);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Presensi');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().substring(0, 10)}.xlsx`);
}

// Generate & download blank / sample Excel template with 24 columns
export function downloadExcelTemplate() {
  const sampleData = [
    {
      'Periode': '2026-08-25 sd 2026-09-24',
      'Nopeg': 'NP-1011',
      'Nama Pengajar': 'Dr. Ahmad Fauzi, M.Pd',
      'Kode': 'LOK-BKS-01',
      'Lok': 'Bekasi Timur',
      'Dur Mengajar Negeri': 18.0,
      'Sesi Mengajar Negeri': 12,
      'Menit Sangsi Mengajar Negeri': 0,
      'Insentif Hadir Mengajar Negeri': 0,
      'Jaga Tes Negeri': 3,
      'Dur Mengajar Swasta': 12.0,
      'Menit Sangsi Mengajar Swasta': 0,
      'Insentif Hadir Mengajar Swasta': 0,
      'Jaga TesSwasta': 2,
      'Sesi Mengajar Ahad': 2,
      'Sesi Tidak Hadir': 0,
      'Sesi Mengajar Swasta': 8,
      'Dur Konsultasi Negeri': 4.5,
      'Sesi Konsultasi Negeri': 3,
      'Inst Konsultasi Negeri': 0,
      'Dur Konsultasi Swasta': 3.0,
      'Sesi Konsultasi Swasta': 2,
      'Inst Konsultasi Swasta': 0,
      'Belum Presensi': 0
    },
    {
      'Periode': '2026-08-25 sd 2026-09-24',
      'Nopeg': 'NP-1012',
      'Nama Pengajar': 'Siti Nurhaliza, S.Si',
      'Kode': 'LOK-BKS-02',
      'Lok': 'Bekasi Barat',
      'Dur Mengajar Negeri': 14.0,
      'Sesi Mengajar Negeri': 10,
      'Menit Sangsi Mengajar Negeri': 15,
      'Insentif Hadir Mengajar Negeri': 0,
      'Jaga Tes Negeri': 2,
      'Dur Mengajar Swasta': 8.0,
      'Menit Sangsi Mengajar Swasta': 0,
      'Insentif Hadir Mengajar Swasta': 0,
      'Jaga TesSwasta': 1,
      'Sesi Mengajar Ahad': 1,
      'Sesi Tidak Hadir': 0,
      'Sesi Mengajar Swasta': 6,
      'Dur Konsultasi Negeri': 2.0,
      'Sesi Konsultasi Negeri': 2,
      'Inst Konsultasi Negeri': 0,
      'Dur Konsultasi Swasta': 1.5,
      'Sesi Konsultasi Swasta': 1,
      'Inst Konsultasi Swasta': 0,
      'Belum Presensi': 0
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Format 24 Kolom');
  XLSX.writeFile(workbook, 'Template_Presensi_Sesi_24Kolom.xlsx');
}

// Clean number parsing with Indonesian decimal & thousand format handling
export function parseNumber(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  let str = String(val).trim();
  if (!str) return 0;

  // Handle Indonesian comma decimal format (e.g. "1,5" -> "1.5")
  if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } else if (str.includes('.') && str.includes(',')) {
    // Determine whether comma or dot is the decimal separator
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // Indonesian 1.500,50 -> remove dots, replace comma with dot
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // US 1,500.50 -> remove commas
      str = str.replace(/,/g, '');
    }
  }

  const cleaned = str.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Normalize string for fuzzy comparison
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Intelligent matching of source headers to system fields
export function detectColumnMapping(availableHeaders: string[]): ColumnMappingConfig {
  const result: ColumnMappingConfig = {
    periode: '',
    nopeg: '',
    namaPengajar: '',
    kode: '',
    lok: '',
    defaultLokasi: 'LOK-BKS-01',
    durMengajarNegeri: '',
    sesiMengajarNegeri: '',
    menitSangsiMengajarNegeri: '',
    insentifHadirMengajarNegeri: '',
    jagaTesNegeri: '',
    durMengajarSwasta: '',
    menitSangsiMengajarSwasta: '',
    insentifHadirMengajarSwasta: '',
    jagaTesSwasta: '',
    sesiMengajarAhad: '',
    sesiTidakHadir: '',
    sesiMengajarSwasta: '',
    durKonsultasiNegeri: '',
    sesiKonsultasiNegeri: '',
    instKonsultasiNegeri: '',
    durKonsultasiSwasta: '',
    sesiKonsultasiSwasta: '',
    instKonsultasiSwasta: '',
    belumPresensi: ''
  };

  const usedHeaders = new Set<string>();

  SYSTEM_FIELDS.forEach((field) => {
    let bestMatch = '';
    // Pass 1: exact normalized match
    for (const header of availableHeaders) {
      if (usedHeaders.has(header)) continue;
      const normHeader = normalizeString(header);

      // Guard: do not confuse sequence number "No" / "Nomor" with "Nopeg"
      if (field.key === 'nopeg' && (normHeader === 'no' || normHeader === 'nomor' || normHeader === 'nourut')) {
        continue;
      }

      for (const alias of field.aliases) {
        if (normHeader === normalizeString(alias)) {
          bestMatch = header;
          break;
        }
      }
      if (bestMatch) break;
    }

    // Pass 2: substring match
    if (!bestMatch) {
      for (const header of availableHeaders) {
        if (usedHeaders.has(header)) continue;
        const normHeader = normalizeString(header);

        if (field.key === 'nopeg' && (normHeader === 'no' || normHeader === 'nomor' || normHeader === 'nourut')) {
          continue;
        }

        for (const alias of field.aliases) {
          const normAlias = normalizeString(alias);
          if (normHeader.includes(normAlias) || normAlias.includes(normHeader)) {
            bestMatch = header;
            break;
          }
        }
        if (bestMatch) break;
      }
    }

    if (bestMatch) {
      (result as any)[field.key] = bestMatch;
      usedHeaders.add(bestMatch);
    }
  });

  return result;
}

// Convert user-uploaded data applying the customized ColumnMappingConfig
export function applyColumnMapping(
  rawRows: Record<string, any>[],
  mapping: ColumnMappingConfig,
  defaultPeriode: string = '2026-08-25 sd 2026-09-24'
): SesiMengajarRecord[] {
  const results: SesiMengajarRecord[] = [];

  rawRows.forEach((row, i) => {
    // 1. Periode
    let periode = defaultPeriode;
    if (mapping.periode && row[mapping.periode] !== undefined) {
      const pVal = String(row[mapping.periode]).trim();
      if (pVal) periode = pVal;
    }

    // 2. Nopeg
    let nopeg = '';
    if (mapping.nopeg && row[mapping.nopeg] !== undefined) {
      nopeg = String(row[mapping.nopeg]).trim();
    }

    // 3. Nama Pengajar
    let namaPengajar = '';
    if (mapping.namaPengajar && row[mapping.namaPengajar] !== undefined) {
      namaPengajar = String(row[mapping.namaPengajar]).trim();
    }
    if (!namaPengajar || namaPengajar === 'undefined') {
      namaPengajar = `Pengajar ${i + 1}`;
    }

    if (!nopeg) {
      const matchedTeacher = TEACHERS_LIST.find(
        (t) => t.nama.toLowerCase().includes(namaPengajar.toLowerCase()) ||
               namaPengajar.toLowerCase().includes(t.nama.toLowerCase())
      );
      nopeg = matchedTeacher ? matchedTeacher.nopeg : `NP-${2000 + i}`;
    }

    // 4. Kode Lokasi & 5. Lok
    let kode = '';
    let lok = '';
    if (mapping.kode && row[mapping.kode] !== undefined) {
      kode = String(row[mapping.kode]).trim().toUpperCase();
    }
    if (mapping.lok && row[mapping.lok] !== undefined) {
      lok = String(row[mapping.lok]).trim();
    }

    // Match or fallback to default location
    if (!kode && lok) {
      const matched = LOKASI_DATA.find(
        (l) => l.namaLokasi.toLowerCase().includes(lok.toLowerCase()) ||
               lok.toLowerCase().includes(l.namaLokasi.toLowerCase())
      );
      if (matched) {
        kode = matched.kodeLokasi;
        lok = matched.namaLokasi;
      }
    } else if (kode && !lok) {
      const matched = LOKASI_DATA.find((l) => l.kodeLokasi === kode);
      if (matched) lok = matched.namaLokasi;
    }

    if (!kode) {
      const defLok = LOKASI_DATA.find((l) => l.kodeLokasi === mapping.defaultLokasi) || LOKASI_DATA[0];
      kode = defLok.kodeLokasi;
      lok = defLok.namaLokasi;
    }

    const getValue = (key: keyof ColumnMappingConfig): number => {
      const colName = mapping[key];
      if (!colName || row[colName] === undefined) return 0;
      return parseNumber(row[colName]);
    };

    // Auto-calculate sessions if duration is given but session count is 0
    let durNegeri = getValue('durMengajarNegeri');
    let sesiNegeri = getValue('sesiMengajarNegeri');
    if (sesiNegeri === 0 && durNegeri > 0) {
      sesiNegeri = Math.round(durNegeri / 1.5);
    }

    let durSwasta = getValue('durMengajarSwasta');
    let sesiSwasta = getValue('sesiMengajarSwasta');
    if (sesiSwasta === 0 && durSwasta > 0) {
      sesiSwasta = Math.round(durSwasta / 1.5);
    }

    let durKonsulNegeri = getValue('durKonsultasiNegeri');
    let sesiKonsulNegeri = getValue('sesiKonsultasiNegeri');
    if (sesiKonsulNegeri === 0 && durKonsulNegeri > 0) {
      sesiKonsulNegeri = Math.round(durKonsulNegeri / 1.5);
    }

    let durKonsulSwasta = getValue('durKonsultasiSwasta');
    let sesiKonsulSwasta = getValue('sesiKonsultasiSwasta');
    if (sesiKonsulSwasta === 0 && durKonsulSwasta > 0) {
      sesiKonsulSwasta = Math.round(durKonsulSwasta / 1.5);
    }

    const record: SesiMengajarRecord = {
      id: `rec-imp-${Date.now()}-${i}`,
      periode,
      nopeg,
      namaPengajar,
      kode,
      lok,
      kodeLokasi: kode,
      lokasi: lok,
      durMengajarNegeri: durNegeri,
      sesiMengajarNegeri: sesiNegeri,
      menitSangsiMengajarNegeri: getValue('menitSangsiMengajarNegeri'),
      insentifHadirMengajarNegeri: getValue('insentifHadirMengajarNegeri'),
      jagaTesNegeri: getValue('jagaTesNegeri'),
      durMengajarSwasta: durSwasta,
      menitSangsiMengajarSwasta: getValue('menitSangsiMengajarSwasta'),
      insentifHadirMengajarSwasta: getValue('insentifHadirMengajarSwasta'),
      jagaTesSwasta: getValue('jagaTesSwasta'),
      sesiMengajarAhad: getValue('sesiMengajarAhad'),
      sesiTidakHadir: getValue('sesiTidakHadir'),
      sesiMengajarSwasta: sesiSwasta,
      durKonsultasiNegeri: durKonsulNegeri,
      sesiKonsultasiNegeri: sesiKonsulNegeri,
      instKonsultasiNegeri: getValue('instKonsultasiNegeri'),
      durKonsultasiSwasta: durKonsulSwasta,
      sesiKonsultasiSwasta: sesiKonsulSwasta,
      instKonsultasiSwasta: getValue('instKonsultasiSwasta'),
      belumPresensi: getValue('belumPresensi'),
      statusKoreksi: 'Belum Dicek'
    };

    results.push(record);
  });

  return results;
}

// Parse Raw Rows from Excel / CSV into SesiMengajarRecord
export function parseRawRowsToRecords(rawRows: Record<string, any>[], defaultPeriode: string = '2026-08-25 sd 2026-09-24'): SesiMengajarRecord[] {
  if (!rawRows || rawRows.length === 0) return [];
  const sample = rawRows[0];
  const headers = Object.keys(sample);
  const detected = detectColumnMapping(headers);
  return applyColumnMapping(rawRows, detected, defaultPeriode);
}

// Helper to extract clean rows from a worksheet by locating the true header row
function extractRowsFromWorksheet(worksheet: XLSX.WorkSheet): Record<string, any>[] {
  const rawMatrix = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
  if (!rawMatrix || rawMatrix.length === 0) return [];

  // Keywords that identify header rows in teaching session datasets
  const headerKeywords = [
    'nama', 'pengajar', 'guru', 'nopeg', 'nip', 'nik', 'kode', 'lok', 'lokasi',
    'sesi', 'periode', 'durasi', 'dur', 'negeri', 'swasta', 'insentif', 'jaga',
    'konsul', 'presensi', 'hadir'
  ];

  let headerRowIndex = 0;
  let maxKeywordScore = 0;

  // Search first 15 rows for the best matching header row
  for (let r = 0; r < Math.min(15, rawMatrix.length); r++) {
    const row = rawMatrix[r];
    if (!Array.isArray(row)) continue;
    let score = 0;
    for (const cell of row) {
      if (typeof cell === 'string') {
        const lower = cell.toLowerCase().trim();
        for (const kw of headerKeywords) {
          if (lower.includes(kw)) {
            score++;
            break;
          }
        }
      }
    }
    if (score > maxKeywordScore) {
      maxKeywordScore = score;
      headerRowIndex = r;
    }
  }

  // Parse starting at the detected header row
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    range: headerRowIndex,
    defval: ''
  });

  // Filter out completely empty or blank lines
  return jsonData.filter((row) => {
    const values = Object.values(row).filter((v) => v !== '' && v !== null && v !== undefined);
    return values.length >= 2;
  });
}

// Parse pasted tabular text (TSV from Excel/Google Sheets copy, or CSV)
export function parseClipboardText(text: string): Record<string, any>[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const workbook = XLSX.read(trimmed, { type: 'string', raw: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return extractRowsFromWorksheet(sheet);
}

// Convert Google Sheet URL to direct CSV URL if possible
export function convertGoogleSheetUrlToCsv(url: string): string {
  const trimmed = url.trim();
  if (trimmed.includes('output=csv')) {
    return trimmed;
  }
  if (trimmed.includes('/pubhtml')) {
    return trimmed.replace('/pubhtml', '/pub?output=csv');
  }
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }
  return trimmed;
}

// Fetch CSV from URL (with multi-strategy fallback for zero CORS issues)
export async function fetchCsvFromGoogleSheet(url: string): Promise<Record<string, any>[]> {
  const rawUrl = url.trim();
  const proxyUrl = `/api/fetch-sheet?url=${encodeURIComponent(rawUrl)}`;

  try {
    const resp = await fetch(proxyUrl);
    if (!resp.ok) {
      let errorJson: any = null;
      try {
        errorJson = await resp.json();
      } catch {}
      if (errorJson && errorJson.error) {
        throw new Error(errorJson.error);
      }
      throw new Error(`Gagal menghubungi Google Sheet (HTTP ${resp.status})`);
    }

    const text = await resp.text();
    if (!text || text.trim().length === 0) {
      throw new Error('Data Google Sheet kosong.');
    }

    const workbook = XLSX.read(text, { type: 'string', raw: true });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = extractRowsFromWorksheet(sheet);
    if (!rows || rows.length === 0) {
      throw new Error('Tidak ada baris data presensi yang terbaca dari Google Sheet tersebut.');
    }
    return rows;
  } catch (err: any) {
    throw new Error(
      err.message ||
      'Gagal mengambil data dari Google Sheet. Pastikan setelan Berbagi diset "Siapa saja yang memiliki link dapat melihat" atau gunakan opsi Upload File Excel (.xlsx).'
    );
  }
}

// Parse ArrayBuffer from uploaded File (.xlsx, .xls, .csv)
export function parseUploadedFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array', raw: true });

        // Check across all sheets in case the active data is not on sheet 1
        let bestRows: Record<string, any>[] = [];
        for (const sheetName of workbook.SheetNames) {
          const ws = workbook.Sheets[sheetName];
          const rows = extractRowsFromWorksheet(ws);
          if (rows.length > bestRows.length) {
            bestRows = rows;
          }
        }

        if (bestRows.length === 0 && workbook.SheetNames.length > 0) {
          const ws = workbook.Sheets[workbook.SheetNames[0]];
          bestRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
        }

        if (bestRows.length === 0) {
          throw new Error('File Excel tidak memiliki baris data yang dapat dibaca.');
        }

        resolve(bestRows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
