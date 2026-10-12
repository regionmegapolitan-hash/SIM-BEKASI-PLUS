import React, { useState, useMemo, useEffect } from 'react';
import { SesiMengajarRecord, UserSession } from '../types';
import { LOKASI_DATA } from '../data/mockData';
import { exportToExcelFile, formatRupiah, formatDecimal } from '../utils/excelHelper';
import {
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Check,
  RotateCcw,
  Download,
  Printer,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface LokasiDashboardProps {
  user: UserSession;
  records: SesiMengajarRecord[];
  activePeriode: string;
  onUpdateRecordStatus: (recordId: string, status: 'Sudah Dikoreksi' | 'Belum Dicek' | 'Perlu Perbaikan', catatan?: string) => void;
  onBatchVerifyLocation: (kodeLokasi: string, status: 'Sudah Dikoreksi' | 'Belum Dicek') => void;
  onOpenImport?: () => void;
}

export const LokasiDashboard: React.FC<LokasiDashboardProps> = ({
  user,
  records,
  activePeriode,
  onUpdateRecordStatus,
  onBatchVerifyLocation,
  onOpenImport
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickNoteModalRecord, setQuickNoteModalRecord] = useState<SesiMengajarRecord | null>(null);
  const [catatanInput, setCatatanInput] = useState('');

  // Find info of current location from user's assigned account
  const lokasiInfo = useMemo(() => {
    return (
      LOKASI_DATA.find((l) => l.kodeLokasi === user.identifier) ||
      LOKASI_DATA.find((l) => l.namaLokasi.toLowerCase().includes((user.unitName || '').toLowerCase())) ||
      LOKASI_DATA.find((l) => (user.unitName || '').toLowerCase().includes(l.namaLokasi.toLowerCase())) || {
        kodeLokasi: user.identifier,
        namaLokasi: user.unitName,
        alamat: 'Unit Lokasi Belajar',
        penanggungJawab: user.name,
        kontak: user.phone || '-'
      }
    );
  }, [user]);

  // Filter records ONLY for this location by matching lok, kodeLokasi, or lokasi name
  const locationRecords = useMemo(() => {
    const targetCode = (lokasiInfo.kodeLokasi || user.identifier || '').trim().toLowerCase();
    const targetName = (lokasiInfo.namaLokasi || user.unitName || '').trim().toLowerCase();

    return records.filter((r) => {
      const recLok = String(r.lok || '').trim().toLowerCase();
      const recKodeLokasi = String(r.kodeLokasi || '').trim().toLowerCase();
      const recLokasiName = String(r.lokasi || '').trim().toLowerCase();

      return (
        recLok === targetCode ||
        recKodeLokasi === targetCode ||
        (targetName && (recLokasiName === targetName || recLokasiName.includes(targetName) || targetName.includes(recLokasiName)))
      );
    });
  }, [records, lokasiInfo, user]);

  const filteredRecords = useMemo(() => {
    return locationRecords.filter((r) => {
      const matchStatus = selectedStatus === 'ALL' || r.statusKoreksi === selectedStatus;
      const matchSearch =
        searchQuery.trim() === '' ||
        r.namaPengajar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nopeg.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [locationRecords, selectedStatus, searchQuery]);

  // Stats for this location
  const stats = useMemo(() => {
    const total = locationRecords.length;
    const verified = locationRecords.filter((r) => r.statusKoreksi === 'Sudah Dikoreksi').length;
    const pending = locationRecords.filter((r) => r.statusKoreksi === 'Belum Dicek').length;
    const needFix = locationRecords.filter((r) => r.statusKoreksi === 'Perlu Perbaikan').length;
    const pct = total > 0 ? Math.round((verified / total) * 100) : 0;

    const totalJam = locationRecords.reduce(
      (acc, r) => acc + (Number(r.durMengajarNegeri) || 0) + (Number(r.durMengajarSwasta) || 0),
      0
    );
    const totalInsentif = locationRecords.reduce(
      (acc, r) => acc + (Number(r.insentifHadirMengajarNegeri) || 0) + (Number(r.insentifHadirMengajarSwasta) || 0),
      0
    );
    const totalBelumPresensi = locationRecords.reduce((acc, r) => acc + (Number(r.belumPresensi) || 0), 0);

    return {
      total,
      verified,
      pending,
      needFix,
      pct,
      totalJam,
      totalInsentif,
      totalBelumPresensi
    };
  }, [locationRecords]);

  const handleOpenNoteModal = (rec: SesiMengajarRecord) => {
    setQuickNoteModalRecord(rec);
    setCatatanInput(rec.catatanKoreksi || '');
  };

  const handleSaveNoteAndStatus = (status: 'Sudah Dikoreksi' | 'Perlu Perbaikan') => {
    if (!quickNoteModalRecord) return;
    onUpdateRecordStatus(quickNoteModalRecord.id, status, catatanInput);
    setQuickNoteModalRecord(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Banner Lokasi Belajar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20 text-xs font-semibold mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Pusat Kendali & Pengecekan Lokasi Belajar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lokasiInfo.namaLokasi}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
              Kode: <span className="font-mono font-bold text-white">{lokasiInfo.kodeLokasi}</span> &bull; Penanggung Jawab: <span className="font-semibold text-white">{lokasiInfo.penanggungJawab}</span> &bull; {lokasiInfo.alamat}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onBatchVerifyLocation(lokasiInfo.kodeLokasi, 'Sudah Dikoreksi')}
              className="px-4 py-2.5 rounded-xl bg-emerald-800/90 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md border border-emerald-600/40 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Tandai Semua Selesai Dicek</span>
            </button>

            <button
              type="button"
              onClick={() => exportToExcelFile(locationRecords, `Rekap_Presensi_${lokasiInfo.kodeLokasi}`)}
              className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 border border-emerald-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Rekap</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for This Location */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Status Verifikasi</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-extrabold text-emerald-700">{stats.pct}%</p>
            <span className="text-xs text-slate-500">
              ({stats.verified}/{stats.total} Dicek)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Jam Ajar di Lokasi</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatDecimal(stats.totalJam)} <span className="text-xs font-normal text-slate-500">Jam</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Gabungan Negeri & Swasta</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Guru Mengajar di Sini</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {stats.total} <span className="text-xs font-normal text-slate-500">Guru</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {stats.pending} guru belum dicek
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Belum Presensi</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className={`text-2xl font-extrabold ${stats.totalBelumPresensi > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {stats.totalBelumPresensi} <span className="text-xs font-normal text-slate-500">Sesi</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {stats.totalBelumPresensi > 0 ? 'Mohon hubungi pengajar terkait' : 'Semua presensi tertib'}
          </p>
        </div>
      </div>

      {/* Checklist Table for Teachers at this location */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/40">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama guru atau nopeg..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Status Koreksi</option>
              <option value="Belum Dicek">Belum Dicek ({stats.pending})</option>
              <option value="Sudah Dikoreksi">Sudah Dikoreksi ({stats.verified})</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan ({stats.needFix})</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">
              Format: <span className="font-bold text-slate-700">24 Kolom Standar Resmi</span> &bull; {filteredRecords.length} pengajar di lokasi ini
            </span>
          </div>
        </div>

        {/* 24 Columns Table with Green Header and Red Incentive Columns */}
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

                {/* Keterangan Guru & Tindak Lanjut Keuangan */}
                <th className="px-3 py-3 text-left whitespace-nowrap min-w-[260px]">
                  Keterangan Guru &amp; Tindak Lanjut Keuangan
                </th>

                {/* Status & Verification Actions */}
                <th className="px-3 py-3 text-center sticky right-0 bg-[#00ffa2] z-20 shadow-xs whitespace-nowrap min-w-[210px]">
                  Status & Tindakan Verifikasi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={26} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada pengajar di lokasi ini yang memenuhi filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
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
                        <div>
                          <p>{r.namaPengajar}</p>
                          {r.catatanKoreksi && (
                            <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 max-w-[150px] truncate">
                              Catatan: {r.catatanKoreksi}
                            </p>
                          )}
                        </div>
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
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap font-medium text-red-600">
                        {formatDecimal(r.instKonsultasiNegeri)}
                      </td>

                      {/* 21. Dur Konsultasi Swasta */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.durKonsultasiSwasta)}
                      </td>

                      {/* 22. Sesi Konsultasi Swasta */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap">
                        {formatDecimal(r.sesiKonsultasiSwasta)}
                      </td>

                      {/* 23. Inst Konsultasi Swasta */}
                      <td className="px-3 py-3 text-right font-mono whitespace-nowrap font-medium text-red-600">
                        {formatDecimal(r.instKonsultasiSwasta)}
                      </td>

                      {/* 24. Belum Presensi */}
                      <td className="px-3 py-3 text-center font-mono whitespace-nowrap">
                        {r.belumPresensi > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[11px]">
                            {r.belumPresensi}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">0</span>
                        )}
                      </td>

                      {/* Keterangan Guru & Tindak Lanjut Keuangan */}
                      <td className="px-3 py-3 min-w-[260px]">
                        {r.keteranganPengajar ? (
                          <div className="space-y-1">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-[11px]">
                              <p className="font-semibold text-indigo-700 text-[10px] flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1 text-indigo-600" />
                                Keterangan Pengajar:
                              </p>
                              <p className="font-medium text-slate-700 mt-0.5">{r.keteranganPengajar}</p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.statusTindakLanjutKeuangan === 'Selesai Ditindaklanjuti'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.statusTindakLanjutKeuangan === 'Sedang Diproses'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              Status Keuangan: {r.statusTindakLanjutKeuangan || 'Menunggu Tindak Lanjut'}
                            </span>
                            {r.catatanKeuangan && (
                              <p className="text-[10px] text-emerald-900 bg-emerald-50 rounded p-1 border border-emerald-100">
                                <strong>Respon Keuangan:</strong> {r.catatanKeuangan}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>

                      {/* Fast Verification Buttons (Sticky Right) */}
                      <td className="px-3 py-3 text-center sticky right-0 bg-white hover:bg-slate-50 z-10 shadow-xs whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {r.statusKoreksi === 'Sudah Dikoreksi' ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                Sudah Dikoreksi
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateRecordStatus(r.id, 'Belum Dicek')}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Batalkan status koreksi"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => onUpdateRecordStatus(r.id, 'Sudah Dikoreksi')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center space-x-1 cursor-pointer transition-transform active:scale-95"
                                title="Klik untuk konfirmasi sesi sesuai"
                              >
                                <Check className="w-3 h-3" />
                                <span>Klik Sudah Dicek</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenNoteModal(r)}
                                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Catatan perbaikan"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Note Modal */}
      {quickNoteModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Catatan Pengecekan Lokasi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pengajar: <strong>{quickNoteModalRecord.namaPengajar}</strong> ({quickNoteModalRecord.nopeg})
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Keterangan Sesi:
              </label>
              <textarea
                rows={3}
                value={catatanInput}
                onChange={(e) => setCatatanInput(e.target.value)}
                placeholder="Contoh: Terlambat 15 menit, ada 1 sesi belum presensi barcode..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-between space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickNoteModalRecord(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSaveNoteAndStatus('Perlu Perbaikan')}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg"
                >
                  Set Perlu Perbaikan
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNoteAndStatus('Sudah Dikoreksi')}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg"
                >
                  Simpan & Sudah Dikoreksi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
