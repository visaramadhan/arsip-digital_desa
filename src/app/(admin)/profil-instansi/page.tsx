"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getInstitutionProfile,
  updateInstitutionProfile,
  InstitutionProfile,
} from "@/services/settings";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function InstitutionProfilePage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<InstitutionProfile>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    dashboardTitle: "",
    logoUrl: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else if (role !== "administrator") {
        router.push("/");
      } else {
        fetchData();
      }
    }
  }, [user, role, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getInstitutionProfile();
      if (data) {
        setFormData(data);
        if (data.logoUrl) {
          setPreviewUrl(data.logoUrl);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran file maksimal 2MB");
        return;
      }
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      let currentLogoUrl = formData.logoUrl;

      // Upload logo if changed
      if (logoFile) {
        const storageRef = ref(storage, `settings/logo_${Date.now()}_${logoFile.name}`);
        const snapshot = await uploadBytes(storageRef, logoFile);
        currentLogoUrl = await getDownloadURL(snapshot.ref);
      }

      await updateInstitutionProfile({
        ...formData,
        logoUrl: currentLogoUrl,
      });

      setSuccess("Profil instansi berhasil diperbarui.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memperbarui profil.");
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div>
      <PageBreadCrumb pageTitle="Profil Instansi" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit Profil Instansi
        </h3>
        
        {success && (
          <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* Logo Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Logo Instansi"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  No Logo
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Logo Instansi
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: JPG, PNG. Maksimal 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="Judul Dashboard"
              placeholder="Contoh: Sistem Arsip Digital"
              value={formData.dashboardTitle || ""}
              onChange={(e) => setFormData({ ...formData, dashboardTitle: e.target.value })}
            />
            <InputField
              label="Nama Instansi"
              placeholder="Masukkan nama instansi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="Email"
              type="email"
              placeholder="email@instansi.go.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <InputField
              label="Nomor Telepon"
              placeholder="021-xxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <TextArea
            label="Alamat Lengkap"
            placeholder="Jalan..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
          />

          <TextArea
            label="Deskripsi Singkat"
            placeholder="Tentang instansi..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
