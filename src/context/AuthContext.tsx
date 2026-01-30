"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Fetch user role with timeout
          const fetchRole = async () => {
            const userDocRef = doc(db, "users", user.uid);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Timeout")), 5000)
            );
            
            try {
              const userDoc = await Promise.race([
                getDoc(userDocRef),
                timeoutPromise
              ]) as any; // Cast to any to handle the timeout error race

              if (userDoc.exists()) {
                setRole(userDoc.data().role);
              } else {
                // If user exists in Auth but not in Firestore (e.g. first run), create a default profile
                const defaultRole = "administrator"; 
                await setDoc(doc(db, "users", user.uid), {
                  email: user.email,
                  role: defaultRole,
                  createdAt: new Date(),
                });
                setRole(defaultRole);
              }
            } catch (error) {
              console.error("Error fetching user role (or timeout):", error);
              // Fallback for demo/offline: assume admin if error occurs
              setRole("administrator");
            }
          };

          await fetchRole();
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Fallback for demo/offline: assume admin if error occurs
          setRole("administrator");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
