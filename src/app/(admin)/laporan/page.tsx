"use client";
import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import { getDocumentTypes, DocumentType } from "@/services/documentTypes";
import { getArchivesReport, Archive } from "@/services/archives";

const ReportPage = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const currentYear = new Date().getFullYear();
  const [filter, setFilter] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: currentYear.toString(),
    typeId: "all"
  });

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }));

  const fetchDocTypes = async () => {
    try {
      const data = await getDocumentTypes();
      setDocumentTypes(data);
    } catch (error) {
      console.error("Error fetching doc types:", error);
    }
  };

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const monthInt = parseInt(filter.month);
      const yearInt = parseInt(filter.year);
      const typeId = filter.typeId === "all" ? undefined : filter.typeId;
      
      const data = await getArchivesReport(monthInt, yearInt, typeId);
      setArchives(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  }, [filter.month, filter.year, filter.typeId]);

  useEffect(() => {
    fetchDocTypes();
    handleSearch();
  }, [handleSearch]);

  const handlePrint = () => {
    window.print();
  };

  const typeOptions = [
    { value: "all", label: "Semua Jenis" },
    ...documentTypes.map(dt => ({ value: dt.id, label: dt.name }))
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Laporan Arsip" />

      {/* Filter Card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 print:hidden">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bulan
            </label>
            <Select
              options={months}
              value={filter.month}
              onChange={(value) => setFilter(prev => ({ ...prev, month: value }))}
              placeholder="Pilih Bulan"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tahun
            </label>
            <Select
              options={years}
              value={filter.year}
              onChange={(value) => setFilter(prev => ({ ...prev, year: value }))}
              placeholder="Pilih Tahun"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Jenis Dokumen
            </label>
            <Select
              options={typeOptions}
              value={filter.typeId}
              onChange={(value) => setFilter(prev => ({ ...prev, typeId: value }))}
              placeholder="Semua Jenis"
            />
          </div>
          <div>
            <Button onClick={handlePrint} className="w-full">
              Cetak Laporan
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] print:border-0 print:shadow-none">
        <div className="mb-6 text-center hidden print:block">
          <h2 className="text-xl font-bold text-gray-900">LAPORAN ARSIP DOKUMEN</h2>
          <p className="text-gray-600">
            Periode: {months.find(m => m.value === filter.month)?.label} {filter.year}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-white/[0.02] text-gray-500 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium text-sm">No</th>
                <th className="px-6 py-4 font-medium text-sm">Tanggal Upload</th>
                <th className="px-6 py-4 font-medium text-sm">Judul Dokumen</th>
                <th className="px-6 py-4 font-medium text-sm">Jenis Dokumen</th>
                <th className="px-6 py-4 font-medium text-sm">Nama File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : archives.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data arsip untuk periode ini.
                  </td>
                </tr>
              ) : (
                archives.map((archive, index) => (
                  <tr key={archive.id}>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">
                      {archive.createdAt ? new Date(archive.createdAt.toDate()).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">
                      {archive.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-white/90">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
                        {archive.documentTypeName || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {archive.fileName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 hidden print:block">
          <div className="flex justify-end">
            <div className="text-center">
              <p className="mb-16">Mengetahui,</p>
              <p className="font-bold underline">Admin Pengelola</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
