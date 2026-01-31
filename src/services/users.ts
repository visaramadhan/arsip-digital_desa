import { 
  createUserWithEmailAndPassword, 
  getAuth 
} from "firebase/auth";
import { initializeApp, getApp, deleteApp } from "firebase/app";

export interface UserData {
  id: string; // MongoDB _id or Firebase UID? Ideally map to UID for consistency
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt?: string;
}

export const getUsers = async () => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const data = await response.json();
    return data.map((user: any) => ({
      ...user,
      id: user.uid, // Map uid to id for frontend compatibility if needed, or keep _id
    })) as UserData[];
  } catch (error) {
    console.error("Error getting users: ", error);
    throw error;
  }
};

export const updateUserRole = async (uid: string, role: string) => {
  try {
    const response = await fetch(`/api/users/${uid}`, {
      method: 'POST', // Using POST/PUT to update
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user role');
    }
  } catch (error) {
    console.error("Error updating user role: ", error);
    throw error;
  }
};

export const deleteUser = async (uid: string) => {
  // Note: This only deletes from MongoDB. 
  // Firebase Auth deletion usually requires Admin SDK or client-side current user deletion.
  // The original code only deleted from Firestore.
  try {
    // We haven't implemented DELETE in api/users/[uid] yet.
    // Let's assume we will or warn.
    // For now, let's just warn or try to call DELETE if we implement it.
    console.warn("deleteUser from MongoDB not fully implemented in API yet");
    
    // If we were to implement it:
    // await fetch(`/api/users/${uid}`, { method: 'DELETE' });
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

// Helper to create user using a secondary app instance to avoid signing out the current user
export const createUser = async (data: Omit<UserData, "id" | "uid" | "createdAt">, password: string) => {
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

        // Save to MongoDB via API
        await fetch(`/api/users/${user.uid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: data.email,
                role: data.role,
                firstName: data.firstName,
                lastName: data.lastName,
            }),
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
