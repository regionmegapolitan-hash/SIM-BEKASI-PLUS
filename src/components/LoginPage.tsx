import React, { useState } from 'react';
import { Role, UserSession } from '../types';
import { authenticateUser, registerNewAccount, getStoredAccounts } from '../utils/storage';
import {
  Building2,
  MapPin,
  GraduationCap,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  Clock,
  Send,
  Layers
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form states (default kosong demi privasi)
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'pending' | 'success' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<Role>('pengajar');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg(null);

    if (!loginInput.trim()) {
      setErrorMsg('Masukkan email atau ID yang telah terdaftar.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Masukkan password akun Anda.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = authenticateUser(loginInput, password);
      setLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        if (res.status === 'pending') {
          setStatusMsg({
            type: 'pending',
            text: res.message || 'Akun Anda sedang menunggu persetujuan dari Admin Wilayah.'
          });
        } else {
          setErrorMsg(res.message || 'Login gagal. Periksa kembali email dan password.');
        }
      }
    }, 200);
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regIdentifier.trim()) {
      setRegError('Mohon lengkapi semua kolom yang bertanda bintang (*).');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password baru minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi password tidak cocok.');
      return;
    }

    const res = registerNewAccount({
      name: regName,
      email: regEmail,
      role: regRole,
      identifier: regIdentifier,
      unitName: regRole === 'admin_lokasi' ? `Lokasi ${regIdentifier}` : `Guru Pengajar (${regIdentifier})`,
      password: regPassword
    });

    if (res.success) {
      setRegSuccess(res.message);
      // Switch back to login with email prefilled
      setLoginInput(regEmail);
      setPassword(regPassword);
      setRegName('');
      setRegEmail('');
      setRegIdentifier('');
      setRegPassword('');
      setRegConfirmPassword('');
    } else {
      setRegError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* App Logo & Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-indigo-600 to-sky-400 text-white shadow-xl shadow-indigo-500/30 mb-3 ring-4 ring-indigo-500/20">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            SIM-SESI
          </h2>
          <p className="mt-1 text-sm font-medium text-indigo-200">
            Sistem Monitoring & Pengecekan Sesi Mengajar
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs backdrop-blur-md border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Login dengan Email Terdaftar & Persetujuan Admin Wilayah</span>
          </div>
        </div>

        {/* Card Form */}
        <div className="mt-6 bg-white/95 backdrop-blur-xl py-6 px-6 sm:px-8 shadow-2xl rounded-3xl border border-white/20">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setStatusMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === 'login'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Masuk Akun</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError('');
                setRegSuccess('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                mode === 'register'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* ================= MODE: LOGIN ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Status Message (e.g. Pending Approval) */}
              {statusMsg && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-2.5 animate-in fade-in">
                  <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Menunggu Persetujuan Admin Wilayah:</strong>
                    <p className="mt-0.5">{statusMsg.text}</p>
                    <p className="mt-1 text-[11px] text-amber-700">
                      Hubungi Admin Wilayah Bekasi Plus untuk mengaktifkan akun Anda.
                    </p>
                  </div>
                </div>
              )}

              {/* Success Notification (e.g. from registration) */}
              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Email / ID Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Email Terdaftar</span>
                  <span className="text-[10px] text-slate-400 font-normal">atau Kode/Nopeg</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="email@anda.com atau kode (446 / 119 / 709027)"
                    className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 transition-all"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Masukkan email terdaftar atau kode identitas (Kode Lokasi / Nopeg Guru).
                </p>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password Akun
                  </label>
                  <span className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer" onClick={() => alert('Untuk mereset password, Anda dapat menghubungi Admin Wilayah atau login dan gunakan menu "Ganti Password".')}>
                    Lupa Password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda..."
                    className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Password dapat diganti kapan saja oleh pemilik akun setelah masuk.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk ke Dasbor SIM-SESI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= MODE: REGISTER ================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                <strong className="block font-bold">Pendaftaran Akun Baru:</strong>
                <p className="text-[11px] mt-0.5">
                  Setiap akun yang didaftarkan akan dikirim ke <strong>Admin Wilayah</strong> untuk diverifikasi dan disetujui sebelum dapat digunakan.
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Rian Pratama, S.Pd"
                    className="block w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Email Terdaftar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email yang Didaftarkan *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="block w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Peran & Identifier */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Peran *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as Role)}
                    className="block w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="pengajar">Guru / Pengajar</option>
                    <option value="admin_lokasi">Admin Lokasi Belajar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {regRole === 'admin_lokasi' ? 'Kode Lokasi (119)*' : 'Nopeg (709027)*'}
                  </label>
                  <input
                    type="text"
                    value={regIdentifier}
                    onChange={(e) => setRegIdentifier(e.target.value)}
                    placeholder={regRole === 'admin_lokasi' ? '119' : '709027'}
                    className="block w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password Awal *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="block w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ulangi Password *
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang"
                    className="block w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Pendaftaran ke Admin Wilayah</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          SIM-SESI Presensi &bull; Wilayah Bekasi Plus &bull; Hak Akses Berjenjang
        </p>
      </div>
    </div>
  );
};
