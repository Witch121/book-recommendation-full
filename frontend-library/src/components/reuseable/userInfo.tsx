import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseFolder/firebase";
import { getDoc, doc, DocumentData } from "firebase/firestore";

// Define the context's value type
interface AuthContextValue {
  user: FirebaseUser | null;
  userData: DocumentData | null;
  loading: boolean;
}

// Define the props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create AuthContext with a default value of null
const AuthContext = createContext<AuthContextValue | null>(null);

// Custom hook for accessing auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          } else {
            console.log("No such user data in Firestore!");
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
        navigate('/SignIn');
      }

      setLoading(false);
    });
  
    return unsubscribe;
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
