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
  try {
    const response = await fetch("/api/document-types", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error("Failed to add document type");
    }
    
    const newItem = await response.json();
    return newItem._id;
  } catch (error) {
    console.error("Error adding document type: ", error);
    throw error;
  }
};

export const updateDocumentType = async (id: string, data: Partial<Omit<DocumentType, "id" | "createdAt" | "updatedAt">>) => {
  try {
    const response = await fetch(`/api/document-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update document type");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating document type: ", error);
    throw error;
  }
};

export const deleteDocumentType = async (id: string) => {
  try {
    const response = await fetch(`/api/document-types/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete document type");
    }
  } catch (error) {
    console.error("Error deleting document type: ", error);
    throw error;
  }
};
