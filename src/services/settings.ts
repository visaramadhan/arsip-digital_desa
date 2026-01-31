export interface InstitutionDocument {
  name: string;
  url: string;
  uploadedAt?: Date | string;
}

export interface InstitutionProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  dashboardTitle?: string;
  logoUrl?: string;
  documents?: InstitutionDocument[];
  updatedAt?: Date | string;
}

export const getInstitutionProfile = async (): Promise<InstitutionProfile | null> => {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch institution profile');
    }
    const data = await response.json();
    return data as InstitutionProfile;
  } catch (error) {
    console.error("Error getting institution profile: ", error);
    throw error;
  }
};

export const updateInstitutionProfile = async (formData: FormData) => {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update institution profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating institution profile: ", error);
    throw error;
  }
};
