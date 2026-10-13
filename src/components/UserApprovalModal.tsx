import React, { useState, useMemo } from 'react';
import { UserAccount, UserSession } from '../types';
import {
  getStoredAccounts,
  approveAccount,
  rejectAccount,
  adminResetPassword,
  registerNewAccount,
  deleteAccount,
  batchDeleteAccounts
} from '../utils/storage';
import {
  X,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  ShieldCheck,
  Search,
  UserPlus,
  AlertTriangle,
  Mail,
  Building2,
  MapPin,
  GraduationCap,
  Sparkles,
  Check,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  Info
} from 'lucide-react';

interface UserApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onStatusChanged: (message: string) => void;
  onCurrentUserDeleted?: () => void;
}

export const UserApprovalModal: React.FC<UserApprovalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStatusChanged,
  onCurrentUserDeleted
}) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => getStoredAccounts());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resetModalAccount, setResetModalAccount] = useState<UserAccount | null>(null);
  const [newPassInput, setNewPassInput] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<UserAccount | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDeleteModalOpen, setBatchDeleteModalOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin_lokasi' | 'pengajar'>('pengajar');
  const [newUserIdentifier, setNewUserIdentifier] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [addError, setAddError] = useState('');

  const refreshAccounts = () => {
    setAccounts(getStoredAccounts());
  };

  const pendingCount = accounts.filter((a) => a.status === 'pending').length;

  const filteredAccounts = accounts.filter((acc) => {
    const matchStatus = statusFilter === 'all' || acc.status === statusFilter;
    const matchSearch =
      searchQuery.trim() === '' ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.unitName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleApprove = (accountId: string, accountName: string) => {
    const updated = approveAccount(accountId, currentUser.name);
    setAccounts(updated);
    onStatusChanged(`Akun "${accountName}" berhasil disetujui! Pengguna kini dapat login.`);
  };

  const handleReject = (accountId: string, accountName: string) => {
    const updated = rejectAccount(accountId, 'Ditolak oleh Admin Wilayah');
    setAccounts(updated);
    onStatusChanged(`Pendaftaran akun "${accountName}" ditolak.`);
  };

  const handleAdminResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalAccount || !newPassInput.trim()) return;
    const res = adminResetPassword(resetModalAccount.id, newPassInput.trim());
    if (res.success) {
      refreshAccounts();
      onStatusChanged(res.message);
      setResetModalAccount(null);
      setNewPassInput('');
    }
  };

  const handleCopyLoginInfo = (acc: UserAccount) => {
    const roleLabel =
      acc.role === 'admin_lokasi'
        ? 'Admin Lokasi Belajar'
        : acc.role === 'pengajar'
        ? 'Guru / Pengajar'
        : 'Admin Wilayah';

    const textToCopy = `*PEMBERITAHUAN SIM-SESI NF BEKASI PLUS*
Halo ${acc.name}, akun Anda telah DISETUJUI dan AKTIF di SIM-SESI.

Silakan masuk menggunakan data berikut:
• Email Terdaftar: ${acc.email}
• Kode / Nopeg: ${acc.identifier}
• Unit / Lokasi: ${acc.unitName}
• Peran: ${roleLabel}
• Password: (Gunakan password saat mendaftar atau password yang telah diatur oleh Admin)

*Panduan Masuk:*
1. Buka laman login SIM-SESI
2. Masukkan Email atau Kode/Nopeg di kolom pertama
3. Masukkan Password Anda dan klik "Masuk ke Dasbor"`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedId(acc.id);
    onStatusChanged(`Info & panduan login untuk "${acc.name}" berhasil disalin! Anda dapat mengirimkannya ke pengguna.`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const selectableAccounts = useMemo(
    () => filteredAccounts.filter((a) => a.id !== currentUser.id && a.email.toLowerCase() !== currentUser.email?.toLowerCase()),
    [filteredAccounts, currentUser]
  );

  const isAllSelected =
    selectableAccounts.length > 0 &&
    selectableAccounts.every((a) => selectedIds.includes(a.id));

  const handleDeleteAccount = () => {
    if (!accountToDelete) return;
    const isCurrent =
      accountToDelete.id === currentUser.id ||
      accountToDelete.email.toLowerCase() === currentUser.email?.toLowerCase();
    
    if (isCurrent) {
      onStatusChanged('Akun yang sedang aktif digunakan login saat ini diproteksi secara otomatis dan tidak dapat dihapus.');
      setAccountToDelete(null);
      return;
    }

    const res = deleteAccount(accountToDelete.id);
    if (res.success) {
      setAccounts(res.updatedAccounts);
      onStatusChanged(res.message);
      setSelectedIds((prev) => prev.filter((id) => id !== accountToDelete.id));
      setAccountToDelete(null);
    } else {
      onStatusChanged(res.message);
      setAccountToDelete(null);
    }
  };

  const handleRevokeApproval = (accountId: string, accountName: string) => {
    const updated = rejectAccount(accountId, 'Persetujuan dicabut oleh Admin Wilayah');
    setAccounts(updated);
    onStatusChanged(`Status persetujuan akun "${accountName}" berhasil dicabut (Ditolak).`);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    // Exclude current active user to enforce automatic protection
    const safeIds = selectedIds.filter((id) => {
      const target = accounts.find((a) => a.id === id);
      return (
        target &&
        target.id !== currentUser.id &&
        target.email.toLowerCase() !== currentUser.email?.toLowerCase()
      );
    });

    if (safeIds.length === 0) {
      onStatusChanged('Tidak ada akun yang dapat dihapus. Akun aktif saat ini diproteksi secara otomatis.');
      setBatchDeleteModalOpen(false);
      setSelectedIds([]);
      return;
    }

    const res = batchDeleteAccounts(safeIds);
    if (res.success) {
      setAccounts(res.updatedAccounts);
      onStatusChanged(res.message);
      setSelectedIds([]);
      setBatchDeleteModalOpen(false);
    } else {
      onStatusChanged(res.message);
      setBatchDeleteModalOpen(false);
    }
  };

  const toggleSelectAccount = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    if (target && (target.id === currentUser.id || target.email.toLowerCase() === currentUser.email?.toLowerCase())) {
      onStatusChanged('Akun aktif login saat ini diproteksi secara otomatis dan tidak dapat dipilih untuk dihapus.');
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allSelectableIds = selectableAccounts.map((a) => a.id);
    const allSelected = allSelectableIds.length > 0 && allSelectableIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allSelectableIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allSelectableIds])));
    }
  };

  const handleCreateDirectAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserIdentifier.trim()) {
      setAddError('Semua kolom wajib diisi.');
      return;
    }

    const res = registerNewAccount({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      identifier: newUserIdentifier,
      unitName: newUserRole === 'admin_lokasi' ? `Lokasi ${newUserIdentifier}` : `Pengajar ${newUserIdentifier}`,
      password: newUserPassword
    });

    if (res.success && res.account) {
      // Auto-approve since Admin Wilayah created it directly
      approveAccount(res.account.id, currentUser.name);
      refreshAccounts();
      setIsAddingUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserIdentifier('');
      onStatusChanged(`Akun ${res.account.name} (${res.account.email}) berhasil dibuat dan langsung disetujui!`);
    } else {
      setAddError(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-6 animate-in fade-in-50 zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Manajemen &amp; Persetujuan Akun Pengguna
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    {pendingCount} Menunggu Persetujuan
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin Wilayah mengontrol persetujuan akun terdaftar untuk guru kelas dan kepala lokasi belajar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, nopeg..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex rounded-xl bg-slate-200/70 p-0.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({accounts.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menunggu ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disetujui ({accounts.filter((a) => a.status === 'approved').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  statusFilter === 'rejected' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ditolak
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingUser(!isAddingUser)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isAddingUser ? 'Batal Tambah' : 'Tambah Akun Baru'}</span>
          </button>
        </div>

        {/* Batch Action Bar when accounts are selected */}
        {selectedIds.length > 0 && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center space-x-2 text-rose-950 font-bold">
              <CheckSquare className="w-4 h-4 text-rose-600" />
              <span>{selectedIds.length} akun dipilih</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-3 py-1 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Batalkan Pilihan
              </button>
              <button
                type="button"
                onClick={() => setBatchDeleteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus {selectedIds.length} Akun Terpilih</span>
              </button>
            </div>
          </div>
        )}

        {/* Add User Direct Form (Expandable) */}
        {isAddingUser && (
          <form onSubmit={handleCreateDirectAccount} className="p-4 sm:p-5 bg-indigo-50/60 border-b border-indigo-100 space-y-3">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center">
              <UserPlus className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Tambah Akun Pengguna Baru (Langsung Disetujui)
            </h4>

            {addError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                {addError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Misal: Budi Pratama, S.Pd"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Terdaftar</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="budi@gmail.com"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Peran Akun</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="pengajar">Guru / Pengajar Kelas</option>
                  <option value="admin_lokasi">Admin Lokasi Belajar</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {newUserRole === 'admin_lokasi' ? 'Kode Lokasi (Misal: 119)' : 'Nopeg (Misal: 709027)'}
                </label>
                <input
                  type="text"
                  value={newUserIdentifier}
                  onChange={(e) => setNewUserIdentifier(e.target.value)}
                  placeholder={newUserRole === 'admin_lokasi' ? '119' : '709027'}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Password default otomatis diset: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono font-bold text-indigo-700">{newUserPassword}</code> (Pengguna dapat menggantinya sendiri setelah masuk).
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan & Setujui Akun</span>
              </button>
            </div>
          </form>
        )}

        {/* Table Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Quick Guide on How Approved Users Log In */}
          <div className="mb-4 p-3.5 bg-gradient-to-r from-sky-50 via-indigo-50/60 to-emerald-50 rounded-2xl border border-indigo-100 flex items-start space-x-3 text-xs text-slate-700 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center">
                  <span>Petunjuk Login untuk Akun yang Sudah Disetujui</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Siap Digunakan
                  </span>
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Pengguna yang statusnya telah <strong className="text-emerald-700 font-bold">Disetujui</strong> dapat langsung masuk ke sistem SIM-SESI tanpa kendala dengan data berikut:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-[11px]">
                <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <strong className="text-indigo-900 block font-bold mb-0.5">1. Kolom Email Terdaftar / ID:</strong>
                  <span className="text-slate-600">
                    Pengguna dapat memasukkan <strong>Email Terdaftar</strong> ATAU <strong>Kode Lokasi</strong> (misal: <code>119</code>, <code>122</code>) / <strong>Nopeg Guru</strong> (misal: <code>710178</code>).
                  </span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <strong className="text-indigo-900 block font-bold mb-0.5">2. Kolom Password:</strong>
                  <span className="text-slate-600">
                    Masukkan password yang dibuat saat mendaftar. Jika lupa, Anda dapat klik tombol <strong>"Reset Password"</strong> di tabel bawah untuk mengatur sandi baru.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Tidak ada akun yang sesuai dengan filter atau kata kunci.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs bg-white">
              <table className="min-w-[980px] w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua akun"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        title="Pilih semua akun yang ditampilkan"
                      />
                    </th>
                    <th className="px-4 py-3 text-left min-w-[210px]">Nama & Email</th>
                    <th className="px-4 py-3 text-left min-w-[130px]">Peran</th>
                    <th className="px-4 py-3 text-center min-w-[100px]">Kode / Nopeg</th>
                    <th className="px-4 py-3 text-left min-w-[120px]">Tanggal Daftar</th>
                    <th className="px-4 py-3 text-center min-w-[110px]">Status</th>
                    <th className="px-4 py-3 text-right min-w-[280px] whitespace-nowrap">Tindakan Admin Wilayah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAccounts.map((acc) => {
                    const isPending = acc.status === 'pending';
                    const isApproved = acc.status === 'approved';
                    const isRejected = acc.status === 'rejected';
                    const isCurrentUser = acc.email.toLowerCase() === currentUser.email?.toLowerCase();

                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-3 text-center">
                          {isCurrentUser ? (
                            <span
                              className="inline-flex items-center justify-center text-indigo-500"
                              title="Akun aktif yang sedang login diproteksi otomatis dari pemilihan hapus"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              aria-label={`Pilih akun ${acc.name}`}
                              checked={selectedIds.includes(acc.id)}
                              onChange={() => toggleSelectAccount(acc.id)}
                              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                              title={`Pilih akun ${acc.name}`}
                            />
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{acc.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono flex items-center mt-0.5">
                            <Mail className="w-3 h-3 mr-1 text-slate-400" />
                            {acc.email}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{acc.unitName}</p>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {acc.role === 'admin_wilayah' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Building2 className="w-3 h-3 mr-1" />
                              Admin Wilayah
                            </span>
                          )}
                          {acc.role === 'admin_lokasi' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <MapPin className="w-3 h-3 mr-1" />
                              Admin Lokasi
                            </span>
                          )}
                          {acc.role === 'pengajar' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Guru / Pengajar
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap font-mono font-bold text-slate-700">
                          {acc.identifier}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                          {acc.registeredAt}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 mr-1 animate-spin" />
                              Menunggu
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Disetujui
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-3 h-3 mr-1" />
                              Ditolak
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap min-w-[280px]">
                          <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-y-1">
                            {isCurrentUser && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold" title="Akun yang sedang Anda gunakan saat ini">
                                Akun Aktif
                              </span>
                            )}

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(acc.id, acc.name)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs inline-flex items-center space-x-1"
                                  title="Setujui pendaftaran akun ini"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(acc.id, acc.name)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                                  title="Tolak pendaftaran akun ini"
                                >
                                  Tolak
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopyLoginInfo(acc)}
                                  className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer inline-flex items-center space-x-1 shadow-2xs ${
                                    copiedId === acc.id
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700'
                                  }`}
                                  title="Salin data login dan panduan masuk untuk pengguna ini (bisa dikirim via WhatsApp)"
                                >
                                  {copiedId === acc.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-700 font-bold">Tersalin!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>Salin Info Login</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setResetModalAccount(acc);
                                    setNewPassInput('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                                  title="Reset password pengguna ini"
                                >
                                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Reset Password</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRevokeApproval(acc.id, acc.name)}
                                  className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                                  title="Cabut / Batalkan status persetujuan akun ini (Ubah ke Ditolak)"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Cabut Status</span>
                                </button>
                              </>
                            )}

                            {isRejected && (
                              <button
                                type="button"
                                onClick={() => handleApprove(acc.id, acc.name)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Buka Persetujuan</span>
                              </button>
                            )}

                            {/* Tombol Delete / Hapus Akun */}
                            {isCurrentUser ? (
                              <span
                                className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs inline-flex items-center space-x-1 cursor-default select-none shadow-2xs"
                                title="Akun yang sedang aktif digunakan login saat ini diproteksi secara otomatis dari penghapusan"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Diproteksi (Aktif)</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAccountToDelete(acc)}
                                className="px-2.5 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:border-rose-400 font-bold text-xs transition-all inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                                title={`Hapus akun "${acc.name}" secara permanen dari sistem`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <p className="text-slate-500">
            Total {accounts.length} akun terdaftar ({pendingCount} menunggu persetujuan).
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Reset Password Submodal */}
        {resetModalAccount && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center">
                  <KeyRound className="w-4 h-4 mr-1.5 text-indigo-600" />
                  Reset Password Akun
                </h4>
                <button
                  type="button"
                  onClick={() => setResetModalAccount(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Masukkan password baru untuk pengguna: <br />
                <strong className="text-slate-900">{resetModalAccount.name}</strong> ({resetModalAccount.email})
              </p>

              <form onSubmit={handleAdminResetPassword} className="space-y-3">
                <input
                  type="text"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  required
                />

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setResetModalAccount(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    Simpan Password Baru
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus Akun */}
        {accountToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Hapus Akun Pengguna?
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tindakan ini permanen dan tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-2.5">
                <p className="font-semibold text-rose-900">
                  Apakah Anda yakin ingin menghapus akun pengguna berikut dari sistem?
                </p>
                <div className="bg-white p-3 rounded-lg border border-rose-100 text-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nama:</span>
                    <span className="font-bold text-slate-900">{accountToDelete.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Email:</span>
                    <span className="font-mono text-indigo-700">{accountToDelete.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Peran:</span>
                    <span className="font-semibold text-slate-700">
                      {accountToDelete.role === 'admin_wilayah'
                        ? 'Admin Wilayah'
                        : accountToDelete.role === 'admin_lokasi'
                        ? 'Admin Lokasi'
                        : accountToDelete.role === 'admin_keuangan'
                        ? 'Admin Keuangan'
                        : 'Guru / Pengajar'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Kode / Nopeg:</span>
                    <span className="font-mono font-bold text-slate-900">{accountToDelete.identifier}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Unit:</span>
                    <span className="truncate max-w-[200px] text-slate-700">{accountToDelete.unitName}</span>
                  </div>
                </div>
                <p className="text-[11px] text-rose-700 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-rose-600 shrink-0" />
                  <span>Pengguna tidak dapat masuk lagi setelah akun ini dihapus.</span>
                </p>

                {accountToDelete.email.toLowerCase() === currentUser.email?.toLowerCase() && (
                  <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-semibold flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Perhatian: Akun ini adalah akun aktif Anda yang sedang digunakan. Jika dihapus, Anda akan otomatis keluar ke halaman login.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Akun Ini</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus Massal Akun Terpilih */}
        {batchDeleteModalOpen && selectedIds.length > 0 && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Hapus {selectedIds.length} Akun Terpilih?
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tindakan ini permanen dan akan menghapus semua akun yang dipilih.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-2.5">
                <p className="font-semibold text-rose-900">
                  Daftar akun yang akan dihapus dari sistem:
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-white p-2.5 rounded-lg border border-rose-100">
                  {accounts
                    .filter((a) => selectedIds.includes(a.id))
                    .map((a) => (
                      <div key={a.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-b-0 text-xs">
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">{a.name}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{a.email}</span>
                      </div>
                    ))}
                </div>
                <p className="text-[11px] text-rose-700 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-rose-600 shrink-0" />
                  <span>Seluruh akun terpilih tidak akan dapat login lagi setelah dihapus.</span>
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBatchDeleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus {selectedIds.length} Akun</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
