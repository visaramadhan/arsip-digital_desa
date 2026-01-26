import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  getDoc
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export interface Archive {
  id: string;
  title: string;
  documentTypeId: string;
  documentTypeName?: string;
  fileUrl: string;
  fileName: string;
  storagePath: string;
  uploadedBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION_NAME = "archives";

export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  try {
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    console.error("Upload failed:", error);
    if (error.code === 'storage/unknown' || error.message?.includes('net::ERR_FAILED')) {
        throw new Error("Gagal mengupload file. Kemungkinan masalah koneksi atau konfigurasi CORS pada Firebase Storage. Pastikan Anda telah mengkonfigurasi CORS untuk mengizinkan upload dari localhost.");
    }
    throw error;
  }
};

export const addArchive = async (data: Omit<Archive, "id" | "createdAt" | "updatedAt" | "fileUrl" | "fileName" | "storagePath" | "documentTypeName">, file: File) => {
  try {
    // 1. Upload file
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filePath = `archives/${timestamp}_${sanitizedFileName}`;
    const fileUrl = await uploadFile(file, filePath);

    // 2. Get document type name
    let docTypeName = "";
    if (data.documentTypeId) {
        const docTypeDoc = await getDoc(doc(db, "document_types", data.documentTypeId));
        if (docTypeDoc.exists()) {
            docTypeName = docTypeDoc.data().name;
        }
    }

    // 3. Save to Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      fileUrl,
      fileName: file.name,
      storagePath: filePath,
      documentTypeName: docTypeName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding archive: ", error);
    throw error;
  }
};

export const getArchives = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Archive[];
  } catch (error) {
    console.error("Error getting archives: ", error);
    throw error;
  }
};

export const getArchivesReport = async (month: number, year: number, typeId?: string) => {
  try {
    // Note: Firestore filtering by multiple fields including range requires composite indexes.
    // For simplicity in this project, we will fetch all and filter client-side or use basic range query.
    // Given the potential scale described, client-side filtering after fetching by date range is reasonable 
    // or fetching all for the month and filtering by type in memory.
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const archives = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Archive[];

    return archives.filter(archive => {
      if (!archive.createdAt) return false;
      const date = archive.createdAt.toDate();
      const matchDate = date >= startDate && date <= endDate;
      const matchType = typeId ? archive.documentTypeId === typeId : true;
      return matchDate && matchType;
    });
  } catch (error) {
    console.error("Error getting archives report: ", error);
    throw error;
  }
};

export const deleteArchive = async (id: string, storagePath: string) => {
  try {
    if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef).catch(err => console.warn("File not found in storage", err));
    }
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting archive: ", error);
    throw error;
  }
};
