import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp, getApp, deleteApp } from "firebase/app";
import { db } from "@/lib/firebase";

export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt?: Timestamp;
}

const COLLECTION_NAME = "users";

export const getUsers = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserData[];
  } catch (error) {
    console.error("Error getting users: ", error);
    throw error;
  }
};

export const updateUserRole = async (id: string, role: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { role });
  } catch (error) {
    console.error("Error updating user role: ", error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    // Note: This only deletes from Firestore, not Firebase Auth (requires Admin SDK)
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

// Helper to create user using a secondary app instance to avoid signing out the current user
export const createUser = async (data: Omit<UserData, "id" | "createdAt">, password: string) => {
    let secondaryApp;
    try {
        // Initialize a secondary app
        const config = getApp().options;
        // Use a unique name for the secondary app
        secondaryApp = initializeApp(config, `SecondaryApp-${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);

        // Create user in Auth
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, password);
        const user = userCredential.user;

        // Save to Firestore (using main app's db)
        await setDoc(doc(db, COLLECTION_NAME, user.uid), {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email,
            role: data.role,
            createdAt: serverTimestamp(),
        });

        // Sign out from secondary app to be safe (though it doesn't affect main app)
        await secondaryAuth.signOut();
        
        return user.uid;
    } catch (error) {
        console.error("Error creating user: ", error);
        throw error;
    } finally {
        if (secondaryApp) {
            await deleteApp(secondaryApp);
        }
    }
};
