import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Info, Plus, Filter, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { useUser } from './UserContext';

const Meals = () => {
  const { user } = useUser();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showMealDetails, setShowMealDetails] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: 1, pricePerUnit: 0 });
  const [complement, setComplement] = useState({ name: '', priceDefault: 0, quantity: 1, unit: 'kilogramme' });
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
  const [showComplementDialog, setShowComplementDialog] = useState(false);

  const userId = user ? user.uid : 'anonymous-user';

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'légumes', label: 'Légumes' },
    { id: 'grillades', label: 'Grillades' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'féculents', label: 'Féculents' },
    { id: 'sauces', label: 'Sauces' },
    { id: 'boissons', label: 'Boissons' },
    { id: 'autres', label: 'Autres' },
  ];

  const initialMeals = [
    { id: '1', name: 'Koki', category: 'féculents', description: 'Plat à base de haricots cuits à la vapeur.', recipe: 'Mélanger haricots et huile, cuire à la vapeur.', image: 'https://example.com/koki.jpg', ingredients: [] },
    { id: '2', name: 'Poulet DG', category: 'grillades', description: 'Poulet frit avec plantains.', recipe: 'Frire poulet et plantains, mélanger.', image: 'https://example.com/poulet-dg.jpg', ingredients: [] },
    { id: '3', name: 'Salade Verte', category: 'légumes', description: 'Salade fraîche et saine.', recipe: 'Mélanger légumes verts et vinaigrette.', image: 'https://example.com/salade.jpg', ingredients: [] },
    { id: '4', name: 'Jus d’Orange', category: 'boissons', description: 'Jus naturel vitaminé.', recipe: 'Presser des oranges fraîches.', image: 'https://example.com/jus.jpg', ingredients: [] },
    { id: '5', name: 'Sauce Arachide', category: 'sauces', description: 'Sauce crémeuse à base d’arachide.', recipe: 'Cuire arachides et épices.', image: 'https://example.com/sauce.jpg', ingredients: [] },
    { id: '6', name: 'Fruit Mix', category: 'fruits', description: 'Mélange de fruits exotiques.', recipe: 'Couper et mélanger les fruits.', image: 'https://example.com/fruit-mix.jpg', ingredients: [] },
  ];

  // Fonction pour supprimer les doublons dans plats_habituels
  const removeDuplicatePlatsHabituels = async () => {
    try {
      const platsHabituelsSnapshot = await getDocs(collection(db, 'plats_habituels'));
      const seen = new Map(); // Map pour suivre les combinaisons mealId + name + type
      for (const doc of platsHabituelsSnapshot.docs) {
        const data = doc.data();
        const key = `${data.mealId}-${data.name}-${data.type}`;
        if (seen.has(key)) {
          // Supprimer le doublon
          await deleteDoc(doc.ref);
          console.log(`Doublon supprimé : ${key}`);
        } else {
          seen.set(key, doc.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des doublons dans plats_habituels :', error);
    }
  };

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        // Nettoyer les doublons dans plats_habituels avant de récupérer les plats
        await removeDuplicatePlatsHabituels();

        const mealsSnapshot = await getDocs(collection(db, 'meals'));
        let fetchedMeals = [];
        const mealNames = new Set(); // Pour éviter les doublons par nom

        if (mealsSnapshot.empty) {
          console.log('Initialisation des plats par défaut');
          for (const meal of initialMeals) {
            if (!mealNames.has(meal.name)) {
              mealNames.add(meal.name);
              const mealRef = await addDoc(collection(db, 'meals'), {
                name: meal.name,
                category: meal.category,
                description: meal.description,
                recipe: meal.recipe,
                image: meal.image,
                userId,
              });
              fetchedMeals.push({ id: mealRef.id, ...meal });
            }
          }
        } else {
          fetchedMeals = await Promise.all(
            mealsSnapshot.docs
              .filter((doc) => {
                const mealData = doc.data();
                if (mealNames.has(mealData.name)) {
                  return false; // Ignorer les doublons
                }
                mealNames.add(mealData.name);
                return true;
              })
              .map(async (doc) => {
                const mealData = { id: doc.id, ...doc.data() };
                const ingredientsSnapshot = await getDocs(collection(db, 'meals', doc.id, 'ingredient'));
                mealData.ingredients = ingredientsSnapshot.docs.map((ingDoc) => ingDoc.data());
                return mealData;
              })
          );
        }

        setMeals(fetchedMeals);
        setFilteredMeals(fetchedMeals);
      } catch (error) {
        console.error('Erreur lors de la récupération des plats :', error);
        // Filtrer les initialMeals pour éviter les doublons
        const uniqueInitialMeals = initialMeals.filter((meal) => !mealNames.has(meal.name));
        uniqueInitialMeals.forEach((meal) => mealNames.add(meal.name));
        setMeals(uniqueInitialMeals);
        setFilteredMeals(uniqueInitialMeals);
      }
    };

    fetchMeals();
  }, [userId]);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredMeals(meals);
    } else {
      const filtered = meals.filter((meal) => meal.category === activeCategory);
      setFilteredMeals(filtered);
    }
  }, [activeCategory, meals]);

  const handleSelectMeal = (meal) => {
    setSelectedMeal(meal);
    setShowIngredientDialog(true);
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!selectedMeal || !newIngredient.name || newIngredient.quantity <= 0 || newIngredient.pricePerUnit < 0) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      // Vérifier si l'ingrédient existe déjà pour ce plat
      const ingredientQuery = query(
        collection(db, 'meals', selectedMeal.id, 'ingredient'),
        where('name', '==', newIngredient.name)
      );
      const ingredientSnapshot = await getDocs(ingredientQuery);
      if (!ingredientSnapshot.empty) {
        alert('Cet ingrédient existe déjà pour ce plat.');
        return;
      }

      // Ajouter l'ingrédient dans la sous-collection ingredient de meals
      const ingredientRef = await addDoc(collection(db, 'meals', selectedMeal.id, 'ingredient'), {
        name: newIngredient.name,
        quantity: newIngredient.quantity,
        pricePerUnit: newIngredient.pricePerUnit,
      });

      // Ajouter l'ingrédient dans la collection plats_habituels
      await addDoc(collection(db, 'plats_habituels'), {
        mealId: selectedMeal.id,
        name: newIngredient.name,
        quantity: newIngredient.quantity,
        pricePerUnit: newIngredient.pricePerUnit,
        type: 'ingredient',
        userId,
      });

      // Ajouter le plat à la collection plats_habituels
      await addDoc(collection(db, 'plats_habituels'), {
        mealId: selectedMeal.id,
        name: selectedMeal.name,
        category: selectedMeal.category,
        description: selectedMeal.description,
        recipe: selectedMeal.recipe,
        image: selectedMeal.image,
        type: 'plat',
        userId,
      });

      // Mettre à jour l'état local
      const updatedMeals = meals.map((m) =>
        m.id === selectedMeal.id
          ? {
              ...m,
              ingredients: [
                ...m.ingredients,
                {
                  id: ingredientRef.id,
                  name: newIngredient.name,
                  quantity: newIngredient.quantity,
                  pricePerUnit: newIngredient.pricePerUnit,
                },
              ],
            }
          : m
      );
      setMeals(updatedMeals);
      setFilteredMeals(activeCategory === 'all' ? updatedMeals : updatedMeals.filter((m) => m.category === activeCategory));
      setNewIngredient({ name: '', quantity: 1, pricePerUnit: 0 });
      setShowIngredientDialog(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'ingrédient :", error);
      alert("Une erreur s'est produite lors de l'ajout de l'ingrédient.");
    }
  };

  const handleAddComplement = async (e) => {
    e.preventDefault();
    if (!selectedMeal || !complement.name || complement.priceDefault < 0 || complement.quantity <= 0 || !complement.unit) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    try {
      // Vérifier si le complément existe déjà pour ce plat
      const complementQuery = query(
        collection(db, 'plats_habituels'),
        where('mealId', '==', selectedMeal.id),
        where('name', '==', complement.name),
        where('type', '==', 'complement')
      );
      const complementSnapshot = await getDocs(complementQuery);
      if (!complementSnapshot.empty) {
        alert('Ce complément existe déjà pour ce plat.');
        return;
      }

      // Ajouter le complément dans la collection plats_habituels
      await addDoc(collection(db, 'plats_habituels'), {
        mealId: selectedMeal.id,
        name: complement.name,
        priceDefault: complement.priceDefault,
        quantity: complement.quantity,
        unit: complement.unit,
        type: 'complement',
        userId,
      });

      setComplement({ name: '', priceDefault: 0, quantity: 1, unit: 'kilogramme' });
      setShowComplementDialog(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du complément :", error);
      alert("Une erreur s'est produite lors de l'ajout du complément.");
    }
  };

  const handleToggleFavorite = (mealId) => {
    if (favoriteMeals.includes(mealId)) {
      setFavoriteMeals(favoriteMeals.filter((id) => id !== mealId));
    } else {
      setFavoriteMeals([...favoriteMeals, mealId]);
      const audio = new Audio('https://www.myinstants.com/media/sounds/notification.mp3');
      audio.play().catch((error) => console.log('Erreur son :', error));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50">
      <Navbar />
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800">Plats Habituels</h1>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300"
          >
            <Filter size={20} className="mr-2" />
            Filtrer
          </button>
        </motion.div>

        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full shadow-md ${
                    activeCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-800 hover:bg-green-100'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="h-48 flex items-center justify-center overflow-hidden bg-gray-100">
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-3/4 h-auto object-contain transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800">{meal.name}</h3>
                <div className="mt-2 flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMealDetails(meal)}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <Info size={16} className="mr-1" />
                    Description
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 1.1 }}
                    onClick={() => handleToggleFavorite(meal.id)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <Heart
                      size={20}
                      fill={favoriteMeals.includes(meal.id) ? 'red' : 'none'}
                      className={favoriteMeals.includes(meal.id) ? 'animate-pulse' : ''}
                    />
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectMeal(meal)}
                  className="mt-4 w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-300"
                >
                  Sélectionner
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedMeal(meal);
                    setShowComplementDialog(true);
                  }}
                  className="mt-2 w-full py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-all duration-300"
                >
                  <Plus size={16} className="mr-1 inline" /> Complément
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {showMealDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">{showMealDetails.name}</h3>
              <p className="mb-4 text-gray-700">{showMealDetails.description}</p>
              <h4 className="font-medium mb-2 text-gray-800">Recette :</h4>
              <p className="mb-4 whitespace-pre-line text-gray-600">{showMealDetails.recipe}</p>
              <h4 className="font-medium mb-2 text-gray-800">Ingrédients :</h4>
              <ul className="list-disc pl-5 mb-4 text-gray-600">
                {showMealDetails.ingredients.map((ing, index) => (
                  <li key={index}>{ing.name} ({ing.quantity} unité, {ing.pricePerUnit} FCFA)</li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMealDetails(null)}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-all duration-300"
              >
                Fermer
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {showIngredientDialog && selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">Ajouter des ingrédients pour {selectedMeal.name}</h3>
              <form onSubmit={handleAddIngredient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantité</label>
                  <input
                    type="number"
                    value={newIngredient.quantity}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseInt(e.target.value) || 1 })}
                    className="mt-1 p-2 w-full border rounded-md"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix unitaire (FCFA)</label>
                  <input
                    type="number"
                    value={newIngredient.pricePerUnit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, pricePerUnit: parseInt(e.target.value) || 0 })}
                    className="mt-1 p-2 w-full border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-all duration-300"
                >
                  Ajouter
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowIngredientDialog(false)}
                  className="w-full mt-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                >
                  Annuler
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showComplementDialog && selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">Ajouter un complément pour {selectedMeal.name}</h3>
              <form onSubmit={handleAddComplement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom (ex: Plantain)</label>
                  <select
                    value={complement.name}
                    onChange={(e) => setComplement({ ...complement, name: e.target.value })}
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  >
                    <option value="">Sélectionner un complément</option>
                    {['Plantain', 'Igname', 'Patate', 'Manioc', 'Riz', 'Macabo'].map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix par défaut (FCFA)</label>
                  <input
                    type="number"
                    value={complement.priceDefault}
                    onChange={(e) => setComplement({ ...complement, priceDefault: parseInt(e.target.value) || 0 })}
                    className="mt-1 p-2 w-full border rounded-md"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantité</label>
                  <input
                    type="number"
                    value={complement.quantity}
                    onChange={(e) => setComplement({ ...complement, quantity: parseInt(e.target.value) || 1 })}
                    className="mt-1 p-2 w-full border rounded-md"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unité</label>
                  <select
                    value={complement.unit}
                    onChange={(e) => setComplement({ ...complement, unit: e.target.value })}
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  >
                    {['kilogramme', 'litre', 'cuillerée', 'poignée', 'unité'].map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-all duration-300"
                >
                  Ajouter
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowComplementDialog(false)}
                  className="w-full mt-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                >
                  Annuler
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Meals;
