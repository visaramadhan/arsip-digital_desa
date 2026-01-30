"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { InstitutionProfile, getInstitutionProfile } from "@/services/settings";
import { dummyInstitutionProfile } from "@/data/dummy";

interface SettingsContextType {
  profile: InstitutionProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<InstitutionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await getInstitutionProfile();
      setProfile(data || dummyInstitutionProfile);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setProfile(dummyInstitutionProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    await fetchProfile();
  };

  return (
    <SettingsContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </SettingsContext.Provider>
  );
};
