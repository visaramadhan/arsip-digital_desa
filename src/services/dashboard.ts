import { 
  collection, 
  getDocs, 
  query, 
  where,
  getCountFromServer
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface DashboardStats {
  totalArchives: number;
  totalDocTypes: number;
  totalUsers: number;
  archivesPerType: { name: string; count: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // 1. Get Counts
    const archivesColl = collection(db, "archives");
    const docTypesColl = collection(db, "document_types");
    const usersColl = collection(db, "users");

    const [archivesSnapshot, docTypesSnapshot, usersSnapshot] = await Promise.all([
      getDocs(archivesColl), // Need data for aggregation
      getCountFromServer(docTypesColl),
      getCountFromServer(usersColl),
    ]);

    const totalArchives = archivesSnapshot.size;
    const totalDocTypes = docTypesSnapshot.data().count;
    const totalUsers = usersSnapshot.data().count;

    // 2. Aggregate Archives per Type
    // We need document type names.
    // If archives have 'documentTypeName' stored, we can use that.
    // Otherwise we might need to map IDs. 
    // Based on my implementation of addArchive, 'documentTypeName' is stored.
    
    const typeCounts: Record<string, number> = {};
    
    archivesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const typeName = data.documentTypeName || "Unknown";
        typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
    });

    const archivesPerType = Object.entries(typeCounts).map(([name, count]) => ({
        name,
        count
    }));

    return {
      totalArchives,
      totalDocTypes,
      totalUsers,
      archivesPerType
    };

  } catch (error) {
    console.error("Error getting dashboard stats: ", error);
    throw error;
  }
};
