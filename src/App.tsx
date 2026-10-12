import React, { useState, useEffect } from 'react';
import { UserSession, SesiMengajarRecord, StatusTindakLanjutKeuangan } from './types';
import {
  getStoredRecords,
  saveStoredRecords,
  getStoredUserSession,
  saveUserSession,
  resetToDefaultData,
  updateRecord,
  updateLokasiBatchVerification,
  mergeOrReplaceRecords,
  getStoredAccounts,
  updateKeteranganPengajar,
  updateTindakLanjutKeuangan
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { WilayahDashboard } from './components/WilayahDashboard';
import { LokasiDashboard } from './components/LokasiDashboard';
import { PengajarDashboard } from './components/PengajarDashboard';
import { ImportModal } from './components/ImportModal';
import { EditSessionModal } from './components/EditSessionModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { UserApprovalModal } from './components/UserApprovalModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    // If there's an existing session in localStorage, use it. Otherwise, default to Admin Wilayah for immediate live preview experience
    const stored = getStoredUserSession();
    if (stored) return stored;
    return {
      id: 'acc-wilayah-01',
      role: 'admin_wilayah',
      name: 'Murtiyo',
      identifier: '446',
      unitName: 'Wilayah Bekasi Plus (446)',
      email: 'wilayahbekasiplus@gmail.com'
    };
  });

  const [records, setRecords] = useState<SesiMengajarRecord[]>(() => {
    const current = getStoredRecords();
    return current.map((r) => ({
      ...r,
      periode: r.periode || '2026-08-25 sd 2026-09-24',
      kode: r.kode || '',
      lok: r.lok || r.kodeLokasi || '',
      kodeLokasi: r.kodeLokasi || r.lok || '',
      lokasi: r.lokasi || '',
      sesiMengajarNegeri: r.sesiMengajarNegeri !== undefined ? r.sesiMengajarNegeri : Math.max(0, Math.round((Number(r.durMengajarNegeri) || 0) / 1.5)),
      sesiMengajarSwasta: r.sesiMengajarSwasta !== undefined ? r.sesiMengajarSwasta : Math.max(0, Math.round((Number(r.durMengajarSwasta) || 0) / 1.5)),
      sesiMengajarAhad: r.sesiMengajarAhad !== undefined ? r.sesiMengajarAhad : 0,
      sesiTidakHadir: r.sesiTidakHadir !== undefined ? r.sesiTidakHadir : 0,
      sesiKonsultasiNegeri: r.sesiKonsultasiNegeri !== undefined ? r.sesiKonsultasiNegeri : Math.max(0, Math.round((Number(r.durKonsultasiNegeri) || 0) / 1.5)),
      sesiKonsultasiSwasta: r.sesiKonsultasiSwasta !== undefined ? r.sesiKonsultasiSwasta : Math.max(0, Math.round((Number(r.durKonsultasiSwasta) || 0) / 1.5)),
    }));
  });

  const [activePeriode, setActivePeriode] = useState<string>('2026-08-25 sd 2026-09-24');

  const availablePeriodes = React.useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.periode).filter(Boolean)));
    const defaults = [
      '2026-08-25 sd 2026-09-24',
      '2026-07-25 sd 2026-08-24',
      '2026-09-25 sd 2026-10-24'
    ];
    defaults.forEach((d) => {
      if (!list.includes(d)) list.push(d);
    });
    return list;
  }, [records]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isUserApprovalOpen, setIsUserApprovalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SesiMengajarRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [pendingApprovalCount, setPendingApprovalCount] = useState<number>(() => {
    try {
      const accounts = getStoredAccounts();
      return accounts.filter((a) => a.status === 'pending').length;
    } catch {
      return 0;
    }
  });

  const refreshPendingCount = () => {
    try {
      const accounts = getStoredAccounts();
      setPendingApprovalCount(accounts.filter((a) => a.status === 'pending').length);
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    saveUserSession(user);
    refreshPendingCount();
    showToast(`Berhasil masuk sebagai ${user.name} (${user.email})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveUserSession(null);
    showToast('Anda telah keluar.');
  };

  const handleSwitchUser = (newUser: UserSession) => {
    setCurrentUser(newUser);
    saveUserSession(newUser);
    refreshPendingCount();
    showToast(`Beralih ke ${newUser.name} (${newUser.email || newUser.identifier})`);
  };

  const handleResetData = () => {
    const fresh = resetToDefaultData();
    setRecords([...fresh]);
    refreshPendingCount();
    showToast('Data demo berhasil di-reset ke kondisi awal.');
  };

  // Update status from location view
  const handleUpdateRecordStatus = (
    recordId: string,
    status: 'Sudah Dikoreksi' | 'Belum Dicek' | 'Perlu Perbaikan',
    catatan?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedRecords = updateRecord(recordId, {
      statusKoreksi: status,
      korektor: status === 'Sudah Dikoreksi' ? currentUser?.name : undefined,
      waktuKoreksi: status === 'Sudah Dikoreksi' ? now : undefined,
      catatanKoreksi: catatan !== undefined ? catatan : undefined
    });
    setRecords([...updatedRecords]);
    showToast(`Status sesi diperbarui: ${status}`);
  };

  // Batch verify entire location
  const handleBatchVerifyLocation = (kodeLokasi: string, status: 'Sudah Dikoreksi' | 'Belum Dicek') => {
    const updated = updateLokasiBatchVerification(
      kodeLokasi,
      status,
      currentUser?.name || 'Admin Lokasi'
    );
    setRecords([...updated]);
    showToast(`Semua sesi di lokasi ${kodeLokasi} ditandai ${status}.`);
  };

  // Import complete from Google Sheets or Excel
  const handleImportComplete = (newRecords: SesiMengajarRecord[], mode: 'merge' | 'replace') => {
    const result = mergeOrReplaceRecords(newRecords, mode);
    setRecords([...result]);
    showToast(`Berhasil mengimpor ${newRecords.length} data presensi sesi.`);
  };

  // Save edited record from modal
  const handleSaveEditedRecord = (updated: SesiMengajarRecord) => {
    const next = updateRecord(updated.id, updated);
    setRecords([...next]);
    showToast(`Perubahan sesi untuk ${updated.namaPengajar} disimpan.`);
  };

  // Save keterangan from teacher dashboard
  const handleSaveKeteranganPengajar = (recordId: string, keterangan: string) => {
    const updated = updateKeteranganPengajar(recordId, keterangan);
    setRecords([...updated]);
    showToast('Keterangan berhasil disimpan & diteruskan ke Admin Keuangan.');
  };

  // Save tindak lanjut by Admin Keuangan
  const handleSaveTindakLanjutKeuangan = (
    recordId: string,
    status: StatusTindakLanjutKeuangan,
    catatanKeuangan: string
  ) => {
    const updated = updateTindakLanjutKeuangan(
      recordId,
      status,
      catatanKeuangan,
      currentUser?.name || 'Admin Keuangan'
    );
    setRecords([...updated]);
    showToast(`Tindak lanjut keuangan disimpan: ${status}`);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenUserApproval={() => setIsUserApprovalOpen(true)}
        pendingApprovalCount={pendingApprovalCount}
        activePeriode={activePeriode}
        onChangePeriode={setActivePeriode}
        availablePeriodes={availablePeriodes}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {(currentUser.role === 'admin_wilayah' || currentUser.role === 'admin_keuangan') && (
          <WilayahDashboard
            user={currentUser}
            records={records}
            activePeriode={activePeriode}
            onOpenImport={() => setIsImportModalOpen(true)}
            onEditRecord={(rec) => setEditingRecord(rec)}
            onOpenUserApproval={() => setIsUserApprovalOpen(true)}
            pendingApprovalCount={pendingApprovalCount}
            onSaveTindakLanjutKeuangan={handleSaveTindakLanjutKeuangan}
          />
        )}

        {currentUser.role === 'admin_lokasi' && (
          <LokasiDashboard
            user={currentUser}
            records={records}
            activePeriode={activePeriode}
            onOpenImport={() => setIsImportModalOpen(true)}
            onUpdateRecordStatus={handleUpdateRecordStatus}
            onBatchVerifyLocation={handleBatchVerifyLocation}
          />
        )}

        {currentUser.role === 'pengajar' && (
          <PengajarDashboard
            user={currentUser}
            records={records}
            activePeriode={activePeriode}
            onSaveKeterangan={handleSaveKeteranganPengajar}
          />
        )}
      </main>

      {/* Import Modal (Google Sheets / Excel) */}
      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={handleImportComplete}
          activePeriode={activePeriode}
        />
      )}

      {/* Edit Session Record Modal */}
      {editingRecord && (
        <EditSessionModal
          isOpen={!!editingRecord}
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleSaveEditedRecord}
          currentUserName={currentUser.name}
        />
      )}

      {/* Change Password Modal (By Account Owner) */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          user={currentUser}
          onPasswordChanged={(msg) => showToast(msg)}
        />
      )}

      {/* User Approval Modal (By Admin Wilayah) */}
      {isUserApprovalOpen && (
        <UserApprovalModal
          isOpen={isUserApprovalOpen}
          onClose={() => {
            setIsUserApprovalOpen(false);
            refreshPendingCount();
          }}
          currentUser={currentUser}
          onStatusChanged={(msg) => {
            refreshPendingCount();
            showToast(msg);
          }}
          onCurrentUserDeleted={() => {
            setIsUserApprovalOpen(false);
            handleLogout();
            showToast('Akun aktif Anda telah dihapus. Silakan masuk kembali.');
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-bottom-5 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
