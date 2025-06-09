import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      let userId = localStorage.getItem('cookCourseUserId');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('cookCourseUserId', userId);
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            id: userId,
            ...data,
          });
          setFamilyMembers(data.familyMembers || []);
        } else {
          console.log('Aucune donnée utilisateur trouvée, utilisateur vide.');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur :', error);
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  // Save user data to Firestore
  const saveUser = async (userData) => {
    const userId = localStorage.getItem('cookCourseUserId');
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        familyMembers, // on conserve les familyMembers existants
        updatedAt: new Date(),
        id: userId,
      }, { merge: true });
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Erreur lors de l’enregistrement des données utilisateur :', error);
      return false;
    }
  };

  // Save family members to Firestore
  const saveFamilyMembers = async (members) => {
    const userId = localStorage.getItem('cookCourseUserId');
    try {
      await setDoc(doc(db, 'users', userId), {
        familyMembers: members,
        updatedAt: new Date(),
      }, { merge: true });
      setFamilyMembers(members);
      return true;
    } catch (error) {
      console.error('Erreur lors de l’enregistrement des membres de la famille :', error);
      return false;
    }
  };

  // Calculate BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const value = {
    user,
    familyMembers,
    loading,
    saveUser,
    saveFamilyMembers,
    calculateBMI,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
}
