import { IArchive } from "@/models/Archive"; // Type definition only if shared, but usually services define their own or share

export interface ArchiveData {
  id: string; // MongoDB _id
  title: string;
  documentTypeId: string;
  documentTypeName?: string;
  fileUrl: string;
  fileName: string;
  storagePath: string;
  uploadedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Archive = ArchiveData;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const uploadFile = async (file: File, path: string) => {
  // Not used in MongoDB embedded approach
  return ""; 
};

export const addArchive = async (data: Omit<Archive, "id" | "createdAt" | "updatedAt" | "fileUrl" | "fileName" | "storagePath" | "documentTypeName">, file: File) => {
  try {
    // 1. Convert file to Base64
    const base64File = await fileToBase64(file);
    
    // 2. Send metadata and file data to API
    const payload = {
      title: data.title,
      documentTypeId: data.documentTypeId,
      uploadedBy: data.uploadedBy,
      fileName: file.name,
      fileData: base64File, // Base64 string
      contentType: file.type,
    };

    const response = await fetch("/api/archives", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add archive");
    }

    const result = await response.json();
    return result._id;
  } catch (error) {
    console.error("Error adding archive: ", error);
    throw error;
  }
};

export const getArchives = async () => {
  try {
    const response = await fetch("/api/archives");
    if (!response.ok) {
      throw new Error("Failed to fetch archives");
    }
    const data = await response.json();
    // Map MongoDB _id to id
    return data.map((item: any) => ({
      ...item,
      id: item._id,
    })) as Archive[];
  } catch (error) {
    console.error("Error getting archives: ", error);
    return [];
  }
};

export const deleteArchive = async (id: string) => {
  try {
    const response = await fetch(`/api/archives/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete archive");
    }
  } catch (error) {
    console.error("Error deleting archive: ", error);
    throw error;
  }
};

export const updateArchive = async (id: string, data: Partial<Omit<Archive, "id" | "createdAt" | "updatedAt" | "fileUrl" | "fileName" | "storagePath" | "documentTypeName">>, file?: File) => {
  try {
    let filePayload = {};

    if (file) {
        const base64File = await fileToBase64(file);
        filePayload = {
            fileName: file.name,
            fileData: base64File,
            contentType: file.type,
        };
    }

    // 2. Send metadata to API
    const payload = {
        ...data,
        ...filePayload,
    };

    const response = await fetch(`/api/archives/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update archive");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating archive: ", error);
    throw error;
  }
};

export const getArchivesReport = async (month?: number, year?: number, typeId?: string) => {
  try {
    // Construct query params
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());
    if (typeId) params.append("typeId", typeId);

    const response = await fetch(`/api/archives?${params.toString()}`);
    if (!response.ok) {
        throw new Error("Failed to fetch archives report");
    }
    const data = await response.json();
    return data.map((item: any) => ({
        ...item,
        id: item._id,
    })) as Archive[];
  } catch (error) {
    console.error("Error getting archives report: ", error);
    return [];
  }
};
