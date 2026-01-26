"use client";
import React from "react";
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

export default function Dashboard() {
  const { user, role } = useAuth();

  const stats = [
    {
      title: "Arsip Dokumen",
      value: "120", // Placeholder, idealnya fetch dari API
      icon: <FolderIcon className="size-6 text-brand-500" />,
      link: "/arsip-dokumen",
      roles: ["administrator", "pengelola_arsip", "pengguna"],
    },
    {
      title: "Jenis Dokumen",
      value: "15", // Placeholder
      icon: <DocsIcon className="size-6 text-blue-500" />,
      link: "/jenis-dokumen",
      roles: ["administrator", "pengelola_arsip"],
    },
    {
      title: "Laporan",
      value: "View",
      icon: <PieChartIcon className="size-6 text-green-500" />,
      link: "/laporan",
      roles: ["administrator", "pengelola_arsip"],
    },
    {
      title: "Manajemen User",
      value: "User",
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

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Selamat Datang, {user?.email}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Anda login sebagai <span className="font-medium text-brand-500">{role?.replace("_", " ").toUpperCase()}</span>.
          Silakan gunakan menu di samping untuk mengelola arsip dan dokumen.
        </p>
      </div>
    </div>
  );
}
