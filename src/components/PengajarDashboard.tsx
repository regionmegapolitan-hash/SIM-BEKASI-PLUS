import React, { useState, useMemo } from 'react';
import { SesiMengajarRecord, UserSession } from '../types';
import { formatRupiah, formatDecimal } from '../utils/excelHelper';
import {
  GraduationCap,
  MapPin,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Printer,
  Sparkles,
  Info,
  Calendar,
  Building,
  MessageSquare,
  MessageSquarePlus,
  Edit3,
  X,
  Send,
  ShieldCheck,
  Check
} from 'lucide-react';

interface PengajarDashboardProps {
  user: UserSession;
  records: SesiMengajarRecord[];
  activePeriode: string;
  onSaveKeterangan?: (recordId: string, keterangan: string) => void;
}

export const PengajarDashboard: React.FC<PengajarDashboardProps> = ({
  user,
  records,
  activePeriode,
  onSaveKeterangan
}) => {
  const [selectedRecordForKeterangan, setSelectedRecordForKeterangan] = useState<SesiMengajarRecord | null>(null);
  const [keteranganInput, setKeteranganInput] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Filter records for this teacher (match by nopeg or name)
  const teacherRecords = useMemo(() => {
    const byNopeg = records.filter((r) => r.nopeg === user.identifier);
    if (byNopeg.length > 0) return byNopeg;
    const byName = records.filter(
      (r) =>
        r.namaPengajar.toLowerCase().includes(user.name.toLowerCase()) ||
        user.name.toLowerCase().includes(r.namaPengajar.toLowerCase())
    );
    if (byName.length > 0) return byName;
    return byNopeg;
  }, [records, user.identifier, user.name]);

  // Statistics for follow-ups by Admin Keuangan
  const followUpStats = useMemo(() => {
    const withKeterangan = teacherRecords.filter((r) => r.keteranganPengajar && r.keteranganPengajar.trim().length > 0);
    const waitingFinance = withKeterangan.filter(
      (r) => r.statusTindakLanjutKeuangan === 'Menunggu Tindak Lanjut' || !r.statusTindakLanjutKeuangan
    );
    const inProgressFinance = withKeterangan.filter((r) => r.statusTindakLanjutKeuangan === 'Sedang Diproses');
    const completedFinance = withKeterangan.filter((r) => r.statusTindakLanjutKeuangan === 'Selesai Ditindaklanjuti');
    return {
      total: withKeterangan.length,
      waiting: waitingFinance.length,
      inProgress: inProgressFinance.length,
      completed: completedFinance.length
    };
  }, [teacherRecords]);

  const handleOpenInputKeterangan = (record: SesiMengajarRecord) => {
    setSelectedRecordForKeterangan(record);
    setKeteranganInput(record.keteranganPengajar || '');
    setSaveSuccessMsg(null);
  };

  const handleSaveKeteranganSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForKeterangan) return;
    if (onSaveKeterangan) {
      onSaveKeterangan(selectedRecordForKeterangan.id, keteranganInput);
    }
    setSaveSuccessMsg('Keterangan berhasil disimpan dan dikirim ke Admin Keuangan untuk ditindaklanjuti!');
    setTimeout(() => {
      setSelectedRecordForKeterangan(null);
      setSaveSuccessMsg(null);
    }, 1500);
  };

  // Aggregate totals across all locations
  const totals = useMemo(() => {
    const totalDurNegeri = teacherRecords.reduce((a, b) => a + Number(b.durMengajarNegeri || 0), 0);
    const totalSesiNegeri = teacherRecords.reduce((a, b) => a + Number(b.sesiMengajarNegeri || 0), 0);
    const totalDurSwasta = teacherRecords.reduce((a, b) => a + Number(b.durMengajarSwasta || 0), 0);
    const totalSesiSwasta = teacherRecords.reduce((a, b) => a + Number(b.sesiMengajarSwasta || 0), 0);
    const totalJamMengajar = totalDurNegeri + totalDurSwasta;

    const totalMenitSangsiNegeri = teacherRecords.reduce((a, b) => a + Number(b.menitSangsiMengajarNegeri || 0), 0);
    const totalMenitSangsiSwasta = teacherRecords.reduce((a, b) => a + Number(b.menitSangsiMengajarSwasta || 0), 0);
    const totalMenitSangsi = totalMenitSangsiNegeri + totalMenitSangsiSwasta;

    const totalInsentifHadirNegeri = teacherRecords.reduce((a, b) => a + Number(b.insentifHadirMengajarNegeri || 0), 0);
    const totalInsentifHadirSwasta = teacherRecords.reduce((a, b) => a + Number(b.insentifHadirMengajarSwasta || 0), 0);
    const totalInsentifHadir = totalInsentifHadirNegeri + totalInsentifHadirSwasta;

    const totalJagaTesNegeri = teacherRecords.reduce((a, b) => a + Number(b.jagaTesNegeri || 0), 0);
    const totalJagaTesSwasta = teacherRecords.reduce((a, b) => a + Number(b.jagaTesSwasta || 0), 0);
    const totalJagaTes = totalJagaTesNegeri + totalJagaTesSwasta;

    const totalSesiAhad = teacherRecords.reduce((a, b) => a + Number(b.sesiMengajarAhad || 0), 0);
    const totalSesiTidakHadir = teacherRecords.reduce((a, b) => a + Number(b.sesiTidakHadir || 0), 0);

    const totalDurKonsulNegeri = teacherRecords.reduce((a, b) => a + Number(b.durKonsultasiNegeri || 0), 0);
    const totalSesiKonsulNegeri = teacherRecords.reduce((a, b) => a + Number(b.sesiKonsultasiNegeri || 0), 0);
    const totalDurKonsulSwasta = teacherRecords.reduce((a, b) => a + Number(b.durKonsultasiSwasta || 0), 0);
    const totalSesiKonsulSwasta = teacherRecords.reduce((a, b) => a + Number(b.sesiKonsultasiSwasta || 0), 0);

    const totalInstKonsulNegeri = teacherRecords.reduce((a, b) => a + Number(b.instKonsultasiNegeri || 0), 0);
    const totalInstKonsulSwasta = teacherRecords.reduce((a, b) => a + Number(b.instKonsultasiSwasta || 0), 0);
    const totalInstKonsul = totalInstKonsulNegeri + totalInstKonsulSwasta;

    const totalBelumPresensi = teacherRecords.reduce((a, b) => a + Number(b.belumPresensi || 0), 0);

    const locationsCount = new Set(teacherRecords.map((r) => r.lok || r.kodeLokasi || r.lokasi)).size;

    return {
      totalDurNegeri,
      totalSesiNegeri,
      totalDurSwasta,
      totalSesiSwasta,
      totalJamMengajar,
      totalMenitSangsiNegeri,
      totalMenitSangsiSwasta,
      totalMenitSangsi,
      totalInsentifHadirNegeri,
      totalInsentifHadirSwasta,
      totalInsentifHadir,
      totalJagaTesNegeri,
      totalJagaTesSwasta,
      totalJagaTes,
      totalSesiAhad,
      totalSesiTidakHadir,
      totalDurKonsulNegeri,
      totalSesiKonsulNegeri,
      totalDurKonsulSwasta,
      totalSesiKonsulSwasta,
      totalInstKonsulNegeri,
      totalInstKonsulSwasta,
      totalInstKonsul,
      totalBelumPresensi,
      locationsCount
    };
  }, [teacherRecords]);

  return (
    <div className="space-y-6 pb-16">
      {/* Teacher Profile Card */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/20 text-xs font-semibold mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Portal Rekapitulasi Sesi Pengajar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user.name}
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/80 mt-1 max-w-2xl">
              Nomor Pegawai (Nopeg): <span className="font-mono font-bold text-white">{user.identifier}</span> &bull; {user.unitName} &bull; Periode: <span className="font-semibold text-white">{activePeriode}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-white text-sky-950 hover:bg-sky-50 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-sky-700" />
              <span>Cetak Rekap Sesi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Cards across all teaching locations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Jam Mengajar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Jam Mengajar</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatDecimal(totals.totalJamMengajar)} <span className="text-xs font-normal text-slate-500">Jam</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Negeri: {formatDecimal(totals.totalDurNegeri)}j ({formatDecimal(totals.totalSesiNegeri)} sesi) | Swasta: {formatDecimal(totals.totalDurSwasta)}j ({formatDecimal(totals.totalSesiSwasta)} sesi)
          </p>
        </div>

        {/* Lokasi Mengajar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lokasi Mengajar</span>
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {totals.locationsCount} <span className="text-xs font-normal text-slate-500">Cabang</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Tersebar di wilayah kerja</p>
        </div>

        {/* Total Insentif Kehadiran */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Jumlah Insentif Hadir</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 truncate">
            {formatDecimal(totals.totalInsentifHadir)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Inst Konsultasi: {formatDecimal(totals.totalInstKonsul)}
          </p>
        </div>

        {/* Total Sanksi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menit Sangsi</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className={`text-2xl font-extrabold ${totals.totalMenitSangsi > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {formatDecimal(totals.totalMenitSangsi)} <span className="text-xs font-normal text-slate-500">Menit</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Negeri: {formatDecimal(totals.totalMenitSangsiNegeri)}m | Swasta: {formatDecimal(totals.totalMenitSangsiSwasta)}m
          </p>
        </div>

        {/* Belum Presensi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Belum Presensi</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className={`text-2xl font-extrabold ${totals.totalBelumPresensi > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {totals.totalBelumPresensi} <span className="text-xs font-normal text-slate-500">Sesi</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {totals.totalBelumPresensi > 0 ? 'Harap konfirmasi ke lokasi' : 'Semua sesi berpresensi'}
          </p>
        </div>
      </div>

      {/* Multi-Location Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
          <Building className="w-4 h-4 text-sky-600 mr-1.5" />
          Rincian Berdasarkan Lokasi Mengajar ({teacherRecords.length} Lokasi)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {teacherRecords.map((rec) => {
            const displayLok = rec.lok || rec.lokasi || '-';
            const displayKode = rec.kode || rec.kodeLokasi || '-';

            return (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{displayKode}</span>
                    <h4 className="text-sm font-bold text-slate-900">{displayLok}</h4>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    rec.statusKoreksi === 'Sudah Dikoreksi'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rec.statusKoreksi === 'Perlu Perbaikan'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rec.statusKoreksi}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-500">Mengajar Negeri</p>
                    <p className="font-extrabold text-slate-800">{formatDecimal(rec.durMengajarNegeri)} Jam ({formatDecimal(rec.sesiMengajarNegeri)} sesi)</p>
                    <p className="text-[10px] text-slate-500">Sangsi: {formatDecimal(rec.menitSangsiMengajarNegeri)}m</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-500">Mengajar Swasta</p>
                    <p className="font-extrabold text-slate-800">{formatDecimal(rec.durMengajarSwasta)} Jam ({formatDecimal(rec.sesiMengajarSwasta)} sesi)</p>
                    <p className="text-[10px] text-slate-500">Ahad: {formatDecimal(rec.sesiMengajarAhad)} sesi</p>
                  </div>
                </div>

                {rec.catatanKoreksi && (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800">
                    <strong>Catatan Lokasi:</strong> {rec.catatanKoreksi}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Banner Monitoring Tindak Lanjut Keuangan */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border border-indigo-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Monitoring Keterangan &amp; Tindak Lanjut Admin Keuangan
                </h4>
                {followUpStats.waiting > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                    {followUpStats.waiting} Menunggu Tindak Lanjut
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                Bila Anda menemukan kendala durasi jam mengajar, insentif belum terhitung, atau klarifikasi status presensi, silakan klik tombol <strong>+ Input Keterangan</strong> pada tabel di bawah. Catatan Anda akan langsung dimonitor oleh Admin Keuangan Wilayah untuk ditindaklanjuti.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
            <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-indigo-100 shadow-2xs text-xs">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Status Pengajuan</span>
              <div className="flex items-center space-x-2 mt-0.5 font-bold">
                <span className="text-emerald-700">{followUpStats.completed} Selesai</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-amber-700">{followUpStats.waiting} Menunggu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table: Exact 24 Columns Requested with Image Header Style */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Tabel Rekapitulasi Sesi Mengajar Seluruh Lokasi
            </h3>
            <p className="text-xs text-slate-500">
              Format resmi 24 parameter laporan sesi mengajar Anda di seluruh cabang
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
            {teacherRecords.length} Lokasi Mengajar
          </span>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
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
                <th className="px-3 py-3 text-center whitespace-nowrap">
                  Status Koreksi
                </th>
                {/* 25. Keterangan Pengajar & Monitoring Keuangan */}
                <th className="px-4 py-3 text-left whitespace-nowrap min-w-[280px] bg-[#00ea95] text-slate-950 font-black">
                  Keterangan Pengajar &amp; Tindak Lanjut Keuangan
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {teacherRecords.length === 0 ? (
                <tr>
                  <td colSpan={26} className="px-6 py-12 text-center text-slate-400">
                    Tidak ditemukan data sesi untuk nomor pegawai ini.
                  </td>
                </tr>
              ) : (
                teacherRecords.map((r) => {
                  const displayKode = r.kode || '-';
                  const displayLok = r.lok || r.kodeLokasi || '-';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Periode (Sticky Left) */}
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600 font-medium sticky left-0 bg-white hover:bg-slate-50 z-10 shadow-xs">
                        {r.periode || activePeriode}
                      </td>

                      {/* 2. Nopeg */}
                      <td className="px-3 py-3 whitespace-nowrap font-mono text-slate-700 font-semibold">
                        {r.nopeg}
                      </td>

                      {/* 3. Nama Pengajar */}
                      <td className="px-3 py-3 font-bold text-slate-900 whitespace-nowrap">
                        {r.namaPengajar}
                      </td>

                      {/* 4. Kode */}
                      <td className="px-3 py-3 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {displayKode}
                      </td>

                      {/* 5. Lok */}
                      <td className="px-3 py-3 text-slate-700 whitespace-nowrap font-medium">
                        {displayLok}
                      </td>

                      {/* 6. Dur Mengajar Negeri */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap font-medium text-slate-800">
                        {formatDecimal(r.durMengajarNegeri)}
                      </td>

                      {/* 7. Sesi Mengajar Negeri */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap text-slate-800">
                        {formatDecimal(r.sesiMengajarNegeri)}
                      </td>

                      {/* 8. Menit Sangsi Mengajar Negeri */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                        {r.menitSangsiMengajarNegeri > 0 ? (
                          <span className="text-amber-600 font-bold">{formatDecimal(r.menitSangsiMengajarNegeri)}</span>
                        ) : (
                          <span className="text-slate-400">{formatDecimal(0)}</span>
                        )}
                      </td>

                      {/* 9. Insentif Hadir Mengajar Negeri */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap font-medium text-red-600">
                        {formatDecimal(r.insentifHadirMengajarNegeri)}
                      </td>

                      {/* 10. Jaga Tes Negeri */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.jagaTesNegeri)}
                      </td>

                      {/* 11. Dur Mengajar Swasta */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap font-medium text-slate-800">
                        {formatDecimal(r.durMengajarSwasta)}
                      </td>

                      {/* 12. Menit Sangsi Mengajar Swasta */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                        {r.menitSangsiMengajarSwasta > 0 ? (
                          <span className="text-amber-600 font-bold">{formatDecimal(r.menitSangsiMengajarSwasta)}</span>
                        ) : (
                          <span className="text-slate-400">{formatDecimal(0)}</span>
                        )}
                      </td>

                      {/* 13. Insentif Hadir Mengajar Swasta */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap font-medium text-red-600">
                        {formatDecimal(r.insentifHadirMengajarSwasta)}
                      </td>

                      {/* 14. Jaga TesSwasta */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.jagaTesSwasta)}
                      </td>

                      {/* 15. Sesi Mengajar Ahad */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap text-slate-800">
                        {formatDecimal(r.sesiMengajarAhad)}
                      </td>

                      {/* 16. Sesi Tidak Hadir */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                        {(r.sesiTidakHadir || 0) > 0 ? (
                          <span className="text-rose-600 font-bold">{formatDecimal(r.sesiTidakHadir)}</span>
                        ) : (
                          <span className="text-slate-400">{formatDecimal(0)}</span>
                        )}
                      </td>

                      {/* 17. Sesi Mengajar Swasta */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap text-slate-800">
                        {formatDecimal(r.sesiMengajarSwasta)}
                      </td>

                      {/* 18. Dur Konsultasi Negeri */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.durKonsultasiNegeri)}
                      </td>

                      {/* 19. Sesi Konsultasi Negeri */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
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

                      {/* Status Koreksi */}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.statusKoreksi === 'Sudah Dikoreksi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.statusKoreksi === 'Perlu Perbaikan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.statusKoreksi}
                        </span>
                      </td>

                      {/* 25. Keterangan Pengajar & Monitoring Keuangan */}
                      <td className="px-3 py-2.5 min-w-[280px]">
                        {r.keteranganPengajar ? (
                          <div className="space-y-1.5">
                            {/* Teacher's Note Card */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-[11px] leading-relaxed">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                <span className="font-bold flex items-center text-indigo-700">
                                  <MessageSquare className="w-3 h-3 mr-1 text-indigo-600" />
                                  Keterangan Pengajar:
                                </span>
                                <span>{r.waktuKeteranganPengajar || '-'}</span>
                              </div>
                              <p className="font-medium text-slate-700 whitespace-pre-wrap">{r.keteranganPengajar}</p>
                            </div>

                            {/* Status Badge from Finance & Edit Action */}
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
                                onClick={() => handleOpenInputKeterangan(r)}
                                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5 hover:underline cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Ubah</span>
                              </button>
                            </div>

                            {/* Finance Admin Response if available */}
                            {r.catatanKeuangan && (
                              <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-950">
                                <div className="flex items-center justify-between text-[10px] text-emerald-700 font-bold mb-0.5">
                                  <span>Tindak Lanjut Keuangan ({r.petugasKeuangan || 'Admin Keuangan'}):</span>
                                  <span className="font-normal text-emerald-600">{r.waktuTindakLanjutKeuangan || ''}</span>
                                </div>
                                <p className="font-medium text-emerald-900">{r.catatanKeuangan}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenInputKeterangan(r)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-600" />
                            <span>+ Input Keterangan Keuangan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Row */}
            {teacherRecords.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td className="px-3 py-3 sticky left-0 bg-slate-100 z-10 shadow-xs">
                    TOTAL KESELURUHAN
                  </td>
                  <td className="px-3 py-3 text-slate-500 font-normal">
                    {teacherRecords.length}
                  </td>
                  <td className="px-3 py-3 text-slate-500 font-normal" colSpan={3}>
                    {teacherRecords.length} Lokasi Mengajar
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalDurNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalSesiNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono text-amber-600">{formatDecimal(totals.totalMenitSangsiNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-600">{formatDecimal(totals.totalInsentifHadirNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalJagaTesNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalDurSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono text-amber-600">{formatDecimal(totals.totalMenitSangsiSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-600">{formatDecimal(totals.totalInsentifHadirSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalJagaTesSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalSesiAhad)}</td>
                  <td className="px-3 py-3 text-right font-mono text-rose-600">{formatDecimal(totals.totalSesiTidakHadir)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalSesiSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalDurKonsulNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalSesiKonsulNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-600">{formatDecimal(totals.totalInstKonsulNegeri)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalDurKonsulSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono">{formatDecimal(totals.totalSesiKonsulSwasta)}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-600">{formatDecimal(totals.totalInstKonsulSwasta)}</td>
                  <td className="px-3 py-3 text-center font-mono text-rose-600 font-extrabold">{totals.totalBelumPresensi}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Input Keterangan Pengajar untuk Tindak Lanjut Admin Keuangan */}
      {selectedRecordForKeterangan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in-50 zoom-in-95 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Input Keterangan Sesi Mengajar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Untuk dimonitor dan ditindaklanjuti oleh Admin Keuangan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForKeterangan(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveKeteranganSubmit} className="p-6 space-y-4">
              {/* Session Meta Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center space-x-1.5 text-indigo-700">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedRecordForKeterangan.lok || selectedRecordForKeterangan.lokasi}</span>
                  </span>
                  <span className="font-mono text-slate-500">Kode: {selectedRecordForKeterangan.kode || selectedRecordForKeterangan.kodeLokasi}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Periode:</span>
                    <span className="font-semibold text-slate-800">{selectedRecordForKeterangan.periode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Durasi:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDecimal((selectedRecordForKeterangan.durMengajarNegeri || 0) + (selectedRecordForKeterangan.durMengajarSwasta || 0))} Jam
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Belum Presensi:</span>
                    <span className={`font-semibold ${selectedRecordForKeterangan.belumPresensi > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}`}>
                      {selectedRecordForKeterangan.belumPresensi || 0} Sesi
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Template Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Template Alasan Cepat (Klik untuk menyisipkan):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Insentif hadir mengajar negeri belum terhitung di sistem.',
                    'Durasi jam mengajar sesi negeri belum sesuai dengan jadwal rilis.',
                    'Ada sesi pengganti yang belum tercatat pada daftar sesi.',
                    'Klarifikasi status belum presensi (absensi manual sudah ditandatangani).',
                    'Koreksi menit sangsi mengajar karena kendala fingerprint/jaringan.'
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => {
                        setKeteranganInput((prev) => (prev ? `${prev}\n${tpl}` : tpl));
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/70 transition-colors cursor-pointer text-left"
                    >
                      + {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Keterangan / Pengajuan Kendala Pengajar <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={keteranganInput}
                  onChange={(e) => setKeteranganInput(e.target.value)}
                  placeholder="Tuliskan keterangan detail kendala, tanggal sesi, koreksi durasi, atau klarifikasi insentif yang perlu ditindaklanjuti oleh Admin Keuangan..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Keterangan ini akan langsung tampil di menu <strong>Monitoring Tindak Lanjut Keuangan</strong> pada akun Admin Keuangan Wilayah.
                </p>
              </div>

              {/* Existing Finance Response if any */}
              {selectedRecordForKeterangan.catatanKeuangan && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Tanggapan Admin Keuangan Sebelumnya:</span>
                  </div>
                  <p className="text-emerald-950 font-medium text-[11px]">{selectedRecordForKeterangan.catatanKeuangan}</p>
                  <p className="text-[10px] text-emerald-600 mt-1">
                    Petugas: {selectedRecordForKeterangan.petugasKeuangan || 'Admin Keuangan'} &bull; Waktu: {selectedRecordForKeterangan.waktuTindakLanjutKeuangan || '-'}
                  </p>
                </div>
              )}

              {/* Success Notification inside modal */}
              {saveSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRecordForKeterangan(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!keteranganInput.trim()}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Admin Keuangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
