"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  getArchives,
  addArchive,
  deleteArchive,
  Archive,
} from "@/services/archives";
import { getDocumentTypes, DocumentType } from "@/services/documentTypes";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import { TrashBinIcon, PlusIcon, DownloadIcon, EyeIcon } from "@/icons";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";

export default function ArchivesPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentArchive, setCurrentArchive] = useState<Archive | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else {
        fetchData();
      }
    }
  }, [user, role, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [archivesData, docTypesData] = await Promise.all([
        getArchives(),
        getDocumentTypes(),
      ]);
      setArchives(archivesData);
      setDocumentTypes(docTypesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setTitle("");
    setDocumentTypeId("");
    setFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDocumentTypeId("");
    setFile(null);
  };

  const handleOpenDeleteModal = (archive: Archive) => {
    setCurrentArchive(archive);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentArchive(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !documentTypeId || !file) {
      setError("Semua field harus diisi.");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      if (user) {
          try {
            await addArchive(
              {
                title,
                documentTypeId,
                uploadedBy: user.email || "unknown",
              },
              file
            );
            await fetchData();
            handleCloseModal();
          } catch (uploadError: any) {
             // Handle specific upload errors
             console.error("Upload error details:", uploadError);
             throw new Error(uploadError.message || "Gagal mengupload file ke storage.");
          }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentArchive) return;
    setActionLoading(true);
    try {
      await deleteArchive(currentArchive.id, currentArchive.storagePath);
      await fetchData();
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="p-6">Loading...</div>;
  }

  const docTypeOptions = documentTypes.map(dt => ({
      value: dt.id,
      label: dt.name
  }));

  return (
    <div>
      <PageBreadCrumb pageTitle="Arsip Dokumen" />
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleOpenModal}
            startIcon={<PlusIcon className="size-5" />}
          >
            Tambah Arsip
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead className="border-b border-gray-100 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Judul</th>
                  <th className="px-6 py-4 font-medium">Jenis Dokumen</th>
                  <th className="px-6 py-4 font-medium">Nama File</th>
                  <th className="px-6 py-4 font-medium">Diunggah Oleh</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {archives.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Belum ada data arsip.
                    </td>
                  </tr>
                ) : (
                  archives.map((archive) => (
                    <tr key={archive.id}>
                      <td className="px-6 py-4 text-gray-800 dark:text-white/90">
                        {archive.title}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {archive.documentTypeName || "-"}
                      </td>
                       <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {archive.fileName}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {archive.uploadedBy}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {archive.createdAt?.toDate().toLocaleDateString() || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={archive.fileUrl}
                            target="_blank"
                            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500"
                            title="Lihat / Download"
                          >
                            <DownloadIcon className="size-5" />
                          </Link>
                          {(role === "administrator" || role === "pengelola_arsip") && (
                             <button
                                onClick={() => handleOpenDeleteModal(archive)}
                                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                title="Hapus"
                              >
                                <TrashBinIcon className="size-5" />
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[500px] p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Tambah Arsip Dokumen
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Judul Dokumen"
            placeholder="Masukkan judul dokumen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <div>
            <Label>Jenis Dokumen</Label>
            <Select
                options={docTypeOptions}
                onChange={(val) => setDocumentTypeId(val)}
                placeholder="Pilih Jenis Dokumen"
                className="w-full"
            />
          </div>

          <div>
             <Label>Upload File (PDF/Image)</Label>
             <FileInput 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                        // Validate file type
                        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
                        if (!validTypes.includes(selectedFile.type)) {
                            setError("Format file tidak didukung. Harap upload PDF atau gambar.");
                            setFile(null);
                            return;
                        }
                        // Validate file size (e.g., 5MB)
                        if (selectedFile.size > 5 * 1024 * 1024) {
                            setError("Ukuran file terlalu besar. Maksimal 5MB.");
                            setFile(null);
                            return;
                        }
                        setError("");
                        setFile(selectedFile);
                    }
                }}
             />
             <p className="mt-1 text-xs text-gray-500">Maksimal 5MB. Format: PDF, JPG, PNG.</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCloseModal} type="button">
              Batal
            </Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} className="max-w-[400px] p-6">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            Hapus Arsip?
          </h3>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus "{currentArchive?.title}"? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={handleCloseDeleteModal}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
