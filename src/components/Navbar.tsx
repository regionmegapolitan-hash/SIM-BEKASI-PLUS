import React, { useState } from 'react';
import { UserSession } from '../types';
import { WILAYAH_DATA, LOKASI_DATA, TEACHERS_LIST } from '../data/mockData';
import { authenticateUser } from '../utils/storage';
import {
  Building2,
  MapPin,
  GraduationCap,
  LogOut,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  KeyRound,
  Users,
  Coins
} from 'lucide-react';

interface NavbarProps {
  user: UserSession;
  onLogout: () => void;
  onSwitchUser: (newUser: UserSession) => void;
  onResetData: () => void;
  onOpenImport?: () => void;
  onOpenChangePassword: () => void;
  onOpenUserApproval?: () => void;
  pendingApprovalCount?: number;
  activePeriode: string;
  onChangePeriode: (periode: string) => void;
  availablePeriodes?: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onSwitchUser,
  onResetData,
  onOpenImport,
  onOpenChangePassword,
  onOpenUserApproval,
  pendingApprovalCount = 0,
  activePeriode,
  onChangePeriode,
  availablePeriodes
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin_wilayah':
        return {
          label: 'Admin Wilayah',
          bg: 'bg-indigo-600/10 text-indigo-700 border-indigo-200',
          icon: <Building2 className="w-3.5 h-3.5 mr-1" />
        };
      case 'admin_lokasi':
        return {
          label: 'Lokasi Belajar',
          bg: 'bg-emerald-600/10 text-emerald-700 border-emerald-200',
          icon: <MapPin className="w-3.5 h-3.5 mr-1" />
        };
      case 'pengajar':
        return {
          label: 'Guru / Pengajar',
          bg: 'bg-sky-600/10 text-sky-700 border-sky-200',
          icon: <GraduationCap className="w-3.5 h-3.5 mr-1" />
        };
      case 'admin_keuangan':
        return {
          label: 'Admin Keuangan',
          bg: 'bg-amber-600/10 text-amber-700 border-amber-200',
          icon: <Coins className="w-3.5 h-3.5 mr-1" />
        };
    }
  };

  const roleInfo = getRoleBadge();

  const handleQuickSwitch = (id: string, pass: string) => {
    const res = authenticateUser(id, pass);
    if (res.success && res.user) {
      onSwitchUser(res.user);
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Identity */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">
                    SIM-SESI
                  </h1>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Sistem Presensi
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Monitoring & Pengecekan Sesi Mengajar Bertingkat
                </p>
              </div>
            </div>

            {/* Middle: Periode Selector */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium">Periode:</span>
              <select
                value={activePeriode}
                onChange={(e) => onChangePeriode(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {(availablePeriodes && availablePeriodes.length > 0 ? availablePeriodes : [
                  '2026-08-25 sd 2026-09-24',
                  '2026-07-25 sd 2026-08-24',
                  '2026-09-25 sd 2026-10-24'
                ]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Active User & Actions */}
            <div className="flex items-center space-x-2">
              {/* Button Persetujuan Akun (Khusus Admin Wilayah) */}
              {user.role === 'admin_wilayah' && onOpenUserApproval && (
                <button
                  type="button"
                  onClick={onOpenUserApproval}
                  className="relative px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Persetujuan Akun Pengguna Terdaftar"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">Persetujuan Akun</span>
                  {pendingApprovalCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                      {pendingApprovalCount}
                    </span>
                  )}
                </button>
              )}

              {/* Button Ganti Password */}
              <button
                type="button"
                onClick={onOpenChangePassword}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center space-x-1 transition-all cursor-pointer"
                title="Ganti Password Akun Anda"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline">Ganti Password</span>
              </button>

              {/* Quick Role Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-bold text-slate-800 flex items-center">
                      <span className="truncate max-w-[140px]">{user.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
                    </div>
                    <div className="flex items-center mt-0.5">
                      <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleInfo.bg}`}>
                        {roleInfo.icon}
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu for fast switching between Wilayah, Lokasi, and Guru */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Akun Aktif
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{user.email || 'Email belum diatur'}</p>
                      <p className="text-[11px] text-slate-400">{user.unitName} (ID: {user.identifier})</p>
                    </div>

                    {/* Account Settings / Actions */}
                    <div className="px-3 py-1.5 border-b border-slate-100 space-y-1">
                      {user.role === 'admin_wilayah' && onOpenUserApproval && (
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenUserApproval();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 text-indigo-950 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Persetujuan Akun Pengguna</span>
                          </div>
                          {pendingApprovalCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                              {pendingApprovalCount}
                            </span>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenChangePassword();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ganti Password Akun</span>
                      </button>
                    </div>

                    {/* Quick Role Switcher (Hanya untuk Admin Wilayah) */}
                    {(user.role === 'admin_wilayah' || user.role === 'admin_keuangan') && (
                      <div className="px-3 py-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                          <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                          Ganti Peran Cepat (Simulasi Demo)
                        </p>

                        {/* Admin Wilayah */}
                        <button
                          type="button"
                          onClick={() => handleQuickSwitch('446', 'admin123')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between mb-1 transition-colors bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            <div>
                              <p className="font-bold">Admin Wilayah Bekasi Plus</p>
                              <p className="text-[10px] text-slate-500">Kode: 446 (Murtiyo)</p>
                            </div>
                          </div>
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        </button>

                        {/* Admin Keuangan */}
                        <button
                          type="button"
                          onClick={() => handleQuickSwitch('FIN-446', 'keuangan123')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between mb-1 transition-colors bg-amber-50 border border-amber-200 text-amber-950 font-semibold cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-amber-600" />
                            <div>
                              <p className="font-bold">Admin Keuangan &amp; Honor</p>
                              <p className="text-[10px] text-amber-700">Siti Rahmawati (FIN-446)</p>
                            </div>
                          </div>
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                        </button>

                        {/* Lokasi Belajar */}
                        <div className="text-[10px] font-semibold text-slate-400 mt-2 mb-1 px-1">
                          Pilih Lokasi Belajar:
                        </div>
                        <div className="space-y-1">
                          {LOKASI_DATA.slice(0, 3).map((l) => (
                            <button
                              key={l.kodeLokasi}
                              type="button"
                              onClick={() => handleQuickSwitch(l.kodeLokasi, 'lokasi123')}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors hover:bg-slate-50 text-slate-700 cursor-pointer"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{l.namaLokasi}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-1">{l.kodeLokasi}</span>
                            </button>
                          ))}
                        </div>

                        {/* Guru Kelas */}
                        <div className="text-[10px] font-semibold text-slate-400 mt-2 mb-1 px-1">
                          Pilih Pengajar:
                        </div>
                        <div className="space-y-1">
                          {TEACHERS_LIST.slice(0, 3).map((t) => (
                            <button
                              key={t.nopeg}
                              type="button"
                              onClick={() => handleQuickSwitch(t.nopeg, 'guru123')}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors hover:bg-slate-50 text-slate-700 cursor-pointer"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <GraduationCap className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span className="truncate">{t.nama}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-1">{t.nopeg}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between">
                      {/* Reset Demo HANYA untuk Admin Wilayah */}
                      {user.role === 'admin_wilayah' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            setShowResetConfirm(true);
                          }}
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Reset Data Demo
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">SIM-SESI Presensi</span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset Data Button (HANYA untuk Admin Wilayah, disembunyikan untuk Lokasi & Guru) */}
              {user.role === 'admin_wilayah' && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  title="Kembalikan data ke awal simulasi (Khusus Admin Wilayah)"
                  className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 rounded-xl transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Kembalikan Data Simulasi?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Tindakan ini akan mengembalikan data presensi dan sesi mengajar ke data awal Wilayah Bekasi Plus (semua catatan koreksi atau import baru akan di-reset).
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-colors"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
