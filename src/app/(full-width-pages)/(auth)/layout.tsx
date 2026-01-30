"use client";
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { FolderIcon } from "@/icons";

import { ThemeProvider } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useSettings();

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-6">
                  <div className="flex items-center gap-3 justify-center">
                    {true ? (
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg">
                        <Image
                          src="/default-logo.png"
                          alt="Logo"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg">
                        <FolderIcon className="h-7 w-7" />
                      </div>
                    )}
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                      {profile?.name || "Sistem Arsip"}
                    </h1>
                  </div>
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  {profile?.description || "Sistem Pengelolaan Arsip Digital Desa"}
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
