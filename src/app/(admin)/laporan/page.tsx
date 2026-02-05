"use client";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import { getDocumentTypes, DocumentType } from "@/services/documentTypes";
import { getArchivesReport, Archive } from "@/services/archives";
import { dummyArchives, dummyDocumentTypes } from "@/data/dummy";
import { DownloadIcon } from "@/icons";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ReportPage = () => {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<{
    series: { name: string; data: number[] }[];
    categories: string[];
  }>({ series: [], categories: [] });
  
  // Filter states
  const currentYear = new Date().getFullYear();
  const [filter, setFilter] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: currentYear.toString(),
    typeId: "all"
  });

  const months = [
    { value: "all", label: "Semua Bulan" },
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

  const years = [
    { value: "all", label: "Semua Tahun" },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString()
    }))
  ];

  const fetchDocTypes = async () => {
    try {
      const data = await getDocumentTypes();
      setDocumentTypes(data.length > 0 ? data : dummyDocumentTypes);
    } catch (error) {
      console.error("Error fetching doc types:", error);
      setDocumentTypes(dummyDocumentTypes);
    }
  };

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      // If year is "all", then month is ignored in service logic (effectively all time)
      const yearInt = filter.year === "all" ? undefined : parseInt(filter.year);
      
      // If month is "all", pass undefined to service (effectively all months in that year)
      const monthInt = filter.month === "all" ? undefined : parseInt(filter.month);
      
      const typeId = filter.typeId === "all" ? undefined : filter.typeId;
      
      let data = await getArchivesReport(monthInt, yearInt, typeId);

      if (data.length === 0) {
        // Fallback to dummy data but apply filters
        data = dummyArchives.filter(archive => {
           if (!archive.createdAt) return false;
           // Handle string date (ISO) or Firestore Timestamp (legacy)
           const date = typeof archive.createdAt === 'string' 
              ? new Date(archive.createdAt) 
              : (archive.createdAt as any).toDate ? (archive.createdAt as any).toDate() : new Date(archive.createdAt);
           
           let matchYear = true;
           if (yearInt) {
               matchYear = date.getFullYear() === yearInt;
           }

           let matchMonth = true;
           if (monthInt) {
               matchMonth = date.getMonth() + 1 === monthInt;
           }
           
           let matchType = true;
           if (typeId) {
               matchType = archive.documentTypeId === typeId;
           }

           return matchYear && matchMonth && matchType;
        });
      }
      
      setArchives(data);
    } catch (error) {
      console.error("Error fetching report:", error);
      setArchives([]);
    } finally {
      setLoading(false);
    }
  }, [filter.month, filter.year, filter.typeId]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else if (role !== "administrator" && role !== "pimpinan") {
        router.push("/");
      }
    }
  }, [user, role, authLoading, router]);

  useEffect(() => {
    fetchDocTypes();
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Calculate summary for chart and table
    const summaryMap = new Map<string, number>();
    
    archives.forEach(archive => {
      const typeName = archive.documentTypeName || "Tanpa Kategori";
      summaryMap.set(typeName, (summaryMap.get(typeName) || 0) + 1);
    });

    const data: number[] = [];
    const categories: string[] = [];

    summaryMap.forEach((count, name) => {
      data.push(count);
      categories.push(name);
    });

    setChartData({ 
      series: [{ name: "Total Arsip", data: data }], 
      categories: categories 
    });
  }, [archives]);

  const handlePrint = () => {
    window.print();
  };

  const typeOptions = [
    { value: "all", label: "Semua Jenis" },
    ...documentTypes.map(dt => ({ value: dt.id, label: dt.name }))
  ];

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Jumlah Arsip",
      },
    },
    colors: ["#3C50E0"],
    grid: {
      borderColor: "#e0e0e0",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " Arsip";
        },
      },
    },
  };

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
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1">
              Tampilkan Data
            </Button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-3 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              title="Cetak Laporan"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75v-4.125c0-.621-.504-1.125-1.125-1.125H4.125C3.504 10.5 3 11.004 3 11.625v4.125c0 .621.504 1.125 1.125 1.125h1.091M7.5 6.889a2.25 2.25 0 00-2.242 2.244l-5.455 1.761m13.393-3.75h.008v.008h-.008v-.008zm-1.875 0h.008v.008h-.008v-.008zm-1.875 0h.008v.008h-.008v-.008z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {archives.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 print:hidden">
          {/* Chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Statistik Arsip
            </h3>
            <div className="w-full">
              <ReactApexChart
                options={chartOptions}
                series={chartData.series}
                type="bar"
                height={350}
              />
            </div>
          </div>

          {/* Recap Table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Rekapitulasi Jenis Dokumen
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-white/[0.02] text-gray-500 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-sm">Jenis Dokumen</th>
                    <th className="px-4 py-3 font-medium text-sm text-center">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {chartData.categories.map((label, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                        {label}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-800 dark:text-white/90">
                        {chartData.series[0]?.data[index] || 0}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50/50 dark:bg-white/[0.01] font-medium">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                      {chartData.series[0]?.data.reduce((a, b) => a + b, 0) || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] print:border-0 print:shadow-none">
        <div className="mb-6 text-center hidden print:block">
          <h2 className="text-xl font-bold text-gray-900">LAPORAN ARSIP DOKUMEN</h2>
          <p className="text-gray-600">
            Periode: {filter.year === "all" 
              ? "Semua Waktu" 
              : filter.month === "all" 
                ? `Tahun ${filter.year}`
                : `${months.find(m => m.value === filter.month)?.label} ${filter.year}`}
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
                <th className="px-6 py-4 font-medium text-sm text-center print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : archives.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
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
                      {archive.createdAt
                        ? new Date(
                            typeof archive.createdAt === "string"
                              ? archive.createdAt
                              : (archive.createdAt as any).toDate
                              ? (archive.createdAt as any).toDate()
                              : archive.createdAt
                          ).toLocaleDateString("id-ID")
                        : "-"}
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
                    <td className="px-6 py-4 text-sm text-center print:hidden">
                      <a
                        href={archive.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-brand-500 p-2 text-white hover:bg-brand-600 transition-colors"
                        title="Download"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </a>
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
