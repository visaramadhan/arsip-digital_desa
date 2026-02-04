"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import { TrashBinIcon, PencilIcon, PlusIcon } from "@/icons";
import { 
  getDocumentTypes, 
  addDocumentType, 
  updateDocumentType, 
  deleteDocumentType,
  DocumentType 
} from "@/services/documentTypes";
import { dummyDocumentTypes } from "@/data/dummy";

const DocumentTypePage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentDocType, setCurrentDocType] = useState<Partial<DocumentType> | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else if (role !== "administrator") {
        router.push("/");
      } else {
        fetchDocumentTypes();
      }
    }
  }, [user, role, authLoading, router]);

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      const data = await getDocumentTypes();
      setDocumentTypes(data.length > 0 ? data : dummyDocumentTypes);
    } catch (error) {
      console.error("Error fetching document types:", error);
      setDocumentTypes(dummyDocumentTypes);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (docType?: DocumentType) => {
    setError("");
    if (docType) {
      setCurrentDocType(docType);
      setFormData({ name: docType.name, description: docType.description || "" });
    } else {
      setCurrentDocType(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDocType(null);
    setFormData({ name: "", description: "" });
    setError("");
  };

  const handleOpenDeleteModal = (docType: DocumentType) => {
    setCurrentDocType(docType);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentDocType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      if (currentDocType?.id) {
        await updateDocumentType(currentDocType.id, formData);
      } else {
        await addDocumentType(formData);
      }
      await fetchDocumentTypes();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving document type:", error);
      setError("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentDocType?.id) return;
    
    setSubmitting(true);
    try {
      await deleteDocumentType(currentDocType.id);
      await fetchDocumentTypes();
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting document type:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Jenis Dokumen" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Daftar Jenis Dokumen
          </h3>
          <Button size="sm" onClick={() => handleOpenModal()} startIcon={<PlusIcon className="size-5" />}>
            Tambah Jenis
          </Button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="border-b border-gray-100 bg-gray-50 text-left dark:border-gray-800 dark:bg-white/[0.02]">
              <tr>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">No</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Nama Jenis</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Deskripsi</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : documentTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Belum ada data jenis dokumen.
                  </td>
                </tr>
              ) : (
                documentTypes.map((docType, index) => (
                  <tr key={docType.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{index + 1}</td>
                    <td className="px-4 py-4 text-gray-800 dark:text-white/90 font-medium">{docType.name}</td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{docType.description || "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenModal(docType)}
                          className="text-gray-500 hover:text-brand-500 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(docType)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          title="Hapus"
                        >
                          <TrashBinIcon className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-[500px] p-6">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white/90">
          {currentDocType ? "Edit Jenis Dokumen" : "Tambah Jenis Dokumen"}
        </h3>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <InputField
              label="Nama Jenis"
              placeholder="Contoh: Akta Kelahiran"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <InputField
              label="Deskripsi"
              placeholder="Keterangan singkat (opsional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={handleCloseModal} type="button">
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} className="max-w-[400px] p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <TrashBinIcon className="size-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white/90">
            Hapus Jenis Dokumen?
          </h3>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus <strong>{currentDocType?.name}</strong>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCloseDeleteModal}>
              Batal
            </Button>
            <Button 
              size="sm" 
              className="bg-red-500 hover:bg-red-600 text-white" 
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentTypePage;
