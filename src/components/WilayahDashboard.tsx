import React, { useState, useMemo } from 'react';
import { SesiMengajarRecord, UserSession, StatusTindakLanjutKeuangan } from '../types';
import { WILAYAH_DATA, LOKASI_DATA } from '../data/mockData';
import { exportToExcelFile, formatRupiah, formatDecimal } from '../utils/excelHelper';
import {
  Building2,
  MapPin,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Printer,
  Edit3,
  Upload,
  MessageSquare,
  ShieldCheck,
  Coins,
  Check,
  X,
  Send
} from 'lucide-react';

interface WilayahDashboardProps {
  user: UserSession;
  records: SesiMengajarRecord[];
  activePeriode: string;
  onOpenImport: () => void;
  onEditRecord: (record: SesiMengajarRecord) => void;
  onOpenUserApproval?: () => void;
  pendingApprovalCount?: number;
  onSaveTindakLanjutKeuangan?: (
    recordId: string,
    status: StatusTindakLanjutKeuangan,
    catatanKeuangan: string
  ) => void;
}

export const WilayahDashboard: React.FC<WilayahDashboardProps> = ({
  user,
  records,
  activePeriode,
  onOpenImport,
  onEditRecord,
  onOpenUserApproval,
  pendingApprovalCount = 0,
  onSaveTindakLanjutKeuangan
}) => {
  const [selectedLokasi, setSelectedLokasi] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedKeuanganFilter, setSelectedKeuanganFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State for Follow-Up Modal
  const [selectedFollowUpRecord, setSelectedFollowUpRecord] = useState<SesiMengajarRecord | null>(null);
  const [statusTindakLanjutForm, setStatusTindakLanjutForm] = useState<StatusTindakLanjutKeuangan>('Selesai Ditindaklanjuti');
  const [catatanKeuanganForm, setCatatanKeuanganForm] = useState<string>('');
  const [tindakLanjutSuccessMsg, setTindakLanjutSuccessMsg] = useState<string | null>(null);

  // Statistics for follow-ups by Admin Keuangan
  const keuanganFollowUpStats = useMemo(() => {
    const withKeterangan = records.filter((r) => r.keteranganPengajar && r.keteranganPengajar.trim().length > 0);
    const menunggu = withKeterangan.filter(
      (r) => r.statusTindakLanjutKeuangan === 'Menunggu Tindak Lanjut' || !r.statusTindakLanjutKeuangan
    );
    const sedangDiproses = withKeterangan.filter((r) => r.statusTindakLanjutKeuangan === 'Sedang Diproses');
    const selesai = withKeterangan.filter((r) => r.statusTindakLanjutKeuangan === 'Selesai Ditindaklanjuti');
    const ditolak = withKeterangan.filter((r) => r.statusTindakLanjutKeuangan === 'Ditolak');

    return {
      totalSubmitted: withKeterangan.length,
      menunggu: menunggu.length,
      sedangDiproses: sedangDiproses.length,
      selesai: selesai.length,
      ditolak: ditolak.length
    };
  }, [records]);

  // Open Follow-up modal
  const handleOpenFollowUp = (record: SesiMengajarRecord) => {
    setSelectedFollowUpRecord(record);
    setStatusTindakLanjutForm(record.statusTindakLanjutKeuangan && record.statusTindakLanjutKeuangan !== 'Belum Ada Keterangan' ? record.statusTindakLanjutKeuangan : 'Selesai Ditindaklanjuti');
    setCatatanKeuanganForm(record.catatanKeuangan || '');
    setTindakLanjutSuccessMsg(null);
  };

  const handleSaveFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUpRecord) return;
    if (onSaveTindakLanjutKeuangan) {
      onSaveTindakLanjutKeuangan(selectedFollowUpRecord.id, statusTindakLanjutForm, catatanKeuanganForm);
    }
    setTindakLanjutSuccessMsg('Tindak lanjut keuangan berhasil disimpan dan diperbarui!');
    setTimeout(() => {
      setSelectedFollowUpRecord(null);
      setTindakLanjutSuccessMsg(null);
    }, 1200);
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const recLokCode = r.lok || r.kodeLokasi;
      const recLokName = r.lokasi || r.lok;
      const matchLokasi =
        selectedLokasi === 'ALL' ||
        recLokCode === selectedLokasi ||
        recLokName === selectedLokasi;
      const matchStatus = selectedStatus === 'ALL' || r.statusKoreksi === selectedStatus;

      const matchKeuangan =
        selectedKeuanganFilter === 'ALL'
          ? true
          : selectedKeuanganFilter === 'PERLU_TINDAK_LANJUT'
          ? Boolean(
              r.keteranganPengajar &&
                r.keteranganPengajar.trim().length > 0 &&
                r.statusTindakLanjutKeuangan !== 'Selesai Ditindaklanjuti'
            )
          : selectedKeuanganFilter === 'Menunggu Tindak Lanjut'
          ? r.statusTindakLanjutKeuangan === 'Menunggu Tindak Lanjut' || (Boolean(r.keteranganPengajar) && !r.statusTindakLanjutKeuangan)
          : r.statusTindakLanjutKeuangan === selectedKeuanganFilter;

      const matchSearch =
        searchQuery.trim() === '' ||
        r.namaPengajar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nopeg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recLokName && recLokName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.keteranganPengajar && r.keteranganPengajar.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.periode && r.periode.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchLokasi && matchStatus && matchKeuangan && matchSearch;
    });
  }, [records, selectedLokasi, selectedStatus, selectedKeuanganFilter, searchQuery]);

  // Overall Statistics for Territory
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const verifiedRecords = records.filter((r) => r.statusKoreksi === 'Sudah Dikoreksi').length;
    const needFixRecords = records.filter((r) => r.statusKoreksi === 'Perlu Perbaikan').length;
    const pendingRecords = records.filter((r) => r.statusKoreksi === 'Belum Dicek').length;
    const verificationPct = totalRecords > 0 ? Math.round((verifiedRecords / totalRecords) * 100) : 0;

    const totalDurNegeri = records.reduce((acc, r) => acc + (Number(r.durMengajarNegeri) || 0), 0);
    const totalDurSwasta = records.reduce((acc, r) => acc + (Number(r.durMengajarSwasta) || 0), 0);
    const totalInsentifHadir = records.reduce(
      (acc, r) => acc + (Number(r.insentifHadirMengajarNegeri) || 0) + (Number(r.insentifHadirMengajarSwasta) || 0),
      0
    );
    const totalInsentifKonsul = records.reduce(
      (acc, r) => acc + (Number(r.instKonsultasiNegeri) || 0) + (Number(r.instKonsultasiSwasta) || 0),
      0
    );
    const totalJagaTes = records.reduce(
      (acc, r) => acc + (Number(r.jagaTesNegeri) || 0) + (Number(r.jagaTesSwasta) || 0),
      0
    );
    const totalBelumPresensi = records.reduce((acc, r) => acc + (Number(r.belumPresensi) || 0), 0);
    const uniqueTeachers = new Set(records.map((r) => r.nopeg)).size;

    return {
      totalRecords,
      verifiedRecords,
      needFixRecords,
      pendingRecords,
      verificationPct,
      totalDurNegeri,
      totalDurSwasta,
      totalJamMengajar: totalDurNegeri + totalDurSwasta,
      totalInsentifHadir,
      totalInsentifKonsul,
      totalInsentifAll: totalInsentifHadir + totalInsentifKonsul,
      totalJagaTes,
      totalBelumPresensi,
      uniqueTeachers
    };
  }, [records]);

  // Per-Location Progress breakdown
  const lokasiSummary = useMemo(() => {
    return LOKASI_DATA.map((loc) => {
      const locRecords = records.filter(
        (r) =>
          r.lok === loc.kodeLokasi ||
          r.kodeLokasi === loc.kodeLokasi ||
          r.lokasi === loc.namaLokasi
      );
      const total = locRecords.length;
      const checked = locRecords.filter((r) => r.statusKoreksi === 'Sudah Dikoreksi').length;
      const unpresensi = locRecords.reduce((acc, r) => acc + (Number(r.belumPresensi) || 0), 0);
      const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
      return {
        ...loc,
        total,
        checked,
        unpresensi,
        pct
      };
    });
  }, [records]);

  // Aggregated totals for all columns in the current filtered view
  const filterTotals = useMemo(() => {
    return {
      durNegeri: filteredRecords.reduce((a, b) => a + Number(b.durMengajarNegeri || 0), 0),
      sesiNegeri: filteredRecords.reduce((a, b) => a + Number(b.sesiMengajarNegeri || 0), 0),
      menitSangsiNegeri: filteredRecords.reduce((a, b) => a + Number(b.menitSangsiMengajarNegeri || 0), 0),
      insentifNegeri: filteredRecords.reduce((a, b) => a + Number(b.insentifHadirMengajarNegeri || 0), 0),
      jagaTesNegeri: filteredRecords.reduce((a, b) => a + Number(b.jagaTesNegeri || 0), 0),
      durSwasta: filteredRecords.reduce((a, b) => a + Number(b.durMengajarSwasta || 0), 0),
      menitSangsiSwasta: filteredRecords.reduce((a, b) => a + Number(b.menitSangsiMengajarSwasta || 0), 0),
      insentifSwasta: filteredRecords.reduce((a, b) => a + Number(b.insentifHadirMengajarSwasta || 0), 0),
      jagaTesSwasta: filteredRecords.reduce((a, b) => a + Number(b.jagaTesSwasta || 0), 0),
      sesiAhad: filteredRecords.reduce((a, b) => a + Number(b.sesiMengajarAhad || 0), 0),
      sesiTidakHadir: filteredRecords.reduce((a, b) => a + Number(b.sesiTidakHadir || 0), 0),
      sesiSwasta: filteredRecords.reduce((a, b) => a + Number(b.sesiMengajarSwasta || 0), 0),
      durKonsulNegeri: filteredRecords.reduce((a, b) => a + Number(b.durKonsultasiNegeri || 0), 0),
      sesiKonsulNegeri: filteredRecords.reduce((a, b) => a + Number(b.sesiKonsultasiNegeri || 0), 0),
      instKonsulNegeri: filteredRecords.reduce((a, b) => a + Number(b.instKonsultasiNegeri || 0), 0),
      durKonsulSwasta: filteredRecords.reduce((a, b) => a + Number(b.durKonsultasiSwasta || 0), 0),
      sesiKonsulSwasta: filteredRecords.reduce((a, b) => a + Number(b.sesiKonsultasiSwasta || 0), 0),
      instKonsulSwasta: filteredRecords.reduce((a, b) => a + Number(b.instKonsultasiSwasta || 0), 0),
      belumPresensi: filteredRecords.reduce((a, b) => a + Number(b.belumPresensi || 0), 0)
    };
  }, [filteredRecords]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 text-xs font-semibold mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Dasbor Monitoring Eksekutif Wilayah</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {WILAYAH_DATA.namaWilayah} ({WILAYAH_DATA.kodeWilayah})
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
              Admin Keuangan Wilayah: <span className="font-bold text-white">{WILAYAH_DATA.kepalaWilayah}</span> &bull; Memantau real-time seluruh {LOKASI_DATA.length} lokasi belajar dengan format baku 24 parameter presensi.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenImport}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
              title="Update data presensi pengajar dari tautan Google Sheets atau berkas Excel"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>Update Data Presensi</span>
            </button>

            {onOpenUserApproval && (
              <button
                type="button"
                onClick={onOpenUserApproval}
                className="relative px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-900" />
                <span>Persetujuan Akun</span>
                {pendingApprovalCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                    {pendingApprovalCount} Baru
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => exportToExcelFile(filteredRecords, `Rekap_Presensi_Wilayah_${activePeriode.replace(/\s+/g, '_')}`)}
              className="px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 border border-indigo-500/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm flex items-center space-x-1.5 border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Jam Mengajar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Jam Ajar</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatDecimal(stats.totalJamMengajar)} <span className="text-xs font-normal text-slate-500">Jam</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Negeri: {formatDecimal(stats.totalDurNegeri)}j | Swasta: {formatDecimal(stats.totalDurSwasta)}j
          </p>
        </div>

        {/* Verifikasi Lokasi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verifikasi Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-700">
            {stats.verificationPct}%
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${stats.verificationPct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {stats.verifiedRecords} dari {stats.totalRecords} sesi dicek
          </p>
        </div>

        {/* Total Insentif Kehadiran (Jumlah/Count) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Jumlah Insentif Hadir</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatDecimal(stats.totalInsentifHadir)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Inst Konsultasi: {formatDecimal(stats.totalInsentifKonsul)}
          </p>
        </div>

        {/* Total Jaga Tes & Ujian */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Jaga Tes & Ujian</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatDecimal(stats.totalJagaTes)} <span className="text-xs font-normal text-slate-500">Sesi</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Meliputi Negeri & Swasta
          </p>
        </div>

        {/* Belum Presensi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Belum Presensi</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className={`text-xl sm:text-2xl font-extrabold ${stats.totalBelumPresensi > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {stats.totalBelumPresensi} <span className="text-xs font-normal text-slate-500">Sesi</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {stats.totalBelumPresensi > 0 ? 'Perlu tindak lanjut lokasi' : 'Semua presensi tertib'}
          </p>
        </div>

        {/* Pengajar Aktif */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Guru Aktif</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {stats.uniqueTeachers} <span className="text-xs font-normal text-slate-500">Orang</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Tersebar di {LOKASI_DATA.length} Lokasi
          </p>
        </div>

        {/* Tindak Lanjut Keuangan */}
        <div
          onClick={() => setSelectedKeuanganFilter(selectedKeuanganFilter === 'PERLU_TINDAK_LANJUT' ? 'ALL' : 'PERLU_TINDAK_LANJUT')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedKeuanganFilter === 'PERLU_TINDAK_LANJUT'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
          title="Klik untuk menyaring pengajuan guru yang perlu tindak lanjut keuangan"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Tindak Lanjut Keuangan</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {keuanganFollowUpStats.menunggu}
            </p>
            <span className="text-xs font-bold text-amber-600">Menunggu</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 truncate">
            {keuanganFollowUpStats.totalSubmitted} Diajukan &bull; <strong className="text-emerald-600">{keuanganFollowUpStats.selesai} Selesai</strong>
          </p>
        </div>
      </div>

      {/* Monitoring Per Lokasi Belajar Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <MapPin className="w-4 h-4 text-indigo-600 mr-1.5" />
            Status Pengecekan Lokasi Belajar ({LOKASI_DATA.length} Lokasi)
          </h3>
          <span className="text-xs text-slate-500">Klik lokasi untuk memfilter tabel</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {lokasiSummary.map((loc) => {
            const isSelected = selectedLokasi === loc.kodeLokasi;
            return (
              <button
                key={loc.kodeLokasi}
                type="button"
                onClick={() => setSelectedLokasi(isSelected ? 'ALL' : loc.kodeLokasi)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{loc.kodeLokasi}</span>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                      {loc.namaLokasi}
                    </h4>
                  </div>
                  <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    loc.pct === 100
                      ? 'bg-emerald-100 text-emerald-800'
                      : loc.pct > 50
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {loc.pct}%
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        loc.pct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${loc.pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{loc.checked}/{loc.total} Terkoreksi</span>
                  {loc.unpresensi > 0 && (
                    <span className="text-rose-600 font-bold">{loc.unpresensi} blm presensi</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Section with Exact 24 Columns matching User Image */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filters & Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/40">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari guru, nopeg, lokasi..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Filter Lokasi */}
            <select
              value={selectedLokasi}
              onChange={(e) => setSelectedLokasi(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            >
              <option value="ALL">Semua Lokasi ({LOKASI_DATA.length})</option>
              {LOKASI_DATA.map((l) => (
                <option key={l.kodeLokasi} value={l.kodeLokasi}>
                  {l.namaLokasi} ({l.kodeLokasi})
                </option>
              ))}
            </select>

            {/* Filter Status Koreksi */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            >
              <option value="ALL">Semua Status Koreksi</option>
              <option value="Sudah Dikoreksi">Sudah Dikoreksi</option>
              <option value="Belum Dicek">Belum Dicek</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
            </select>

            {/* Filter Status Tindak Lanjut Keuangan */}
            <select
              value={selectedKeuanganFilter}
              onChange={(e) => setSelectedKeuanganFilter(e.target.value)}
              className={`text-xs py-1.5 px-3 rounded-xl border font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-600 transition-colors ${
                selectedKeuanganFilter !== 'ALL'
                  ? 'bg-amber-50 border-amber-400 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">Semua Monitoring Keuangan</option>
              <option value="PERLU_TINDAK_LANJUT">🔔 Perlu Tindak Lanjut Keuangan ({keuanganFollowUpStats.menunggu})</option>
              <option value="Menunggu Tindak Lanjut">Menunggu Tindak Lanjut ({keuanganFollowUpStats.menunggu})</option>
              <option value="Sedang Diproses">Sedang Diproses ({keuanganFollowUpStats.sedangDiproses})</option>
              <option value="Selesai Ditindaklanjuti">Selesai Ditindaklanjuti ({keuanganFollowUpStats.selesai})</option>
              <option value="Ditolak">Ditolak ({keuanganFollowUpStats.ditolak})</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Format: <span className="font-bold text-slate-700">24 Parameter Sesuai Template Resmi</span> &bull; Menampilkan <strong className="text-slate-800">{filteredRecords.length}</strong> data sesi
          </div>
        </div>

        {/* Responsive Table with Exact 24 Columns & Cyan/Green Styling from Image */}
        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            {/* Header with vibrant green background (#00ffa2 / #00ea95) and Red text for incentives as in uploaded image */}
            <thead className="bg-[#00ffa2] text-slate-950 font-extrabold uppercase tracking-tight text-[11px] select-none border-b-2 border-emerald-400">
              <tr>
                {/* 1. Periode */}
                <th className="px-3 py-3 text-left whitespace-nowrap bg-[#00ffa2] sticky left-0 z-20 shadow-xs">
                  Periode
                </th>
                {/* 2. Nopeg */}
                <th className="px-3 py-3 text-left whitespace-nowrap">
                  Nopeg
                </th>
                {/* 3. Nama Pengajar */}
                <th className="px-3 py-3 text-left whitespace-nowrap min-w-[170px]">
                  Nama Pengajar
                </th>
                {/* 4. Kode */}
                <th className="px-3 py-3 text-center whitespace-nowrap">
                  Kode
                </th>
                {/* 5. Lok */}
                <th className="px-3 py-3 text-left whitespace-nowrap min-w-[120px]">
                  Lok
                </th>
                {/* 6. Dur Mengajar Negeri */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Dur<br />Mengajar<br />Negeri
                </th>
                {/* 7. Sesi Mengajar Negeri */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Sesi<br />Mengajar<br />Negeri
                </th>
                {/* 8. Menit Sangsi Mengajar Negeri */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Menit<br />Sangsi<br />Mengajar<br />Negeri
                </th>
                {/* 9. Insentif Hadir Mengajar Negeri (RED) */}
                <th className="px-3 py-3 text-right whitespace-nowrap text-red-600 font-extrabold leading-tight">
                  Insentif<br />Hadir<br />Mengajar<br />Negeri
                </th>
                {/* 10. Jaga Tes Negeri */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Jaga Tes<br />Negeri
                </th>
                {/* 11. Dur Mengajar Swasta */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Dur<br />Mengajar<br />Swasta
                </th>
                {/* 12. Menit Sangsi Mengajar Swasta */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Menit<br />Sangsi<br />Mengajar<br />Swasta
                </th>
                {/* 13. Insentif Hadir Mengajar Swasta (RED) */}
                <th className="px-3 py-3 text-right whitespace-nowrap text-red-600 font-extrabold leading-tight">
                  Insentif<br />Hadir<br />Mengajar<br />Swasta
                </th>
                {/* 14. Jaga TesSwasta */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Jaga<br />TesSwasta
                </th>
                {/* 15. Sesi Mengajar Ahad */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Sesi<br />Mengajar<br />Ahad
                </th>
                {/* 16. Sesi Tidak Hadir */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Sesi<br />Tidak<br />Hadir
                </th>
                {/* 17. Sesi Mengajar Swasta */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Sesi<br />Mengajar<br />Swasta
                </th>
                {/* 18. Dur Konsultasi Negeri */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Dur<br />Konsulta<br />si Negeri
                </th>
                {/* 19. Sesi Konsultasi Negeri */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Sesi<br />Konsulta<br />si Negeri
                </th>
                {/* 20. Inst Konsultasi Negeri (RED) */}
                <th className="px-3 py-3 text-right whitespace-nowrap text-red-600 font-extrabold leading-tight">
                  Inst<br />Konsulta<br />si Negeri
                </th>
                {/* 21. Dur Konsultasi Swasta */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Dur<br />Konsulta<br />si Swasta
                </th>
                {/* 22. Sesi Konsultasi Swasta */}
                <th className="px-3 py-3 text-right whitespace-nowrap leading-tight">
                  Sesi<br />Konsulta<br />si Swasta
                </th>
                {/* 23. Inst Konsultasi Swasta (RED) */}
                <th className="px-3 py-3 text-right whitespace-nowrap text-red-600 font-extrabold leading-tight">
                  Inst<br />Konsulta<br />si Swasta
                </th>
                {/* 24. Belum Presensi */}
                <th className="px-3 py-3 text-center whitespace-nowrap leading-tight font-extrabold">
                  Belum<br />Presensi
                </th>

                {/* Additional Action Columns */}
                <th className="px-3 py-3 text-center whitespace-nowrap">
                  Status Koreksi
                </th>
                {/* Keterangan Guru & Tindak Lanjut Keuangan */}
                <th className="px-4 py-3 text-left whitespace-nowrap min-w-[300px] bg-[#00ea95] text-slate-950 font-black">
                  Keterangan Guru &amp; Tindak Lanjut Keuangan
                </th>
                <th className="px-3 py-3 text-center whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={27} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data sesi mengajar yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const displayKode = r.kode || r.kodeLokasi || '-';
                  const displayLok = r.lok || r.lokasi || '-';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Periode (Sticky Left) */}
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 font-medium sticky left-0 bg-white hover:bg-slate-50 z-10 shadow-xs">
                        {r.periode || activePeriode}
                      </td>

                      {/* 2. Nopeg */}
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-700 font-semibold">
                        {r.nopeg}
                      </td>

                      {/* 3. Nama Pengajar */}
                      <td className="px-3 py-2.5 whitespace-nowrap font-bold text-slate-900">
                        {r.namaPengajar}
                      </td>

                      {/* 4. Kode */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {displayKode}
                      </td>

                      {/* 5. Lok */}
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 font-medium">
                        {displayLok}
                      </td>

                      {/* 6. Dur Mengajar Negeri */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-medium text-slate-800">
                        {formatDecimal(r.durMengajarNegeri)}
                      </td>

                      {/* 7. Sesi Mengajar Negeri */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap text-slate-800">
                        {formatDecimal(r.sesiMengajarNegeri)}
                      </td>

                      {/* 8. Menit Sangsi Mengajar Negeri */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {r.menitSangsiMengajarNegeri > 0 ? (
                          <span className="text-amber-600 font-bold">{formatDecimal(r.menitSangsiMengajarNegeri)}</span>
                        ) : (
                          <span className="text-slate-400">{formatDecimal(0)}</span>
                        )}
                      </td>

                      {/* 9. Insentif Hadir Mengajar Negeri */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-medium text-red-600">
                        {formatDecimal(r.insentifHadirMengajarNegeri)}
                      </td>

                      {/* 10. Jaga Tes Negeri */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.jagaTesNegeri)}
                      </td>

                      {/* 11. Dur Mengajar Swasta */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-medium text-slate-800">
                        {formatDecimal(r.durMengajarSwasta)}
                      </td>

                      {/* 12. Menit Sangsi Mengajar Swasta */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {r.menitSangsiMengajarSwasta > 0 ? (
                          <span className="text-amber-600 font-bold">{formatDecimal(r.menitSangsiMengajarSwasta)}</span>
                        ) : (
                          <span className="text-slate-400">{formatDecimal(0)}</span>
                        )}
                      </td>

                      {/* 13. Insentif Hadir Mengajar Swasta */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-medium text-red-600">
                        {formatDecimal(r.insentifHadirMengajarSwasta)}
                      </td>

                      {/* 14. Jaga TesSwasta */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.jagaTesSwasta)}
                      </td>

                      {/* 15. Sesi Mengajar Ahad */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap text-slate-800">
                        {formatDecimal(r.sesiMengajarAhad)}
                      </td>

                      {/* 16. Sesi Tidak Hadir */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {(r.sesiTidakHadir || 0) > 0 ? (
                          <span className="text-rose-600 font-bold">{formatDecimal(r.sesiTidakHadir)}</span>
                        ) : (
                          <span className="text-slate-400">{formatDecimal(0)}</span>
                        )}
                      </td>

                      {/* 17. Sesi Mengajar Swasta */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap text-slate-800">
                        {formatDecimal(r.sesiMengajarSwasta)}
                      </td>

                      {/* 18. Dur Konsultasi Negeri */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.durKonsultasiNegeri)}
                      </td>

                      {/* 19. Sesi Konsultasi Negeri */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.sesiKonsultasiNegeri)}
                      </td>

                      {/* 20. Inst Konsultasi Negeri */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-medium text-red-600">
                        {formatDecimal(r.instKonsultasiNegeri)}
                      </td>

                      {/* 21. Dur Konsultasi Swasta */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.durKonsultasiSwasta)}
                      </td>

                      {/* 22. Sesi Konsultasi Swasta */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.sesiKonsultasiSwasta)}
                      </td>

                      {/* 23. Inst Konsultasi Swasta */}
                      <td className="px-3 py-2.5 text-right font-mono whitespace-nowrap font-medium text-red-600">
                        {formatDecimal(r.instKonsultasiSwasta)}
                      </td>

                      {/* 24. Belum Presensi */}
                      <td className="px-3 py-2.5 text-center font-mono whitespace-nowrap">
                        {r.belumPresensi > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[11px]">
                            {r.belumPresensi}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">0</span>
                        )}
                      </td>

                      {/* Status Koreksi Lokasi */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.statusKoreksi === 'Sudah Dikoreksi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.statusKoreksi === 'Perlu Perbaikan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.statusKoreksi}
                        </span>
                        {r.korektor && (
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                            oleh: {r.korektor}
                          </p>
                        )}
                      </td>

                      {/* Keterangan Guru & Tindak Lanjut Keuangan */}
                      <td className="px-3 py-2.5 min-w-[300px]">
                        {r.keteranganPengajar ? (
                          <div className="space-y-1.5">
                            {/* Teacher Note Card */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-[11px] leading-relaxed">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                <span className="font-bold flex items-center text-indigo-700">
                                  <MessageSquare className="w-3 h-3 mr-1 text-indigo-600" />
                                  Keterangan Guru:
                                </span>
                                <span>{r.waktuKeteranganPengajar || '-'}</span>
                              </div>
                              <p className="font-medium text-slate-700 whitespace-pre-wrap">{r.keteranganPengajar}</p>
                            </div>

                            {/* Status & Action */}
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  r.statusTindakLanjutKeuangan === 'Selesai Ditindaklanjuti'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : r.statusTindakLanjutKeuangan === 'Sedang Diproses'
                                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                    : r.statusTindakLanjutKeuangan === 'Ditolak'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {r.statusTindakLanjutKeuangan === 'Selesai Ditindaklanjuti' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 text-amber-600 mr-1" />
                                )}
                                <span>{r.statusTindakLanjutKeuangan || 'Menunggu Tindak Lanjut'}</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => handleOpenFollowUp(r)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Tindak Lanjuti</span>
                              </button>
                            </div>

                            {/* Catatan / Respon Keuangan if exists */}
                            {r.catatanKeuangan && (
                              <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-950">
                                <div className="flex items-center justify-between text-[10px] text-emerald-700 font-bold mb-0.5">
                                  <span>Respon Keuangan ({r.petugasKeuangan || 'Admin Keuangan'}):</span>
                                  <span className="font-normal text-emerald-600">{r.waktuTindakLanjutKeuangan || ''}</span>
                                </div>
                                <p className="font-medium text-emerald-900">{r.catatanKeuangan}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Tidak ada keterangan</span>
                            <button
                              type="button"
                              onClick={() => handleOpenFollowUp(r)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                            >
                              + Beri Respon
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onEditRecord(r)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                          title="Edit / Tinjau Sesi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Row */}
            {filteredRecords.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td className="px-3 py-3 sticky left-0 bg-slate-100 z-10 shadow-xs">
                    TOTAL
                  </td>
                  <td className="px-3 py-3 text-slate-500 font-normal">
                    {filteredRecords.length}
                  </td>
                  <td className="px-3 py-3 text-slate-500 font-normal" colSpan={3}>
                    {filteredRecords.length} Baris Data
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.durNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.sesiNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono text-amber-600">{formatDecimal(filterTotals.menitSangsiNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-600">{formatDecimal(filterTotals.insentifNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.jagaTesNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.durSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono text-amber-600">{formatDecimal(filterTotals.menitSangsiSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-600">{formatDecimal(filterTotals.insentifSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.jagaTesSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.sesiAhad)}</td>
                  <td className="px-3 py-3 text-right font-mono text-rose-600">{formatDecimal(filterTotals.sesiTidakHadir)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.sesiSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.durKonsulNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.sesiKonsulNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-600">{formatDecimal(filterTotals.instKonsulNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.durKonsulSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(filterTotals.sesiKonsulSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-600">{formatDecimal(filterTotals.instKonsulSwasta)}</td>
                  <td className="px-3 py-3 text-center font-mono text-rose-600 font-extrabold">{filterTotals.belumPresensi}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Tindak Lanjut Admin Keuangan */}
      {selectedFollowUpRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in-50 zoom-in-95 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-white to-indigo-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tindak Lanjut Keuangan Guru Pengajar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifikasi pengajuan kendala &amp; tindak lanjut honor presensi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFollowUpRecord(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveFollowUpSubmit} className="p-6 space-y-4">
              {/* Teacher and Session Meta Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {selectedFollowUpRecord.namaPengajar}
                    </h4>
                    <p className="font-mono text-slate-500 text-[11px]">
                      Nopeg: {selectedFollowUpRecord.nopeg} &bull; Lokasi: {selectedFollowUpRecord.lok || selectedFollowUpRecord.kodeLokasi} ({selectedFollowUpRecord.kode || selectedFollowUpRecord.kodeLokasi})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Periode: {selectedFollowUpRecord.periode}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Durasi:</span>
                    <span className="font-bold text-slate-800">
                      {formatDecimal((selectedFollowUpRecord.durMengajarNegeri || 0) + (selectedFollowUpRecord.durMengajarSwasta || 0))} Jam
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Insentif Hadir:</span>
                    <span className="font-bold text-red-600 font-mono">
                      {formatDecimal((selectedFollowUpRecord.insentifHadirMengajarNegeri || 0) + (selectedFollowUpRecord.insentifHadirMengajarSwasta || 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Menit Sangsi:</span>
                    <span className="font-bold text-amber-600 font-mono">
                      {formatDecimal((selectedFollowUpRecord.menitSangsiMengajarNegeri || 0) + (selectedFollowUpRecord.menitSangsiMengajarSwasta || 0))}m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Belum Presensi:</span>
                    <span className={`font-bold ${selectedFollowUpRecord.belumPresensi > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {selectedFollowUpRecord.belumPresensi || 0} Sesi
                    </span>
                  </div>
                </div>
              </div>

              {/* Pengajuan Keterangan dari Pengajar */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
                <div className="flex items-center justify-between text-indigo-900 font-bold mb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Catatan Kendala yang Diajukan Guru Pengajar:</span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-normal">
                    {selectedFollowUpRecord.waktuKeteranganPengajar || '-'}
                  </span>
                </div>
                <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed text-xs">
                  {selectedFollowUpRecord.keteranganPengajar || 'Belum ada catatan khusus yang ditulis oleh guru pengajar.'}
                </p>
              </div>

              {/* Status Tindak Lanjut Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Status Tindak Lanjut Keuangan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Menunggu Tindak Lanjut', 'Sedang Diproses', 'Selesai Ditindaklanjuti', 'Ditolak'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusTindakLanjutForm(st)}
                      className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        statusTindakLanjutForm === st
                          ? st === 'Selesai Ditindaklanjuti'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : st === 'Sedang Diproses'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : st === 'Ditolak'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Template Chips for Finance Respon */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Pilihan Respon Cepat Keuangan:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Sudah disetujui dan disesuaikan pada slip honor bulan berjalan.',
                    'Tambahan insentif sebesar nominal telah dimasukkan ke daftar transfer.',
                    'Sudah divalidasi dengan absensi manual unit lokasi, sesi disetujui.',
                    'Durasi jam mengajar telah diperbaiki sesuai jadwal rilis.',
                    'Sesuai ketentuan yang berlaku, rekapitulasi sesi sudah akurat.'
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => {
                        setCatatanKeuanganForm((prev) => (prev ? `${prev}\n${tpl}` : tpl));
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer text-left"
                    >
                      + {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Catatan Keuangan */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan &amp; Tindak Lanjut dari Admin Keuangan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={catatanKeuanganForm}
                  onChange={(e) => setCatatanKeuanganForm(e.target.value)}
                  placeholder="Tuliskan keterangan tindakan, verifikasi slip honor, atau tindak lanjut yang diberikan untuk guru pengajar..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white leading-relaxed"
                />
              </div>

              {/* Direct Adjustment Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <span>Perlu mengubah angka durasi, insentif, atau menit sangsi?</span>
                <button
                  type="button"
                  onClick={() => {
                    const rec = selectedFollowUpRecord;
                    setSelectedFollowUpRecord(null);
                    onEditRecord(rec);
                  }}
                  className="px-3 py-1 text-xs font-bold bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl transition-colors cursor-pointer"
                >
                  Edit Angka Sesi
                </button>
              </div>

              {/* Success Notification */}
              {tindakLanjutSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{tindakLanjutSuccessMsg}</span>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedFollowUpRecord(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Tindak Lanjut</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
