"use client";
import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  GridIcon,
  FolderIcon,
  DocsIcon,
  PieChartIcon,
  GroupIcon,
} from "@/icons/index";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getArchives, Archive } from "@/services/archives";
import { getDocumentTypes } from "@/services/documentTypes";
import { getUsers } from "@/services/users";
import { dummyArchives, dummyDocumentTypes, dummyUsers } from "@/data/dummy";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const { user, role } = useAuth();
  const [counts, setCounts] = useState({
    archives: 0,
    types: 0,
    users: 0,
  });
  const [recentArchives, setRecentArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [archivesData, typesData, usersData] = await Promise.all([
          getArchives(),
          getDocumentTypes(),
          role === "administrator" ? getUsers() : Promise.resolve([]),
        ]);

        const finalArchives = archivesData.length > 0 ? archivesData : dummyArchives;
        const finalTypes = typesData.length > 0 ? typesData : dummyDocumentTypes;
        const finalUsers = usersData.length > 0 ? usersData : dummyUsers;

        setCounts({
          archives: finalArchives.length,
          types: finalTypes.length,
          users: finalUsers.length,
        });

        // Get top 5 recent archives
        setRecentArchives(finalArchives.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to dummy data on error
        setCounts({
          archives: dummyArchives.length,
          types: dummyDocumentTypes.length,
          users: dummyUsers.length,
        });
        setRecentArchives(dummyArchives.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  const stats = [
    {
      title: "Arsip Dokumen",
      value: loading ? "..." : counts.archives,
      icon: <FolderIcon className="size-6 text-brand-500" />,
      link: "/arsip-dokumen",
      roles: ["administrator", "pengelola_arsip", "pengguna"],
    },
    {
      title: "Jenis Dokumen",
      value: loading ? "..." : counts.types,
      icon: <DocsIcon className="size-6 text-blue-500" />,
      link: "/jenis-dokumen",
      roles: ["administrator", "pengelola_arsip"],
    },
    {
      title: "Laporan",
      value: "Lihat",
      icon: <PieChartIcon className="size-6 text-green-500" />,
      link: "/laporan",
      roles: ["administrator", "pengelola_arsip"],
    },
    {
      title: "Manajemen User",
      value: loading ? "..." : counts.users,
      icon: <GroupIcon className="size-6 text-orange-500" />,
      link: "/manajemen-user",
      roles: ["administrator"],
    },
  ];

  const filteredStats = stats.filter(
    (stat) => !stat.roles || (role && stat.roles.includes(role))
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredStats.map((stat, index) => (
          <Link key={index} href={stat.link}>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {stat.value}
                  </h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                  {stat.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Arsip Terbaru
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Judul</TableCell>
                  <TableCell isHeader>Jenis</TableCell>
                  <TableCell isHeader>Tanggal</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell className="text-center" isHeader={false}>
                      Loading...
                    </TableCell>
                    <TableCell isHeader={false}>-</TableCell>
                    <TableCell isHeader={false}>-</TableCell>
                  </TableRow>
                ) : recentArchives.length > 0 ? (
                  recentArchives.map((archive) => (
                    <TableRow key={archive.id}>
                      <TableCell className="font-medium text-gray-800 dark:text-white/90">
                        {archive.title}
                      </TableCell>
                      <TableCell>{archive.documentTypeName || "-"}</TableCell>
                      <TableCell>
                        {archive.createdAt
                          ? new Date(
                              // @ts-ignore
                              archive.createdAt.seconds * 1000
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center" isHeader={false}>
                      Tidak ada data arsip.
                    </TableCell>
                    <TableCell isHeader={false}>-</TableCell>
                    <TableCell isHeader={false}>-</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Selamat Datang, {user?.email}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Anda login sebagai{" "}
            <span className="font-medium text-brand-500">
              {role?.replace("_", " ").toUpperCase()}
            </span>
            . Silakan gunakan menu di samping untuk mengelola arsip dan dokumen.
          </p>
          <div className="mt-6">
            <Link
              href="/arsip-dokumen"
              className="block w-full rounded-lg bg-brand-500 px-5 py-3 text-center text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/50"
            >
              Kelola Arsip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
