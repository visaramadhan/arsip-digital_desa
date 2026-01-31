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

export const uploadFile = async (file: File, path: string) => {
  // This is now handled by the API route internally, or we could have a separate upload API.
  // For this refactor, addArchive handles the upload.
  return ""; 
};

export const addArchive = async (data: Omit<Archive, "id" | "createdAt" | "updatedAt" | "fileUrl" | "fileName" | "storagePath" | "documentTypeName">, file: File) => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("documentTypeId", data.documentTypeId);
    formData.append("uploadedBy", data.uploadedBy);
    formData.append("file", file);

    const response = await fetch("/api/archives", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to add archive");
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
