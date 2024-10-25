import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
const { auth, db } = require('../firebaseFolder/firebase');
const { getDoc, doc } = require('firebase/firestore');


const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);
  
        try {
          const userDocRef = doc(db,"users", currentUser.uid);
          // console.log(userDocRef)
          // console.log("Fetching user data for:", currentUser.uid);
  
          const userDocSnap = await getDoc(userDocRef);
          // console.log("Document snapshot:", userDocSnap);
  
          if (userDocSnap.exists()) {
            const fetchedUserData = userDocSnap.data();
            // console.log("Fetched user data:", fetchedUserData);
            setUserData(fetchedUserData);
          } else {
            console.log("No such user data in Firestore!");
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);  // Improved error handling
        }
      } else {
        setUser(null);
        setUserData(null);
        navigate('/SignIn');
      }
      setLoading(false);
    });
  
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
