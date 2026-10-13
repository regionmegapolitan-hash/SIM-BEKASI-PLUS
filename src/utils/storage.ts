import { SesiMengajarRecord, UserSession, LokasiInfo, WilayahInfo, UserAccount, ApprovalStatus, StatusTindakLanjutKeuangan, Role } from '../types';
import { INITIAL_SESI_RECORDS, LOKASI_DATA, WILAYAH_DATA, TEACHERS_LIST } from '../data/mockData';

const STORAGE_KEYS = {
  RECORDS: 'sim_sesi_records_v7',
  USER_SESSION: 'sim_sesi_user_v1',
  WILAYAH: 'sim_sesi_wilayah_v1',
  LOKASI: 'sim_sesi_lokasi_v3',
  ACTIVE_PERIODE: 'sim_sesi_periode_v3',
  ACCOUNTS: 'sim_sesi_accounts_v1'
};

// Initial Seed Accounts
const DEFAULT_ACCOUNTS: UserAccount[] = [
  // 1. Admin Wilayah & Keuangan (Murtiyo / Kode: 446)
  {
    id: 'acc-wilayah-01',
    email: 'wilayahbekasiplus@gmail.com',
    password: 'admin123',
    role: 'admin_wilayah',
    name: 'Murtiyo',
    identifier: '446',
    unitName: 'Wilayah Bekasi Plus (446)',
    phone: '0811-2233-4455',
    status: 'approved',
    registeredAt: '2026-10-01 08:00',
    approvedAt: '2026-10-01 08:00',
    approvedBy: 'Sistem'
  },
  // 2. Admin Keuangan Wilayah (Siti Rahmawati / FIN-446)
  {
    id: 'acc-keuangan-01',
    email: 'keuangan@gmail.com',
    password: 'keuangan123',
    role: 'admin_wilayah',
    name: 'Siti Rahmawati, S.E (Admin Keuangan)',
    identifier: 'FIN-446',
    unitName: 'Divisi Keuangan & Honor Wilayah (446)',
    phone: '0811-9988-7766',
    status: 'approved',
    registeredAt: '2026-10-01 08:00',
    approvedAt: '2026-10-01 08:00',
    approvedBy: 'Murtiyo'
  },
  // 3. Admin Lokasi (Ratna Sulistiawati / Kode Lokasi: 119)
  {
    id: 'acc-lokasi-119',
    email: 'lokasi119@gmail.com',
    password: 'lokasi123',
    role: 'admin_lokasi',
    name: 'Ratna Sulistiawati, S.Pd',
    identifier: '119',
    unitName: 'Lokasi 119 (Bekasi Timur)',
    phone: '0812-9876-1101',
    status: 'approved',
    registeredAt: '2026-10-01 08:15',
    approvedAt: '2026-10-01 08:15',
    approvedBy: 'Murtiyo'
  },
  // 4. Guru Pengajar Utama (Achmad Sofian / Nopeg: 710178)
  {
    id: 'acc-guru-710178',
    email: 'achmad.sofian@gmail.com',
    password: 'guru123',
    role: 'pengajar',
    name: 'ACHMAD SOFIAN',
    identifier: '710178',
    unitName: 'Guru Pengajar (Nopeg: 710178)',
    phone: '0813-1122-3344',
    status: 'approved',
    registeredAt: '2026-10-01 08:30',
    approvedAt: '2026-10-01 08:30',
    approvedBy: 'Murtiyo'
  },
  // 5. Guru Pengajar (Dr. Ahmad Fauzi / Nopeg: 709027)
  {
    id: 'acc-guru-709027',
    email: 'guru709027@gmail.com',
    password: 'guru123',
    role: 'pengajar',
    name: 'Dr. Ahmad Fauzi, M.Pd',
    identifier: '709027',
    unitName: 'Guru Matematika & SNBT (Nopeg: 709027)',
    phone: '0813-1122-3344',
    status: 'approved',
    registeredAt: '2026-10-01 08:30',
    approvedAt: '2026-10-01 08:30',
    approvedBy: 'Murtiyo'
  },
  // 4. Contoh Akun Pengajar Baru (Menunggu Persetujuan Admin Wilayah)
  {
    id: 'acc-guru-pending-1',
    email: 'budi.santoso@gmail.com',
    password: 'guru123',
    role: 'pengajar',
    name: 'Budi Santoso, M.T',
    identifier: '709028',
    unitName: 'Guru Fisika (Nopeg: 709028)',
    phone: '0813-7788-9900',
    status: 'pending',
    registeredAt: '2026-10-05 08:00',
    notes: 'Pendaftaran mandiri melalui portal guru.'
  },
  // 5. Contoh Akun Lokasi Baru (Menunggu Persetujuan Admin Wilayah)
  {
    id: 'acc-lokasi-pending-2',
    email: 'lokasi120@gmail.com',
    password: 'lokasi123',
    role: 'admin_lokasi',
    name: 'Dimas Ardiansyah, M.Pd',
    identifier: '120',
    unitName: 'Lokasi 120 (Bekasi Barat)',
    phone: '0812-9876-1102',
    status: 'pending',
    registeredAt: '2026-10-05 08:45',
    notes: 'Pengajuan akun kepala unit lokasi baru.'
  }
];

// ================= ACCOUNTS MANAGEMENT =================

export function getStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      saveStoredAccounts(DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveStoredAccounts(DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse stored accounts', e);
    return DEFAULT_ACCOUNTS;
  }
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

// Register new account (Defaults to 'pending' waiting for Admin Wilayah approval)
export function registerNewAccount(data: {
  email: string;
  password: string;
  name: string;
  role: Role;
  identifier: string;
  unitName: string;
  phone?: string;
}): { success: boolean; message: string; account?: UserAccount } {
  const cleanEmail = data.email.trim().toLowerCase();
  const accounts = getStoredAccounts();

  // Check duplicate email
  const existingEmail = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return {
      success: false,
      message: `Email ${cleanEmail} sudah terdaftar di sistem. Silakan login atau hubungi Admin Wilayah.`
    };
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newAccount: UserAccount = {
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    password: data.password.trim(),
    role: data.role,
    name: data.name.trim(),
    identifier: data.identifier.trim(),
    unitName: data.unitName.trim() || (data.role === 'admin_lokasi' ? `Lokasi ${data.identifier}` : `Pengajar ${data.identifier}`),
    phone: data.phone?.trim() || '-',
    status: 'pending', // Requires approval
    registeredAt: now,
    notes: 'Pendaftaran akun baru menunggu verifikasi Admin Wilayah.'
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  return {
    success: true,
    message: 'Pendaftaran akun berhasil dikirim! Akun Anda sedang menunggu persetujuan dari Admin Wilayah sebelum dapat digunakan untuk masuk.',
    account: newAccount
  };
}

// Admin Wilayah Approves an Account
export function approveAccount(accountId: string, approverName: string): UserAccount[] {
  const accounts = getStoredAccounts();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updated = accounts.map((acc) => {
    if (acc.id === accountId) {
      return {
        ...acc,
        status: 'approved' as ApprovalStatus,
        approvedAt: now,
        approvedBy: approverName
      };
    }
    return acc;
  });
  saveStoredAccounts(updated);
  return updated;
}

// Admin Wilayah Rejects an Account
export function rejectAccount(accountId: string, notes?: string): UserAccount[] {
  const accounts = getStoredAccounts();
  const updated = accounts.map((acc) => {
    if (acc.id === accountId) {
      return {
        ...acc,
        status: 'rejected' as ApprovalStatus,
        notes: notes || 'Pendaftaran ditolak oleh Admin Wilayah.'
      };
    }
    return acc;
  });
  saveStoredAccounts(updated);
  return updated;
}

// Password Change by Account Owner
export function changeUserPassword(
  emailOrIdentifier: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; message: string } {
  const accounts = getStoredAccounts();
  const cleanInput = emailOrIdentifier.trim().toLowerCase();
  const cleanOld = oldPassword.trim();
  const cleanNew = newPassword.trim();

  if (cleanNew.length < 6) {
    return { success: false, message: 'Password baru minimal harus 6 karakter.' };
  }

  const accountIndex = accounts.findIndex(
    (a) => a.email.toLowerCase() === cleanInput || a.identifier.toLowerCase() === cleanInput
  );

  if (accountIndex === -1) {
    return { success: false, message: 'Akun tidak ditemukan di sistem.' };
  }

  const account = accounts[accountIndex];

  // Validate old password
  if (account.password !== cleanOld) {
    return { success: false, message: 'Password lama (saat ini) tidak sesuai.' };
  }

  accounts[accountIndex].password = cleanNew;
  saveStoredAccounts(accounts);

  // If active user session matches, update session if needed
  const currentSession = getStoredUserSession();
  if (currentSession && (currentSession.email?.toLowerCase() === account.email.toLowerCase() || currentSession.identifier === account.identifier)) {
    saveUserSession({
      ...currentSession,
      email: account.email
    });
  }

  return { success: true, message: 'Password akun Anda berhasil diubah! Gunakan password baru ini saat masuk berikutnya.' };
}

// Admin Wilayah resets password for a user
export function adminResetPassword(accountId: string, newPass: string): { success: boolean; message: string } {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx === -1) {
    return { success: false, message: 'Akun tidak ditemukan.' };
  }
  accounts[idx].password = newPass.trim();
  saveStoredAccounts(accounts);
  return { success: true, message: `Password untuk ${accounts[idx].name} berhasil di-reset menjadi "${newPass.trim()}".` };
}

// Admin Wilayah Deletes an Account
export function deleteAccount(accountId: string): {
  success: boolean;
  message: string;
  updatedAccounts: UserAccount[];
} {
  const accounts = getStoredAccounts();
  const target = accounts.find((a) => a.id === accountId);
  if (!target) {
    return { success: false, message: 'Akun tidak ditemukan di sistem.', updatedAccounts: accounts };
  }
  const next = accounts.filter((a) => a.id !== accountId);
  saveStoredAccounts(next);
  return {
    success: true,
    message: `Akun "${target.name}" (${target.email}) berhasil dihapus.`,
    updatedAccounts: next
  };
}

// Admin Wilayah Batch Deletes Accounts
export function batchDeleteAccounts(accountIds: string[]): {
  success: boolean;
  message: string;
  updatedAccounts: UserAccount[];
} {
  const accounts = getStoredAccounts();
  const idSet = new Set(accountIds);
  const remaining = accounts.filter((a) => !idSet.has(a.id));
  const deletedCount = accounts.length - remaining.length;
  saveStoredAccounts(remaining);
  return {
    success: true,
    message: `${deletedCount} akun berhasil dihapus dari sistem.`,
    updatedAccounts: remaining
  };
}

// ================= AUTHENTICATION =================

export function authenticateUser(
  emailOrId: string,
  password: string
): {
  success: boolean;
  user?: UserSession;
  message?: string;
  status?: ApprovalStatus;
} {
  const cleanInput = emailOrId.trim().toLowerCase();
  const cleanPass = password.trim();
  const accounts = getStoredAccounts();

  // 1. Direct match by Email, Identifier (Kode/Nopeg), Unit Name, or Full Name
  let account = accounts.find(
    (a) =>
      a.email.toLowerCase() === cleanInput ||
      a.identifier.toLowerCase() === cleanInput ||
      a.unitName.toLowerCase() === cleanInput ||
      a.name.toLowerCase() === cleanInput
  );

  // 2. If not found directly, try matching through LOKASI_DATA (e.g. "NF Vila Nusa Indah" or "122")
  if (!account) {
    const locMatch = LOKASI_DATA.find(
      (l) => l.kodeLokasi.toLowerCase() === cleanInput || l.namaLokasi.toLowerCase() === cleanInput
    );
    if (locMatch) {
      // Find if there is an account created for this location code
      const matchingAccount = accounts.find(
        (a) => a.identifier.toLowerCase() === locMatch.kodeLokasi.toLowerCase()
      );
      if (matchingAccount) {
        account = matchingAccount;
      }
    }
  }

  // 3. If not found, try matching through TEACHERS_LIST (e.g. teacher name or nopeg)
  if (!account) {
    const teacherMatch = TEACHERS_LIST.find(
      (t) => t.nopeg.toLowerCase() === cleanInput || t.nama.toLowerCase() === cleanInput
    );
    if (teacherMatch) {
      const matchingAccount = accounts.find(
        (a) => a.identifier.toLowerCase() === teacherMatch.nopeg.toLowerCase()
      );
      if (matchingAccount) {
        account = matchingAccount;
      }
    }
  }

  // 4. Fallback for demo/default mock accounts if no stored account matched
  if (!account) {
    const locMatch = LOKASI_DATA.find(
      (l) => l.kodeLokasi.toLowerCase() === cleanInput || l.namaLokasi.toLowerCase() === cleanInput
    );
    if (locMatch && (cleanPass === 'lokasi123' || cleanPass === 'admin123')) {
      const user: UserSession = {
        id: `acc-lokasi-${locMatch.kodeLokasi}`,
        role: 'admin_lokasi',
        name: locMatch.penanggungJawab || `Koordinator ${locMatch.namaLokasi}`,
        identifier: locMatch.kodeLokasi,
        unitName: locMatch.namaLokasi,
        email: `lokasi${locMatch.kodeLokasi}@gmail.com`,
        phone: locMatch.kontak
      };
      return { success: true, user };
    }

    const teacherMatch = TEACHERS_LIST.find(
      (t) => t.nopeg.toLowerCase() === cleanInput || t.nama.toLowerCase() === cleanInput
    );
    if (teacherMatch && (cleanPass === 'guru123' || cleanPass === 'admin123')) {
      const user: UserSession = {
        id: `acc-guru-${teacherMatch.nopeg}`,
        role: 'pengajar',
        name: teacherMatch.nama,
        identifier: teacherMatch.nopeg,
        unitName: `Pengajar Nopeg: ${teacherMatch.nopeg}`,
        email: `guru${teacherMatch.nopeg}@gmail.com`
      };
      return { success: true, user };
    }

    return {
      success: false,
      message: 'Email atau ID belum terdaftar di sistem. Silakan periksa kembali atau lakukan pendaftaran akun baru.'
    };
  }

  // Check Approval Status
  if (account.status === 'pending') {
    return {
      success: false,
      status: 'pending',
      message: `Akun "${account.email}" masih MENUNGGU PERSETUJUAN dari Admin Wilayah. Harap hubungi Admin Wilayah untuk menyetujui akun Anda.`
    };
  }

  if (account.status === 'rejected') {
    return {
      success: false,
      status: 'rejected',
      message: `Pendaftaran akun "${account.email}" DITOLAK atau DIBATALKAN oleh Admin Wilayah. ${account.notes || ''}`
    };
  }

  // Verify password
  if (account.password !== cleanPass) {
    return {
      success: false,
      message: 'Password yang Anda masukkan salah. Silakan coba lagi atau hubungi Admin Wilayah untuk mereset password.'
    };
  }

  // Login successful
  const user: UserSession = {
    id: account.id,
    role: account.role,
    name: account.name,
    identifier: account.identifier,
    unitName: account.unitName,
    email: account.email,
    phone: account.phone
  };

  return { success: true, user };
}

// ================= RECORDS & SYSTEM STORAGE =================

// Seed sample follow-ups for immediate demo & monitoring
function seedSampleKeteranganIfEmpty(records: SesiMengajarRecord[]): SesiMengajarRecord[] {
  let hasAnyKeterangan = records.some((r) => r.keteranganPengajar && r.keteranganPengajar.trim().length > 0);
  if (!hasAnyKeterangan && records.length > 0) {
    return records.map((r, idx) => {
      // Seed first record of ACHMAD SOFIAN (710178) or first record
      if (idx === 0 || r.nopeg === '710178') {
        return {
          ...r,
          keteranganPengajar: 'Mohon dicek kembali sesi mengajar negeri tanggal 14 September, insentif hadir mengajar negeri belum terhitung di sistem.',
          waktuKeteranganPengajar: '2026-09-26 10:15',
          statusTindakLanjutKeuangan: 'Menunggu Tindak Lanjut'
        };
      }
      // Seed another record with completed follow-up
      if (idx === 3) {
        return {
          ...r,
          keteranganPengajar: 'Klarifikasi 1 sesi belum presensi karena kendala sistem unit lokasi, presensi manual sudah diverifikasi kepala unit.',
          waktuKeteranganPengajar: '2026-09-24 16:40',
          statusTindakLanjutKeuangan: 'Selesai Ditindaklanjuti',
          catatanKeuangan: 'Sudah divalidasi dengan absensi manual unit lokasi. Presensi telah disetujui dan insentif dimasukkan ke slip honor.',
          waktuTindakLanjutKeuangan: '2026-09-25 09:20',
          petugasKeuangan: 'Murtiyo (Admin Keuangan Wilayah)'
        };
      }
      return {
        ...r,
        statusTindakLanjutKeuangan: r.statusTindakLanjutKeuangan || (r.keteranganPengajar ? 'Menunggu Tindak Lanjut' : 'Belum Ada Keterangan')
      };
    });
  }
  return records.map((r) => ({
    ...r,
    statusTindakLanjutKeuangan: r.statusTindakLanjutKeuangan || (r.keteranganPengajar ? 'Menunggu Tindak Lanjut' : 'Belum Ada Keterangan')
  }));
}

// Retrieve Sesi Records
export function getStoredRecords(): SesiMengajarRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      const seeded = seedSampleKeteranganIfEmpty(INITIAL_SESI_RECORDS);
      saveStoredRecords(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    const enriched = seedSampleKeteranganIfEmpty(parsed);
    return enriched;
  } catch (e) {
    console.error('Failed to parse stored records', e);
    const seeded = seedSampleKeteranganIfEmpty(INITIAL_SESI_RECORDS);
    return seeded;
  }
}

// Save Sesi Records
export function saveStoredRecords(records: SesiMengajarRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

// Reset data to defaults
export function resetToDefaultData(): SesiMengajarRecord[] {
  const seeded = seedSampleKeteranganIfEmpty(INITIAL_SESI_RECORDS);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(seeded));
  saveStoredAccounts(DEFAULT_ACCOUNTS);
  return seeded;
}

// Retrieve Active User Session
export function getStoredUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Save User Session
export function saveUserSession(session: UserSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  }
}

// Update single record
export function updateRecord(recordId: string, updates: Partial<SesiMengajarRecord>): SesiMengajarRecord[] {
  const records = getStoredRecords();
  const next = records.map((r) => (r.id === recordId ? { ...r, ...updates } : r));
  saveStoredRecords(next);
  return next;
}

// Update keterangan by Guru Pengajar
export function updateKeteranganPengajar(recordId: string, keterangan: string): SesiMengajarRecord[] {
  const records = getStoredRecords();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const trimmed = keterangan.trim();
  const next = records.map((r) => {
    if (r.id === recordId) {
      return {
        ...r,
        keteranganPengajar: trimmed,
        waktuKeteranganPengajar: trimmed ? now : undefined,
        statusTindakLanjutKeuangan: (trimmed ? 'Menunggu Tindak Lanjut' : 'Belum Ada Keterangan') as StatusTindakLanjutKeuangan
      };
    }
    return r;
  });
  saveStoredRecords(next);
  return next;
}

// Action / Respon Tindak Lanjut oleh Admin Keuangan
export function updateTindakLanjutKeuangan(
  recordId: string,
  status: StatusTindakLanjutKeuangan,
  catatanKeuangan: string,
  adminName: string
): SesiMengajarRecord[] {
  const records = getStoredRecords();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const next = records.map((r) => {
    if (r.id === recordId) {
      return {
        ...r,
        statusTindakLanjutKeuangan: status,
        catatanKeuangan: catatanKeuangan.trim() || undefined,
        waktuTindakLanjutKeuangan: now,
        petugasKeuangan: adminName
      };
    }
    return r;
  });
  saveStoredRecords(next);
  return next;
}

// Update verification status in batch (e.g. for a location)
export function updateLokasiBatchVerification(
  kodeLokasi: string,
  newStatus: 'Sudah Dikoreksi' | 'Belum Dicek',
  korektorName: string,
  catatan?: string
): SesiMengajarRecord[] {
  const records = getStoredRecords();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const target = String(kodeLokasi || '').trim().toLowerCase();
  const next = records.map((r) => {
    const recLok = String(r.lok || '').trim().toLowerCase();
    const recKodeLokasi = String(r.kodeLokasi || '').trim().toLowerCase();
    const recLokasiName = String(r.lokasi || '').trim().toLowerCase();

    if (recLok === target || recKodeLokasi === target || recLokasiName === target) {
      return {
        ...r,
        statusKoreksi: newStatus,
        korektor: newStatus === 'Sudah Dikoreksi' ? korektorName : undefined,
        waktuKoreksi: newStatus === 'Sudah Dikoreksi' ? now : undefined,
        catatanKoreksi: catatan !== undefined ? catatan : r.catatanKoreksi
      };
    }
    return r;
  });
  saveStoredRecords(next);
  return next;
}

// Import or merge records from Google Sheets or Excel
export function mergeOrReplaceRecords(newRecords: SesiMengajarRecord[], mode: 'replace' | 'merge' = 'merge'): SesiMengajarRecord[] {
  if (mode === 'replace') {
    saveStoredRecords(newRecords);
    return newRecords;
  }
  
  const current = getStoredRecords();
  // Merge by composite key: nopeg + lok/kodeLokasi + periode
  const map = new Map<string, SesiMengajarRecord>();
  current.forEach((r) => map.set(`${r.nopeg}_${r.lok || r.kodeLokasi}_${r.periode}`, r));
  
  newRecords.forEach((item) => {
    const key = `${item.nopeg}_${item.lok || item.kodeLokasi}_${item.periode}`;
    const existing = map.get(key);
    if (existing) {
      // Retain verification if unchanged, or update values
      map.set(key, {
        ...existing,
        ...item,
        id: existing.id,
        statusKoreksi: existing.statusKoreksi,
        korektor: existing.korektor,
        waktuKoreksi: existing.waktuKoreksi
      });
    } else {
      map.set(key, {
        ...item,
        id: item.id || `rec-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      });
    }
  });

  const merged = Array.from(map.values());
  saveStoredRecords(merged);
  return merged;
}
