import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface InstitutionProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  dashboardTitle?: string;
  logoUrl?: string;
}

const SETTINGS_COLLECTION = "settings";
const PROFILE_DOC_ID = "institution_profile";

export const getInstitutionProfile = async (): Promise<InstitutionProfile | null> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as InstitutionProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting institution profile: ", error);
    throw error;
  }
};

export const updateInstitutionProfile = async (data: InstitutionProfile) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating institution profile: ", error);
    throw error;
  }
};
