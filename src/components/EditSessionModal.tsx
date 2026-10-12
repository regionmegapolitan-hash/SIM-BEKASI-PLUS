import React, { useState, useEffect } from 'react';
import { SesiMengajarRecord } from '../types';
import { roundToTwo } from '../utils/excelHelper';
import { X, Check, ShieldCheck, AlertCircle, Clock, Save } from 'lucide-react';

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SesiMengajarRecord | null;
  onSave: (updated: SesiMengajarRecord) => void;
  currentUserName: string;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave,
  currentUserName
}) => {
  const [form, setForm] = useState<SesiMengajarRecord>(() => record || ({} as SesiMengajarRecord));

  useEffect(() => {
    if (record) {
      setForm({ ...record });
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleChange = (field: keyof SesiMengajarRecord, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated: SesiMengajarRecord = {
      ...form,
      durMengajarNegeri: roundToTwo(form.durMengajarNegeri),
      sesiMengajarNegeri: roundToTwo(form.sesiMengajarNegeri),
      menitSangsiMengajarNegeri: roundToTwo(form.menitSangsiMengajarNegeri),
      insentifHadirMengajarNegeri: roundToTwo(form.insentifHadirMengajarNegeri),
      jagaTesNegeri: roundToTwo(form.jagaTesNegeri),
      durMengajarSwasta: roundToTwo(form.durMengajarSwasta),
      menitSangsiMengajarSwasta: roundToTwo(form.menitSangsiMengajarSwasta),
      insentifHadirMengajarSwasta: roundToTwo(form.insentifHadirMengajarSwasta),
      jagaTesSwasta: roundToTwo(form.jagaTesSwasta),
      sesiMengajarAhad: roundToTwo(form.sesiMengajarAhad),
      sesiTidakHadir: roundToTwo(form.sesiTidakHadir),
      sesiMengajarSwasta: roundToTwo(form.sesiMengajarSwasta),
      durKonsultasiNegeri: roundToTwo(form.durKonsultasiNegeri),
      sesiKonsultasiNegeri: roundToTwo(form.sesiKonsultasiNegeri),
      instKonsultasiNegeri: roundToTwo(form.instKonsultasiNegeri),
      durKonsultasiSwasta: roundToTwo(form.durKonsultasiSwasta),
      sesiKonsultasiSwasta: roundToTwo(form.sesiKonsultasiSwasta),
      instKonsultasiSwasta: roundToTwo(form.instKonsultasiSwasta),
      belumPresensi: Math.max(0, parseInt(String(form.belumPresensi)) || 0),
      korektor: form.statusKoreksi === 'Sudah Dikoreksi' ? currentUserName : form.korektor,
      waktuKoreksi: form.statusKoreksi === 'Sudah Dikoreksi' ? now : form.waktuKoreksi
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in-50 zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {form.lok || form.lokasi}
              </span>
              <span className="text-xs text-slate-400 font-mono">Kode: {form.kode || form.kodeLokasi}</span>
              <span className="text-xs text-slate-500 font-medium">&bull; Periode: {form.periode}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {form.namaPengajar} ({form.nopeg})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Status Koreksi Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">
              Status Koreksi & Verifikasi Lokasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['Belum Dicek', 'Sudah Dikoreksi', 'Perlu Perbaikan'] as const).map((status) => (
                <label
                  key={status}
                  className={`flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    form.statusKoreksi === status
                      ? status === 'Sudah Dikoreksi'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : status === 'Perlu Perbaikan'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-700 text-white border-slate-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="statusKoreksi"
                    value={status}
                    checked={form.statusKoreksi === status}
                    onChange={() => handleChange('statusKoreksi', status)}
                    className="sr-only"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Catatan Verifikasi / Alasan Koreksi
              </label>
              <textarea
                rows={2}
                value={form.catatanKoreksi || ''}
                onChange={(e) => handleChange('catatanKoreksi', e.target.value)}
                placeholder="Tuliskan catatan bila ada sesi yang belum sesuai atau perlu penyesuaian..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Keterangan Pengajar & Tindak Lanjut Keuangan Section */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
              Keterangan Pengajar &amp; Tindak Lanjut Keuangan
            </label>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Keterangan Kendala / Klarifikasi dari Pengajar:
              </label>
              <textarea
                rows={2}
                value={form.keteranganPengajar || ''}
                onChange={(e) => handleChange('keteranganPengajar', e.target.value)}
                placeholder="Catatan kendala atau klarifikasi sesi yang diajukan oleh guru pengajar..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status Tindak Lanjut Keuangan:
                </label>
                <select
                  value={form.statusTindakLanjutKeuangan || 'Belum Ada Keterangan'}
                  onChange={(e) => handleChange('statusTindakLanjutKeuangan', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Belum Ada Keterangan">Belum Ada Keterangan</option>
                  <option value="Menunggu Tindak Lanjut">Menunggu Tindak Lanjut</option>
                  <option value="Sedang Diproses">Sedang Diproses</option>
                  <option value="Selesai Ditindaklanjuti">Selesai Ditindaklanjuti</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Catatan &amp; Tanggapan Keuangan:
                </label>
                <input
                  type="text"
                  value={form.catatanKeuangan || ''}
                  onChange={(e) => handleChange('catatanKeuangan', e.target.value)}
                  placeholder="Respon tindakan keuangan..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Form Fields: 24 Columns Breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Detail Parameter Sesi Mengajar (Standar 24 Kolom)
            </h4>

            {/* Sesi Mengajar Negeri */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <p className="text-xs font-bold text-slate-800">1. Sesi Mengajar Sekolah Negeri</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Dur Mengajar Negeri</label>
                  <input
                    type="number"
                    step="any"
                    value={form.durMengajarNegeri}
                    onChange={(e) => handleChange('durMengajarNegeri', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Sesi Mengajar Negeri</label>
                  <input
                    type="number"
                    value={form.sesiMengajarNegeri || 0}
                    onChange={(e) => handleChange('sesiMengajarNegeri', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Menit Sangsi Negeri</label>
                  <input
                    type="number"
                    value={form.menitSangsiMengajarNegeri}
                    onChange={(e) => handleChange('menitSangsiMengajarNegeri', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-amber-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-red-600 font-bold block mb-1">Insentif Hadir Negeri</label>
                  <input
                    type="number"
                    value={form.insentifHadirMengajarNegeri}
                    onChange={(e) => handleChange('insentifHadirMengajarNegeri', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-red-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Jaga Tes Negeri</label>
                  <input
                    type="number"
                    value={form.jagaTesNegeri}
                    onChange={(e) => handleChange('jagaTesNegeri', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sesi Mengajar Swasta & Ahad */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <p className="text-xs font-bold text-slate-800">2. Sesi Mengajar Sekolah Swasta, Ahad & Kehadiran</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Dur Mengajar Swasta</label>
                  <input
                    type="number"
                    step="any"
                    value={form.durMengajarSwasta}
                    onChange={(e) => handleChange('durMengajarSwasta', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Menit Sangsi Swasta</label>
                  <input
                    type="number"
                    value={form.menitSangsiMengajarSwasta}
                    onChange={(e) => handleChange('menitSangsiMengajarSwasta', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-amber-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-red-600 font-bold block mb-1">Insentif Hadir Swasta</label>
                  <input
                    type="number"
                    value={form.insentifHadirMengajarSwasta}
                    onChange={(e) => handleChange('insentifHadirMengajarSwasta', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-red-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Jaga TesSwasta</label>
                  <input
                    type="number"
                    value={form.jagaTesSwasta}
                    onChange={(e) => handleChange('jagaTesSwasta', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Sesi Mengajar Ahad</label>
                  <input
                    type="number"
                    value={form.sesiMengajarAhad || 0}
                    onChange={(e) => handleChange('sesiMengajarAhad', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Sesi Tidak Hadir</label>
                  <input
                    type="number"
                    value={form.sesiTidakHadir || 0}
                    onChange={(e) => handleChange('sesiTidakHadir', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Sesi Mengajar Swasta</label>
                  <input
                    type="number"
                    value={form.sesiMengajarSwasta || 0}
                    onChange={(e) => handleChange('sesiMengajarSwasta', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Konsultasi & Belum Presensi */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <p className="text-xs font-bold text-slate-800">3. Konsultasi & Status Belum Presensi</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Dur Konsultasi Negeri</label>
                  <input
                    type="number"
                    step="any"
                    value={form.durKonsultasiNegeri}
                    onChange={(e) => handleChange('durKonsultasiNegeri', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Sesi Konsultasi Negeri</label>
                  <input
                    type="number"
                    value={form.sesiKonsultasiNegeri || 0}
                    onChange={(e) => handleChange('sesiKonsultasiNegeri', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-red-600 font-bold block mb-1">Inst Konsultasi Negeri</label>
                  <input
                    type="number"
                    value={form.instKonsultasiNegeri}
                    onChange={(e) => handleChange('instKonsultasiNegeri', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-red-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Dur Konsultasi Swasta</label>
                  <input
                    type="number"
                    step="any"
                    value={form.durKonsultasiSwasta}
                    onChange={(e) => handleChange('durKonsultasiSwasta', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Sesi Konsultasi Swasta</label>
                  <input
                    type="number"
                    value={form.sesiKonsultasiSwasta || 0}
                    onChange={(e) => handleChange('sesiKonsultasiSwasta', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-red-600 font-bold block mb-1">Inst Konsultasi Swasta</label>
                  <input
                    type="number"
                    value={form.instKonsultasiSwasta}
                    onChange={(e) => handleChange('instKonsultasiSwasta', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-red-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Belum Presensi</label>
                  <input
                    type="number"
                    value={form.belumPresensi}
                    onChange={(e) => handleChange('belumPresensi', parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-rose-600 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
