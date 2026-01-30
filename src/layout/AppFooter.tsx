import React from "react";
import { useSettings } from "@/context/SettingsContext";

const AppFooter: React.FC = () => {
  const { profile } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col gap-2 mb-4">
        <p className="font-medium text-gray-700 dark:text-gray-300">
          {profile?.name || "Sistem Arsip Digital Desa"}
        </p>
        {(profile?.address || profile?.phone || profile?.email) && (
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 text-xs">
            {profile?.address && <span>{profile.address}</span>}
            {profile?.phone && <span>Telp: {profile.phone}</span>}
            {profile?.email && <span>Email: {profile.email}</span>}
          </div>
        )}
      </div>
      <p>
        &copy; {currentYear} {profile?.name || "Sistem Arsip Digital Desa"}. All rights reserved.
      </p>
    </footer>
  );
};

export default AppFooter;
