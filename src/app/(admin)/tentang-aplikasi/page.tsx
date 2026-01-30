"use client";
import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useSettings } from "@/context/SettingsContext";

export default function AboutAppPage() {
  const { profile } = useSettings();

  return (
    <div>
      <PageBreadCrumb pageTitle="Tentang Aplikasi" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
          {profile?.name || "Sistem Informasi Pengelolaan Arsip Digital"}
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {profile?.description || "Sistem ini dirancang untuk mempermudah pengelolaan dokumen administrasi kependudukan secara digital. Aplikasi ini membantu dalam pengarsipan, pencarian, dan pelaporan dokumen penting instansi."}
        </p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
              Fitur Utama
            </h2>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
              <li><strong>Manajemen Arsip Dokumen:</strong> Upload, simpan, dan kelola dokumen digital dengan mudah.</li>
              <li><strong>Pencarian Cepat:</strong> Temukan dokumen berdasarkan jenis, judul, atau kriteria lainnya.</li>
              <li><strong>Laporan & Statistik:</strong> Pantau jumlah arsip dan cetak laporan per periode.</li>
              <li><strong>Multi-Level User:</strong> Hak akses yang dibedakan untuk Administrator, Pengelola Arsip, dan Pengguna.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
              Informasi Pengembang
            </h2>
            <div className="text-gray-600 dark:text-gray-400">
              <p>Versi Aplikasi: 1.0.0</p>
              <p>Teknologi: Next.js, Tailwind CSS, Firebase</p>
            </div>
          </section>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {profile?.name || "Sistem Arsip Digital"}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
