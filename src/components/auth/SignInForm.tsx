"use client";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon, LockIcon, UserIcon, FolderIcon } from "@/icons";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import Image from "next/image";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { profile } = useSettings();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError("Gagal masuk. Silakan periksa email dan password Anda.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 w-full">
      {/* Logo Section */}
      <div className="flex justify-center mb-6">
        {profile?.logoUrl ? (
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-500/10 p-2">
            <Image
              src={profile.logoUrl}
              alt="Logo"
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg">
            <FolderIcon className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Title Section */}
      <div className="mb-8 text-center">
        <h1 className="text-gray-800 dark:text-white font-medium text-lg leading-relaxed">
          {profile?.dashboardTitle || "Sistem Informasi Pengelolaan Arsip Digital Dokumen Administrasi Kependudukan"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-5">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <UserIcon className="w-5 h-5" />
          </div>
          <Input
            placeholder="Username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            <LockIcon className="w-5 h-5" />
          </div>
          <Input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-12 pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
          >
            {showPassword ? (
              <EyeIcon className="w-5 h-5" />
            ) : (
              <EyeCloseIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <Button 
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-lg transition-colors uppercase tracking-wide" 
          disabled={loading} 
          type="submit"
        >
          {loading ? "Loading..." : "LOGIN"}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} - <span className="text-brand-500">{profile?.name || "Pustaka Koding."}</span>
        </p>
      </div>
    </div>
  );
}
