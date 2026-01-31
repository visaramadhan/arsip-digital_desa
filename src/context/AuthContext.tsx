"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
          // Fetch user role from MongoDB API
          const fetchRole = async () => {
            try {
                const response = await fetch(`/api/users/${user.uid}`);
                if (response.ok) {
                    const userData = await response.json();
                    if (userData) {
                        setRole(userData.role);
                        return;
                    }
                }
                
                // If user not found (404) or other error, create default
                // Only create if 404 (not found)
                if (response.status === 404) {
                    const defaultRole = "administrator";
                    const createResponse = await fetch(`/api/users/${user.uid}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: user.email,
                            role: defaultRole,
                            firstName: user.displayName?.split(' ')[0] || 'User',
                            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                        })
                    });
                    
                    if (createResponse.ok) {
                        const newUser = await createResponse.json();
                        setRole(newUser.role);
                    } else {
                         setRole(defaultRole); // Fallback
                    }
                } else {
                    setRole("administrator"); // Fallback on error
                }

            } catch (error) {
              console.error("Error fetching user role:", error);
              setRole("administrator");
            }
          };

          await fetchRole();
        } catch (error) {
          console.error("Error in auth flow:", error);
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
