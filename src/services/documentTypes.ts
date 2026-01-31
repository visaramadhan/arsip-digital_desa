export interface DocumentType {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getDocumentTypes = async () => {
  try {
    const response = await fetch("/api/document-types");
    if (!response.ok) {
      throw new Error("Failed to fetch document types");
    }
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      id: item._id,
    })) as DocumentType[];
  } catch (error) {
    console.error("Error getting document types: ", error);
    return [];
  }
};

export const addDocumentType = async (data: Omit<DocumentType, "id" | "createdAt" | "updatedAt">) => {
  // Not implemented in API yet
  console.warn("addDocumentType not implemented for MongoDB yet");
  return "";
};

export const updateDocumentType = async (id: string, data: Partial<Omit<DocumentType, "id" | "createdAt" | "updatedAt">>) => {
   // Not implemented in API yet
   console.warn("updateDocumentType not implemented for MongoDB yet");
};

export const deleteDocumentType = async (id: string) => {
   // Not implemented in API yet
   console.warn("deleteDocumentType not implemented for MongoDB yet");
};
