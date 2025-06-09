import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const Stock = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Liste des ingrédients par défaut (stock initial)
  const defaultStockItems = [
    { id: '1', name: 'Oignons', category: 'condiment', quantity: 5, unit: 'kilogramme', pricePerUnit: 500 },
    { id: '2', name: 'Tomates', category: 'condiment', quantity: 3, unit: 'kilogramme', pricePerUnit: 600 },
    { id: '3', name: 'Huile d\'olive', category: 'liquide', quantity: 2, unit: 'litre', pricePerUnit: 2000 },
    { id: '4', name: 'Poulet', category: 'boucherie', quantity: 1, unit: 'kilogramme', pricePerUnit: 3000 },
    { id: '5', name: 'Bananes plantains', category: 'complement', quantity: 4, unit: 'kilogramme', pricePerUnit: 800 },
  ];

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockSnapshot = await getDocs(collection(db, 'stock'));
        if (stockSnapshot.empty) {
          // Si la collection est vide, initialiser avec les ingrédients par défaut
          console.log('Collection stock vide, initialisation avec les ingrédients par défaut');
          for (const item of defaultStockItems) {
            await addDoc(collection(db, 'stock'), item);
          }
          setStockItems(defaultStockItems);
        } else {
          // Charger les ingrédients depuis Firestore
          const items = stockSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStockItems(items);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du stock :', error);
        setStockItems(defaultStockItems);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />

      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center mb-8"
        >
          <Package className="text-green-600 mr-3" size={32} />
          <h1 className="text-4xl font-bold text-gray-800">Gestion du Stock</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-8 w-8 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : stockItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center text-gray-500"
          >
            <AlertCircle size={48} className="mb-4" />
            <p>Aucun ingrédient dans le stock pour le moment.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-medium">Nom</th>
                  <th className="py-3 px-6 text-left text-sm font-medium">Catégorie</th>
                  <th className="py-3 px-6 text-left text-sm font-medium">Quantité</th>
                  <th className="py-3 px-6 text-left text-sm font-medium">Unité</th>
                  <th className="py-3 px-6 text-left text-sm font-medium">Prix par unité (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockItems.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-green-50"
                  >
                    <td className="py-4 px-6 text-sm text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.category}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.quantity}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.unit}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.pricePerUnit}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Stock;