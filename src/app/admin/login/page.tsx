"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  EyeOff,
  Eye,
  ArrowRight,
  Headset,
  ShieldAlert,
  Home,
  Sparkles,
} from "lucide-react";
import { loginAdminAction } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAdminAction(null, formData);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Username atau password salah.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl flex overflow-hidden min-h-[600px] border border-gray-100 relative">
        {/* Background patch biru di bagian atas sambungan agar sudut rounded-tl panel kanan tampak sempurna */}
        <div className="absolute top-0 left-0 w-full lg:w-[60%] h-44 bg-[#0e3a8c] pointer-events-none hidden lg:block z-0" />

        {/* Left Panel - Hero Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[45%] relative bg-[#0e3a8c] flex-col justify-between p-10 text-white overflow-hidden rounded-br-[3rem] lg:rounded-br-[3.5rem] z-10 shadow-lg">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets-landingpage/hero2.png"
              alt="Jembatan Ampera & Gedung BBPOM Palembang"
              fill
              className="object-cover object-[60%_center] opacity-30 mix-blend-overlay"
              priority
            />
            <div className="absolute inset-0 bg-[#0e3a8c]/80 mix-blend-multiply"></div>
            {/* Decorative graphics */}
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 -left-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          </div>

          {/* Content Wrapper */}
          <div className="relative z-10">
            {/* Branding Logo */}
            <div className="flex items-center gap-4 mb-14">
              <div className="bg-white p-2 rounded-xl shadow-md">
                <Image
                  src="/assets-landingpage/am.png"
                  alt="Logo BPOM"
                  width={40}
                  height={40}
                  className="w-10 h-auto"
                />
              </div>
              <div className="font-bold text-lg tracking-wide border-l-2 border-white/30 pl-4 leading-tight">
                AMPERA BBPOM
                <span className="block text-xs font-normal text-blue-200 mt-0.5">
                  Amankan Produk Edukasi Masyarakat
                </span>
              </div>
            </div>

            {/* Main Copy */}
            <div className="max-w-md mt-16">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5 font-serif">
                Selamat Datang di<br />Sistem Admin
              </h1>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-6">
                Kelola permohonan pengujian cepat, permintaan informasi, pengaduan konsumen, dan pengaturan konten website dalam satu platform terpadu.
              </p>
              <div className="w-16 h-1 bg-yellow-400 rounded-full"></div>
            </div>
          </div>

          {/* Help / Info Box at the bottom */}
          <div className="relative z-10 mt-auto pt-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 max-w-sm transition-all hover:bg-white/20">
              <div className="bg-white/20 p-3 rounded-xl shrink-0">
                <Headset className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-0.5">Butuh Bantuan?</p>
                <p className="text-xs text-blue-100">
                  Hubungi tim IT Support BBPOM Palembang untuk kendala hak akses sistem.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 relative overflow-hidden bg-white rounded-tl-[3rem] lg:rounded-tl-[3.5rem] z-10 shadow-sm">
          {/* Decorative corner graphics */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-100/50 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-50/50 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
       

          <div className="w-full max-w-md relative z-10">
            {/* Mobile & Form Header Branding */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-2 mb-2">
                <Image
                  src="/assets-landingpage/logo-bpom.png"
                  alt="Logo BPOM"
                  width={80}
                  height={80}
                  className="w-16 sm:w-20 h-auto"
                  priority
                />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0e3a8c]">
                Balai Besar POM di Palembang
              </h2>
              <p className="text-gray-500 mt-1.5 text-xs sm:text-sm">
                Login untuk mengakses halaman admin AMPERA
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-6 sm:p-8 mb-4">
              <h3 className="text-xl font-bold text-[#0e3a8c] mb-5">Login</h3>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs sm:text-sm text-red-600 flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></div>
                  <p>{error}</p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Username petugas"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="block w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-[#0e3a8c] hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98]"
                >
                  {isPending ? "Memproses..." : "Masuk"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo Credentials Box */}
              {/* <div className="mt-5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#0e3a8c]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Akun Akses Default:</span>
                </div>
                <div className="mt-1 flex items-center justify-center gap-3 text-[11px] text-gray-600">
                  <span>
                    User: <strong className="text-gray-900">admin</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Pass: <strong className="text-gray-900">admin123</strong>
                  </span>
                </div>
              </div> */}

              {/* Security Warning */}
              <div className="mt-6 text-center border-t border-gray-100 pt-5">
                <div className="inline-flex items-center gap-2 text-xs text-gray-500/80 font-medium">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Area Terbatas. Hak akses ke dalam sistem dilindungi.</span>
                </div>
              </div>
            </div>

            {/* Footer Copyright */}
            <div className="text-center text-xs text-gray-400 font-medium">
              <p>© {new Date().getFullYear()} Balai Besar POM Palembang. Semua hak dilindungi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
