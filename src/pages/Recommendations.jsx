import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { Heart } from 'lucide-react';

const Recommendations = () => {
  const [meals, setMeals] = useState([]);
  const [topMeal, setTopMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const mealsSnapshot = await getDocs(collection(db, 'meals'));
        const mealsData = mealsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          selectionCount: doc.data().selectionCount || 0,
        }));
        setMeals(mealsData);

        // Calculer le plat le plus consommé
        const mostConsumed = mealsData.reduce((max, meal) => max.selectionCount > meal.selectionCount ? max : meal, mealsData[0]);
        setTopMeal(mostConsumed);
      } catch (error) {
        console.error('Erreur lors de la récupération des plats :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const incrementSelection = async (mealId) => {
    try {
      const mealRef = doc(db, 'meals', mealId);
      const mealSnap = await getDoc(mealRef); // Vérifier si le document existe

      if (mealSnap.exists()) {
        // Le document existe, on met à jour
        const currentCount = mealSnap.data().selectionCount || 0;
        await updateDoc(mealRef, { selectionCount: currentCount + 1 });
        setMeals(meals.map(m => m.id === mealId ? { ...m, selectionCount: currentCount + 1 } : m));
      } else {
        // Le document n'existe pas, on le crée
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
          await setDoc(mealRef, { ...meal, selectionCount: 1 });
          setMeals(meals.map(m => m.id === mealId ? { ...m, selectionCount: 1 } : m));
        } else {
          console.error("Plat non trouvé dans l'état local.");
          return;
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du plat :", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-4xl text-green-600"
        >
          🍲
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50">
      <Navbar />
      <div className="container-custom py-12">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-8 text-center animate-pulse">Recommandations IA</h1>
        <p className="text-lg text-gray-600 mb-6 text-center">Découvrez les plats les plus populaires et nos suggestions personnalisées !</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-green-700 mb-4">Plat le Plus Consommé</h2>
          {topMeal ? (
            <div className="flex flex-col items-center">
              <img src={topMeal.image || 'https://picsum.photos/300/200'} alt={topMeal.name} className="w-64 h-48 object-cover rounded-lg mb-4 shadow-md" />
              <h3 className="text-2xl font-semibold text-gray-800">{topMeal.name}</h3>
              <p className="text-gray-600 mb-4">Consommé {topMeal.selectionCount} fois !</p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => incrementSelection(topMeal.id)}
                className="bg-green-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-green-700 transition-all duration-300"
              >
                <Heart size={20} fill="white" />
                <span>Aimer ce plat</span>
              </motion.button>
            </div>
          ) : (
            <p className="text-gray-500">Aucun plat populaire pour l'instant.</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 bg-white p-6 rounded-xl shadow-2xl max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-green-700 mb-4">Suggestions Personnalisées</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Un repas équilibré : Essayez un plat riche en légumes comme la Salade Verte.</li>
            <li>Option saisonnière : Goûtez le Fruit Mix pour une touche de fraîcheur.</li>
            <li>Menus hebdomadaires : Combinez Koki et Poulet DG pour une semaine savoureuse !</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Recommendations;