import React, { useState, useRef, useMemo } from 'react';
import { SesiMengajarRecord } from '../types';
import { LOKASI_DATA } from '../data/mockData';
import {
  parseUploadedFile,
  parseClipboardText,
  fetchCsvFromGoogleSheet,
  downloadExcelTemplate,
  detectColumnMapping,
  applyColumnMapping,
  ColumnMappingConfig,
  SYSTEM_FIELDS,
  formatDecimal
} from '../utils/excelHelper';
import {
  X,
  Upload,
  Link as LinkIcon,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertTriangle,
  Check,
  RefreshCw,
  ClipboardList,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCheck,
  Database
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (records: SesiMengajarRecord[], mode: 'merge' | 'replace') => void;
  activePeriode: string;
}

type Step = 'source' | 'mapping' | 'preview';

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  activePeriode
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [activeSourceTab, setActiveSourceTab] = useState<'sheets' | 'excel' | 'paste'>('sheets');

  // Input states
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raw parsed data from whatever source
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);

  // Mapping state
  const [mappingConfig, setMappingConfig] = useState<ColumnMappingConfig>({
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
  });

  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Process raw rows and transition to mapping step
  const handleProceedWithRawRows = (rows: Record<string, any>[], sourceLabel: string) => {
    if (!rows || rows.length === 0) {
      setErrorMsg('Sumber data kosong atau tidak ada baris yang terbaca.');
      return;
    }

    const headers = Object.keys(rows[0] || {});
    if (headers.length === 0) {
      setErrorMsg('Tidak ditemukan nama kolom (header) pada data sumber.');
      return;
    }

    setRawRows(rows);
    setAvailableHeaders(headers);

    // Auto-detect best column matches
    const detected = detectColumnMapping(headers);
    setMappingConfig(detected);
    setErrorMsg('');
    setCurrentStep('mapping');
  };

  // 1. Handle File Upload (Excel / CSV)
  const processSelectedFile = async (file: File) => {
    setFileName(file.name);
    setErrorMsg('');
    setLoading(true);

    try {
      const rows = await parseUploadedFile(file);
      handleProceedWithRawRows(rows, file.name);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membaca berkas Excel. Pastikan format valid (.xlsx, .xls, .csv).');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
    if (e.target) e.target.value = '';
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // 2. Handle Google Sheet URL
  const handleFetchGoogleSheets = async () => {
    if (!googleSheetUrl.trim()) {
      setErrorMsg('Silakan masukkan tautan Google Sheets terlebih dahulu.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const rows = await fetchCsvFromGoogleSheet(googleSheetUrl);
      handleProceedWithRawRows(rows, 'Google Sheets');
    } catch (err: any) {
      setErrorMsg(
        err.message ||
        'Gagal membaca link Google Sheets. Pastikan akses diset "Siapa saja yang memiliki link dapat melihat" atau gunakan opsi Upload Excel / Tempel Teks.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Clipboard / Pasted Text
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Tempelkan teks tabel dari spreadsheet terlebih dahulu.');
      return;
    }

    setErrorMsg('');
    try {
      const rows = parseClipboardText(pastedText);
      handleProceedWithRawRows(rows, 'Teks Tempel');
    } catch (err: any) {
      setErrorMsg('Gagal memproses teks tabel yang ditempelkan. Pastikan menyertakan baris judul kolom.');
    }
  };

  // Load a demo non-standard format dataset
  const handleLoadCustomFormatDemo = () => {
    const customBranchRows = [
      {
        'Bulan': activePeriode,
        'NIP': 'NP-1011',
        'Nama Guru': 'Dr. Ahmad Fauzi, M.Pd',
        'Kd Lok': 'LOK-BKS-01',
        'Cabang': 'Bekasi Timur',
        'Jam Ajar SMA': 22.0,
        'Sesi Negeri': 14,
        'Potongan Telat': 0,
        'Jumlah Insentif Hadir Negeri': 14,
        'Pengawas Ujian': 4,
        'Jam Swasta': 15.0,
        'Sanksi Swas': 0,
        'Jumlah Insentif Hadir Swasta': 10,
        'Pengawas Swas': 2,
        'Jam Ahad': 2,
        'Alpha': 0,
        'Sesi Swas': 10,
        'Jam Konsul SMAN': 5.0,
        'Sesi Konsul Neg': 3,
        'Jumlah Inst Konsul Neg': 3,
        'Jam Konsul SMAS': 3.5,
        'Sesi Konsul Swas': 2,
        'Jumlah Inst Konsul Swas': 2,
        'Tidak Absen': 0
      },
      {
        'Bulan': activePeriode,
        'NIP': 'NP-1012',
        'Nama Guru': 'Siti Nurhaliza, S.Si',
        'Kd Lok': 'LOK-BKS-02',
        'Cabang': 'Bekasi Barat',
        'Jam Ajar SMA': 19.5,
        'Sesi Negeri': 12,
        'Potongan Telat': 10,
        'Jumlah Insentif Hadir Negeri': 12,
        'Pengawas Ujian': 3,
        'Jam Swasta': 11.0,
        'Sanksi Swas': 0,
        'Jumlah Insentif Hadir Swasta': 7,
        'Pengawas Swas': 1,
        'Jam Ahad': 1,
        'Alpha': 0,
        'Sesi Swas': 7,
        'Jam Konsul SMAN': 4.0,
        'Sesi Konsul Neg': 2,
        'Jumlah Inst Konsul Neg': 2,
        'Jam Konsul SMAS': 2.0,
        'Sesi Konsul Swas': 1,
        'Jumlah Inst Konsul Swas': 1,
        'Tidak Absen': 1
      },
      {
        'Bulan': activePeriode,
        'NIP': 'NP-1013',
        'Nama Guru': 'Budi Santoso, M.T',
        'Kd Lok': 'LOK-BKS-03',
        'Cabang': 'Tambun',
        'Jam Ajar SMA': 17.0,
        'Sesi Negeri': 11,
        'Potongan Telat': 0,
        'Jumlah Insentif Hadir Negeri': 11,
        'Pengawas Ujian': 2,
        'Jam Swasta': 13.5,
        'Sanksi Swas': 15,
        'Jumlah Insentif Hadir Swasta': 9,
        'Pengawas Swas': 1,
        'Jam Ahad': 2,
        'Alpha': 0,
        'Sesi Swas': 9,
        'Jam Konsul SMAN': 3.5,
        'Sesi Konsul Neg': 2,
        'Jumlah Inst Konsul Neg': 2,
        'Jam Konsul SMAS': 2.5,
        'Sesi Konsul Swas': 1,
        'Jumlah Inst Konsul Swas': 1,
        'Tidak Absen': 0
      }
    ];

    setGoogleSheetUrl('https://docs.google.com/spreadsheets/d/simulasi-data-presensi-format-bebas/edit');
    handleProceedWithRawRows(customBranchRows, 'Simulasi Format Bebas');
  };

  // Convert raw rows using current mapping config
  const normalizedRecords = useMemo(() => {
    if (rawRows.length === 0) return [];
    return applyColumnMapping(rawRows, mappingConfig, activePeriode);
  }, [rawRows, mappingConfig, activePeriode]);

  const matchedCount = useMemo(() => {
    return SYSTEM_FIELDS.filter((f) => {
      const col = mappingConfig[f.key];
      return col && availableHeaders.includes(col);
    }).length;
  }, [mappingConfig, availableHeaders]);

  const handleUpdateMappingField = (key: keyof ColumnMappingConfig, colName: string) => {
    setMappingConfig((prev) => ({
      ...prev,
      [key]: colName
    }));
  };

  const handleCommitFinalImport = () => {
    if (normalizedRecords.length === 0) return;
    onImportComplete(normalizedRecords, importMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-6 animate-in fade-in-50 zoom-in-95 flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Update Data Presensi Sesi Mengajar
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Format 24 Parameter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sumber data <strong>tidak harus sama persis dengan template</strong>. Sistem akan mendeteksi dan menyesuaikan ke format baku 24 kolom.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep('source')}
              className={`flex items-center space-x-2 font-bold transition-colors cursor-pointer ${
                currentStep === 'source' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 'source' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>Pilih Sumber Data</span>
            </button>

            <span className="text-slate-300">&bull;&bull;&bull;</span>

            {/* Step 2 */}
            <button
              type="button"
              disabled={rawRows.length === 0}
              onClick={() => rawRows.length > 0 && setCurrentStep('mapping')}
              className={`flex items-center space-x-2 font-bold transition-colors ${
                currentStep === 'mapping'
                  ? 'text-emerald-700'
                  : rawRows.length > 0
                  ? 'text-slate-500 hover:text-slate-800 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 'mapping' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>Penyesuaian 24 Kolom</span>
            </button>

            <span className="text-slate-300">&bull;&bull;&bull;</span>

            {/* Step 3 */}
            <button
              type="button"
              disabled={rawRows.length === 0}
              onClick={() => rawRows.length > 0 && setCurrentStep('preview')}
              className={`flex items-center space-x-2 font-bold transition-colors ${
                currentStep === 'preview'
                  ? 'text-emerald-700'
                  : rawRows.length > 0
                  ? 'text-slate-500 hover:text-slate-800 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 'preview' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                3
              </span>
              <span>Pratinjau & Simpan</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-[11px] text-slate-500">
              Target Periode: <strong className="text-slate-800">{activePeriode}</strong>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: SOURCE SELECTION ================= */}
          {currentStep === 'source' && (
            <div className="space-y-5">
              {/* Source tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveSourceTab('sheets')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                      activeSourceTab === 'sheets'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link Google Sheets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSourceTab('excel')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                      activeSourceTab === 'excel'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File Excel / CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSourceTab('paste')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                      activeSourceTab === 'paste'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Tempel Teks (Salin Sel)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Unduh referensi template 24 kolom resmi"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Format 24 Kolom</span>
                </button>
              </div>

              {/* Informative highlight banner */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start space-x-3 text-xs text-emerald-950">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold text-sm">
                      Bebas Gunakan Format File / Spreadsheet Mana Saja
                    </strong>
                    <p className="text-emerald-800/90 mt-0.5">
                      Kolom di spreadsheet Anda dapat bernama berbeda. Sistem otomatis mencocokkan nama kolom Anda ke dalam 24 parameter baku SIM-SESI. Insentif dicatat sebagai <strong>Jumlah (bukan Rupiah)</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadCustomFormatDemo}
                  className="shrink-0 px-3.5 py-2 text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-100/50 border border-emerald-300 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coba Demo Format Bebas</span>
                </button>
              </div>

              {/* SOURCE TAB 1: Google Sheets */}
              {activeSourceTab === 'sheets' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tautan Google Sheets
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <input
                          type="url"
                          value={googleSheetUrl}
                          onChange={(e) => setGoogleSheetUrl(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleFetchGoogleSheets}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Membaca Sheet...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Tarik & Sesuaikan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-700">Petunjuk Akses Google Sheets:</p>
                    <p>
                      Pastikan setelan berbagi spreadsheet diatur ke <strong>"Siapa saja yang memiliki link dapat melihat" (Anyone with the link can view)</strong>. Atau bila kesulitan jaringan, cukup salin tabel lalu tempelkan pada tab <em>"Tempel Teks"</em>.
                    </p>
                  </div>
                </div>
              )}

              {/* SOURCE TAB 2: Upload Excel / CSV */}
              {activeSourceTab === 'excel' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {fileName ? `Berkas Terpilih: ${fileName}` : 'Klik untuk Memilih File Excel (.xlsx, .xls, .csv)'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Mendukung format bebas dari sistem/cabang mana saja.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* SOURCE TAB 3: Copy-Paste Text */}
              {activeSourceTab === 'paste' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Salin & Tempel Baris dari Spreadsheet (Excel / Google Sheets)
                    </label>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Pilih baris tabel pada spreadsheet Anda, tekan Ctrl+C lalu tempelkan (Ctrl+V) di sini..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      disabled={!pastedText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Proses Teks & Lanjutkan ke Penyesuaian</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: COLUMN MAPPING & ADJUSTMENT ================= */}
          {currentStep === 'mapping' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Penyesuaian & Pemetaan Format 24 Kolom
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {matchedCount} dari 24 Kolom Cocok
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data sumber memiliki <strong>{availableHeaders.length} kolom</strong> ({rawRows.length} baris data). Insentif dicatat sebagai <strong>Jumlah (bukan Rupiah)</strong>.
                  </p>
                </div>

                {/* Default Lokasi Fallback Selector */}
                <div className="flex items-center space-x-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">Default Lokasi:</span>
                  <select
                    value={mappingConfig.defaultLokasi}
                    onChange={(e) => handleUpdateMappingField('defaultLokasi', e.target.value)}
                    className="font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
                  >
                    {LOKASI_DATA.map((l) => (
                      <option key={l.kodeLokasi} value={l.kodeLokasi}>
                        {l.namaLokasi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid of 24 System Columns with Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SYSTEM_FIELDS.map((field) => {
                  const currentSelected = mappingConfig[field.key];
                  const isAutoDetected = currentSelected && availableHeaders.includes(currentSelected);

                  return (
                    <div
                      key={field.key}
                      className={`p-3 rounded-2xl border transition-all ${
                        isAutoDetected
                          ? 'bg-white border-slate-200 shadow-2xs'
                          : 'bg-slate-50/70 border-dashed border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className={`text-xs font-bold truncate ${field.isRedHeader ? 'text-red-600 font-extrabold' : 'text-slate-800'}`} title={field.label}>
                          {field.label}
                        </label>
                        {isAutoDetected ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                            <Check className="w-2.5 h-2.5 mr-0.5" />
                            Cocok
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            Opsional
                          </span>
                        )}
                      </div>

                      <select
                        value={currentSelected || ''}
                        onChange={(e) => handleUpdateMappingField(field.key, e.target.value)}
                        className={`w-full text-xs py-1.5 px-2 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-colors ${
                          currentSelected
                            ? 'bg-white border-emerald-300 font-semibold text-slate-900'
                            : 'bg-white border-slate-300 text-slate-500'
                        }`}
                      >
                        <option value="">
                          [ — Tidak Ada (Isi 0 / Default) — ]
                        </option>
                        {availableHeaders.map((header) => (
                          <option key={header} value={header}>
                            Kolom: "{header}"
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 3: PREVIEW NORMALIZED 24 COLUMNS ================= */}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Format Data Berhasil Disesuaikan ({normalizedRecords.length} Baris Sesi)
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Data telah dinormalisasi persis sesuai format baku 24 parameter resmi SIM-SESI. Nilai insentif ditampilkan dalam <strong>Jumlah (angka bukan rupiah)</strong>.
                    </p>
                  </div>
                </div>

                {/* Import Mode Selector */}
                <div className="flex items-center space-x-3 text-xs bg-white px-3 py-2 rounded-xl border border-emerald-300">
                  <span className="text-slate-600 font-bold">Metode Simpan:</span>
                  <label className="inline-flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-emerald-600"
                    />
                    <span className="font-semibold text-slate-800">Gabung (Merge)</span>
                  </label>
                  <label className="inline-flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-emerald-600"
                    />
                    <span className="font-semibold text-slate-800">Ganti Semua (Replace)</span>
                  </label>
                </div>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[400px]">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-[#00ffa2] text-slate-950 font-extrabold uppercase tracking-tight text-[11px] sticky top-0 z-20 select-none">
                    <tr>
                      <th className="px-3 py-2 text-left whitespace-nowrap bg-[#00ffa2] sticky left-0 z-30">Periode</th>
                      <th className="px-3 py-2 text-left whitespace-nowrap">Nopeg</th>
                      <th className="px-3 py-2 text-left whitespace-nowrap min-w-[150px]">Nama Pengajar</th>
                      <th className="px-3 py-2 text-center whitespace-nowrap">Kode</th>
                      <th className="px-3 py-2 text-left whitespace-nowrap">Lok</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Dur<br />Negeri</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Sesi<br />Negeri</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Menit<br />Sangsi</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap text-red-600 font-extrabold leading-tight">Insentif<br />Hadir (Jml)</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Jaga Tes<br />Negeri</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Dur<br />Swasta</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Menit<br />Sangsi</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap text-red-600 font-extrabold leading-tight">Insentif<br />Swasta (Jml)</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Jaga<br />TesSwasta</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Sesi<br />Ahad</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Sesi<br />Tidak Hadir</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Sesi<br />Swasta</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Dur<br />Konsul Neg</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Sesi<br />Konsul Neg</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap text-red-600 font-extrabold leading-tight">Inst Konsul<br />Negeri (Jml)</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Dur<br />Konsul Swas</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap leading-tight">Sesi<br />Konsul Swas</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap text-red-600 font-extrabold leading-tight">Inst Konsul<br />Swasta (Jml)</th>
                      <th className="px-3 py-2 text-center whitespace-nowrap leading-tight font-extrabold">Belum<br />Presensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {normalizedRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap sticky left-0 bg-white hover:bg-slate-50 z-10 shadow-2xs font-medium">
                          {r.periode}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-700 whitespace-nowrap font-semibold">{r.nopeg}</td>
                        <td className="px-3 py-2 font-bold text-slate-900 whitespace-nowrap">{r.namaPengajar}</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-500 whitespace-nowrap">{r.kode}</td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{r.lok}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.durMengajarNegeri)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.sesiMengajarNegeri)}</td>
                        <td className="px-3 py-2 text-right font-mono text-amber-600">{formatDecimal(r.menitSangsiMengajarNegeri)}</td>
                        <td className="px-3 py-2 text-right font-mono text-red-600 font-semibold">{formatDecimal(r.insentifHadirMengajarNegeri)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.jagaTesNegeri)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.durMengajarSwasta)}</td>
                        <td className="px-3 py-2 text-right font-mono text-amber-600">{formatDecimal(r.menitSangsiMengajarSwasta)}</td>
                        <td className="px-3 py-2 text-right font-mono text-red-600 font-semibold">{formatDecimal(r.insentifHadirMengajarSwasta)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.jagaTesSwasta)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.sesiMengajarAhad)}</td>
                        <td className="px-3 py-2 text-right font-mono text-rose-600">{formatDecimal(r.sesiTidakHadir)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.sesiMengajarSwasta)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.durKonsultasiNegeri)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.sesiKonsultasiNegeri)}</td>
                        <td className="px-3 py-2 text-right font-mono text-red-600 font-semibold">{formatDecimal(r.instKonsultasiNegeri)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.durKonsultasiSwasta)}</td>
                        <td className="px-3 py-2 text-right font-mono">{formatDecimal(r.sesiKonsultasiSwasta)}</td>
                        <td className="px-3 py-2 text-right font-mono text-red-600 font-semibold">{formatDecimal(r.instKonsultasiSwasta)}</td>
                        <td className="px-3 py-2 text-center font-mono">
                          {r.belumPresensi > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                              {r.belumPresensi}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Sticky Always Visible) */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            {currentStep === 'source' && 'Langkah 1: Masukkan tautan Google Sheets, berkas Excel/CSV, atau tempel data.'}
            {currentStep === 'mapping' && `Langkah 2: Cocokkan kolom sumber (${matchedCount}/24 dicocokkan otomatis).`}
            {currentStep === 'preview' && `Langkah 3: ${normalizedRecords.length} baris data presensi siap diterapkan.`}
          </p>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              Batal
            </button>

            {/* In Step 2: Show Back to Step 1, or Proceed to Step 3, or Quick Commit */}
            {currentStep === 'mapping' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentStep('source')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Sumber</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('preview')}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Lihat Pratinjau (24 Kolom)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCommitFinalImport}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Langsung Simpan & Terapkan</span>
                </button>
              </>
            )}

            {/* In Step 3: Show Back to Step 2, and Final Commit */}
            {currentStep === 'preview' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentStep('mapping')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atur Kolom</span>
                </button>

                <button
                  type="button"
                  onClick={handleCommitFinalImport}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Terapkan Data Presensi</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
