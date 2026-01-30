import React from "react";
import { useSettings } from "@/context/SettingsContext";

const AppFooter: React.FC = () => {
  const { profile } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <p>
        &copy; {currentYear} {profile?.name || "Sistem Arsip Digital Desa"}. All rights reserved.
      </p>
    </footer>
  );
};

export default AppFooter;
