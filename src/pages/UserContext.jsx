// UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('User is authenticated with UID:', firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          // Ajoutez d'autres champs d'authentification si nécessaire
        });
      } else {
        console.log('No user is authenticated.');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateBMI = (weight, height) => {
    // Convert height from cm to meters
    const heightInMeters = height / 100;
    // Calculate BMI
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const saveUser = async (userData) => {
    // Ici, vous pouvez ajouter la logique pour sauvegarder les données de l'utilisateur
    // Par exemple, sauvegarder dans Firebase Firestore
    console.log('Saving user data:', userData);
    // Simuler une sauvegarde réussie
    return true;
  };

  return (
    <UserContext.Provider value={{ user, loading, calculateBMI, saveUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
